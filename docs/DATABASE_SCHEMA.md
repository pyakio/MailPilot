# MailPilot — Database Schema Reference

## Overview
- **Database Engine**: PostgreSQL (Supabase)
- **ORM**: Prisma ORM (v5.22.0)
- **Primary Schema**: `prisma/schema.prisma`

---

## Active Prisma Models

### 1. `User` (`@@map("users")`)
- `id`: String (`cuid`, Primary Key)
- `name`: String (Optional)
- `email`: String (Unique)
- `emailVerified`: DateTime (Optional)
- `image`: String (Optional avatar URL)
- `passwordHash`: String (Optional, bcrypt hash)
- `status`: UserStatus (`ACTIVE` | `SUSPENDED`, Default `ACTIVE`)
- `createdAt`: DateTime (Auto `now()`)
- `updatedAt`: DateTime (Auto `updatedAt`)
- **Relations**: `accounts` (Account[]), `sessions` (Session[]), `memberships` (WorkspaceMembership[])

### 2. `Account` (`@@map("accounts")`)
- `id`: String (`cuid`, Primary Key)
- `userId`: String (Foreign Key -> `User.id`, CASCADE Delete)
- `type`: String (e.g. `"oauth"`)
- `provider`: String (e.g. `"google"`)
- `providerAccountId`: String (Google stable `sub` ID)
- `refreshToken`: String? (`@db.Text`)
- `accessToken`: String? (`@db.Text`)
- `expiresAt`: Int?
- `tokenType`: String?
- `scope`: String?
- `idToken`: String? (`@db.Text`)
- `sessionState`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes & Constraints**: `@@unique([provider, providerAccountId])`, `@@index([userId])`

### 3. `Session` (`@@map("sessions")`)
- `id`: String (`cuid`, Primary Key)
- `sessionToken`: String (Unique)
- `userId`: String (Foreign Key -> `User.id`, CASCADE Delete)
- `expires`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes**: `@@index([userId])`

### 4. `Workspace` (`@@map("workspaces")`)
- `id`: String (`cuid`, Primary Key)
- `name`: String
- `slug`: String (Unique URL slug)
- `logo`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations**: `memberships` (WorkspaceMembership[]), `campaigns` (Campaign[]), `contacts` (Contact[]), `templates` (Template[])

### 5. `WorkspaceMembership` (`@@map("workspace_memberships")`)
- `id`: String (`cuid`, Primary Key)
- `userId`: String (Foreign Key -> `User.id`, CASCADE Delete)
- `workspaceId`: String (Foreign Key -> `Workspace.id`, CASCADE Delete)
- `role`: WorkspaceRole (`ADMIN` | `EDITOR` | `VIEWER`, Default `ADMIN`)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes & Constraints**: `@@unique([userId, workspaceId])`, `@@index([userId])`, `@@index([workspaceId])`

### 6. `Campaign` (`@@map("campaigns")`)
- `id`: String (`cuid`, Primary Key)
- `workspaceId`: String (Foreign Key -> `Workspace.id`, CASCADE Delete)
- `name`: String
- `subject`: String
- `previewText`: String?
- `content`: String? (`@db.Text`)
- `templateId`: String?
- `audienceList`: String (Default `"All Contacts"`)
- `status`: CampaignStatus (`DRAFT` | `SCHEDULED` | `SENDING` | `SENT` | `CANCELLED` | `FAILED`, Default `DRAFT`)
- `scheduledAt`: DateTime?
- `sentAt`: DateTime?
- `stats`: Json? (Stats object `{sent, delivered, opened, clicked, bounced, unsubscribed}`)
- `aiScore`: Float?
- `tags`: String[]
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes**: `@@index([workspaceId])`

### 7. `Contact` (`@@map("contacts")`)
- `id`: String (`cuid`, Primary Key)
- `workspaceId`: String (Foreign Key -> `Workspace.id`, CASCADE Delete)
- `email`: String
- `name`: String?
- `tags`: String[]
- `subscribed`: Boolean (Default `true`)
- `source`: String (Default `"manual"`)
- `engagement`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes & Constraints**: `@@unique([workspaceId, email])`, `@@index([workspaceId])`

### 8. `Template` (`@@map("templates")`)
- `id`: String (`cuid`, Primary Key)
- `workspaceId`: String (Foreign Key -> `Workspace.id`, CASCADE Delete)
- `title`: String
- `subject`: String?
- `body`: String (`@db.Text`)
- `htmlBody`: String? (`@db.Text`)
- `category`: String (Default `"custom"`)
- `usageCount`: Int (Default `0`)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Indexes**: `@@index([workspaceId])`
