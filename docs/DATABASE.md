# MailPilot — Database Architecture & Setup Guide
*ORM: Prisma Client v5.22.0 | Database: Supabase PostgreSQL*

---

## Overview

MailPilot uses **Supabase PostgreSQL** as its primary database and **Prisma** as its Object-Relational Mapping (ORM) layer.

```
React Frontend (Vite)
         │
         ▼ REST API
Express Backend (Node.js)
         │
         ▼ Prisma Client
  Prisma ORM (prisma/schema.prisma)
         │
         ▼ PostgreSQL Protocol (SSL / Pooling)
Supabase PostgreSQL Database
```

---

## Environment Variables

The database setup requires two connection strings supplied by your Supabase project settings:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Transaction pooler connection URL (Supabase Port 6543) used by application runtime |
| `DIRECT_URL` | Direct connection URL (Supabase Port 5432) used by Prisma CLI migrations |

*Example (in `server/.env`):*
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

---

## Prisma Schema Location

The database schema is defined at:
- `prisma/schema.prisma` (workspace root primary)
- `server/prisma/schema.prisma` (server directory mirror)

---

## Initial Foundation Schema Models

### Enums

#### `UserStatus`
- `ACTIVE` — Standard active user account
- `SUSPENDED` — Account suspended for policy or security reasons

#### `WorkspaceRole`
- `ADMIN` — Full workspace configuration and administrative access
- `EDITOR` — Campaign creation, editing, and audience management
- `VIEWER` — Read-only access to campaign analytics and reporting

---

### Models

#### 1. `User` (`@@map("users")`)
Represents registered user identity and core profile parameters.
- `id`: String (cuid, primary key)
- `name`: String?
- `email`: String (unique)
- `emailVerified`: DateTime?
- `image`: String?
- `passwordHash`: String? (null for OAuth-only users)
- `status`: UserStatus (default `ACTIVE`)
- `createdAt`: DateTime (default `now()`)
- `updatedAt`: DateTime (`updatedAt`)
- **Relations**: `accounts` (Account[]), `sessions` (Session[]), `memberships` (WorkspaceMembership[])

#### 2. `Account` (`@@map("accounts")`)
Stores external OAuth identity credentials (e.g. Google Sign-In `sub` identifier).
- `id`: String (cuid, primary key)
- `userId`: String (foreign key -> `User.id`, CASCADE delete)
- `type`: String (e.g. `"oauth"`)
- `provider`: String (e.g. `"google"`)
- `providerAccountId`: String (Google stable `sub` ID)
- `refreshToken`: String? (Text)
- `accessToken`: String? (Text)
- `expiresAt`: Int?
- `tokenType`: String?
- `scope`: String?
- `idToken`: String? (Text)
- `sessionState`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes & Constraints**: Unique constraint `@@unique([provider, providerAccountId])`, index `@@index([userId])`

#### 3. `Session` (`@@map("sessions")`)
Tracks active application sessions for user authentication.
- `id`: String (cuid, primary key)
- `sessionToken`: String (unique)
- `userId`: String (foreign key -> `User.id`, CASCADE delete)
- `expires`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes**: `@@index([userId])`

#### 4. `Workspace` (`@@map("workspaces")`)
Core multi-tenant organization boundary for campaigns and audience assets.
- `id`: String (cuid, primary key)
- `name`: String
- `slug`: String (unique URL slug)
- `logo`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations**: `memberships` (WorkspaceMembership[])

#### 5. `WorkspaceMembership` (`@@map("workspace_memberships")`)
Junction model establishing user access rights within a workspace.
- `id`: String (cuid, primary key)
- `userId`: String (foreign key -> `User.id`, CASCADE delete)
- `workspaceId`: String (foreign key -> `Workspace.id`, CASCADE delete)
- `role`: WorkspaceRole (default `ADMIN`)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes & Constraints**: Unique constraint `@@unique([userId, workspaceId])`, indexes `@@index([userId])`, `@@index([workspaceId])`

---

## Migrations

The initial SQL migration script is saved under:
`prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql`

To apply pending migrations to your Supabase PostgreSQL instance:
```bash
cd server
npx prisma migrate dev
```

To generate updated Prisma Client types:
```bash
cd server
npx prisma generate
```

To validate the schema:
```bash
cd server
npx prisma validate
```

---

## Prisma Client Location

The singleton Prisma Client instance is initialized at:
`server/config/prisma.js`

Usage in backend code:
```javascript
const prisma = require('./config/prisma');

// Example query
const user = await prisma.user.findUnique({ where: { email } });
```
