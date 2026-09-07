const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { revokeToken } = require('../services/tokenBlocklist.service');
const { OAuth2Client } = require('google-auth-library');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COOKIE_SECURE,
  COOKIE_MAX_AGE,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  CLIENT_URL,
  APP_URL,
} = require('../config/env');
const { ensureDbConnected, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getOrCreateUserWorkspace } = require('../services/workspace.service');
const emailService = require('../services/email.service');
const { encryptToken, decryptToken } = require('../services/crypto.service');

const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

const GMAIL_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

function getGoogleOAuth2Client() {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID || undefined,
    GOOGLE_CLIENT_SECRET || undefined,
    GOOGLE_CALLBACK_URL || undefined
  );
}

function signToken(payload) {
  // jti (JWT ID) is a unique identifier per token, used for revocation on logout
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

function buildUserPublic(user, workspace = null, role = 'ADMIN', hasGmail = false) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image || null,
    role,
    status: user.status || 'ACTIVE',
    workspaceId: workspace ? workspace.id : null,
    workspaceName: workspace ? workspace.name : 'Default Workspace',
    hasGmail: Boolean(hasGmail),
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
 * Clears the auth cookie AND revokes the JWT via its jti so it cannot be reused
 * even if an attacker captured the token before logout.
 */
function logout(req, res) {
  // Extract current token to revoke its jti
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.mailpilot_token) {
      token = req.cookies.mailpilot_token;
    }
    if (token) {
      // Decode without verify (we trust the cookie we set; verification already
      // happened in authMiddleware if the route is protected, but logout is not)
      const decoded = jwt.decode(token);
      if (decoded && decoded.jti) {
        revokeToken(decoded.jti, decoded.exp);
      }
    }
  } catch (_) {
    // Best-effort revocation — always clear the cookie regardless
  }

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
      include: {
        accounts: {
          where: { provider: 'google' },
        },
      },
    });
    if (!user) throw new ApiError(404, 'User not found.');

    const workspace = await getOrCreateUserWorkspace(user.id, user.name);
    const googleAccount = user.accounts?.[0];
    const hasGmail = Boolean(googleAccount && (googleAccount.refreshToken || googleAccount.scope?.includes('gmail')));

    return res.json({ success: true, user: buildUserPublic(user, workspace, 'ADMIN', hasGmail) });
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
      let rawCred = credential.replace(/^demo_/, '');
      
      if (rawCred.includes(':::')) {
        const parts = rawCred.split(':::');
        email = (parts[0] || customEmail || 'google.user@gmail.com').toLowerCase().trim();
        name = parts[1] || customName || email.split('@')[0];
      } else {
        email = (rawCred.includes('@') ? rawCred : (customEmail || 'google.user@gmail.com')).toLowerCase().trim();
        name = customName || email.split('@')[0];
      }
      googleSub = `google_demo_${Buffer.from(email).toString('hex').slice(0, 16)}`;
      image = customImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E8A33D&color=14171C&bold=true`;
    } else {
      // Cryptographically verify Google ID token with Google Identity Services
      let payload;
      try {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        throw new ApiError(401, `Google token verification failed: ${verifyErr.message || 'Invalid or expired token.'}`);
      }

      if (!payload || !payload.sub || !payload.email) {
        throw new ApiError(401, 'Google identity payload is missing required claims.');
      }

      if (payload.email_verified === false) {
        throw new ApiError(403, 'Your Google email address is not verified by Google.');
      }

      // The verified Google payload is the authoritative source of truth
      googleSub = payload.sub;
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || email.split('@')[0];
      image = payload.picture || null;
    }

    // 1. Check if an account already exists for this verified Google identity
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

    // 2. If no account linked, match by verified email or create new MailPilot user
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            image,
            status: 'ACTIVE',
            emailVerified: new Date(),
          },
        });
      } else {
        // Update user avatar or name if missing
        const updates = {};
        if (!user.image && image) updates.image = image;
        if ((!user.name || user.name === 'User') && name) updates.name = name;
        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
          });
        }
      }

      // Link Google provider account to the user
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleSub,
        },
      });
    }

    // 3. Ensure user has an active multi-tenant workspace
    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    // 4. Issue standard MailPilot JWT session and secure HttpOnly cookie
    const token = signToken({ id: user.id, email: user.email, workspaceId: workspace.id });
    setCookieToken(res, token);

    return res.json({
      success: true,
      user: buildUserPublic(user, workspace),
      token,
    });
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
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email address is required.');

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    // Always return success to prevent email enumeration
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
 * GET /api/auth/google/url
 * Returns Google OAuth 2.0 authorization URL with Gmail scopes
 */
function getGoogleAuthUrl(req, res, next) {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      const mockState = req.query.state || 'dev_state';
      return res.json({
        success: true,
        url: `${CLIENT_URL}/login?demo_google_oauth=true&state=${encodeURIComponent(mockState)}`,
        configured: false,
        message: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured in server/.env. Using dev mock flow.',
      });
    }

    const oauth2Client = getGoogleOAuth2Client();
    const state = req.query.state || (req.user ? `user_${req.user.id}` : 'auth_login');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Requests refresh_token for background mailbox access
      prompt: 'consent', // Forces consent screen to guarantee refresh_token is returned
      scope: GMAIL_OAUTH_SCOPES,
      state,
      include_granted_scopes: true,
    });

    return res.json({
      success: true,
      url: authUrl,
      configured: true,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth authorization code redirect and token exchange
 */
async function googleOAuthCallback(req, res, next) {
  try {
    ensureDbConnected();
    const { code, state, error } = req.query;

    if (error) {
      console.warn('⚠️ [Google OAuth] User cancelled or Google returned error:', error);
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${CLIENT_URL}/login?error=missing_oauth_code`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new ApiError(500, 'Google OAuth credentials not configured on server.');
    }

    const oauth2Client = getGoogleOAuth2Client();

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens || !tokens.access_token) {
      throw new ApiError(401, 'Failed to obtain access token from Google OAuth.');
    }

    oauth2Client.setCredentials(tokens);

    let googleSub, email, name, image;
    if (tokens.id_token) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleSub = payload.sub;
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || email.split('@')[0];
      image = payload.picture || null;
    } else {
      const userinfoRes = await oauth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });
      const data = userinfoRes.data;
      googleSub = data.sub;
      email = data.email.toLowerCase().trim();
      name = data.name || data.given_name || email.split('@')[0];
      image = data.picture || null;
    }

    // 1. Check or create User
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
            emailVerified: new Date(),
          },
        });
      } else {
        const updates = {};
        if (!user.image && image) updates.image = image;
        if ((!user.name || user.name === 'User') && name) updates.name = name;
        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
          });
        }
      }
    }

    // 2. Compute expiry timestamp in seconds and encrypt tokens
    const expiresAt = tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null;
    const existingRefreshToken = account?.refreshToken;
    const rawRefreshToken = tokens.refresh_token || existingRefreshToken || null;
    const encryptedAccessToken = tokens.access_token ? encryptToken(tokens.access_token) : null;
    const encryptedRefreshToken = rawRefreshToken
      ? (rawRefreshToken.startsWith('enc:') ? rawRefreshToken : encryptToken(rawRefreshToken))
      : null;

    // 3. Upsert Account record with encrypted Gmail scopes and tokens
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          tokenType: tokens.token_type || 'Bearer',
          scope: tokens.scope || null,
          idToken: tokens.id_token || null,
        },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleSub,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          tokenType: tokens.token_type || 'Bearer',
          scope: tokens.scope || null,
          idToken: tokens.id_token || null,
        },
      });
    }

    // 4. Ensure user workspace exists
    const workspace = await getOrCreateUserWorkspace(user.id, user.name);

    // 5. Issue session cookie
    const token = signToken({ id: user.id, email: user.email, workspaceId: workspace.id });
    setCookieToken(res, token);

    // 6. Redirect back to client app
    return res.redirect(`${CLIENT_URL}/?connected=gmail`);
  } catch (err) {
    console.error('❌ [Google OAuth Callback Error]:', err.message);
    return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`);
  }
}

/**
 * GET /api/auth/gmail/status
 * Returns Gmail connection status for the authenticated user
 * Crucial: NEVER exposes accessToken or refreshToken to frontend
 */
async function getGmailStatus(req, res, next) {
  try {
    ensureDbConnected();
    const account = await prisma.account.findFirst({
      where: {
        userId: req.user.id,
        provider: 'google',
      },
      select: {
        id: true,
        providerAccountId: true,
        scope: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        refreshToken: true,
      },
    });

    const isConnected = Boolean(account && (account.refreshToken || account.scope?.includes('gmail')));
    const hasModifyScope = Boolean(account?.scope?.includes('gmail.modify') || account?.scope?.includes('mail.google.com'));
    const hasSendScope = Boolean(account?.scope?.includes('gmail.send') || account?.scope?.includes('mail.google.com'));

    return res.json({
      success: true,
      connected: isConnected,
      account: isConnected
        ? {
            id: account.id,
            email: req.user.email,
            scopes: account.scope ? account.scope.split(' ') : [],
            hasModifyScope,
            hasSendScope,
            connectedAt: account.createdAt,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/gmail/disconnect
 * Disconnects Gmail account for the authenticated user
 */
async function disconnectGmail(req, res, next) {
  try {
    ensureDbConnected();
    await prisma.account.deleteMany({
      where: {
        userId: req.user.id,
        provider: 'google',
      },
    });

    return res.json({
      success: true,
      message: 'Gmail account disconnected successfully.',
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
  getGoogleAuthUrl,
  googleOAuthCallback,
  getGmailStatus,
  disconnectGmail,
  forgotPassword,
  resetPassword,
  status,
  GMAIL_OAUTH_SCOPES,
  getGoogleOAuth2Client,
};
