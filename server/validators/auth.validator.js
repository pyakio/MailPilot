// Auth Schemas — MailPilot

const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please provide a valid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
  name: z.string().optional(),
  email: z.string().optional(),
  image: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  googleAuthSchema,
};
