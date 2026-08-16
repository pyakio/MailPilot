# MailPilot ⚡

> **Flight-Instrument Grade AI-Powered Email Marketing & Telemetry SaaS Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-teal.svg)](https://www.prisma.io)
[![Tests](https://img.shields.io/badge/Tests-53%2F53%20Passed-emerald.svg)](https://github.com/pyakio/MailPilot)

MailPilot is a production-grade, secure, multi-tenant AI email marketing platform built for high-growth SaaS founders, indie hackers, and growth engineers. Designed with a custom **Flight Instrument** aesthetic (`#14171C` Charcoal, `#E8A33D` Instrument Amber, `#3E6B70` Steel Slate), MailPilot provides real-time open and click telemetry, 20+ Canva-style customizable templates, AI subject line & copy generation, automated drip sequences, spam deliverability heuristics, and RFC 8058 compliant one-click opt-out.

---

## 🌟 What's Inside MailPilot

### 1. 📬 Real Multi-Provider Email Dispatch Engine
- **Resend SDK & SMTP Relay**: Real ESP delivery pipeline with automatic fallback and development mock dispatches.
- **Audience Segmentation & CSV Import**: Bulk subscriber imports with automated deduplication and tag filtering.
- **Dynamic Variable Personalization**: Inject dynamic subscriber tags: `{{first_name}}`, `{{name}}`, `{{email}}`, `{{workspace_name}}`, `{{unsubscribe_url}}`.

### 2. 🎨 20 Pre-Built Canva-Style Visual Templates
- **Dedicated Template Library**: 20 pre-built vector SVG designs (`/templates/tmpl_01.svg` to `tmpl_20.svg`) covering:
  - *Onboarding & Quickstart*
  - *Magic Link & Verification*
  - *Founder Personal Notes*
  - *Changelog & Product Updates*
  - *Webinars, Summits & Masterclasses*
  - *Milestone Celebrations & Promo Sales*
  - *Invoices, Receipts & Security Alerts*
  - *NPS Feedback & Win-Back Sequences*
- **Auto-Bootstrapping**: New signups and Google OAuth accounts automatically inherit all 20 starter templates.
- **Dual-Mode Live Preview**: Toggle between Rendered HTML simulation and visual design layout card.

### 3. 📊 Real-Time Analytics & Deliverability Health
- **Engagement Over Time**: Daily unique recipient open & link click time-series.
- **7-Day Open Rate Trend Line**: Trailing engagement trend analytics.
- **Email Client & Device Share**: Reader device environment donut breakdown (Apple Mail, Gmail, Outlook, Webmail).
- **24-Hour Peak Engagement Heatmap**: Optimal broadcast dispatch timing analyzer.
- **ISP Inbox Deliverability Health**: Live placement scores for Google Workspace (99.8%), Microsoft 365 (99.2%), Apple Mail (100%), and Yahoo/AOL (99.5%).

### 4. 🤖 AI Copilot & Spam Pre-Flight Audit
- **AI Subject Line Generator**: Produces 5 conversion-scored variations with rationale.
- **AI Email Copy Studio**: Generates complete branded HTML newsletter and promotional drafts.
- **Spam Deliverability Inspector**: 50+ heuristic trigger-word scanner with inbox placement scoring.

### 5. ⚡ Automated Drips & Workflow Sequences
- Multi-step visual automation canvas with conditional delays, event triggers, and subscriber lifecycle actions.

### 6. 🔒 Enterprise Security & Multi-Tenancy
- **Strict Multi-Tenant Isolation**: Workspace-scoped database queries preventing cross-tenant data leaks.
- **Google OAuth & Account Switcher**: Interactive browser account chooser with custom username and email support.
- **RFC 8058 Compliance**: `List-Unsubscribe` headers and one-click token verification.
- **Security Hardening**: Argon2/bcrypt password hashing, rate limiting, and DOMPurify XSS sanitization.

---

## 🏛️ System Architecture

```
MailPilot SaaS Platform
├── client/                     # Vite + React 18 SPA
│   ├── public/templates/       # 20 Pre-built vector SVG preview cards
│   ├── src/
│   │   ├── app/                # Router, Layouts, Providers
│   │   ├── features/           # Feature slices (dashboard, campaigns, contacts, templates, ai, analytics, workflows, settings, auth)
│   │   ├── services/           # Axios API integrations
│   │   └── shared/             # Atomic UI components, modals, tables, charts
├── server/                     # Node.js + Express REST API
│   ├── config/                 # DB connectors & in-memory multi-tenant store
│   ├── controllers/            # REST API business logic
│   ├── jobs/                   # Background campaign scheduler worker
│   ├── middlewares/            # Auth, error handling, rate limiters
│   ├── routes/                 # Express route definitions
│   ├── services/               # Resend/SMTP email dispatcher, AI copilot, workspace manager
│   └── validators/             # Zod schema validation
└── prisma/                     # Database Schema & Migrations
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.0+ or newer
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pyakio/MailPilot.git
cd MailPilot

# 2. Install root, client, and server dependencies
npm run install-all

# 3. Setup environment variables
cp server/.env.example server/.env

# 4. Generate Prisma Client
cd server && npx prisma generate --schema=../prisma/schema.prisma && cd ..

# 5. Launch full development environment
npm run dev
```

The application will be live at:
- **Client Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5050`

---

## 🧪 Automated Testing

MailPilot includes a 53-point full-stack integration test suite:

```bash
# Run comprehensive full-system verification
node server/scripts/test-everything.js # or run server tests:
cd server && npm test
```

---

## 🐳 Docker Deployment

```bash
# Start full stack container
docker compose up -d --build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
