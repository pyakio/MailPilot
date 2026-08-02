# MailPilot 🚀

> **AI Email Marketing Platform**

MailPilot is an enterprise-grade email marketing and campaign automation SaaS platform built for high-growth product teams. It features a minimal, quiet design aesthetic (inspired by Linear, Vercel, and Resend), high deliverability, automated drip workflows, visual HTML email template builder, subscriber management, and real-time telemetry analytics.

---

## ⚡ Key Features

- 📊 **Real-Time Telemetry**: Track emails sent, open rates, click conversions, and bounce rates with subtle Recharts data visualization.
- ✉️ **Campaign Manager**: Design, filter (Drafts, Scheduled, Sent), schedule, and dispatch bulk email campaigns in one click.
- 🎨 **Visual Template Builder**: Create reusable HTML email layouts with personalization variables (`{{name}}`, `{{company}}`) and live preview.
- 👥 **Audience & Contact Manager**: Tag subscribers, filter contacts, and import bulk audience lists via CSV files with pre-import validation.
- 📈 **Marketing Analytics**: 7-day open progression, campaign-by-campaign engagement breakdowns, and client device distributions.
- ⚙️ **Domain & Deliverability Settings**: Configure SPF, DKIM, and DMARC authentication records, manage API keys, and view SaaS billing tiers.
- 🌗 **Dark / Light Mode**: Subtle theme switching with persistent user preference storage.
- 📱 **Feature-Based Architecture**: Modular code layout, collapsible sidebar, sticky top navbar, and mobile navigation drawer.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite 5) |
| **Architecture** | Feature-Based Architecture (`src/features/`, `src/app/`, `src/lib/`, `src/services/`) |
| **Routing** | React Router v7 (with `React.lazy()` feature code splitting) |
| **Styling & UI** | Tailwind CSS v4, Google Fonts (Inter) |
| **Data Visualization** | Recharts v2 |
| **Icons & Assets** | React Icons (`fi`), Monochromatic SVG Branding |
| **HTTP Client** | Axios (isolated in `src/lib/axios.js`) |
| **Backend API** | Node.js, Express.js |

---

## 📁 Repository Structure

```
MailPilot/
├── client/
│   ├── public/             # Brand assets (favicon.svg, logo.svg, logo-dark.svg, logo-light.svg)
│   ├── src/
│   │   ├── app/            # Core Application Layouts & Routes
│   │   │   ├── layouts/    # Layout, Sidebar, TopNavbar, PageHeader
│   │   │   └── routes/     # AppRoutes (Protected routing + Lazy feature loading)
│   │   ├── features/       # Feature-Based Modules
│   │   │   ├── auth/       # LoginPage
│   │   │   ├── dashboard/  # DashboardPage
│   │   │   ├── campaigns/  # CampaignsPage
│   │   │   ├── templates/  # TemplatesPage
│   │   │   ├── contacts/   # ContactsPage
│   │   │   ├── analytics/  # AnalyticsPage
│   │   │   └── settings/   # SettingsPage
│   │   ├── components/     # Shared Reusable Components
│   │   │   ├── charts/     # Recharts performance & open trend graphs
│   │   │   ├── forms/      # Campaign, Template, Contact & CSV Import modals
│   │   │   ├── tables/     # Recent campaigns table, Contacts list, Templates grid
│   │   │   └── ui/         # Atomic UI Primitives (PrimaryButton, SecondaryButton, Modal, Card, Badge, ToastNotifications)
│   │   ├── contexts/       # ThemeContext, ToastContext, AuthContext
│   │   ├── hooks/          # useTheme, useToast, useAuth, useDebounce, useFetchData
│   │   ├── lib/            # Axios client configuration (axios.js)
│   │   ├── services/       # Domain API services (authService, campaignService, contactService, analyticsService, templateService, settingsService)
│   │   ├── utils/          # Formatting helpers (formatters.js)
│   │   ├── constants/      # App constants (index.js)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js      # Rollup manualChunks optimization & Tailwind plugin
├── server/
│   ├── index.js            # Express API server
│   └── package.json
├── package.json            # Root workspace scripts & dependencies
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

---

## 🚀 Getting Started

### Installation
```bash
git clone https://github.com/pyakio/MailPilot.git
cd MailPilot
npm run install-all
```

### Running Locally
```bash
npm run dev
```

---

## 📄 License

This project is licensed under the [MIT License](file:///Users/abhaysingh/Project%20Trial/LICENSE).
