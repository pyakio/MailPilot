# Multi-stage Dockerfile for MailPilot Full-Stack Deployment

# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build & Run Server
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install server dependencies
COPY server/package*.json ./server/
COPY prisma ./prisma/
WORKDIR /app/server
RUN npm ci --only=production
RUN npx prisma generate --schema=../prisma/schema.prisma

# Copy application source
COPY server/ ./

# Expose API port
EXPOSE 5050

CMD ["node", "index.js"]
