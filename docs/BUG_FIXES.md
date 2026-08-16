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

## Known Open Issues

### OPEN-001: Duplicate + prefix on Contact/Template buttons
**Affected**: ContactsPage "+ Add Contact", TemplatesPage "+ New Template"
**Status**: FIX IN PROGRESS (This session)

### OPEN-002: Analytics page shows hardcoded statistics
**Affected**: `AnalyticsPage.jsx` — 12,450 emails, 38.4% open rate are static
**Status**: FIX IN PROGRESS (This session)

### OPEN-003: Chart components not wired into AnalyticsPage
**Affected**: CampaignBreakdownChart, CampaignPerformanceChart, EmailOpenTrendChart
**Status**: FIX IN PROGRESS (This session)

### OPEN-004: Settings page shows fake data
**Affected**: DKIM "Verified & Active", API key "mp_live_9981a88b..."
**Status**: FIX IN PROGRESS (This session)

### OPEN-005: notificationService.js uses PUT for markAsRead, server has POST
**Affected**: `notificationService.markAsRead()`
**Status**: FIX IN PROGRESS (This session)

### OPEN-006: CSV Import button in ContactsPage not wired to ImportCsvModal
**Affected**: ContactsPage "Import CSV" button shows toast instead of modal
**Status**: FIX IN PROGRESS (This session)

### OPEN-007: Dashboard KPI cards show hardcoded values
**Affected**: "Campaign Health 98%", "142 Audience" etc. in DashboardPage
**Status**: IN PROGRESS

### OPEN-008: settingsService completely mocked
**Status**: REQUIRES backend settings endpoint (Sprint 2)

### OPEN-009: Empty directories remain in project
**Affected**: src/app/routes/, src/routes/, src/config/, src/types/, src/app/store/, features/auth/components/, features/auth/hooks/, etc.
**Status**: To be cleaned

### OPEN-010: README outdated (wrong color palette, references deleted directories)
**Status**: FIX IN PROGRESS (This session)
