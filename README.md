# MailPilot 🚀

> **AI-Powered Email Marketing & Campaign Automation Platform**

MailPilot is an enterprise-grade, modern email marketing and campaign telemetry SaaS platform designed for high-growth SaaS and product teams. It provides real-time campaign performance analytics, automated drip workflows, visual HTML email template building, subscriber list management, and high-deliverability domain verification.

---

## ⚡ Features

- 📊 **Real-Time Telemetry Dashboard**: Monitor emails sent, open rates, click conversions, and bounce rates dynamically with interactive Recharts graphs.
- ✉️ **Campaign Manager**: Design, filter (Drafts, Scheduled, Sent), schedule, and dispatch bulk email campaigns in one click.
- 🎨 **Visual Template Builder**: Create reusable HTML email layouts with dynamic personalization tags (`{{name}}`, `{{company}}`) and instant live preview.
- 👥 **Audience & Contact Manager**: Tag subscribers, filter contacts, and import bulk audience lists via CSV files with pre-import validation previews.
- 📈 **Deep Marketing Analytics**: Analyze 7-day open progression, campaign-by-campaign engagement breakdowns, and client device distributions.
- ⚙️ **Domain & Deliverability Settings**: Configure SPF, DKIM, and DMARC authentication records, manage API keys, and view SaaS billing tiers.
- 🌗 **Dark / Light Mode**: Seamless theme switching with persistent user preference storage.
- 📱 **Fully Responsive Layout**: Built with Tailwind CSS v4, collapsible sidebar, sticky top navbar, and mobile navigation drawer.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite 5) |
| **Routing** | React Router v7 (with `React.lazy()` code splitting) |
| **Styling & UI** | Tailwind CSS v4, Google Fonts (Inter) |
| **Data Visualization** | Recharts v2 |
| **Icons & Assets** | React Icons (`fi`), SVG Vector Branding |
| **HTTP Client** | Axios (with API interceptors) |
| **Backend API** | Node.js, Express.js |

---

## 📁 Repository Structure

```
MailPilot/
├── client/
│   ├── public/             # Branding assets (favicon.svg, logo.svg)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # 13 Reusable UI primitives (Buttons, Modals, Badges, Cards, Toasts)
│   │   │   ├── layout/     # Sidebar, TopNavbar, PageHeader, Layout shell
│   │   │   ├── charts/     # Recharts performance & open trend graphs
│   │   │   ├── forms/      # Campaign, Template, Contact & CSV Import modals
│   │   │   └── tables/     # Recent campaigns table, Contacts list, Templates grid
│   │   ├── context/        # ThemeContext, ToastContext, AuthContext
│   │   ├── hooks/          # useTheme, useToast, useAuth, useDebounce, useFetchData
│   │   ├── pages/          # Dashboard, Campaigns, Templates, Contacts, Analytics, Settings, Login
│   │   ├── routes/         # AppRoutes (Protected routing + Lazy loading)
│   │   ├── services/       # Axios API integration modules
│   │   ├── utils/          # Formatting utilities
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js      # Rollup manualChunks optimization & Tailwind plugin
├── server/
│   ├── index.js            # Express API server (endpoints for summary, campaigns, templates, contacts)
│   └── package.json
├── package.json            # Root workspace scripts & dependencies
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pyakio/MailPilot.git
   cd MailPilot
   ```

2. **Install all dependencies** (root, client, and server):
   ```bash
   npm run install-all
   ```

### Running Locally

Start both the backend API server (`http://localhost:5050`) and the Vite frontend dev server (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Alternatively, run client and server independently:

```bash
# Start backend server
npm run dev --prefix server

# Start frontend client
npm run dev --prefix client
```

---

## 🔐 Environment Variables

Create a `.env` file in `client/` if custom API URL overriding is needed:

```env
# Optional: Default connects to http://localhost:5050/api
VITE_API_URL=http://localhost:5050/api
```

---

## 🗺️ Roadmap & Milestones

See detailed sprint progression in [ROADMAP.md](file:///Users/abhaysingh/Project%20Trial/ROADMAP.md).

- **Sprint 1 (Completed)**: Frontend Architecture, Component Taxonomy, Recharts, Rebranding.
- **Sprint 1.5 (Completed)**: Repository Standardization, Metadata, Asset Generation & Hygiene.
- **Sprint 2 (Upcoming)**: JWT Authentication & User Session Persistence.
- **Sprint 3**: Campaign Automation Engine & SMTP/Resend Integration.
- **Sprint 4**: Advanced Real-Time Analytics & Click Heatmaps.
- **Sprint 5**: AI Email Assistant & Subject Line Generator.

---

## 📸 Screenshots & UI Preview

| Metric Telemetry Dashboard | Campaign Management |
| :---: | :---: |
| ![Dashboard Preview](https://raw.githubusercontent.com/pyakio/MailPilot/main/client/public/logo-dark.svg) | ![Campaigns Preview](https://raw.githubusercontent.com/pyakio/MailPilot/main/client/public/logo-light.svg) |

---

## 📄 License

This project is open-source under the [MIT License](file:///Users/abhaysingh/Project%20Trial/LICENSE).
