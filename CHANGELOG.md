# MailPilot Changelog 📜

All notable changes to the **MailPilot** project will be documented in this file.

---

## [0.2.0] - 2026-08-02

### Refactored & Rearchitected
- **Feature-Based Architecture**:
  - Reorganized client codebase into `src/app/` (`layouts/`, `routes/`), `src/features/` (`auth/`, `dashboard/`, `campaigns/`, `templates/`, `contacts/`, `analytics/`, `settings/`), `src/lib/`, `src/services/`, `src/contexts/`, `src/constants/`.
- **UX & Design System Simplification (Linear / Resend / Vercel Aesthetic)**:
  - Removed decorative multi-colored gradient icons, over-decorated cards, and visual noise.
  - Standardized subtle monochromatic icons, crisp borders (`border-slate-200 dark:border-slate-800`), generous whitespace, and single clear primary action per screen.
- **Branding Standard**:
  - Replaced all occurrences of `MailPilot.io` with **`MailPilot`**.
  - Standardized tagline to **`AI Email Marketing Platform`**.
  - Removed all `.io` domain references in code, UI, and SVG logos.
- **API Services Layer**:
  - Isolated Axios HTTP client in `src/lib/axios.js`.
  - Created dedicated domain service modules: `authService.js`, `campaignService.js`, `contactService.js`, `analyticsService.js`, `templateService.js`, `settingsService.js`.
- **Context & Hook Standardization**:
  - Renamed `src/context/` to `src/contexts/`.

---

## [0.1.0] - 2026-08-02
- Initial Sprint 1 & Sprint 1.5 releases.
