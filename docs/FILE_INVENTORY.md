# MailPilot — File Inventory
*Last updated: 2026-08-13*

## Legend
- ✅ KEEP — Well-implemented, no changes needed
- 🔧 MODIFY — Needs fixes or improvements
- 🗑️ DELETE — Safe to remove
- 📋 EMPTY — Directory exists but has no files

---

## Root Level
| File | Status | Notes |
|------|--------|-------|
| package.json | ✅ KEEP | Monorepo root with concurrently dev script |
| .gitignore | ✅ KEEP | Covers node_modules, .env, dist |
| README.md | 🔧 MODIFY | Outdated (wrong color palette, references deleted dirs) |
| CHANGELOG.md | 🔧 MODIFY | Only has 3 entries, needs Sprint 1 entry |
| ROADMAP.md | ✅ KEEP | Accurate sprint planning |
| CONTRIBUTING.md | ✅ KEEP | Exists |

## Client (React/Vite)
| File | Status | Notes |
|------|--------|-------|
| client/index.html | ✅ KEEP | Good SEO meta tags |
| client/vite.config.js | ✅ KEEP | Code splitting configured |
| client/package.json | ✅ KEEP | All deps correct |
| client/.env.example | ✅ KEEP | VITE_API_URL + VITE_GOOGLE_CLIENT_ID |
| client/src/main.jsx | ✅ KEEP | React 18 createRoot |
| client/src/App.jsx | ✅ KEEP | Minimal root with AppRoutes |
| client/src/index.css | ✅ KEEP | Single @import to styles/index.css |
| client/src/styles/index.css | ✅ KEEP | Design tokens, CSS variables, animations |
| client/src/constants/index.js | ✅ KEEP | APP_NAME, API_BASE_URL |

## Client — App Layer
| File | Status | Notes |
|------|--------|-------|
| src/app/providers/index.jsx | ✅ KEEP | Provider stack (Router/Theme/Toast/Auth) |
| src/app/router/AppRoutes.jsx | 🔧 MODIFY | isLoading guard added; PublicRoute added |
| src/app/routes/ | 🗑️ DELETE | Empty directory (was accidentally created) |
| src/app/store/ | 📋 EMPTY | Placeholder — no Redux/Zustand used |
| src/routes/ | 🗑️ DELETE | Empty directory |
| src/config/ | 📋 EMPTY | Not used |
| src/types/ | 📋 EMPTY | No TypeScript types (project is JSX) |

## Client — Contexts
| File | Status | Notes |
|------|--------|-------|
| src/contexts/AuthContext.jsx | ✅ KEEP | Real JWT session check on mount |
| src/contexts/ThemeContext.jsx | ✅ KEEP | Dark/light mode with localStorage |
| src/contexts/ToastContext.jsx | ✅ KEEP | Global toast queue |

## Client — Hooks
| File | Status | Notes |
|------|--------|-------|
| src/hooks/useAuth.js | ✅ KEEP | Simple context accessor |
| src/hooks/useDebounce.js | ✅ KEEP | Used in search |
| src/hooks/useFetchData.js | ✅ KEEP | Generic fetch wrapper |
| src/hooks/useTheme.js | ✅ KEEP | Theme context accessor |
| src/hooks/useToast.js | ✅ KEEP | Toast context accessor |

## Client — Services
| File | Status | Notes |
|------|--------|-------|
| src/services/authService.js | ✅ KEEP | Real API calls |
| src/services/campaignService.js | ✅ KEEP | Full CRUD |
| src/services/contactService.js | ✅ KEEP | Full CRUD + import + update |
| src/services/templateService.js | ✅ KEEP | Full CRUD |
| src/services/analyticsService.js | 🔧 MODIFY | getSummary points to wrong endpoint |
| src/services/notificationService.js | 🔧 MODIFY | markAsRead uses PUT, server has POST |
| src/services/settingsService.js | 🔧 MODIFY | Completely mocked — needs real backend |

## Client — Lib
| File | Status | Notes |
|------|--------|-------|
| src/lib/axios.js | ✅ KEEP | withCredentials: true, error interceptor |

## Client — Utilities
| File | Status | Notes |
|------|--------|-------|
| src/utils/formatters.js | ✅ KEEP | formatDate, formatNumber, etc. |

## Client — Feature Pages
| File | Status | Notes |
|------|--------|-------|
| features/auth/pages/LoginPage.jsx | ✅ KEEP | Premium split-panel design + Google OAuth |
| features/auth/pages/RegisterPage.jsx | ✅ KEEP | Password strength meter, confirm match |
| features/dashboard/pages/DashboardPage.jsx | 🔧 MODIFY | Hardcoded stats in hero cards |
| features/campaigns/pages/CampaignsPage.jsx | 🔧 MODIFY | "+" prefix on button text |
| features/contacts/pages/ContactsPage.jsx | 🔧 MODIFY | "+" prefix on button text, CSV import modal not wired |
| features/templates/pages/TemplatesPage.jsx | 🔧 MODIFY | "+" prefix on button text, previewText field may not exist |
| features/analytics/pages/AnalyticsPage.jsx | 🔧 MODIFY | Hardcoded stats, charts not wired |
| features/settings/pages/SettingsPage.jsx | 🔧 MODIFY | Fake DKIM status, fake API key |

## Client — Auth Subdirs (Empty)
| File | Status | Notes |
|------|--------|-------|
| features/auth/components/ | 📋 EMPTY | No components extracted |
| features/auth/hooks/ | 📋 EMPTY | useAuth lives in /hooks/ |
| features/auth/services/ | 📋 EMPTY | authService lives in /services/ |
| features/auth/types/ | 📋 EMPTY | No TypeScript |
| features/auth/utils/ | 📋 EMPTY | No auth utils |

## Client — Shared UI Primitives
| File | Status | Notes |
|------|--------|-------|
| shared/ui/Avatar.jsx | ✅ KEEP | Initials-based avatar |
| shared/ui/Badge.jsx | ✅ KEEP | Color variants |
| shared/ui/Button.jsx | ✅ KEEP | All variants including danger |
| shared/ui/Card.jsx | ✅ KEEP | Title/subtitle/action slots |
| shared/ui/ConfirmationDialog.jsx | ✅ KEEP | Wraps Modal for confirm flows |
| shared/ui/Dropdown.jsx | ✅ KEEP | Action menu |
| shared/ui/EmptyState.jsx | ✅ KEEP | No data state |
| shared/ui/Input.jsx | ✅ KEEP | Icon-slotted input |
| shared/ui/Loader.jsx | ✅ KEEP | Spinning animation |
| shared/ui/MetricCard.jsx | ✅ KEEP | KPI card with trend |
| shared/ui/Modal.jsx | ✅ KEEP | ESC + backdrop click handling |
| shared/ui/PageHeader.jsx | ✅ KEEP | Page title+description+action |
| shared/ui/Pagination.jsx | ✅ KEEP | Prev/next pagination |
| shared/ui/SectionHeader.jsx | ✅ KEEP | Section label |
| shared/ui/Skeleton.jsx | ✅ KEEP | Loading skeleton |
| shared/ui/StatCard.jsx | ✅ KEEP | Stat display card |
| shared/ui/Table.jsx | ✅ KEEP | Sortable table wrapper |
| shared/ui/Tabs.jsx | ✅ KEEP | Tab navigation |
| shared/ui/Toast.jsx | ✅ KEEP | Individual toast component |
| shared/ui/ToastNotifications.jsx | ✅ KEEP | Toast container |

## Client — Shared Layout
| File | Status | Notes |
|------|--------|-------|
| shared/layout/Layout.jsx | ✅ KEEP | Shell with sidebar + outlet |
| shared/layout/Sidebar.jsx | ✅ KEEP | Collapsible nav |
| shared/layout/TopNavbar.jsx | 🔧 MODIFY | ⌘K fixed (open-only), + button fixed |

## Client — Charts (Built but not yet rendered)
| File | Status | Notes |
|------|--------|-------|
| shared/components/charts/CampaignBreakdownChart.jsx | 🔧 MODIFY | Needs to be wired into AnalyticsPage |
| shared/components/charts/CampaignPerformanceChart.jsx | 🔧 MODIFY | Needs to be wired into AnalyticsPage |
| shared/components/charts/EmailOpenTrendChart.jsx | 🔧 MODIFY | Needs to be wired into AnalyticsPage |

## Client — Form Modals
| File | Status | Notes |
|------|--------|-------|
| shared/components/forms/CampaignFormModal.jsx | ✅ KEEP | |
| shared/components/forms/ContactFormModal.jsx | ✅ KEEP | |
| shared/components/forms/ImportCsvModal.jsx | 🔧 MODIFY | Not wired in ContactsPage |
| shared/components/forms/TemplateFormModal.jsx | ✅ KEEP | |

## Client — Tables
| File | Status | Notes |
|------|--------|-------|
| shared/components/tables/ContactsTable.jsx | ✅ KEEP | |
| shared/components/tables/RecentCampaignsTable.jsx | ✅ KEEP | |
| shared/components/tables/TemplatesGrid.jsx | ✅ KEEP | |

## Server
| File | Status | Notes |
|------|--------|-------|
| server/index.js | ✅ KEEP | Thin bootstrap (9 lines) |
| server/app.js | ✅ KEEP | Express factory |
| server/package.json | ✅ KEEP | All deps present |
| server/.env.example | ✅ KEEP | All vars documented |
| server/config/env.js | ✅ KEEP | Central env config |
| server/config/db.js | ✅ KEEP | Mongoose + graceful fallback |
| server/middlewares/auth.middleware.js | ✅ KEEP | JWT from cookie or header |
| server/middlewares/error.middleware.js | ✅ KEEP | Global handler + ApiError class |
| server/models/User.model.js | ✅ KEEP | bcrypt hooks, toPublic() |
| server/models/Campaign.model.js | ✅ KEEP | Stats subdoc, virtual rates |
| server/models/Contact.model.js | ✅ KEEP | Compound unique index |
| server/models/Template.model.js | ✅ KEEP | Category enum, merge tags |
| server/models/AiGeneration.model.js | ✅ KEEP | Ready for AI integration |
| server/controllers/auth.controller.js | ✅ KEEP | Full auth + Google OAuth |
| server/controllers/campaigns.controller.js | ✅ KEEP | CRUD + send + summary |
| server/controllers/contacts.controller.js | ✅ KEEP | CRUD + bulk import |
| server/controllers/templates.controller.js | ✅ KEEP | Full CRUD |
| server/controllers/analytics.controller.js | ✅ KEEP | Aggregated telemetry |
| server/routes/auth.routes.js | ✅ KEEP | |
| server/routes/campaigns.routes.js | ✅ KEEP | |
| server/routes/contacts.routes.js | ✅ KEEP | |
| server/routes/templates.routes.js | ✅ KEEP | |
| server/routes/analytics.routes.js | ✅ KEEP | |
| server/routes/notifications.routes.js | ✅ KEEP | Fixes 404 |
| server/services/ | 📋 EMPTY | Reserved for business logic extraction |
| server/validators/ | 📋 EMPTY | Reserved for Joi/Zod validators |

## Docs (New)
| File | Status | Notes |
|------|--------|-------|
| docs/ARCHITECTURE.md | ✅ NEW | Full system architecture |
| docs/FILE_INVENTORY.md | ✅ NEW | This file |
| docs/API.md | ✅ NEW | All endpoints documented |
| docs/DATABASE.md | ✅ NEW | Mongoose models documented |
| docs/DEVELOPMENT.md | ✅ NEW | Setup guide |
| docs/BUG_FIXES.md | ✅ NEW | All fixed bugs |
| docs/REFACTORING.md | ✅ NEW | Structural changes |
| docs/SPRINT_PROGRESS.md | ✅ NEW | Sprint tracking |
| docs/CHANGELOG.md | → CHANGELOG.md | Lives at root per convention |
