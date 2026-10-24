# Environment Variables & Configuration Reference

## Overview

This document provides a single, consolidated reference of all `.env` files and environment variable values used across the **DevOps Task Tracker** project, including their usage in **Local Development**, **Docker Compose**, **Minikube/Kind**, and **Amazon EKS (Kubernetes & Helm)**.

---

## 1. Quick Master Reference Table

| Variable | Default Value | Used In | Purpose |
|---|---|---|---|
| `PORT` | `5000` | Backend | Port Express HTTP server listens on |
| `FRONTEND_PORT` | `3000` | Docker Compose / Frontend | Local host port mapped to React frontend |
| `NODE_ENV` | `development` / `production` | Backend | Node runtime environment mode |
| `DB_HOST` | `localhost` / `postgres` | Backend | PostgreSQL host (`localhost` for local, service name in K8s) |
| `DB_PORT` | `5432` | Backend | PostgreSQL listening port |
| `DB_NAME` | `devops_tasks` | Backend / DB | Target PostgreSQL database name |
| `DB_USER` | `postgres` | Backend / DB | PostgreSQL master username |
| `DB_PASSWORD` | `postgres` | Backend / DB | PostgreSQL master password |
| `DB_SSL` | `false` | Backend | Enable/disable SSL for PostgreSQL connections |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/devops_tasks` | Backend | Full connection string for migrations/ORM |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:5173` | Backend | Allowed browser origins for cross-origin API calls |
| `VITE_API_BASE_URL` | `/api` | Frontend | Base path for frontend API requests (proxied by Nginx) |
| `VITE_APP_TITLE` | `DevOps Task Tracker \| Amazon EKS` | Frontend | Browser tab title displayed in React app |

---

## 2. File-by-File Values

### A. Root / Docker Compose (`app/.env.example`)
* **Path:** `app/.env.example`
* **Scope:** Used by `docker-compose.yml` to orchestrate multi-container local stack.

```env
# Global Docker Compose & Application Configuration
# Server Ports
PORT=5000
FRONTEND_PORT=3000

# PostgreSQL Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=devops_tasks
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Node Environment
NODE_ENV=production

# CORS Origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

### B. Backend API (`app/backend/.env` & `app/backend/.env.example`)
* **Path:** `app/backend/.env` & `app/backend/.env.example`
* **Scope:** Read by `src/config/env.js` and `dotenv` for the Express backend.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devops_tasks
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devops_tasks

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

---

### C. Frontend Client (`app/frontend/.env` & `app/frontend/.env.example`)
* **Path:** `app/frontend/.env` & `app/frontend/.env.example`
* **Scope:** Read by Vite at build time and injected into React client.

```env
# Frontend Environment Variables
# If left empty, API calls will proxy through /api
VITE_API_BASE_URL=/api
VITE_APP_TITLE=DevOps Task Tracker | Amazon EKS
```

---

## 3. Environment Variable Differences by Deployment Target

Depending on where you run the application, `DB_HOST` and `CORS_ORIGIN` change:

| Environment | `DB_HOST` | `NODE_ENV` | `VITE_API_BASE_URL` |
|---|---|---|---|
| **Local Bare-Metal** (`npm run dev`) | `localhost` | `development` | `http://localhost:5000/api` |
| **Docker Compose** | `postgres` (container name) | `production` | `/api` (proxied by Nginx) |
| **Minikube / Kind (Raw YAML)** | `postgres` (ClusterIP service) | `production` | `/api` (proxied by Nginx) |
| **Helm Chart Deployment** | `devops-task-tracker-postgres` | `production` | `/api` (proxied by Nginx) |
| **Amazon EKS Cloud** | AWS RDS endpoint or in-cluster Postgres | `production` | `/api` or Ingress / ALB DNS |

---

## 4. Kubernetes & Helm Mapping

When migrating from `.env` files to Kubernetes, environment variables are split between **ConfigMaps** (non-sensitive) and **Secrets** (sensitive credentials):

### ConfigMap (`backend-config`):
Stores non-sensitive configuration:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: "production"
  DB_HOST: "postgres"
  DB_PORT: "5432"
```

### Secret (`postgres-secret` / `db-credentials`):
Stores sensitive database authentication:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_USER: "postgres"
  POSTGRES_PASSWORD: "postgres"
  POSTGRES_DB: "devops_tasks"
```

---

## 5. Security Best Practices

1. **Never commit actual `.env` files with production passwords to Git.** They are properly ignored via `.gitignore`.
2. **Always maintain `.env.example`** with placeholder/safe defaults as documentation for teammates and CI/CD pipelines.
3. In production Amazon EKS, inject database credentials using **AWS Secrets Manager** with External Secrets Operator (ESO) or native Kubernetes Secrets sealed with SealedSecrets / KMS encryption.
