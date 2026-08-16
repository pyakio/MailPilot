# MailPilot — SaaS Multi-Tenant Architecture

## Overview
MailPilot implements a true multi-tenant SaaS architecture where all core email marketing assets (Campaigns, Contacts/Audience Lists, Templates) are strictly isolated by **Workspace**.

---

## Workspace Isolation Model

```
User (users table)
  │
  ├── Account[] (OAuth Provider identities)
  ├── Session[] (Active session tokens)
  └── WorkspaceMembership[] (Role: ADMIN | EDITOR | VIEWER)
                           │
                           ▼
                    Workspace (workspaces table)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
Campaign (campaigns)  Contact (contacts)  Template (templates)
```

---

## Security & Query Isolation Guarantees

1. **Automatic Workspace Bootstrapping**:
   When a user registers or logs in via Google/email for the first time, `getOrCreateUserWorkspace(userId, userName)` creates a default `Workspace` (`"User's Workspace"`) and `WorkspaceMembership` with role `ADMIN`.

2. **Scoped Database Operations**:
   Every resource database query is scoped by the user's active `workspaceId`:
   - `prisma.campaign.findMany({ where: { workspaceId } })`
   - `prisma.contact.findMany({ where: { workspaceId } })`
   - `prisma.template.findMany({ where: { workspaceId } })`
   - `prisma.campaign.findFirst({ where: { id, workspaceId } })`

3. **Cross-Tenant Access Prevention**:
   Accessing `/api/campaigns/:id`, `/api/contacts/:id`, or `/api/templates/:id` verifies `where: { id, workspaceId }`. If a resource belongs to another workspace, the backend returns `404 Not Found or Access Denied`.

4. **Per-Workspace Contact Uniqueness**:
   Contacts are unique per workspace (`@@unique([workspaceId, email])`). Subscriber `john@example.com` in Workspace A does not conflict with `john@example.com` in Workspace B.
