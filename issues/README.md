# Project Issues & Troubleshooting Log

This directory documents the technical challenges, root causes, and resolutions encountered during containerization, local development, and deployment for the **Cloud-Native Authentication Application Deployment on Minikube** project.

---

## 📋 Incident Index

| ID | Issue | Category | Status | Details |
|---|---|---|---|---|
| **#01** | Docker Build Failure (`npm ci` lockfile mismatch) | Docker / Containerization | ✅ Resolved | [Read Details](01-npm-ci-lockfile-mismatch.md) |
| **#02** | Host Port 5000 Collision (`ERR_CONNECTION_RESET`) | Networking / Docker Compose | ✅ Resolved | [Read Details](02-port-5000-conflict.md) |

---

## 🎯 Key Takeaways for Production & CI/CD Pipelines
1. **Container Consistency**: Never rely on Windows-generated lockfiles with strict `npm ci` without specifying `--omit=dev` or generating standard cross-platform dependency manifests.
2. **Context Hygiene**: Always include `.dockerignore` files in each service directory to avoid pushing host artifacts (such as local `node_modules` or `.env` files) into container build contexts.
3. **Host Port Isolation**: Ensure standard developer ports (e.g. 5000, 5432, 8080) have fallback or configurable overrides via `.env` variables to prevent collisions with host services.
