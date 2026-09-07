// Express Application Factory — MailPilot
// Configures all middleware and routes.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { CLIENT_URL } = require('./config/env');

// Route modules
const authRoutes = require('./routes/auth.routes');
const campaignRoutes = require('./routes/campaigns.routes');
const contactRoutes = require('./routes/contacts.routes');
const templateRoutes = require('./routes/templates.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notifications.routes');
const trackRoutes = require('./routes/track.routes');
const unsubscribeRoutes = require('./routes/unsubscribe.routes');
const aiRoutes = require('./routes/ai.routes');
const inboxRoutes = require('./routes/inbox.routes');

const { authMiddleware } = require('./middlewares/auth.middleware');
const { getSummary } = require('./controllers/campaigns.controller');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { globalApiLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

// ─── Security & Core Middleware ─────────────────────────────────────────────
// Apply global API rate limit before any route resolves
app.use('/api', globalApiLimiter);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows tracking pixel loading across mail clients
}));

app.use(cors({
  origin: CLIENT_URL,
  credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', authRoutes);                          // /api/auth/*, /api/status
app.use('/api/inbox', inboxRoutes);                    // /api/inbox/*
app.use('/api/campaigns', campaignRoutes);            // /api/campaigns/*
app.use('/api/contacts', contactRoutes);              // /api/contacts/*
app.use('/api/templates', templateRoutes);            // /api/templates/*
app.use('/api/analytics', analyticsRoutes);           // /api/analytics
app.use('/api/notifications', notificationRoutes);    // /api/notifications/*
app.use('/api/track', trackRoutes);                    // /api/track/open/:token, /api/track/click/:token
app.use('/api/unsubscribe', unsubscribeRoutes);        // /api/unsubscribe/:token
app.use('/api/ai', aiRoutes);                          // /api/ai/*

// Keep /api/summary as an alias for dashboard compatibility
app.get('/api/summary', authMiddleware, getSummary);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
