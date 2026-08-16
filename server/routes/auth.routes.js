const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  googleAuth,
  forgotPassword,
  resetPassword,
  status,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../validators/validate.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  googleAuthSchema,
} = require('../validators/auth.validator');

const router = Router();

// Rate limiter for authentication endpoints (relaxed in dev/test, 20 in prod)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 500,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.get('/status', status);
router.post('/auth/register', authLimiter, validate(registerSchema), register);
router.post('/auth/login', authLimiter, validate(loginSchema), login);
router.post('/auth/logout', logout);
router.post('/auth/google', authLimiter, validate(googleAuthSchema), googleAuth);
router.post('/auth/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/auth/me', authMiddleware, getMe);
router.put('/auth/profile', authMiddleware, validate(updateProfileSchema), updateProfile);

module.exports = router;


