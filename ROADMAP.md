# MailPilot Strategic Product Roadmap 🗺️

This document outlines the planned engineering milestones and sprint objectives for **MailPilot: AI-Powered Email Marketing & Campaign Automation Platform**.

---

## 📅 Sprint Overview & Milestones

```
Sprint 1 [Done]  ──────► Sprint 1.5 [Done] ──────► Sprint 2 [Next] ──────► Sprint 3 ──────► Sprint 4-7
Frontend UI Refactor     Hygiene & Branding        Authentication & JWT    Campaign Engine   Analytics & AI
```

---

### 🟢 Sprint 1: Frontend Architecture & SaaS UI Modernization (Completed)
- [x] Refactor legacy single-file code into component taxonomy (`ui/`, `layout/`, `charts/`, `forms/`, `tables/`).
- [x] Implement 13 reusable UI components (Buttons, Modals, Cards, Badges, Toasts, Pagination, Loaders, Empty States).
- [x] Integrate Recharts for campaign performance, email open trends, and breakdown graphs.
- [x] Integrate React Router v7 with code splitting (`React.lazy()`).
- [x] Implement Light / Dark mode persistence and responsive mobile drawer.

### 🟢 Sprint 1.5: Repository Standardization & Product Rebranding (Completed)
- [x] Full rebranding from legacy project names to **MailPilot**.
- [x] Add OpenGraph & Twitter Card SEO metadata to `index.html`.
- [x] Create vector SVG brand assets (`favicon.svg`, `logo.svg`, `logo-dark.svg`, `logo-light.svg`).
- [x] Standardize repository hygiene (`.gitignore`, cleanup unused files, update `package.json` schemas).
- [x] Create project documentation (`README.md`, `ROADMAP.md`, `CHANGELOG.md`, `CONTRIBUTING.md`).

---

### 🟡 Sprint 2: User Authentication & Multi-Tenant Session Management (Planned)
- [ ] Implement backend JWT authentication (sign up, log in, password reset, token verification middleware).
- [ ] Connect `AuthContext` to live authentication APIs (`/api/auth/login`, `/api/auth/me`).
- [ ] Multi-tenant workspace isolation (organizations, role-based permissions: Admin, Editor, Viewer).
- [ ] OAuth2 Social Logins (Google Workspace, GitHub SSO).

---

### 🔵 Sprint 3: Campaign Automation Engine & ESP Delivery (Planned)
- [ ] Integrate transaction email delivery service providers (Resend, AWS SES, SendGrid).
- [ ] Drag-and-drop visual email workflow builder (drip triggers, delay nodes, conditional branches).
- [ ] Dynamic template variable interpolation with Handlebars/Liquid syntax parser.
- [ ] Scheduled cron job queue for queueing and dispatching scheduled broadcasts.

---

### 🟣 Sprint 4: Advanced Real-Time Telemetry & Deliverability Insights (Planned)
- [ ] Webhook receiver for real-time open, click, bounce, and spam complaint events.
- [ ] Click map overlays and link tracking telemetry.
- [ ] Automatic bounce suppression list management.
- [ ] Custom domain DNS verification checker (automated CNAME/TXT polling).

---

### 🤖 Sprint 5: AI Assistant & Copywriting Engine (Planned)
- [ ] Integrated LLM AI assistant for generating high-converting email subject lines.
- [ ] Automated email copy generation and tone adjustment (Professional, Conversational, Urgent).
- [ ] AI Send-Time Optimization (predict subscriber peak engagement windows).
- [ ] Automated A/B testing with AI variant selection.

---

### 👥 Sprint 6: Team Collaboration & Workspace Permissions (Planned)
- [ ] Multi-user team invitations with granular access roles.
- [ ] Real-time co-editing and comments on email templates.
- [ ] Audit log tracking for campaign modifications and subscriber deletion events.

---

### 🚀 Sprint 7: Enterprise Production Deployment & Infrastructure (Planned)
- [ ] Docker containerization (`Dockerfile`, `docker-compose.yml`).
- [ ] CI/CD automation pipeline (GitHub Actions for linting, testing, and automated deployment).
- [ ] High-availability database migration (MongoDB / PostgreSQL with Prisma ORM).
- [ ] Redis queue management for concurrent bulk email dispatches.
