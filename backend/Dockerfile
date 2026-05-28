FROM node:18-alpine AS base

# Install curl for health check
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

# --- DEVELOPMENT STAGE (Installs nodemon for hot reloading) ---
FROM base AS development
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npx", "nodemon", "server.js"]

# --- PRODUCTION STAGE (Lightweight and hardened) ---
FROM base AS production
RUN npm install --omit=dev
COPY . .

# Don't run as root in production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

# Production Health Check to ensure Render/Railway traffic routing is safe
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

CMD ["node", "server.js"]
