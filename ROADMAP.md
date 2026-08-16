# MailPilot Strategic Product Roadmap 🗺️

This document outlines the planned engineering milestones and sprint objectives for **MailPilot: Enterprise Email Marketing & Campaign Automation SaaS Platform**.

---

## 📅 Sprint Overview & Milestones

```text
Sprint 0.3-0.5 [Done] ──► Sprint 4 [Next] ──────► Sprint 5 ────────► Sprint 6
SaaS Foundation &        ESP Delivery Engine     AI Copywriting &    Automations &
Database Integration     & Tracking Pixels       Telemetry Engine    Workflows
```

---

### 🟢 Sprint 0.5: SaaS Foundation & Multi-Tenant Database Stabilization (Completed)
- [x] Conducted comprehensive audit across server, database, API layer, and client components.
- [x] Enforced strict Prisma ORM PostgreSQL models (`User`, `Account`, `Session`, `Workspace`, `WorkspaceMembership`, `Campaign`, `Contact`, `Template`, `Notification`).
- [x] Eliminated all in-memory persistence fallbacks from auth and notification controllers.
- [x] Enforced non-bypassable multi-tenant workspace isolation across all resource controllers (`where: { id, workspaceId }`).
- [x] Replaced fake dashboard metrics and hardcoded scores with real workspace database telemetry.
- [x] Standardized API contracts, error responses, and client services (`settingsService`, `contactService`, `templateService`).
- [x] Created `docs/IMPLEMENTATION_REPORT.md` and updated `docs/API.md`.

---

### 🟡 Sprint 4: Email Provider Integration & Open/Click Tracking (Planned)
- [ ] Implement ESP delivery abstraction layer (Resend, AWS SES, SendGrid adapters).
- [ ] Deploy open tracking pixel (`GET /api/track/open/:eventId`) and click tracking redirects.
- [ ] Bounce and spam complaint webhook ingestion handlers.
- [ ] Sender domain DKIM and SPF verification status checker.

---

### 🟣 Sprint 3: Advanced Real-Time Telemetry & Deliverability Insights (Planned)
- [ ] Webhook receiver for real-time open, click, bounce, and spam complaint events.
- [ ] Click map overlays and link tracking telemetry.
- [ ] Automatic bounce suppression list management.
- [ ] Custom domain DNS verification checker (automated CNAME/TXT polling).

---

### 🤖 Sprint 4: AI Assistant & Copywriting Engine (Planned)
- [ ] Integrated LLM AI assistant for generating high-converting email subject lines.
- [ ] Automated email copy generation and tone adjustment (Professional, Conversational, Urgent).
- [ ] AI Send-Time Optimization (predict subscriber peak engagement windows).
- [ ] Automated A/B testing with AI variant selection.

---

### 🚀 Sprint 5: Enterprise Production Deployment & Infrastructure (Planned)
- [ ] Docker containerization (`Dockerfile`, `docker-compose.yml`).
- [ ] CI/CD automation pipeline (GitHub Actions for linting, testing, and automated deployment).
- [ ] High-availability database migration (MongoDB / PostgreSQL with Prisma ORM).
- [ ] Redis queue management for concurrent bulk email dispatches.
