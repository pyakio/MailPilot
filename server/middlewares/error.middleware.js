// Global error handling middleware for MailPilot API
// Must be registered LAST in app.js (after all routes)

const { NODE_ENV } = require('../config/env');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Log full error in development
  if (NODE_ENV === 'development') {
    console.error(`❌ [Error] ${req.method} ${req.path}:`, err);
  } else {
    console.error(`❌ [Error] ${req.method} ${req.path}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    message: message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// Helper to create structured API errors
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

module.exports = { errorMiddleware, ApiError };
