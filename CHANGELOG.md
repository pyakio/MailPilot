# MailPilot Changelog 📜

All notable changes to the **MailPilot** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-02

### Added
- **Product Rebranding**: Full rebranding of platform title, logos, navbar, metadata, and documentation to **MailPilot**.
- **Frontend Architecture & Component Taxonomy**:
  - Reusable UI primitives: `PrimaryButton`, `SecondaryButton`, `Modal`, `ConfirmationDialog`, `ToastNotifications`, `SearchBar`, `Pagination`, `LoadingSpinner`, `SkeletonLoader`, `EmptyState`, `Badge`, `Card`, `NotFound`.
  - Layout components: Collapsible `Sidebar`, sticky `TopNavbar`, `PageHeader`, responsive `Layout` frame.
  - Recharts integration: `CampaignPerformanceChart`, `EmailOpenTrendChart`, `CampaignBreakdownChart`.
  - Interactive forms & modals: `CampaignFormModal`, `TemplateFormModal` (with Live Preview tab), `ContactFormModal`, `ImportCsvModal` (with live parsed preview table).
  - Data tables & grids: `RecentCampaignsTable`, `ContactsTable`, `TemplatesGrid`.
- **SaaS Page Suites**:
  - `Dashboard`: Real-time telemetry metric cards, Quick Actions bar, performance charts, scheduled campaigns queue, activity timeline.
  - `Campaigns`: Status tabs (All, Draft, Scheduled, Sent), search, create/edit modals, instant "Send Now" button.
  - `Templates`: Visual card grid layout, HTML template builder modal with dynamic personalization tags.
  - `Contacts`: Subscriber tag filtering, search bar, CSV importer modal, subscriber list table.
  - `Analytics`: Open/Click/Bounce/Deliverability metrics, trend graphs, device client breakdown, CSV report exporter.
  - `Settings`: Account profile, sender domain authentication status (SPF/DKIM/DMARC), secret API key management, SaaS subscription billing cards.
  - `Login`: Split-screen SaaS authentication landing page.
- **Brand Assets & Metadata**:
  - Created vector SVG branding assets (`favicon.svg`, `logo.svg`, `logo-dark.svg`, `logo-light.svg`).
  - Added OpenGraph (`og:*`) and Twitter Card (`twitter:*`) metadata tags.
- **State & Theme Management**:
  - `ThemeContext` with dark/light mode toggle and persistent local storage selection.
  - `ToastContext` for floating notification alerts.
  - `AuthContext` for user session state.
- **Services & Data Layer**:
  - Axios service layer ([api.js](file:///Users/abhaysingh/Project%20Trial/client/src/services/api.js), `campaignService`, `templateService`, `contactService`, `analyticsService`).
- **Code Splitting & Performance**:
  - Route lazy loading via `React.lazy()` and `Suspense`.
  - Rollup `manualChunks` optimization in `vite.config.js` (`react-vendor`, `recharts-vendor`, `icons-vendor`).

### Changed
- Standardized package manifest metadata in `package.json`, `client/package.json`, and `server/package.json`.
- Refactored project `.gitignore` for strict build and system artifact exclusion.

### Removed
- Removed legacy un-nested stylesheet `client/src/styles.css`.
