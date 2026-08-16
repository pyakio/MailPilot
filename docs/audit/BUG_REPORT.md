# MailPilot — Comprehensive Bug Discovery Report

## Overview
This document compiles all discovered bugs, mismatches, logic gaps, and potential issues across the MailPilot codebase.

---

## Complete Bug Inventory (Sorted by Severity)

### CRITICAL SEVERITY

#### BUG-001: Missing Database Storage for Campaigns, Contacts, and Templates
- **File**: `server/controllers/campaigns.controller.js`, `server/controllers/contacts.controller.js`, `server/controllers/templates.controller.js`
- **Line/Function**: In-memory array handlers
- **Root Cause**: Campaigns, Contacts, and Templates are stored in Node.js process global arrays (`const campaigns = [...]`). While `User` auth is integrated with Prisma PostgreSQL, resources reset on server restart.
- **Impact**: User-created campaigns, subscribers, and templates are lost whenever the server process restarts.
- **How to Reproduce**: Create a campaign, restart the server (`npm run dev`), list campaigns → data resets to initial 2 demo items.
- **Recommended Fix**: Add `Campaign`, `Contact`, and `Template` models to `prisma/schema.prisma` and wire Prisma queries into controllers.

---

### HIGH SEVERITY

#### BUG-002: Notification Service API Method Mismatches
- **File**: `client/src/services/notificationService.js` vs `server/routes/notifications.routes.js`
- **Line/Function**: `markAsRead()` and `clearAll()`
- **Root Cause**:
  - `notificationService.markAsRead(id)` calls `PUT /notifications/:id/read`, but server route defines `POST /api/notifications/:id/read`.
  - `notificationService.clearAll()` calls `DELETE /notifications`, but server route defines `POST /api/notifications/read-all`.
- **Impact**: Clicking "Mark as read" or "Clear all" in top navbar notification menu throws HTTP 404 network errors.
- **How to Reproduce**: Open top navbar notification bell menu, click mark read → browser console shows 404.
- **Recommended Fix**: Align `notificationService.js` HTTP methods and path URLs to match `notifications.routes.js`.

#### BUG-003: Analytics Page Statistics & Charts Not Wired
- **File**: `client/src/features/analytics/pages/AnalyticsPage.jsx`
- **Line/Function**: Render return statement
- **Root Cause**: `AnalyticsPage.jsx` renders static KPI cards with hardcoded strings (`12,450 Total Sent`, `38.4% Avg Open Rate`, `12.6% CTR`, `99.2% Deliverability`). The Recharts components (`CampaignBreakdownChart`, `CampaignPerformanceChart`, `EmailOpenTrendChart`) exist in `client/src/shared/components/charts/` but are never imported or rendered.
- **Impact**: Analytics page displays static fake numbers and zero visualization charts despite `/api/analytics` backend endpoint existing.
- **How to Reproduce**: Navigate to `/analytics` → observe hardcoded cards and absence of charts.
- **Recommended Fix**: Import `analyticsService.getAnalytics`, fetch telemetry data on mount, and render `EmailOpenTrendChart` & `CampaignPerformanceChart`.

#### BUG-004: Settings Page Save completely Mocked
- **File**: `client/src/services/settingsService.js` & `client/src/features/settings/pages/SettingsPage.jsx`
- **Line/Function**: `settingsService` methods & `handleSaveSettings`
- **Root Cause**: `settingsService.js` returns a hardcoded `Promise.resolve()` with static data (`fromName`, `apiKey: 'mp_live_99a8b7c6d5e4f3a2b1c0'`, `domainStatus: 'VERIFIED'`). No `/api/settings` route exists on Express backend.
- **Impact**: User updates to name, email, sender domain, or API key are not saved to the server or database.
- **How to Reproduce**: Change name on `/settings` page, click Save, refresh page → name reverts.
- **Recommended Fix**: Implement `server/routes/settings.routes.js` and `server/controllers/settings.controller.js` to persist workspace settings.

---

### MEDIUM SEVERITY

#### BUG-005: Unused & Empty Code Directories
- **File**: `client/src/app/routes/`, `client/src/routes/`, `client/src/config/`, `client/src/types/`, `client/src/app/store/`, `client/src/features/auth/components/`, `client/src/features/auth/hooks/`, `client/src/features/auth/services/`, `client/src/features/auth/types/`, `client/src/features/auth/utils/`, `server/services/`, `server/validators/`
- **Root Cause**: Empty directories left over from project boilerplate layout setup.
- **Impact**: Confuses developers and inflates repository tree structure.
- **Recommended Fix**: Clean up empty unused subdirectories or add placeholders.

#### BUG-006: Duplicate Prisma Schema and Migration Files
- **File**: `server/prisma/schema.prisma` & `server/prisma/migrations/...`
- **Root Cause**: Duplicated schema and migration files exist in both `prisma/` root and `server/prisma/`.
- **Impact**: Risks schema drift if one directory is updated without updating the mirror.
- **Recommended Fix**: Standardize on `prisma/schema.prisma` at workspace root and configure Prisma CLI in server scripts to point to `../prisma/schema.prisma`.

---

### LOW SEVERITY

#### BUG-007: Unrendered Recharts Components
- **File**: `client/src/shared/components/charts/CampaignBreakdownChart.jsx`, `CampaignPerformanceChart.jsx`, `EmailOpenTrendChart.jsx`
- **Root Cause**: Exported chart components are standalone modules with zero import references in any page.
- **Impact**: Adds unused bundle code to client JS build.
- **Recommended Fix**: Wire chart components into `AnalyticsPage.jsx`.
