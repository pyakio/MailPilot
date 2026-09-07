# MailPilot — Bug Fix Report
*Last updated: 2026-08-13*

---

## Fixed Bugs

### BUG-001: Duplicate + Icon on Buttons
**Cause**: Button component renders `icon` prop as an icon AND button children text started with `+ ` prefix.
**Affected Files**:
- `client/src/shared/layout/TopNavbar.jsx` (+ New Campaign)
- `client/src/features/campaigns/pages/CampaignsPage.jsx` (+ New Campaign)
**Fix**: Removed `+ ` prefix from button text content (icon already rendered by Button component).
**Status**: FIXED

### BUG-002: ⌘K Command Palette Stuck Open
**Cause**: TopNavbar's global keydown listener used `setIsCommandPaletteOpen((prev) => !prev)` — this toggled the state, but when CommandPalette also had its own ⌘K listener, they fought each other and the palette got stuck.
**Affected Files**: `client/src/shared/layout/TopNavbar.jsx`
**Fix**: Changed TopNavbar to only `setIsCommandPaletteOpen(true)` — CommandPalette handles its own closing via Esc and ⌘K.
**Status**: FIXED

### BUG-003: Mock Authentication Auto-Login Bypass
**Cause**: `AuthContext.jsx` used `DEFAULT_USER` from constants and `localStorage.getItem('saas_is_authenticated')` — any visitor was auto-authenticated.
**Affected Files**: `client/src/contexts/AuthContext.jsx`, `client/src/constants/index.js`
**Fix**: Replaced with real `GET /api/auth/me` session check on mount. Added isLoading state to prevent flash-to-login during check.
**Status**: FIXED

### BUG-004: Flash-to-Login on Page Refresh
**Cause**: `ProtectedRoute` immediately redirected to `/login` while `AuthContext` was still checking the session.
**Affected Files**: `client/src/app/router/AppRoutes.jsx`
**Fix**: Added `isLoading` guard — shows `<Loader>` until session check completes, then redirects if not authenticated.
**Status**: FIXED

### BUG-005: Missing Template Update/Delete Endpoints
**Cause**: `templateService.js` only had `getTemplates` and `createTemplate`. UI had edit/delete buttons that called nonexistent functions.
**Affected Files**: `client/src/services/templateService.js`
**Fix**: Added `updateTemplate(id, data)` and `deleteTemplate(id)` methods.
**Status**: FIXED

### BUG-006: Missing Contact Update Endpoint
**Cause**: `contactService.js` had no `updateContact` method.
**Affected Files**: `client/src/services/contactService.js`
**Fix**: Added `updateContact(id, data)` method.
**Status**: FIXED

### BUG-007: Notifications Endpoint 404
**Cause**: `notificationService.js` called `/notifications` but no route existed on the server.
**Affected Files**: `server/routes/notifications.routes.js` (created)
**Fix**: Created full notifications route with GET, POST /:id/read, POST /read-all.
**Status**: FIXED

### BUG-008: Broken Duplicate Router File
**Cause**: `client/src/app/routes/AppRoutes.jsx` had broken import paths and was never used (real router at `app/router/AppRoutes.jsx`).
**Affected Files**: Deleted `client/src/app/routes/AppRoutes.jsx`
**Status**: FIXED (deleted)

### BUG-009: Authenticated Users Could Visit /login
**Cause**: No redirect from `/login` when already logged in.
**Affected Files**: `client/src/app/router/AppRoutes.jsx`
**Fix**: Added `PublicRoute` wrapper that redirects authenticated users to `/`.
**Status**: FIXED

### BUG-010: Axios Not Sending Cookies
**Cause**: `axios.create()` in lib/axios.js had no `withCredentials` option. httpOnly cookies were never sent with API requests.
**Affected Files**: `client/src/lib/axios.js`
**Fix**: Added `withCredentials: true` to axios instance config.
**Status**: FIXED

---

### BUG-011: Multi-Tenancy Workspace Role Bleed
**Cause**: `requireRole` in `auth.middleware.js` checked `workspaceMembership` using only `userId` without scoping to the active workspace.
**Affected Files**: `server/middlewares/auth.middleware.js`
**Fix**: Updated `requireRole` to query `workspaceMembership` by `userId AND workspaceId` (from `x-workspace-id` header), removing default ADMIN fallback.
**Status**: FIXED

### BUG-012: Analytics Rendered Hardcoded Fake Device and Hourly Data
**Cause**: `DeviceBreakdownChart` and `HourlyEngagementChart` rendered hardcoded fallback arrays because controller never computed `deviceShare` or `hourlyTrend`.
**Affected Files**: `server/controllers/analytics.controller.js`
**Fix**: Added `classifyUserAgent()` and 24-hour bucket aggregation from `EmailEvent` timestamps.
**Status**: FIXED

### BUG-013: Campaign "Send Now" button crashes UI
**Cause**: DashboardPage and CampaignsPage invoked `campaignService.sendCampaign(id)`, but function was named `sendCampaignNow`.
**Affected Files**: `client/src/services/campaignService.js`, `client/src/features/dashboard/pages/DashboardPage.jsx`, `client/src/features/campaigns/pages/CampaignsPage.jsx`
**Fix**: Unified method name to `sendCampaign(id)`.
**Status**: FIXED

### BUG-014: AI Studio Generation Handlers Throw TypeErrors
**Cause**: `AiWorkspacePage.jsx` and `TemplatesPage.jsx` called `generateSubjectLines`, `generateEmailCopy`, `analyzeSpam`, while `aiService.js` only exported `getSubjectLines`, `getEmailCopy`, `checkSpamRisk`.
**Affected Files**: `client/src/services/aiService.js`, `client/src/features/ai/pages/AiWorkspacePage.jsx`, `client/src/features/templates/pages/TemplatesPage.jsx`
**Fix**: Added method aliases and normalized positional arguments into expected JSON body payloads.
**Status**: FIXED

### BUG-015: Spam Risk Check Parameter Mismatch
**Cause**: `CampaignFormModal.jsx` passed separate `(subject, content)` arguments instead of `{ subject, content }`.
**Affected Files**: `client/src/services/aiService.js`, `client/src/shared/components/forms/CampaignFormModal.jsx`
**Fix**: Added argument normalization in `aiService.checkSpamRisk`.
**Status**: FIXED

### BUG-016: Settings Page Profile Update Throws TypeError
**Cause**: `SettingsPage.jsx` imported `authService` instead of `settingsService` for `updateProfile`.
**Affected Files**: `client/src/features/settings/pages/SettingsPage.jsx`
**Fix**: Switched import to `settingsService` and linked `updateUser` from `AuthContext`.
**Status**: FIXED

### BUG-017: Unsubscribe Page Token Verification TypeError
**Cause**: `UnsubscribePage.jsx` read `res.data.subscribed` on an already-unwrapped response object from `axios.js`.
**Affected Files**: `client/src/features/auth/pages/UnsubscribePage.jsx`
**Fix**: Changed `res.data` to `res` and improved error messaging.
**Status**: FIXED

### BUG-018: Template Model Missing Thumbnail Column in Schema
**Cause**: `templates.controller.js` passed `thumbnail` field on template create/update, but field was omitted from `prisma/schema.prisma`.
**Affected Files**: `prisma/schema.prisma`
**Fix**: Added `thumbnail String?` to `model Template` and regenerated Prisma client.
**Status**: FIXED

### BUG-019: Missing Database Tables in Migrations
**Cause**: Initial migration lacked tables for `notifications`, `email_events`, `password_reset_tokens`, `subscriptions` and their enums.
**Affected Files**: `prisma/migrations/20260823000001_add_telemetry_notifications_subscriptions/migration.sql`
**Fix**: Generated migration SQL defining all missing models, enums, indexes, and foreign keys.
**Status**: FIXED

### BUG-020: Forgot/Reset Password Error Response Unwrapping
**Cause**: `ForgotPasswordPage.jsx` and `ResetPasswordPage.jsx` attempted to read `err.response?.data?.message` on an already-unwrapped axios error.
**Affected Files**: `client/src/features/auth/pages/ForgotPasswordPage.jsx`, `client/src/features/auth/pages/ResetPasswordPage.jsx`
**Fix**: Changed error extraction to `err.message`.
**Status**: FIXED

### BUG-021: Missing SENDING and FAILED Status Badges
**Cause**: `RecentCampaignsTable.jsx` and `CampaignsPage.jsx` lacked badge handling for `SENDING` and `FAILED` states, causing them to render as "Draft".
**Affected Files**: `client/src/shared/components/tables/RecentCampaignsTable.jsx`, `client/src/features/campaigns/pages/CampaignsPage.jsx`
**Fix**: Added `SENDING` (steel badge) and `FAILED` (danger badge) cases.
**Status**: FIXED

### BUG-022: Hardcoded Colors & Theme Inconsistencies
**Cause**: `CommandPalette.jsx`, `CampaignFormModal.jsx`, `ImportCsvModal.jsx`, `Toast.jsx`, `Loader.jsx`, `EmptyState.jsx`, `ConfirmationDialog.jsx`, `UnsubscribePage.jsx` had hardcoded dark background and border colors.
**Affected Files**: Above client components.
**Fix**: Replaced all hardcoded dark styling with CSS theme variables (`var(--surface-card)`, `var(--surface-secondary)`, `var(--border)`, `var(--text)`, etc.).
**Status**: FIXED

### BUG-023: Dead & Duplicate UI Components
**Cause**: Unused components left in `client/src/shared/ui/` and `client/src/shared/components/tables/`.
**Affected Files**: `PageHeader.jsx`, `SectionHeader.jsx`, `Pagination.jsx`, `Tabs.jsx`, `StatCard.jsx`, `MetricCard.jsx`, `ContactsTable.jsx`, `TemplatesGrid.jsx`, `feedback/` directory.
**Fix**: Deleted all 8 unused files and empty directory.
**Status**: FIXED

