# MailPilot Changelog 📜

All notable changes to the **MailPilot** project will be documented in this file.

---

## [0.5.0] - 2026-08-13

### Full-Stack SaaS Foundation & Database Integration Complete
- **Auth Controller Hardening (BUG-001)**:
  - Removed in-memory fallback user array from `server/controllers/auth.controller.js`.
  - Enforced strict database connection check across all authentication endpoints (`register`, `login`, `getMe`, `googleAuth`, `updateProfile`), returning `503 Service Unavailable` if PostgreSQL is unreachable.
  - Added `PUT /api/auth/profile` endpoint to persist user profile updates.
- **Database-Backed Notifications (BUG-010)**:
  - Added `Notification` model to `prisma/schema.prisma` with relation to `Workspace`.
  - Replaced in-memory notifications array with `notifications.controller.js` and Prisma queries scoped to `workspaceId`.
- **Form Modal Pre-fill Fixes (BUG-003 & BUG-004)**:
  - Fixed `ContactFormModal` and `TemplateFormModal` to accept `initialData` and populate form state on edit.
- **Campaign & Contact State Integrity (BUG-005 & BUG-006)**:
  - Fixed status string case comparison in `CampaignsPage.jsx` (`SENT` vs `sent`).
  - Updated `ContactsPage.jsx` badge logic to use `c.subscribed` boolean.
- **Settings & Navbar Integration (BUG-007 & BUG-011)**:
  - Updated `settingsService.js` to call `PUT /api/auth/profile`.
  - Connected `SettingsPage.jsx` to update profile and propagate changes through `AuthContext`.
  - Updated `TopNavbar.jsx` to display real user `workspaceName`.
- **Dashboard Metric Cleaning (BUG-002 & BUG-012)**:
  - Replaced fake hardcoded metrics in `DashboardPage.jsx` with real DB metrics from `campaignService`, `contactService`, and `templateService`.
  - Updated `sendNow` in `campaigns.controller.js` to set `delivered: 0` with an explicit `emailProviderStatus: 'NOT_CONFIGURED'` note.
  - Marked unimplemented AI features with clear `PLANNED` tags.
- **Error Response Standardization (BUG-009)**:
  - Standardized `error.middleware.js` to output `{ success: false, error: message, message: message }`.
- **Documentation**:
  - Created `docs/IMPLEMENTATION_REPORT.md`.
  - Updated `docs/API.md`, `README.md`, `CHANGELOG.md`, and `ROADMAP.md`.

---

## [0.4.0] - 2026-08-13

### Database Foundation & Prisma Setup (Supabase PostgreSQL)
- **Supabase PostgreSQL & Prisma Integration**:
  - Configured PostgreSQL datasource with `@prisma/client` and `prisma` CLI (v5.22.0).
  - Created `prisma/schema.prisma` datasource with `DATABASE_URL` (pooler) and `DIRECT_URL` (direct migration connection).
- **Foundation Schema Models**:
  - Implemented core authentication and multi-tenant schema models: `User`, `Account` (OAuth provider identities e.g. Google `sub`), `Session`, `Workspace`, and `WorkspaceMembership`.
  - Added enums `UserStatus` (`ACTIVE`, `SUSPENDED`) and `WorkspaceRole` (`ADMIN`, `EDITOR`, `VIEWER`).
  - Defined explicit cascade rules, foreign keys, and indexes (`users_email_key`, `accounts_provider_providerAccountId_key`, `workspaces_slug_key`, `workspace_memberships_userId_workspaceId_key`).
- **Initial Migration**:
  - Created initial foundation SQL migration `prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql`.
- **Backend Prisma Client Singleton**:
  - Created reusable Prisma Client singleton at `server/config/prisma.js`.
  - Updated `server/config/db.js` with safe connectivity check (`prisma.$connect()`) and fallback handling without logging raw credentials.
  - Updated `auth.controller.js` to utilize Prisma Client for user queries and Google OAuth account creation.
  - Removed old Mongoose ODM dependency and `server/models/` directory.
- **Documentation & Environment**:
  - Created `docs/DATABASE.md` and `docs/ENVIRONMENT.md`.
  - Updated `docs/ARCHITECTURE.md` and `.env.example` templates.
- **Verification**:
  - Verified `npx prisma validate` (schema valid).
  - Verified `npx prisma generate` (Prisma Client v5.22.0 generated).
  - Verified backend startup (`node index.js`).

---

## [0.3.0] - 2026-08-03

### Architectural & Design System Foundation Overhaul
- **Design System Single Source of Truth**:
  - Implemented CSS tokens in `src/styles/index.css` for Spacing Scale (`4, 8, 12, 16, 24, 32, 48, 64`), Radius Scale (`10px, 14px, 18px`), Inter typography, and dark SaaS palette (`#0B1020`, `#111827`, `#151E2E`, `#6366F1`, `#4F46E5`, `#22C55E`, `#F59E0B`, `#EF4444`, `#F8FAFC`, `#94A3B8`, `#64748B`, `rgba(255,255,255,.06)`).
- **Unified UI Component Taxonomy**:
  - Created 17 reusable UI primitives under `src/components/common/ui/`: `Button`, `Input`, `Card`, `Modal`, `Badge`, `Toast`, `Dropdown`, `Avatar`, `Tabs`, `Table`, `EmptyState`, `Skeleton`, `Loader`, `PageHeader`, `MetricCard`, `StatCard`, `SectionHeader`.
  - Consolidated `PrimaryButton` and `SecondaryButton` into a single, flexible `Button` component with design system variants.
- **Modular Project Architecture**:
  - Reorganized client into scalable feature-first structure (`src/app/`, `src/assets/`, `src/components/common/`, `src/features/`, `src/services/`, `src/routes/`, `src/styles/`).
  - Formatted backend server directory (`server/config`, `controllers`, `middlewares`, `models`, `routes`, `services`, `validators`) and root directories (`emails/`, `jobs/`, `constants/`, `utils/`, `database/`, `docs/`, `scripts/`, `tests/`).
- **Page Experience Modernization**:
  - Refactored `DashboardPage`, `CampaignsPage`, `ContactsPage`, `TemplatesPage`, `AnalyticsPage`, `SettingsPage`, and `LoginPage` to enforce maximum whitespace, zero decorative clutter, and 1 clear primary action per screen.
- **API Layer**:
  - Expanded service abstractions to include `NotificationService`.
- **Verification**:
  - Verified Vite build bundle compilation (`npm run build --prefix client`).

---

## [0.2.0] - 2026-08-02
- Feature-based architecture reorganization & branding standardization.

---

## [0.1.0] - 2026-08-02
- Initial Sprint release.
