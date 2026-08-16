// JWT Authentication Middleware
// Verifies Bearer token from Authorization header or mailpilot_token cookie
// Attaches decoded user payload to req.user

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authMiddleware(req, res, next) {
  try {
    // Try Authorization header first, then fall back to cookie
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.mailpilot_token) {
      token = req.cookies.mailpilot_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

// Optional auth — attaches user if token present, continues regardless
function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.mailpilot_token) {
      token = req.cookies.mailpilot_token;
    }
    if (token) {
      req.user = jwt.verify(token, JWT_SECRET);
    }
  } catch (_) {
    // Token invalid or missing — req.user remains undefined
  }
  next();
}

/**
 * Role-Based Access Control Middleware
 * Verifies that the authenticated user holds an allowed role in their active workspace
 */
function requireRole(allowedRoles = ['ADMIN', 'EDITOR']) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      const { prisma } = require('../config/db');
      const membership = await prisma.workspaceMembership.findFirst({
        where: {
          userId: req.user.id,
        },
      });

      // Default role to ADMIN if bootstrap user
      const role = membership?.role || 'ADMIN';

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: `Permission denied. Requires role: [${allowedRoles.join(', ')}].`,
        });
      }

      req.userRole = role;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Authorization verification failed.' });
    }
  };
}

module.exports = { authMiddleware, optionalAuth, requireRole };

