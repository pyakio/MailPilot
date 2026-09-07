#!/usr/bin/env node
/**
 * MailPilot — Supabase Database Setup Script
 * 
 * Pushes the Prisma schema to Supabase PostgreSQL using the service role key.
 * Run this from the /server directory: node scripts/setup-supabase-db.js
 *
 * This script does NOT require your database password.
 * It uses the Supabase service role key to execute SQL via the REST API.
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

console.log('🚀 MailPilot Database Setup');
console.log('   Project:', SUPABASE_URL);
console.log('   Pushing schema to Supabase PostgreSQL...\n');

// Full schema SQL
const SQL = `
-- MailPilot Database Schema — Auto-generated from Prisma schema
-- Run in Supabase Dashboard → SQL Editor or via this script

-- Create enums
DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EmailEventType" AS ENUM ('SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable: users
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

-- CreateTable: accounts
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

-- CreateTable: sessions
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

-- CreateTable: workspaces
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

-- CreateTable: workspace_memberships
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

-- CreateTable: campaigns
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

-- CreateTable: contacts
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

-- CreateTable: templates
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

-- CreateTable: notifications
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

-- CreateTable: email_events
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

-- CreateTable: password_reset_tokens
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

-- CreateTable: subscriptions
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

-- Foreign Keys
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_memberships" DROP CONSTRAINT IF EXISTS "workspace_memberships_userId_fkey";
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_memberships" DROP CONSTRAINT IF EXISTS "workspace_memberships_workspaceId_fkey";
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "campaigns_workspaceId_fkey";
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contacts" DROP CONSTRAINT IF EXISTS "contacts_workspaceId_fkey";
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "templates" DROP CONSTRAINT IF EXISTS "templates_workspaceId_fkey";
ALTER TABLE "templates" ADD CONSTRAINT "templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_workspaceId_fkey";
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "email_events" DROP CONSTRAINT IF EXISTS "email_events_campaignId_fkey";
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "email_events" DROP CONSTRAINT IF EXISTS "email_events_contactId_fkey";
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_userId_fkey";
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_workspaceId_fkey";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

/**
 * Execute SQL via Supabase SQL endpoint (pg-meta or REST)
 * Uses the service role key which has full database access.
 */
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const url = new URL(`/pg-meta/v1/query`, SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(result.error || result.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(result);
          }
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  try {
    console.log('📋 Executing schema SQL on Supabase...');
    await executeSql(SQL);
    console.log('✅ Schema created successfully!');
    console.log('\n📋 Tables created:');
    console.log('   • users');
    console.log('   • accounts');
    console.log('   • sessions');
    console.log('   • workspaces');
    console.log('   • workspace_memberships');
    console.log('   • campaigns');
    console.log('   • contacts');
    console.log('   • templates');
    console.log('   • notifications');
    console.log('   • email_events');
    console.log('   • password_reset_tokens');
    console.log('   • subscriptions');
    console.log('\n🎉 Your Supabase database is ready! You can now:');
    console.log('   1. Add the DATABASE_URL to server/.env');
    console.log('   2. Start the server: npm run dev');
    console.log('   3. Register at http://localhost:5173/register');
  } catch (err) {
    console.error('❌ Schema execution failed:', err.message);
    console.log('\n📋 Manual Setup Instructions:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/vcelknanpebcxbuqpqbe/sql/new');
    console.log('   2. Copy and paste the SQL from: server/scripts/supabase-schema.sql');
    console.log('   3. Click "Run"');
    console.log('\n   This will create all tables needed for MailPilot.');
    process.exit(1);
  }
}

main();
