# Backend Dockerfile
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install curl for container health checks
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Production dependencies stage
FROM base AS dependencies
RUN npm install --omit=dev && npm cache clean --force

# Final application image
FROM base AS release
ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

# Set non-root user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
