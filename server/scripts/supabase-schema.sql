-- MailPilot Database Schema for Supabase PostgreSQL
-- Generated from Prisma schema.prisma
--
-- HOW TO RUN:
--   1. Go to: https://supabase.com/dashboard/project/vcelknanpebcxbuqpqbe/sql/new
--   2. Paste this entire file into the SQL editor
--   3. Click "Run" (or press Ctrl+Enter)
--
-- This is idempotent — safe to run multiple times.

-- ─── Create ENUM Types ────────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmailEventType" AS ENUM ('SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Table: users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"            TEXT NOT NULL,
  "name"          TEXT,
  "email"         TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image"         TEXT,
  "passwordHash"  TEXT,
  "status"        "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- ─── Table: accounts (OAuth providers like Google) ───────────────────────────
CREATE TABLE IF NOT EXISTS "accounts" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refreshToken"      TEXT,
  "accessToken"       TEXT,
  "expiresAt"         INTEGER,
  "tokenType"         TEXT,
  "scope"             TEXT,
  "idToken"           TEXT,
  "sessionState"      TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");

-- ─── Table: sessions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sessions" (
  "id"           TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");

-- ─── Table: workspaces ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "workspaces" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "logo"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_slug_key" ON "workspaces"("slug");

-- ─── Table: workspace_memberships ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "workspace_memberships" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "role"        "WorkspaceRole" NOT NULL DEFAULT 'ADMIN',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_memberships_userId_workspaceId_key" ON "workspace_memberships"("userId", "workspaceId");
CREATE INDEX IF NOT EXISTS "workspace_memberships_userId_idx" ON "workspace_memberships"("userId");
CREATE INDEX IF NOT EXISTS "workspace_memberships_workspaceId_idx" ON "workspace_memberships"("workspaceId");

-- ─── Table: campaigns ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "campaigns" (
  "id"           TEXT NOT NULL,
  "workspaceId"  TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "subject"      TEXT NOT NULL,
  "previewText"  TEXT,
  "content"      TEXT,
  "templateId"   TEXT,
  "audienceList" TEXT NOT NULL DEFAULT 'All Contacts',
  "status"       "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt"  TIMESTAMP(3),
  "sentAt"       TIMESTAMP(3),
  "stats"        JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "unsubscribed": 0}',
  "aiScore"      DOUBLE PRECISION,
  "tags"         TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "campaigns_workspaceId_idx" ON "campaigns"("workspaceId");

-- ─── Table: contacts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "contacts" (
  "id"          TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "name"        TEXT,
  "tags"        TEXT[] DEFAULT ARRAY[]::TEXT[],
  "subscribed"  BOOLEAN NOT NULL DEFAULT true,
  "source"      TEXT NOT NULL DEFAULT 'manual',
  "engagement"  JSONB DEFAULT '{"opens": 0, "clicks": 0}',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_workspaceId_email_key" ON "contacts"("workspaceId", "email");
CREATE INDEX IF NOT EXISTS "contacts_workspaceId_idx" ON "contacts"("workspaceId");

-- ─── Table: templates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "templates" (
  "id"          TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "subject"     TEXT,
  "body"        TEXT NOT NULL,
  "htmlBody"    TEXT,
  "thumbnail"   TEXT,
  "category"    TEXT NOT NULL DEFAULT 'custom',
  "usageCount"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "templates_workspaceId_idx" ON "templates"("workspaceId");

-- ─── Table: notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"          TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "type"        TEXT NOT NULL DEFAULT 'info',
  "title"       TEXT NOT NULL,
  "message"     TEXT NOT NULL,
  "read"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "notifications_workspaceId_idx" ON "notifications"("workspaceId");

-- ─── Table: email_events ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "email_events" (
  "id"          TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "campaignId"  TEXT NOT NULL,
  "contactId"   TEXT NOT NULL,
  "eventType"   "EmailEventType" NOT NULL,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "email_events_workspaceId_idx" ON "email_events"("workspaceId");
CREATE INDEX IF NOT EXISTS "email_events_campaignId_idx" ON "email_events"("campaignId");
CREATE INDEX IF NOT EXISTS "email_events_contactId_idx" ON "email_events"("contactId");

-- ─── Table: password_reset_tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- ─── Table: subscriptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id"                   TEXT NOT NULL,
  "workspaceId"          TEXT NOT NULL,
  "plan"                 "PlanTier" NOT NULL DEFAULT 'FREE',
  "status"               "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId"     TEXT,
  "stripeSubscriptionId" TEXT,
  "currentPeriodEnd"     TIMESTAMP(3),
  "monthlyEmailLimit"    INTEGER NOT NULL DEFAULT 1000,
  "contactLimit"         INTEGER NOT NULL DEFAULT 500,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_workspaceId_key" ON "subscriptions"("workspaceId");

-- ─── Foreign Key Constraints ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "templates" ADD CONSTRAINT "templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "email_events" ADD CONSTRAINT "email_events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ✅ Schema complete! All 12 tables created.
