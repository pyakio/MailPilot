# MailPilot — Strategic Roadmap & Recommended Sprint Order

## Overview
Based strictly on empirical evidence discovered during this codebase audit, here is the recommended sequential roadmap to bring MailPilot to full production readiness.

---

## Recommended Sprint Sequence

```
Sprint 1: Schema Expansion & Core Resource Migration
    │
    ▼
Sprint 2: Analytics & Telemetry Visualization
    │
    ▼
Sprint 3: AI Copilot & Content Generation Integration
    │
    ▼
Sprint 4: Real Email Provider Infrastructure (Resend / SendGrid)
    │
    ▼
Sprint 5: Automation & Workflow Drip Scheduler
    │
    ▼
Sprint 6: Settings, Domain Verification & Production Hardening
```

---

## Sprint Breakdown & Objectives

### Sprint 1: Schema Expansion & Core Resource Migration
- **Objective**: Add `Campaign`, `Contact`, `Template`, and `AiGeneration` models to `prisma/schema.prisma`.
- **Tasks**:
  1. Add model definitions with explicit relations to `Workspace` and `User`.
  2. Run `npx prisma migrate dev` to generate PostgreSQL database tables.
  3. Refactor `campaigns.controller.js`, `contacts.controller.js`, and `templates.controller.js` from in-memory arrays to Prisma queries.
  4. Fix `notificationService.js` HTTP route mismatches (`markAsRead` and `clearAll`).

### Sprint 2: Analytics & Telemetry Visualization
- **Objective**: Wire live database metrics and interactive charts into `AnalyticsPage.jsx`.
- **Tasks**:
  1. Update `analytics.controller.js` to compute real open/click/bounce rates using Prisma queries.
  2. Import and render `EmailOpenTrendChart` and `CampaignPerformanceChart` in `AnalyticsPage.jsx`.
  3. Connect export button to dynamic CSV generator.

### Sprint 3: AI Copilot & Content Generation Integration
- **Objective**: Implement real AI email copywriting and subject line optimization.
- **Tasks**:
  1. Integrate Gemini 1.5 Pro / OpenAI SDK in backend server (`server/services/ai.service.js`).
  2. Create REST endpoints (`POST /api/ai/generate-subject`, `POST /api/ai/generate-email`).
  3. Record completions in `AiGeneration` Prisma model.
  4. Build real AI Copilot workspace UI for prompt-based campaign creation.

### Sprint 4: Real Email Provider Infrastructure
- **Objective**: Connect real ESP API (Resend, SendGrid, or Amazon SES) for email delivery.
- **Tasks**:
  1. Create email dispatch queue worker.
  2. Add webhook endpoint (`POST /api/webhooks/email`) for open, click, bounce events.
  3. Implement open tracking pixel and click tracking link wrapper.

### Sprint 5: Automation & Workflow Drip Scheduler
- **Objective**: Build automated multi-step drip campaign workflows.
- **Tasks**:
  1. Implement background cron job scheduler (using `node-cron` or `BullMQ`).
  2. Add `Workflow` and `WorkflowStep` Prisma models.
  3. Build frontend visual workflow step builder.

### Sprint 6: Settings, Domain Verification & Production Hardening
- **Objective**: Persist workspace settings, domain verification (DKIM/SPF), and rate-limiting.
- **Tasks**:
  1. Build backend settings routes and Prisma model for sender identity.
  2. Add Express security headers (`helmet`) and rate-limiting (`express-rate-limit`).
  3. Prepare production deployment configuration.
