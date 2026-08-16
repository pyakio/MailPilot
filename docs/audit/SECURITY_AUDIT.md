# MailPilot — Security Audit

## Overview
This document evaluates authentication, session management, CORS, input sanitization, environment secrets, and data exposure across MailPilot.

---

## Security Audit Items

### 1. Hardcoded Secrets & Credentials Check
- **Status**: **PASS**
- **Findings**: No raw passwords, database connection strings, JWT secrets, or Google OAuth client secrets are hardcoded in source code files.
- **Environment Handling**: Secrets are read via `process.env` through `server/config/env.js`.

### 2. Git & Version Control Hygiene
- **Status**: **PASS**
- **Findings**: `.gitignore` properly excludes `.env`, `.env.local`, `.env.development.local`, etc. `.env.example` templates contain variable names and sample format strings only.

### 3. Authentication & Session Security
- **Status**: **PASS / SECURE**
- **Mechanism**:
  - Email/Password login hashes passwords with `bcryptjs` (salt rounds: 12).
  - Passwords are never returned in user queries (`passwordHash` excluded in `buildUserPublic` helper).
  - JWT tokens are issued with `JWT_SECRET` and stored in an `httpOnly` cookie (`mailpilot_token`) with `sameSite: 'lax'` and `maxAge: 7 days`.
  - Client Axios instance uses `withCredentials: true` to prevent manual JWT localStorage exposure to XSS.

### 4. Google OAuth 2.0 Security
- **Status**: **PASS / SECURE**
- **Mechanism**:
  - Uses `google-auth-library` `OAuth2Client.verifyIdToken` to cryptographically verify Google JWT signatures server-side.
  - Links accounts using Google's stable `sub` identifier (`providerAccountId`).
  - Google ID tokens and client secrets are not stored in plaintext in database models.

### 5. CORS Configuration
- **Status**: **PASS**
- **Mechanism**: `cors({ origin: CLIENT_URL, credentials: true })` restricts API requests to the configured client origin (`http://localhost:5173`).

### 6. Error Handling & Information Leaks
- **Status**: **PASS**
- **Mechanism**: `server/middlewares/error.middleware.js` formats error responses cleanly. In `NODE_ENV === 'production'`, stack traces are suppressed.

### 7. SQL Injection & Input Validation
- **Status**: **PASS**
- **Mechanism**: Database queries use Prisma ORM parameterized queries (`prisma.user.findUnique`, `prisma.user.create`). Raw SQL calls use Prisma tagged template literals (`prisma.$queryRaw\`SELECT 1\``).

---

## Security Recommendations for Production
1. **Enable Rate Limiting**: Add `express-rate-limit` middleware to `/api/auth/login` and `/api/auth/register` routes to prevent brute-force attacks.
2. **Helmet Middleware**: Add `helmet` middleware to Express `app.js` to set HTTP security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
3. **Cookie Security in Production**: Ensure `NODE_ENV=production` is set so `secure: true` (HTTPS only) is active for the `mailpilot_token` cookie.
