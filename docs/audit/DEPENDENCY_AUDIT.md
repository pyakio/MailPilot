# MailPilot — Dependency Audit

## Overview
This document audits the packages listed in `package.json`, `client/package.json`, and `server/package.json`.

---

## 1. Root `package.json`

### DevDependencies
- **`concurrently`** (`^8.2.2`): Used in `npm run dev` to launch server and client dev servers in parallel. **ACTIVE**.

---

## 2. Server `server/package.json`

### Dependencies
- **`@prisma/client`** (`^5.22.0`): Database ORM client for PostgreSQL. **ACTIVE**.
- **`bcryptjs`** (`^2.4.3`): Password hashing algorithm. **ACTIVE**.
- **`body-parser`** (`^1.20.2`): Express body parsing middleware (Note: Express has built-in `express.json()`). **PARTIALLY REDUNDANT**.
- **`cookie-parser`** (`^1.4.7`): Cookie parsing middleware for httpOnly JWT cookie. **ACTIVE**.
- **`cors`** (`^2.8.5`): Cross-Origin Resource Sharing middleware. **ACTIVE**.
- **`dotenv`** (`^16.4.5`): Environment variable loader. **ACTIVE**.
- **`express`** (`^4.18.2`): Backend Web Framework. **ACTIVE**.
- **`google-auth-library`** (`^9.9.0`): Google ID token verification library. **ACTIVE**.
- **`jsonwebtoken`** (`^9.0.2`): JWT signing and verification library. **ACTIVE**.

### DevDependencies
- **`nodemon`** (`^3.1.4`): Auto-restarting development process manager. **ACTIVE**.
- **`prisma`** (`^5.22.0`): Prisma CLI for migrations and schema validation. **ACTIVE**.

---

## 3. Client `client/package.json`

### Dependencies
- **`@tailwindcss/vite`** (`^4.0.0`): Vite plugin for Tailwind CSS v4. **ACTIVE**.
- **`axios`** (`^1.7.9`): HTTP client library. **ACTIVE**.
- **`react`** (`^18.3.1`): React core library. **ACTIVE**.
- **`react-dom`** (`^18.3.1`): React DOM renderer. **ACTIVE**.
- **`react-icons`** (`^5.4.0`): SVG icon library (Feather icon set `fi`). **ACTIVE**.
- **`react-router-dom`** (`^7.1.3`): React routing library. **ACTIVE**.
- **`recharts`** (`^2.11.10`): SVG Charting library. **ACTIVE** (Components exist, but need rendering in AnalyticsPage).
- **`tailwindcss`** (`^4.0.0`): CSS utility engine. **ACTIVE**.

### DevDependencies
- **`@vitejs/plugin-react`** (`^4.3.1`): Vite React plugin. **ACTIVE**.
- **`vite`** (`^5.4.2`): Vite build tool and dev server. **ACTIVE**.

---

## Dependency Health & Recommendations
1. All dependencies are active and up to date.
2. `body-parser` in `server/package.json` can be removed in a future cleanup since `express.json()` and `express.urlencoded()` are built into Express 4.18.
