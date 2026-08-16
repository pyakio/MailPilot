# MailPilot — System Architecture
*Last updated: 2026-08-13*

---

## High-Level Architecture Overview

MailPilot is an AI-powered email marketing SaaS platform built as a clean full-stack application.

```
┌────────────────────────────────────────────────────────┐
│                   User Browser Client                  │
│       React 18 + Vite + Tailwind CSS v4 (Port 5173)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP REST (Axios + Cookies)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Server                   │
│        Node.js + Express 4.18.2 REST (Port 5050)      │
│                                                        │
│  ├── JWT Middleware (httpOnly Cookie Verification)     │
│  ├── Auth / OAuth Controllers (bcrypt + Google sub)    │
│  └── Prisma Client Singleton (server/config/prisma.js) │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ PostgreSQL Wire Protocol
                            ▼
┌────────────────────────────────────────────────────────┐
│               Supabase PostgreSQL Database             │
│   Prisma ORM Models (users, accounts, sessions,        │
│             workspaces, workspace_memberships)         │
└────────────────────────────────────────────────────────┘
```

---

## Data Layer Architecture (Prisma + Supabase PostgreSQL)

The database schema (`prisma/schema.prisma`) implements a multi-tenant foundation:

```
User (users)
 ├── Account[] (accounts) — OAuth provider identities (Google sub)
 ├── Session[] (sessions) — Application sessions
 └── WorkspaceMembership[] (workspace_memberships) ──► Workspace (workspaces)
```

### Models Overview

1. **`User`**: Internal user identity with password hash or OAuth identity
2. **`Account`**: External OAuth identity links (`provider` + `providerAccountId`)
3. **`Session`**: Session token management
4. **`Workspace`**: Tenant boundary for organization resources
5. **`WorkspaceMembership`**: User-to-workspace junction with roles (`ADMIN`, `EDITOR`, `VIEWER`)

---

## Future Expansion Architecture

The initial foundation schema is structured to seamlessly support:
- `Campaign` & `CampaignRecipient`
- `Contact` (Audience subscriber lists & custom fields)
- `Template` (Email layouts & merge tags)
- `AiGeneration` (AI copywriting prompts, completions & token usage)
- `Analytics` & `EmailEvent` (Deliverability, opens, clicks telemetry)
- `Automation` & `Workflow` (Drip campaign queue workers)
