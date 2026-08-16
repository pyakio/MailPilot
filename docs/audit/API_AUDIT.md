# MailPilot — API Audit & Compatibility Matrix

## Overview
This document audits every backend API route exposed by Express (`server/routes/`) against the corresponding frontend service calls (`client/src/services/`).

---

## Complete Endpoint Audit

| HTTP Method | Path | Backend Route | Controller Function | Auth Required | Request Payload | Response Data | Frontend Caller | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | `auth.routes.js` | `status` | No | None | `{ status: "ok", service, version }` | `authService.getStatus` | WORKING |
| `POST` | `/api/auth/register` | `auth.routes.js` | `register` | No | `{ name, email, password }` | `{ user, token }` | `authService.register` | WORKING |
| `POST` | `/api/auth/login` | `auth.routes.js` | `login` | No | `{ email, password }` | `{ user, token }` + Cookie | `authService.login` | WORKING |
| `POST` | `/api/auth/logout` | `auth.routes.js` | `logout` | No | None | `{ success: true }` | `authService.logout` | WORKING |
| `POST` | `/api/auth/google` | `auth.routes.js` | `googleAuth` | No | `{ credential }` | `{ user, token }` + Cookie | `authService.loginWithGoogle` | WORKING |
| `GET` | `/api/auth/me` | `auth.routes.js` | `getMe` | Yes | Header / Cookie | `{ user }` | `authService.getMe` | WORKING |
| `GET` | `/api/campaigns` | `campaigns.routes.js` | `getAll` | Yes | Header / Cookie | `Campaign[]` | `campaignService.getCampaigns` | WORKING |
| `GET` | `/api/campaigns/summary` | `campaigns.routes.js` | `getSummary` | Yes | Header / Cookie | `{ totalCampaigns, emailsSent, ... }` | `campaignService.getSummary` | WORKING |
| `GET` | `/api/campaigns/:id` | `campaigns.routes.js` | `getOne` | Yes | Header / Cookie | `Campaign` | None (Direct URL fetch) | UNUSED (Client) |
| `POST` | `/api/campaigns` | `campaigns.routes.js` | `create` | Yes | `{ name, subject, ... }` | `Campaign` (201) | `campaignService.createCampaign` | WORKING |
| `PUT` | `/api/campaigns/:id` | `campaigns.routes.js` | `update` | Yes | `{ name, subject, ... }` | Updated `Campaign` | `campaignService.updateCampaign` | WORKING |
| `DELETE` | `/api/campaigns/:id` | `campaigns.routes.js` | `remove` | Yes | Header / Cookie | `{ success: true }` | `campaignService.deleteCampaign` | WORKING |
| `POST` | `/api/campaigns/:id/send` | `campaigns.routes.js` | `sendNow` | Yes | Header / Cookie | Updated `Campaign` | `campaignService.sendCampaign` | WORKING |
| `GET` | `/api/contacts` | `contacts.routes.js` | `getAll` | Yes | Header / Cookie | `Contact[]` | `contactService.getContacts` | WORKING |
| `POST` | `/api/contacts` | `contacts.routes.js` | `create` | Yes | `{ email, name, tags }` | `Contact` (201) | `contactService.createContact` | WORKING |
| `PUT` | `/api/contacts/:id` | `contacts.routes.js` | `update` | Yes | `{ name, tags, ... }` | Updated `Contact` | `contactService.updateContact` | WORKING |
| `DELETE` | `/api/contacts/:id` | `contacts.routes.js` | `remove` | Yes | Header / Cookie | `{ success: true }` | `contactService.deleteContact` | WORKING |
| `POST` | `/api/contacts/import` | `contacts.routes.js` | `importContacts` | Yes | `{ rows: [...] }` | `{ importedCount, ... }` | `contactService.importContacts` | WORKING |
| `GET` | `/api/templates` | `templates.routes.js` | `getAll` | Yes | Header / Cookie | `Template[]` | `templateService.getTemplates` | WORKING |
| `GET` | `/api/templates/:id` | `templates.routes.js` | `getOne` | Yes | Header / Cookie | `Template` | `templateService.getTemplate` | WORKING |
| `POST` | `/api/templates` | `templates.routes.js` | `create` | Yes | `{ title, body, ... }` | `Template` (201) | `templateService.createTemplate` | WORKING |
| `PUT` | `/api/templates/:id` | `templates.routes.js` | `update` | Yes | `{ title, body, ... }` | Updated `Template` | `templateService.updateTemplate` | WORKING |
| `DELETE` | `/api/templates/:id` | `templates.routes.js` | `remove` | Yes | Header / Cookie | `{ success: true }` | `templateService.deleteTemplate` | WORKING |
| `GET` | `/api/analytics` | `analytics.routes.js` | `getAnalytics` | Yes | Header / Cookie | `{ openRate, trend, ... }` | `analyticsService.getAnalytics` | PARTIAL |
| `GET` | `/api/summary` | `app.js` (alias) | `getSummary` | Yes | Header / Cookie | `{ totalCampaigns, ... }` | `analyticsService.getSummary` | WORKING |
| `GET` | `/api/notifications` | `notifications.routes.js` | Inline Handler | Yes | Header / Cookie | `{ notifications, unreadCount }` | `notificationService.getNotifications` | WORKING |
| `POST` | `/api/notifications/:id/read` | `notifications.routes.js` | Inline Handler | Yes | Header / Cookie | `{ success: true }` | `notificationService.markAsRead` | MISMATCH (PUT vs POST) |
| `POST` | `/api/notifications/read-all` | `notifications.routes.js` | Inline Handler | Yes | Header / Cookie | `{ success: true }` | `notificationService.clearAll` | MISMATCH (DELETE vs POST) |

---

## Frontend ↔ Backend API Compatibility Matrix & Mismatches

1. **`notificationService.markAsRead(id)`**:
   - Frontend calls: `apiClient.put('/notifications/${id}/read')` (HTTP `PUT`)
   - Backend expects: `POST /api/notifications/:id/read` (HTTP `POST`)
   - **Result**: HTTP 404 Method Not Allowed error on front-end notification read click.

2. **`notificationService.clearAll()`**:
   - Frontend calls: `apiClient.delete('/notifications')` (HTTP `DELETE`)
   - Backend expects: `POST /api/notifications/read-all` (HTTP `POST`)
   - **Result**: HTTP 404 Route Not Found error on front-end clear all notifications click.

3. **`analyticsService.getSummary()`**:
   - Frontend calls: `apiClient.get('/summary')`
   - Backend provides: `GET /api/summary` (alias mounted in `app.js`)
   - **Result**: Working via explicit alias.

4. **`settingsService`**:
   - Frontend has: `client/src/services/settingsService.js` returning hardcoded resolved Promises.
   - Backend has: **No endpoints** (`/api/settings` does not exist).
   - **Result**: Mock-only frontend functionality.
