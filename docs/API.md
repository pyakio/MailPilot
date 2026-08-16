# MailPilot — API Reference
*Base URL: http://localhost:5050/api*
*Auth: httpOnly cookie 'mailpilot_token' or Authorization: Bearer <token>*

## Authentication

### POST /auth/register
Register new user account.
- **Body**: `{ name, email, password }` (password min 8 chars)
- **Response**: `{ user, token }`
- **Errors**: 400 (missing fields), 409 (email exists)

### POST /auth/login
Authenticate with email + password.
- **Body**: `{ email, password }`
- **Response**: `{ user, token }` + sets httpOnly cookie
- **Errors**: 400 (missing), 401 (invalid credentials)

### POST /auth/logout
Clear session cookie.
- **Response**: `{ success: true }`

### GET /auth/me
Get current authenticated user.
- **Auth**: Required
- **Response**: `{ success: true, user }`
- **Errors**: 401, 404

### PUT /auth/profile
Update current user profile.
- **Auth**: Required
- **Body**: `{ name* }`
- **Response**: `{ success: true, user }`
- **Errors**: 400, 401, 404

### POST /auth/google
Authenticate with Google Identity Services JWT.
- **Body**: `{ credential }` (Google ID token)
- **Response**: `{ success: true, user, token }` + sets cookie
- **Errors**: 400, 503 (GOOGLE_CLIENT_ID not configured)

### GET /status
Health check (public).
- **Response**: `{ status: "ok", service: "MailPilot API", version: "2.0.0" }`

---

## Campaigns

All campaign routes require authentication.

### GET /campaigns
List all campaigns for authenticated user.
- **Response**: `Campaign[]`

### GET /campaigns/summary
Get aggregate metrics for dashboard.
- **Response**: `{ totalCampaigns, emailsSent, openRate, clickRate, contacts }`

### GET /campaigns/:id
Get single campaign.
- **Response**: `Campaign`
- **Errors**: 404

### POST /campaigns
Create campaign.
- **Body**: `{ name*, subject*, previewText, templateId, audienceList, scheduledAt, tags }`
- **Response**: `Campaign` (201)
- **Errors**: 400

### PUT /campaigns/:id
Update campaign fields.
- **Body**: any Campaign fields
- **Response**: Updated `Campaign`
- **Errors**: 404

### DELETE /campaigns/:id
Delete campaign.
- **Response**: `{ success: true, message }`
- **Errors**: 404

### POST /campaigns/:id/send
Transition campaign status to 'SENT' in database.
- **Response**: Updated `Campaign` with `emailProviderStatus: 'NOT_CONFIGURED'`
- **Errors**: 404

---

## Contacts

All contact routes require authentication.

### GET /contacts
List all contacts.
- **Response**: `Contact[]`

### POST /contacts
Add single contact.
- **Body**: `{ email*, name, tags }`
- **Response**: `Contact` (201)
- **Errors**: 400, 409 (duplicate email)

### PUT /contacts/:id
Update contact.
- **Body**: any Contact fields
- **Response**: Updated `Contact`
- **Errors**: 404

### DELETE /contacts/:id
Remove contact.
- **Response**: `{ success: true, message }`
- **Errors**: 404

### POST /contacts/import
Bulk import from CSV rows.
- **Body**: `{ rows: [{ name, email, tags }] }`
- **Response**: `{ total, importedCount, skippedCount, failedCount, imported }`
- **Errors**: 400

---

## Templates

All template routes require authentication.

### GET /templates
List all templates.
- **Response**: `Template[]`

### GET /templates/:id
Get single template.
- **Response**: `Template`
- **Errors**: 404

### POST /templates
Create template.
- **Body**: `{ title*, body*, subject, category, htmlBody }`
- **Response**: `Template` (201)
- **Errors**: 400

### PUT /templates/:id
Update template.
- **Body**: any Template fields
- **Response**: Updated `Template`
- **Errors**: 404

### DELETE /templates/:id
Delete template.
- **Response**: `{ success: true, message }`
- **Errors**: 404

---

## Analytics

### GET /analytics
Get aggregate campaign analytics.
- **Auth**: Required
- **Response**: `{ totalCampaigns, totalContacts, totalSent, totalDelivered, openRate: null, clickRate: null, perCampaign[] }`

---

## Notifications

### GET /notifications
Get notification list.
- **Auth**: Required
- **Response**: `{ success: true, notifications[], unreadCount }`

### PUT /notifications/:id/read or POST /notifications/:id/read
Mark notification as read.
- **Auth**: Required
- **Response**: `{ success: true, notificationId }`

### DELETE /notifications or POST /notifications/read-all
Mark all notifications read.
- **Auth**: Required
- **Response**: `{ success: true, message }`

---

## Summary (alias)

### GET /summary
Alias for GET /campaigns/summary (dashboard compatibility).
- **Auth**: Required

---

## Error Format
All API error responses return structured JSON:
```json
{
  "success": false,
  "error": "Human-readable error message",
  "message": "Human-readable error message"
}
```
In development mode (`NODE_ENV=development`), stack trace is also attached.

## Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (Database disconnected) |
