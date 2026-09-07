// Rate Limiter Middleware — MailPilot
// Provides tiered per-IP rate limits across all API surfaces.
// Limits are relaxed in development/test and enforced strictly in production.

const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Helper to produce a standard error response body for 429 responses.
 * @param {string} message - Human-readable description of the limit hit.
 */
function limitBody(message) {
  return { success: false, error: message };
}

// ─── General API limiter ──────────────────────────────────────────────────────
// Applied globally to all /api/* routes as a baseline floor.
// 300 req / 15 min in production (~1 req / 3 s steady state), 10 000 in dev.
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 10_000,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitBody('Too many requests. Please slow down and try again shortly.'),
});

// ─── AI / LLM limiter ────────────────────────────────────────────────────────
// Tight limit on all LLM-backed endpoints to guard against runaway API costs.
// Covers: /api/ai/*, /api/inbox/polish, summarize, smart-replies.
// 30 req / 15 min in production (~2 per minute).
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitBody(
    'AI rate limit reached. You are allowed 30 AI requests per 15 minutes. Please try again shortly.'
  ),
});

// ─── Email send limiter ───────────────────────────────────────────────────────
// Prevents abuse of the Gmail send pipeline.
// 20 sends / hour in production.
const sendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 20 : 1_000,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitBody(
    'Email send rate limit reached. You may send up to 20 emails per hour. Please try again later.'
  ),
});

// ─── Gmail sync limiter ───────────────────────────────────────────────────────
// Manual sync triggers are expensive; cap at 10 per 10 minutes in production.
const syncLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProd ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitBody(
    'Sync rate limit reached. Manual sync is allowed up to 10 times per 10 minutes.'
  ),
});

// ─── Search / batch limiter ───────────────────────────────────────────────────
// Search and batch operations run DB-heavy queries; cap at 60 per minute.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 60 : 2_000,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitBody('Search/batch rate limit reached. Please wait a moment before retrying.'),
});

module.exports = {
  globalApiLimiter,
  aiLimiter,
  sendLimiter,
  syncLimiter,
  searchLimiter,
};
