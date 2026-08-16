# MailPilot — Cleanup Candidates List

## Overview
This document recommends cleanup, refactoring, and directory structure consolidation tasks for future implementation approval. **No code or directories were deleted during this audit.**

---

## Complete Candidate List

| Candidate ID | Action | Target Path | Reason / Explanation | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **CLEANUP-001** | DELETE | `client/src/app/routes/` | Empty folder left over from directory structure cleanup | Delete empty directory |
| **CLEANUP-002** | DELETE | `client/src/routes/` | Empty folder left over from directory structure cleanup | Delete empty directory |
| **CLEANUP-003** | DELETE | `client/src/config/` | Empty directory | Delete empty directory |
| **CLEANUP-004** | DELETE | `client/src/types/` | Empty directory (project uses JSX) | Delete empty directory |
| **CLEANUP-005** | DELETE | `client/src/app/store/` | Empty directory | Delete empty directory |
| **CLEANUP-006** | DELETE | `client/src/features/auth/components/` | Empty subdirectory | Delete empty directory |
| **CLEANUP-007** | DELETE | `client/src/features/auth/hooks/` | Empty subdirectory | Delete empty directory |
| **CLEANUP-008** | DELETE | `client/src/features/auth/services/` | Empty subdirectory | Delete empty directory |
| **CLEANUP-009** | DELETE | `client/src/features/auth/types/` | Empty subdirectory | Delete empty directory |
| **CLEANUP-010** | DELETE | `client/src/features/auth/utils/` | Empty subdirectory | Delete empty directory |
| **CLEANUP-011** | DELETE | `server/services/` | Empty directory | Delete empty directory |
| **CLEANUP-012** | DELETE | `server/validators/` | Empty directory | Delete empty directory |
| **CLEANUP-013** | MERGE | `server/prisma/` | Duplicate mirror of workspace root `prisma/` schema and migrations | Standardize on root `prisma/` directory |
| **CLEANUP-014** | REFACTOR | `server/controllers/campaigns.controller.js` | Uses in-memory array store | Migrate to Prisma ORM |
| **CLEANUP-015** | REFACTOR | `server/controllers/contacts.controller.js` | Uses in-memory array store | Migrate to Prisma ORM |
| **CLEANUP-016** | REFACTOR | `server/controllers/templates.controller.js` | Uses in-memory array store | Migrate to Prisma ORM |
| **CLEANUP-017** | REFACTOR | `client/src/services/notificationService.js` | HTTP methods mismatch `notifications.routes.js` | Update PUT/DELETE calls to match POST routes |
| **CLEANUP-018** | REFACTOR | `client/src/features/analytics/pages/AnalyticsPage.jsx` | Renders hardcoded numbers and omits Recharts | Wire `analyticsService` and render Recharts |
| **CLEANUP-019** | REFACTOR | `client/src/services/settingsService.js` | Hardcoded Promise resolve | Implement backend settings routes & Prisma model |
