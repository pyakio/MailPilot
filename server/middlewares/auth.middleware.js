// JWT Authentication Middleware
// Verifies Bearer token from Authorization header or mailpilot_token cookie
// Attaches decoded user payload to req.user

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { isRevoked } = require('../services/tokenBlocklist.service');

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
      return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check blocklist — rejects tokens that were explicitly revoked on logout
    if (isRevoked(decoded.jti)) {
      return res.status(401).json({ success: false, error: 'Session has been revoked. Please sign in again.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
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
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!isRevoked(decoded.jti)) {
        req.user = decoded;
      }
    }
  } catch (_) {
    // Token invalid or missing — req.user remains undefined
  }
  next();
}

/**
 * Role-Based Access Control Middleware
 * Verifies that the authenticated user holds an allowed role in their active workspace.
 * Active workspace is resolved from the x-workspace-id header, or defaults to the
 * user's first (and usually only) workspace membership.
 */
function requireRole(allowedRoles = ['ADMIN', 'EDITOR']) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }

      const { prisma } = require('../config/db');

      // Resolve active workspaceId: prefer explicit header, otherwise use first membership
      const requestedWorkspaceId = req.headers['x-workspace-id'];

      const whereClause = requestedWorkspaceId
        ? { userId: req.user.id, workspaceId: requestedWorkspaceId }
        : { userId: req.user.id };

      const membership = await prisma.workspaceMembership.findFirst({
        where: whereClause,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'No workspace membership found. Access denied.',
        });
      }

      const role = membership.role || 'VIEWER';

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: `Permission denied. Requires role: [${allowedRoles.join(', ')}].`,
        });
      }

      req.userRole = role;
      req.activeWorkspaceId = membership.workspaceId;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Authorization verification failed.' });
    }
  };
}

module.exports = { authMiddleware, optionalAuth, requireRole };


