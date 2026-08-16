# MailPilot — Database Architecture & Schema Audit

## Overview
- **Database Provider**: Supabase PostgreSQL
- **ORM**: Prisma ORM v5.22.0
- **Primary Schema File**: `prisma/schema.prisma`
- **Mirrored Schema File**: `server/prisma/schema.prisma`
- **Migration Location**: `prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql`
- **Prisma Client Singleton**: `server/config/prisma.js`

---

## Prisma Schema Audit (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Models & Enums Summary

#### Enums
- **`UserStatus`**: `ACTIVE`, `SUSPENDED`
- **`WorkspaceRole`**: `ADMIN`, `EDITOR`, `VIEWER`

#### Models Detailed Audit

| Model Name | Table Name (`@@map`) | Primary Key | Key Fields | Foreign Key Relations | Indexes & Constraints | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `User` | `users` | `id` (cuid) | `name`, `email`, `emailVerified`, `image`, `passwordHash`, `status`, `createdAt`, `updatedAt` | `accounts[]`, `sessions[]`, `memberships[]` | `@unique(email)` | ACTIVE |
| `Account` | `accounts` | `id` (cuid) | `userId`, `type`, `provider`, `providerAccountId`, `refreshToken`, `accessToken`, `expiresAt`, `tokenType`, `scope`, `idToken`, `sessionState`, `createdAt`, `updatedAt` | `user` (`userId` -> `User.id` CASCADE) | `@@unique([provider, providerAccountId])`, `@@index([userId])` | ACTIVE |
| `Session` | `sessions` | `id` (cuid) | `sessionToken`, `userId`, `expires`, `createdAt`, `updatedAt` | `user` (`userId` -> `User.id` CASCADE) | `@unique(sessionToken)`, `@@index([userId])` | ACTIVE |
| `Workspace` | `workspaces` | `id` (cuid) | `name`, `slug`, `logo`, `createdAt`, `updatedAt` | `memberships[]` | `@unique(slug)` | ACTIVE |
| `WorkspaceMembership` | `workspace_memberships` | `id` (cuid) | `userId`, `workspaceId`, `role`, `createdAt`, `updatedAt` | `user` (`userId` -> `User.id` CASCADE), `workspace` (`workspaceId` -> `Workspace.id` CASCADE) | `@@unique([userId, workspaceId])`, `@@index([userId])`, `@@index([workspaceId])` | ACTIVE |

---

## Database Connection Audit

- `DATABASE_URL`: Set in `server/.env` (Points to Supabase Transaction Pooler, Port 6543)
- `DIRECT_URL`: Set in `server/.env` (Points to Supabase Direct Session Connection, Port 5432)
- **Connection Test Script**: `server/scripts/test-db-connection.js`
- **Connection Behavior**: `server/config/db.js` attempts Prisma Client connection (`prisma.$connect()`). If connection fails or credentials are placeholder strings, it logs a clean message without exposing secrets and activates in-memory array mode.

---

## Missing Models for Future Sprints (Not Yet Added)
The foundation schema is clean and ready. Future sprints will add:
- `Campaign` (with status, subject, previewText, scheduledAt, sentAt, stats)
- `Contact` (with workspaceId, email, name, tags, subscribed, source, engagement)
- `Template` (with workspaceId, title, subject, body, htmlBody, category)
- `AiGeneration` (with workspaceId, prompt, output, model, tokenCount, feedback)
- `EmailEvent` / `Analytics` (tracking opens, clicks, bounces)
