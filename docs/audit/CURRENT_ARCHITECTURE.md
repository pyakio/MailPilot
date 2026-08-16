# MailPilot — Current Architecture (Technical Audit)

## Executive Summary
MailPilot is an AI-powered email marketing SaaS workspace monorepo. It features a React 18 frontend built with Vite and Tailwind CSS v4, communicating with a Node.js Express 4 REST API server. The database foundation uses Prisma ORM (v5.22.0) with Supabase PostgreSQL, operating with an in-memory fallback when database credentials are not present.

---

## High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   User Browser Client                  │
│       React 18 + Vite + Tailwind CSS v4 (Port 5173)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP REST (Axios + Credentials Cookie)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Server                   │
│        Node.js + Express 4.18.2 REST (Port 5050)      │
│                                                        │
│  ├── JWT Auth Middleware (mailpilot_token cookie)      │
│  ├── Auth / Campaign / Contact / Template Controllers  │
│  └── Prisma Client Singleton (server/config/prisma.js) │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ PostgreSQL Protocol (Port 6543/5432)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Supabase PostgreSQL Database             │
│   Prisma Schema (users, accounts, sessions,            │
│              workspaces, workspace_memberships)        │
└────────────────────────────────────────────────────────┘
```

---

## Layer-by-Layer Architecture

### 1. Frontend Layer (`client/`)
- **Framework**: React 18.3.1
- **Build Engine**: Vite 5.4.2 (@vitejs/plugin-react)
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite) + CSS Custom Variables (`client/src/styles/index.css`)
- **Routing**: React Router DOM v7.1.3 (`AppRoutes.jsx`)
- **State Management**: React Context API (`AuthContext`, `ThemeContext`, `ToastContext`)
- **HTTP Client**: Axios v1.7.9 (`client/src/lib/axios.js` with `withCredentials: true`)
- **Icons**: react-icons v5.4.0 (Feather `fi` family)
- **Charts**: Recharts v2.11.10 (`CampaignBreakdownChart`, `CampaignPerformanceChart`, `EmailOpenTrendChart`)

### 2. Backend Layer (`server/`)
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **App Structure**: Entry point (`server/index.js`), Express App Factory (`server/app.js`), Config (`server/config/env.js`, `server/config/db.js`, `server/config/prisma.js`), Middlewares (`auth.middleware.js`, `error.middleware.js`).
- **Controllers**: `auth.controller.js`, `campaigns.controller.js`, `contacts.controller.js`, `templates.controller.js`, `analytics.controller.js`.
- **Routes**: `auth.routes.js`, `campaigns.routes.js`, `contacts.routes.js`, `templates.routes.js`, `analytics.routes.js`, `notifications.routes.js`.

### 3. Database Layer (`prisma/` & `server/prisma/`)
- **Provider**: Supabase PostgreSQL
- **ORM**: Prisma ORM v5.22.0
- **Schema**: `prisma/schema.prisma`
- **Models**: `User`, `Account`, `Session`, `Workspace`, `WorkspaceMembership`
- **Enums**: `UserStatus`, `WorkspaceRole`
- **Migrations**: `prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql`

---

## Data Flow Architecture

1. **User Authentication Flow**:
   - User submits credentials on `/login` or `/register` (or uses Google Sign-In button).
   - Client sends `POST /api/auth/login` or `POST /api/auth/register` or `POST /api/auth/google`.
   - Server verifies credentials (bcrypt hash comparison or Google ID Token verification via `google-auth-library`).
   - Server signs JWT and attaches it to an `httpOnly` cookie (`mailpilot_token`).
   - Client `AuthContext` verifies session via `GET /api/auth/me` on mount.

2. **Campaign & Audience Resource Flow**:
   - React features (`CampaignsPage`, `ContactsPage`, `TemplatesPage`) trigger CRUD methods on service modules (`campaignService`, `contactService`, `templateService`).
   - Axios instance (`client/src/lib/axios.js`) dispatches requests to `http://localhost:5050/api/...`.
   - Express `auth.middleware.js` verifies the JWT cookie and attaches `req.user`.
   - Express controllers manage resource data (Prisma DB mode or in-memory array fallback).
