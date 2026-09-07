// Central environment configuration for MailPilot API
// All process.env references live here — no scattered env reads across the codebase
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'mailpilot_dev_secret_change_in_production';

// In production, reject weak or default JWT secret
if (NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'mailpilot_dev_secret_change_in_production')) {
  throw new Error('FATAL: In production, JWT_SECRET must be configured with a strong random secret.');
}

module.exports = {
  PORT: parseInt(process.env.PORT || '5050', 10),
  NODE_ENV,

  // Database Connection (Supabase PostgreSQL via Prisma)
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',

  // Supabase Project (REST API, Auth, Storage)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // JWT authentication
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5050/api/auth/google/callback',

  // Client origin & App URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  APP_URL: process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:5050',

  // Cookie settings
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // Email Delivery (Resend / SMTP)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'MailPilot <onboarding@resend.dev>',
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@mailpilot.io',

  // SMTP Fallback (optional for local dev)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',

  // Tracking & Security
  TRACKING_SECRET: process.env.TRACKING_SECRET || JWT_SECRET,

  // Resend Webhook Signing Secret (from Resend Dashboard → Webhooks)
  // Required to verify incoming bounce/complaint webhook payloads
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET || '',

  // AI Assistant (OpenAI / Gemini)
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Stripe Billing (Optional)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
};

