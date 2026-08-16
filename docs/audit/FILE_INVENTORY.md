# MailPilot — Comprehensive File Inventory (Audit)

## Legend & Status Classification
- **ACTIVE**: In active production use by application
- **PARTIAL**: Implemented but missing full integration or DB persistence
- **MOCK**: UI or API exists but returns mock/hardcoded demo data
- **UNUSED**: Present in repository but not imported or called by active code
- **DUPLICATE**: Redundant duplicate file or mirrored copy
- **LEGACY**: Superseded implementation
- **BROKEN**: Contains runtime/syntax/logic error
- **CONFIGURATION**: Project configuration or environment file
- **GENERATED**: Auto-generated build output or lockfile
- **UNKNOWN**: Status requires live production runtime verification

---

## Complete File Table

| File Path | Status | Purpose | Used By | Dependencies | Issues / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `package.json` | CONFIGURATION | Monorepo root config & scripts | Root workspace | `concurrently` | Manages root dev/build scripts |
| `package-lock.json` | GENERATED | Root lockfile | npm | None | Root lockfile |
| `.gitignore` | CONFIGURATION | Git exclusion list | Git | None | Excludes `node_modules`, `.env`, `dist` |
| `.env.example` | CONFIGURATION | Root environment template | Setup | None | Key definitions for DB & Auth |
| `README.md` | ACTIVE | Project documentation | Engineers | None | Updated documentation |
| `CHANGELOG.md` | ACTIVE | Release history log | Engineers | None | Tracks v0.1.0 to v0.4.0 |
| `ROADMAP.md` | ACTIVE | Strategic feature roadmap | Product | None | Sprint plans |
| `CONTRIBUTING.md` | ACTIVE | Development guidelines | Contributors | None | Repository rules |
| `prisma/schema.prisma` | CONFIGURATION | Primary Prisma schema (PostgreSQL) | Prisma CLI / Server | `@prisma/client` | Foundation DB schema |
| `prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql` | CONFIGURATION | Foundation migration SQL | Prisma CLI | PostgreSQL | Initial SQL migration script |
| `client/package.json` | CONFIGURATION | Frontend dependencies & scripts | Vite / npm | React, Tailwind, Recharts | Client package manifest |
| `client/package-lock.json` | GENERATED | Client npm lockfile | npm | None | Client lockfile |
| `client/vite.config.js` | CONFIGURATION | Vite build configuration | Vite | React plugin, Tailwind plugin | Configures manual vendor chunks |
| `client/index.html` | ACTIVE | HTML entry shell & meta tags | Vite / Browser | Google Fonts Inter | SEO & viewport setup |
| `client/.env.example` | CONFIGURATION | Client environment template | Vite / Client | None | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |
| `client/src/main.jsx` | ACTIVE | React DOM root mount | Browser | `AppProviders`, `App` | Wraps app with providers |
| `client/src/App.jsx` | ACTIVE | Root React component | `main.jsx` | `AppRoutes` | Renders router |
| `client/src/index.css` | ACTIVE | Global CSS import | `main.jsx` | `styles/index.css` | Imports primary CSS |
| `client/src/styles/index.css` | ACTIVE | Design tokens & utility CSS | `index.css` | Tailwind CSS v4 | Defines tokens & animations |
| `client/src/app/providers/index.jsx` | ACTIVE | Provider composition stack | `main.jsx` | Auth, Theme, Toast providers | Global provider wrapper |
| `client/src/app/router/AppRoutes.jsx` | ACTIVE | Application routing table | `App.jsx` | Pages, AuthContext | Guards & lazy routes |
| `client/src/constants/index.js` | ACTIVE | Global app constants | App-wide | None | `APP_NAME`, `API_BASE_URL` |
| `client/src/contexts/AuthContext.jsx` | ACTIVE | User auth state provider | App-wide | `authService` | Real session check on mount |
| `client/src/contexts/ThemeContext.jsx` | ACTIVE | Dark/light theme state | App-wide | `localStorage` | Theme toggle state |
| `client/src/contexts/ToastContext.jsx` | ACTIVE | Toast notification state | App-wide | `ToastNotifications` | Toast queue state |
| `client/src/hooks/useAuth.js` | ACTIVE | Context accessor hook | App-wide | `AuthContext` | Accesses AuthContext |
| `client/src/hooks/useDebounce.js` | ACTIVE | Debounce value hook | Search | `react` | Debounces inputs |
| `client/src/hooks/useFetchData.js` | ACTIVE | Data fetching hook | Feature pages | `react` | Generic async wrapper |
| `client/src/hooks/useTheme.js` | ACTIVE | Theme context accessor | App-wide | `ThemeContext` | Accesses ThemeContext |
| `client/src/hooks/useToast.js` | ACTIVE | Toast context accessor | App-wide | `ToastContext` | Accesses ToastContext |
| `client/src/lib/axios.js` | ACTIVE | Axios HTTP instance | Services | `axios` | `withCredentials: true` enabled |
| `client/src/utils/formatters.js` | ACTIVE | Formatting helpers | App-wide | `Intl` | Date, number, pct formatters |
| `client/src/services/authService.js` | ACTIVE | Auth REST API calls | AuthContext | `axios` | Login, register, me, Google auth |
| `client/src/services/campaignService.js` | ACTIVE | Campaign REST API calls | CampaignsPage | `axios` | Campaign CRUD + send |
| `client/src/services/contactService.js` | ACTIVE | Contact REST API calls | ContactsPage | `axios` | Contact CRUD + import |
| `client/src/services/templateService.js` | ACTIVE | Template REST API calls | TemplatesPage | `axios` | Template CRUD |
| `client/src/services/analyticsService.js` | PARTIAL | Analytics REST API calls | AnalyticsPage | `axios` | `getSummary`, `getAnalytics` |
| `client/src/services/notificationService.js` | PARTIAL | Notification REST API calls | TopNavbar | `axios` | `getNotifications`, `markAsRead` |
| `client/src/services/settingsService.js` | MOCK | Settings mock service | SettingsPage | None | Hardcoded Promise resolve |
| `client/src/features/dashboard/pages/DashboardPage.jsx` | ACTIVE | Dashboard overview page | AppRoutes | Card, Button, Table | KPI stats & recent campaigns |
| `client/src/features/campaigns/pages/CampaignsPage.jsx` | ACTIVE | Campaign manager page | AppRoutes | Card, Button, Modal | Campaign list & modal form |
| `client/src/features/contacts/pages/ContactsPage.jsx` | ACTIVE | Audience contacts page | AppRoutes | Card, Table, Modal | Subscriber list & CSV import |
| `client/src/features/templates/pages/TemplatesPage.jsx` | ACTIVE | Email template page | AppRoutes | Card, Grid, Modal | Layout grid & template modal |
| `client/src/features/analytics/pages/AnalyticsPage.jsx` | PARTIAL | Telemetry analytics page | AppRoutes | Card, Button | KPI cards (charts not rendered) |
| `client/src/features/settings/pages/SettingsPage.jsx` | PARTIAL | Workspace settings page | AppRoutes | Card, Input, Button | Profile & API key tabs |
| `client/src/features/auth/pages/LoginPage.jsx` | ACTIVE | Login auth entry page | AppRoutes | Input, Button, Google | Dark split-panel login |
| `client/src/features/auth/pages/RegisterPage.jsx` | ACTIVE | Sign up registration page | AppRoutes | Input, Button | Strength meter & registration |
| `client/src/shared/layout/Layout.jsx` | ACTIVE | App layout frame | AppRoutes | Sidebar, TopNavbar | Shell wrapper |
| `client/src/shared/layout/Sidebar.jsx` | ACTIVE | Navigation sidebar | Layout | React Router | Collapsible sidebar |
| `client/src/shared/layout/TopNavbar.jsx` | ACTIVE | Header navbar | Layout | CommandPalette, Dropdown | Top header bar |
| `client/src/shared/components/CommandPalette.jsx` | ACTIVE | Global search palette | TopNavbar | React Router | Command search overlay |
| `client/src/shared/components/charts/CampaignBreakdownChart.jsx` | UNUSED | Recharts breakdown bar | AnalyticsPage | Recharts | Not imported in page |
| `client/src/shared/components/charts/CampaignPerformanceChart.jsx` | UNUSED | Recharts performance bar | AnalyticsPage | Recharts | Not imported in page |
| `client/src/shared/components/charts/EmailOpenTrendChart.jsx` | UNUSED | Recharts open trend line | AnalyticsPage | Recharts | Not imported in page |
| `client/src/shared/components/forms/CampaignFormModal.jsx` | ACTIVE | Campaign form modal | CampaignsPage | Modal, Input | Create/edit campaign form |
| `client/src/shared/components/forms/ContactFormModal.jsx` | ACTIVE | Contact form modal | ContactsPage | Modal, Input | Create/edit contact form |
| `client/src/shared/components/forms/ImportCsvModal.jsx` | ACTIVE | CSV import modal | ContactsPage | Modal, Textarea | Bulk contact import form |
| `client/src/shared/components/forms/TemplateFormModal.jsx` | ACTIVE | Template form modal | TemplatesPage | Modal, Input | Create/edit template form |
| `client/src/shared/components/tables/ContactsTable.jsx` | ACTIVE | Contacts table component | ContactsPage | Table, Badge | Table display for contacts |
| `client/src/shared/components/tables/RecentCampaignsTable.jsx` | ACTIVE | Campaign table component | DashboardPage | Table, Badge | Table for recent campaigns |
| `client/src/shared/components/tables/TemplatesGrid.jsx` | ACTIVE | Template grid component | TemplatesPage | Card, Badge | Grid layout for templates |
| `client/src/shared/ui/Avatar.jsx` | ACTIVE | Avatar UI primitive | App-wide | `react` | User initials avatar |
| `client/src/shared/ui/Badge.jsx` | ACTIVE | Badge UI primitive | App-wide | `react` | Status badge |
| `client/src/shared/ui/Button.jsx` | ACTIVE | Button UI primitive | App-wide | `react-icons` | Variant button component |
| `client/src/shared/ui/Card.jsx` | ACTIVE | Card container primitive | App-wide | `react` | Surface card container |
| `client/src/shared/ui/ConfirmationDialog.jsx` | ACTIVE | Confirm modal primitive | App-wide | Modal, Button | Destructive action confirmation |
| `client/src/shared/ui/Dropdown.jsx` | ACTIVE | Menu dropdown primitive | App-wide | `react` | Action popover dropdown |
| `client/src/shared/ui/EmptyState.jsx` | ACTIVE | Empty state primitive | App-wide | Button | No-data display block |
| `client/src/shared/ui/Input.jsx` | ACTIVE | Input field primitive | App-wide | `react-icons` | Icon-slotted input |
| `client/src/shared/ui/Loader.jsx` | ACTIVE | Spinner loader primitive | App-wide | `react` | Loading spinner |
| `client/src/shared/ui/MetricCard.jsx` | ACTIVE | Metric card primitive | Dashboard | Card | Metric value display |
| `client/src/shared/ui/Modal.jsx` | ACTIVE | Modal dialog primitive | App-wide | `react-icons` | ESC-closable modal |
| `client/src/shared/ui/PageHeader.jsx` | ACTIVE | Header title primitive | Pages | Button | Page header block |
| `client/src/shared/ui/Pagination.jsx` | ACTIVE | Pagination primitive | Tables | Button | Page navigation control |
| `client/src/shared/ui/SectionHeader.jsx` | ACTIVE | Section label primitive | Pages | `react` | Section header text |
| `client/src/shared/ui/Skeleton.jsx` | ACTIVE | Loading skeleton primitive | Pages | `react` | Skeleton pulse placeholder |
| `client/src/shared/ui/StatCard.jsx` | ACTIVE | Stat card primitive | Analytics | Card | Numeric stat display |
| `client/src/shared/ui/Table.jsx` | ACTIVE | Table primitive | App-wide | `react` | Reusable table shell |
| `client/src/shared/ui/Tabs.jsx` | ACTIVE | Tab strip primitive | App-wide | `react` | Tab bar navigation |
| `client/src/shared/ui/Toast.jsx` | ACTIVE | Toast alert primitive | ToastContext | `react` | Toast notification card |
| `client/src/shared/ui/ToastNotifications.jsx` | ACTIVE | Toast container primitive | AppProviders | Toast | Fixed toast portal |
| `server/package.json` | CONFIGURATION | Server dependencies | Node.js | Express, Prisma, JWT, bcrypt | Backend manifest |
| `server/package-lock.json` | GENERATED | Server npm lockfile | npm | None | Server lockfile |
| `server/.env` | CONFIGURATION | Local server environment | Server | dotenv | Local DB & auth secrets |
| `server/.env.example` | CONFIGURATION | Server environment template | Setup | None | DB & auth key template |
| `server/index.js` | ACTIVE | Server entry point | Node.js | `app.js`, `db.js` | Bootstrap server |
| `server/app.js` | ACTIVE | Express app factory | `index.js` | Express, routes, cors | Middleware & route setup |
| `server/config/env.js` | ACTIVE | Central env config | Backend | `dotenv` | Centralized process.env |
| `server/config/db.js` | ACTIVE | Database manager | `index.js` | `prisma` | Connection check & fallback |
| `server/config/prisma.js` | ACTIVE | Prisma client singleton | Controllers / DB | `@prisma/client` | Single Prisma instance |
| `server/prisma/schema.prisma` | DUPLICATE | Mirrored Prisma schema | Server | `@prisma/client` | Mirror of root schema |
| `server/prisma/migrations/20260813000000_initial_mailpilot_foundation/migration.sql` | DUPLICATE | Mirrored migration SQL | Server | PostgreSQL | Mirror of root migration |
| `server/middlewares/auth.middleware.js` | ACTIVE | JWT auth middleware | Routes | `jsonwebtoken` | Token verification |
| `server/middlewares/error.middleware.js` | ACTIVE | Global error middleware | `app.js` | `ApiError` | Formats API error JSON |
| `server/controllers/auth.controller.js` | ACTIVE | Auth controller | Routes | `prisma`, `bcryptjs`, JWT | Register, login, me, Google auth |
| `server/controllers/campaigns.controller.js` | PARTIAL | Campaign controller | Routes | In-memory store | Campaign CRUD & send |
| `server/controllers/contacts.controller.js` | PARTIAL | Contact controller | Routes | In-memory store | Contact CRUD & import |
| `server/controllers/templates.controller.js` | PARTIAL | Template controller | Routes | In-memory store | Template CRUD |
| `server/controllers/analytics.controller.js` | PARTIAL | Analytics controller | Routes | In-memory store | Telemetry metrics |
| `server/routes/auth.routes.js` | ACTIVE | Auth router | `app.js` | `auth.controller` | Mounts /auth endpoints |
| `server/routes/campaigns.routes.js` | ACTIVE | Campaign router | `app.js` | `campaigns.controller` | Mounts /campaigns endpoints |
| `server/routes/contacts.routes.js` | ACTIVE | Contact router | `app.js` | `contacts.controller` | Mounts /contacts endpoints |
| `server/routes/templates.routes.js` | ACTIVE | Template router | `app.js` | `templates.controller` | Mounts /templates endpoints |
| `server/routes/analytics.routes.js` | ACTIVE | Analytics router | `app.js` | `analytics.controller` | Mounts /analytics endpoint |
| `server/routes/notifications.routes.js` | ACTIVE | Notification router | `app.js` | `express` | Mounts /notifications endpoints |
| `server/scripts/test-db-connection.js` | ACTIVE | DB connection test | CLI | `db.js` | Safe connection test script |
| `docs/API.md` | ACTIVE | API documentation | Engineers | None | Endpoints specification |
| `docs/ARCHITECTURE.md` | ACTIVE | Architecture document | Engineers | None | System architecture |
| `docs/BUG_FIXES.md` | ACTIVE | Bug fix log | Engineers | None | Historical bug fixes |
| `docs/DATABASE.md` | ACTIVE | Database documentation | Engineers | None | Prisma & PostgreSQL docs |
| `docs/DEVELOPMENT.md` | ACTIVE | Developer guide | Engineers | None | Quickstart setup guide |
| `docs/ENVIRONMENT.md` | ACTIVE | Environment reference | Engineers | None | Env key specifications |
| `docs/FILE_INVENTORY.md` | ACTIVE | Legacy inventory | Engineers | None | Initial file list |
