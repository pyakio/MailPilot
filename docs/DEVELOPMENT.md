# MailPilot — Development Setup Guide

## Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB (optional — app runs without it in in-memory mode)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/pyakio/MailPilot.git
cd MailPilot

# 2. Install all dependencies (root + server + client)
npm run install-all

# 3. Configure server environment
cp server/.env.example server/.env
# Edit server/.env — at minimum set JWT_SECRET

# 4. Configure client environment (optional)
cp client/.env.example client/.env
# Edit client/.env — set VITE_GOOGLE_CLIENT_ID for Google OAuth

# 5. Start both server + client in parallel
npm run dev
```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5050/api/status

## Environment Variables

### Server (`server/.env`)
```
PORT=5050
NODE_ENV=development
MONGODB_URI=                    # Leave empty for in-memory mode
JWT_SECRET=your_secret_here     # Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=               # From Google Cloud Console
GOOGLE_CLIENT_SECRET=           # From Google Cloud Console
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5050/api
VITE_GOOGLE_CLIENT_ID=          # Same as server GOOGLE_CLIENT_ID
```

## Database Modes

### In-Memory (default, no config needed)
- Server starts immediately
- Data resets on server restart
- Good for development and demos

### MongoDB (persistent)
- Set `MONGODB_URI=mongodb://localhost:27017/mailpilot` in server/.env
- Start MongoDB: `mongod` or use MongoDB Compass
- Or use MongoDB Atlas (cloud): paste connection string as MONGODB_URI

## Available Scripts

### Root
```bash
npm run dev          # Start server + client concurrently
npm run build        # Build client for production
npm run install-all  # Install all workspace deps
```

### Server only
```bash
cd server
npm run dev   # Start with nodemon (auto-restart)
npm run start # Start without nodemon
```

### Client only
```bash
cd client
npm run dev     # Start Vite dev server
npm run build   # Production build
npm run preview # Preview production build
```

## Testing API Endpoints
```bash
# Health check
curl http://localhost:5050/api/status

# Register
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
