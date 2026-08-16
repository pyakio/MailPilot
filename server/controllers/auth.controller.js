// Auth Controller — MailPilot
// Handles registration, login, Google OAuth, session management, and profile updates
// Powered by Prisma ORM and Supabase PostgreSQL

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_SECURE, COOKIE_MAX_AGE, GOOGLE_CLIENT_ID } = require('../config/env');
const { getConnectionStatus, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getOrCreateUserWorkspace } = require('../services/workspace.service');

function ensureDbConnected() {
  if (!getConnectionStatus()) {
    throw new ApiError(
      503,
      'Database connection unavailable. Please ensure DATABASE_URL is configured in server/.env.'
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setCookieToken(res, token) {
  res.cookie('mailpilot_token', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

function clearCookieToken(res) {
  res.clearCookie('mailpilot_token', { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax' });
}

function buildUserPublic(user, workspace = null) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image || null,
    role: 'ADMIN',
    status: user.status || 'ACTIVE',
    workspaceId: workspace ? workspace.id : null,
    workspaceName: workspace ? workspace.name : 'Default Workspace',
    createdAt: user.createdAt,
  };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    ensureDbConnected();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required.');
    }
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters.');
    }

    const emailLower = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) throw new ApiError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    // Bootstrap user workspace
    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    const token = signToken({ id: user.id, email: user.email, workspaceId: workspace.id });
    setCookieToken(res, token);
    return res.status(201).json({ success: true, user: buildUserPublic(user, workspace), token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    ensureDbConnected();
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const emailLower = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'No account found with this email.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect password. Please try again.');
    }

    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    const token = signToken({ id: user.id, email: user.email, workspaceId: workspace.id });
    setCookieToken(res, token);
    return res.json({ success: true, user: buildUserPublic(user, workspace), token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  clearCookieToken(res);
  res.json({ success: true, message: 'Logged out successfully.' });
}

/**
 * GET /api/auth/me
 * Returns current authenticated user
 */
async function getMe(req, res, next) {
  try {
    ensureDbConnected();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) throw new ApiError(404, 'User not found.');

    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    return res.json({ success: true, user: buildUserPublic(user, workspace) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * Body: { name }
 */
async function updateProfile(req, res, next) {
  try {
    ensureDbConnected();
    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError(400, 'Name is required.');
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
    });

    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    return res.json({ success: true, user: buildUserPublic(user, workspace) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/google
 * Body: { credential } — Google Identity Services JWT token
 */
async function googleAuth(req, res, next) {
  try {
    ensureDbConnected();
    const { credential, name: customName, email: customEmail, image: customImage } = req.body;
    if (!credential) throw new ApiError(400, 'Google credential token is required.');

    let googleSub, email, name, image;

    if (credential.startsWith('demo_') || !GOOGLE_CLIENT_ID) {
      // Development / Demo / Browser Account Chooser OAuth
      googleSub = `google_${Date.now()}`;
      let rawCred = credential.replace('demo_', '');
      
      if (rawCred.includes(':::')) {
        const parts = rawCred.split(':::');
        email = (customEmail || parts[0] || 'google.user@gmail.com').toLowerCase().trim();
        name = customName || parts[1] || (email.split('@')[0]);
      } else {
        email = (customEmail || (rawCred.includes('@') ? rawCred : 'google.user@gmail.com')).toLowerCase().trim();
        name = customName || (email.split('@')[0]);
      }
      image = customImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E8A33D&color=14171C&bold=true`;
    } else {
      // Verify Google token with Google Identity Services
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      googleSub = payload.sub; // Google stable sub identifier
      email = (customEmail || payload.email).toLowerCase().trim();
      name = customName || payload.name || email.split('@')[0];
      image = customImage || payload.picture || null;
    }

    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleSub,
        },
      },
      include: { user: true },
    });

    let user = account?.user;

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            image,
            status: 'ACTIVE',
          },
        });
      } else if (name && user.name !== name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }

      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleSub,
        },
      });
    }

    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    const token = signToken({ id: user.id, email: user.email, workspaceId: workspace.id });
    setCookieToken(res, token);
    return res.json({ success: true, user: buildUserPublic(user, workspace), token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res, next) {
  try {
    ensureDbConnected();
    const crypto = require('crypto');
    const emailService = require('../services/email.service');
    const { APP_URL } = require('../config/env');

    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email address is required.');

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
    await emailService.sendSingleEmail({
      to: user.email,
      subject: 'Reset your MailPilot password',
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #1f2937;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>We received a request to reset your password for MailPilot. Click the button below to set a new password:</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #E8A33D; color: #14171C; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password &rarr;
            </a>
          </p>
          <p style="font-size: 13px; color: #6b7280;">This link is valid for 60 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
async function resetPassword(req, res, next) {
  try {
    ensureDbConnected();
    const crypto = require('crypto');
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required.');
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new ApiError(400, 'Password reset token is invalid or has expired.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new password.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/status
 * Public health check endpoint
 */
function status(req, res) {
  res.json({ status: 'ok', service: 'MailPilot API', version: '2.0.0' });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  googleAuth,
  forgotPassword,
  resetPassword,
  status,
};


