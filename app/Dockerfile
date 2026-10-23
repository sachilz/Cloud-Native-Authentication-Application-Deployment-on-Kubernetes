# Multi-stage Dockerfile for DevOps Application
# Default target: backend

# ====================
# Backend Stage
# ====================
FROM node:20-alpine AS backend-base
WORKDIR /usr/src/app
RUN apk add --no-cache curl
COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY backend/ ./
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]

# ====================
# Frontend Builder Stage
# ====================
FROM node:20-alpine AS frontend-builder
WORKDIR /usr/src/app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ====================
# Frontend Release Stage
# ====================
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-builder /usr/src/app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]

# Default stage when built without --target
FROM backend-base AS release
