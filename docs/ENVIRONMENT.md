# MailPilot — Environment Variables Reference
*Single Source of Truth for Environment Configuration*

---

## Overview

MailPilot environment variables are configured per layer (`server/.env` and `client/.env`).
Never commit `.env` files to git repositories. Sample templates are maintained in `.env.example` files.

---

## Backend Environment Variables (`server/.env`)

| Variable | Required | Description | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | HTTP server listener port | `5050` |
| `NODE_ENV` | Yes | Application execution environment (`development` / `production`) | `development` |
| `DATABASE_URL` | Yes (DB mode) | Supabase PostgreSQL transaction pooler connection URL | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | Yes (DB mode) | Supabase PostgreSQL direct session connection URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | HMAC secret for signing application session JWTs | `random_secret_string` |
| `JWT_EXPIRES_IN` | Yes | JWT token expiration time window | `7d` |
| `GOOGLE_CLIENT_ID` | Optional | Google Cloud Console OAuth 2.0 Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google Cloud Console OAuth 2.0 Client Secret | `GOCSPX-secretkey` |
| `GOOGLE_CALLBACK_URL` | Optional | Redirect callback for OAuth 2.0 authorization code flow | `http://localhost:5050/api/auth/google/callback` |
| `CLIENT_URL` | Yes | Client web origin for CORS header configuration | `http://localhost:5173` |

---

## Frontend Environment Variables (`client/.env`)

| Variable | Required | Description | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Yes | Backend REST API endpoint base URL | `http://localhost:5050/api` |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID for frontend button rendering | `123456789-abc.apps.googleusercontent.com` |

---

## Security Guidelines

1. **Never print or log credentials**: Never output raw database passwords, connection strings, or secrets in logs.
2. **Ignored by Git**: `.gitignore` explicitly excludes all `.env` variants (`.env`, `.env.local`, `.env.development.local`, etc.).
3. **Rotation**: If a credential is ever accidentally checked into source control, revoke and rotate it immediately.
