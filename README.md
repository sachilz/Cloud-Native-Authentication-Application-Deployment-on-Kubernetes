# Cloud-Native Authentication Application Deployment on Kubernetes (Minikube)

### 🚀 Microservices Containerization & Orchestration from Docker Compose to Minikube Kubernetes

[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.30+-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Minikube](https://img.shields.io/badge/Minikube-Local_Cluster-13B5EA?logo=kubernetes&logoColor=white)](https://minikube.sigs.k8s.io/)
[![Helm](https://img.shields.io/badge/Helm-3.x-0F1689?logo=helm&logoColor=white)](https://helm.sh/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end cloud-native project demonstrating the containerization, orchestration, and deployment of a full-stack multi-tier application (**DevOps Task Tracker & Authentication Application**) from a local **Docker Compose** environment to a local **Minikube Kubernetes** cluster using declarative **Kubernetes Manifests** and **Helm 3**.

---

## 🏛️ System Architecture

![Cloud-Native Kubernetes Authentication Architecture](Cloud-Native%20Kubernetes%20Authentication%20Architecture.png)

```text
[ Browser / Developer Client ]
             │
             │ (Port 3000 or NodePort)
             ▼
┌────────────────────────────────────────────────────────┐
│ Minikube Kubernetes Cluster (Namespace: devops-tracker)│
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Frontend Service (NodePort / Port-Forward 3000)  │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Frontend Pod (Nginx + React 18 SPA)              │  │
│  │ Reverse Proxies /api/* ───────────────┐          │  │
│  └───────────────────────────────────────┼──────────┘  │
│                                          │             │
│                                          ▼             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Backend Service (ClusterIP: backend:5000)        │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Backend Pod (Node.js 20 + Express REST API)      │  │
│  │ Config: ConfigMap (backend-config)               │  │
│  │ Credentials: Secret (db-credentials)             │  │
│  │ Health Probes: /health/live, /health/ready       │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Database Service (ClusterIP: postgres:5432)      │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ PostgreSQL 16 Stateful Pod                       │  │
│  │ Storage: PersistentVolumeClaim (PVC 1Gi)         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Matrix

| Domain | Technology | Purpose & Implementation |
|---|---|---|
| **Container Orchestration** | **Minikube** | Local Kubernetes cluster managing Pods, Deployments, Services, and PVCs. |
| **Package Management** | **Helm 3** | Reusable templated packaging (`app/helm/devops-task-tracker`) with environment overrides. |
| **Declarative Manifests** | **Kubernetes YAML** | Pure Kubernetes manifests (`app/k8s/`) specifying Deployments, Services, ConfigMaps, and Secrets. |
| **Container Engine** | **Docker & Buildx** | Multi-stage minimal Alpine base images with non-root security context (`USER node`). |
| **Frontend Tier** | **React 18, Vite, Tailwind CSS** | Single-page application with Kanban board, authentication UI, and Nginx reverse proxy. |
| **Backend Tier** | **Node.js 20, Express** | RESTful API with user authentication, health probes (`/api/health/live`, `/api/health/ready`), and task management. |
| **Database & Storage** | **PostgreSQL 16 Alpine & PVC** | Stateful relational database backed by a Kubernetes PersistentVolumeClaim (PVC). |
| **Observability** | **Kubernetes Probes** | Startup, liveness, and readiness probes for zero-downtime and self-healing. |

---

## 📂 Repository Directory Structure

```text
Cloud-Native-Authentication-Application-Deployment-on-Kubernetes/
├── .dockerignore                       # Excludes local files from Docker build context
├── .gitignore                          # Excludes secrets, node_modules, and build outputs
├── Cloud-Native Kubernetes Authentication Architecture.png # Visual system architecture diagram
├── README.md                           # Master project documentation
│
├── app/                                # Application Source Code & Deployment Configs
│   ├── backend/                        # Node.js + Express REST API
│   │   ├── src/                        # Controllers, routes, models, and DB migrations
│   │   ├── Dockerfile                  # Multi-stage Alpine container with non-root user
│   │   ├── .env.example                # Sample backend environment configuration
│   │   └── package.json                # Dependencies and Jest testing scripts
│   │
│   ├── frontend/                       # React 18 + Vite + Tailwind CSS Client
│   │   ├── src/                        # Components, pages, and API client
│   │   ├── nginx.conf                  # Nginx reverse proxy configuration (/api -> backend:5000)
│   │   ├── Dockerfile                  # Multi-stage production Nginx container
│   │   └── .env.example                # Frontend environment template
│   │
│   ├── k8s/                            # Pure Kubernetes Manifests (Declarative YAML)
│   │   ├── backend.yaml                # Backend Deployment & ClusterIP Service
│   │   ├── backend-configmap.yaml      # Non-sensitive backend environment variables
│   │   ├── frontend.yaml               # Frontend Deployment & NodePort Service
│   │   ├── postgres.yaml               # PostgreSQL Deployment, Secret, PVC, and Service
│   │   └── db-migration-job.yaml       # One-shot database schema migration Job
│   │
│   ├── helm/                           # Helm 3 Application Packaging
│   │   └── devops-task-tracker/        # Chart containing configurable templates and values
│   │       ├── Chart.yaml              # Chart metadata
│   │       ├── values.yaml             # Configurable values (images, replicas, ports, storage)
│   │       └── templates/              # Kubernetes resource templates
│   │
│   ├── docker-compose.yml              # Local multi-container development environment
│   └── .env.example                    # Global environment template for Docker Compose
│
├── docs/                               # Architecture Specifications & API Reference
│   ├── api-documentation.md            # Complete REST API documentation with endpoints
│   ├── architecture.md                 # System architectural design decisions
│   └── troubleshooting.md              # Troubleshooting guide
│
├── issues/                             # Incident Post-Mortems & Resolutions
│   ├── 01-npm-ci-lockfile-mismatch.md  # Docker build lockfile mismatch fix
│   ├── 02-port-5000-conflict.md        # Host port collision resolution
│   └── README.md                       # Issues log and key takeaways
│
└── learning/                           # Step-by-Step Practical Minikube Guides
    ├── 01-deploy-postgres-container-in-minikube.md  # Step 1: Stateful DB deployment
    ├── 02-deploy-frontend-container-in-minikube.md  # Step 2: Nginx + React deployment
    ├── 03-deploy-backend-container-in-minikube.md   # Step 3: Express API deployment
    ├── backend-minikube-deployment.md               # Backend in-depth deployment reference
    ├── kubectl-pods-and-services-inspection.md      # Pod lifecycle, services, and debugging
    ├── kubectl-port-forward-guide.md                # Port forwarding and local tunneling
    ├── how-frontend-connects-to-backend.md          # End-to-end request lifecycle
    ├── docker-compose-service-inspection.md         # Validating compose configurations
    └── environment-variables-reference.md           # Consolidated reference of all env configs
```

---

## 🚀 Execution & Deployment Guide

### Phase 1: Local Verification with Docker Compose (Baseline)
Run the full-stack application locally with Docker Compose to verify application behavior before deploying to Kubernetes:

```bash
cd app
cp .env.example .env
docker compose up -d
```
* **Frontend UI:** `http://localhost:3000`
* **Backend Health Check:** `http://localhost:5001/api/health`
* **Shutdown:** `docker compose down`

---

### Phase 2: Start Minikube & Load Container Images

1. **Start Minikube:**
   ```bash
   minikube start --driver=docker
   ```

2. **Build Local Docker Images:**
   ```bash
   docker build -t app-backend:latest app/backend
   docker build -t app-frontend:latest app/frontend
   ```

3. **Load Images into Minikube's Docker Cache:**
   ```bash
   minikube image load app-backend:latest
   minikube image load app-frontend:latest
   ```

4. **Verify Images in Minikube:**
   ```bash
   minikube image ls | grep app-
   ```

---

### Phase 3: Deploy via Declarative Kubernetes Manifests

1. **Create the Application Namespace:**
   ```bash
   kubectl create namespace devops-tracker
   ```

2. **Deploy PostgreSQL (Secret, PVC, Deployment, Service):**
   ```bash
   kubectl apply -f app/k8s/postgres.yaml -n devops-tracker
   kubectl rollout status deployment/postgres -n devops-tracker --timeout=120s
   ```

3. **Deploy Backend ConfigMap & Deployment:**
   ```bash
   kubectl apply -f app/k8s/backend-configmap.yaml -n devops-tracker
   kubectl apply -f app/k8s/backend.yaml -n devops-tracker
   kubectl rollout status deployment/backend -n devops-tracker --timeout=180s
   ```

4. **Run Database Migration Job:**
   ```bash
   kubectl apply -f app/k8s/db-migration-job.yaml -n devops-tracker
   kubectl wait --for=condition=complete job/db-migration -n devops-tracker --timeout=60s
   ```

5. **Deploy Frontend (Deployment & NodePort Service):**
   ```bash
   kubectl apply -f app/k8s/frontend.yaml -n devops-tracker
   kubectl rollout status deployment/frontend -n devops-tracker --timeout=180s
   ```

---

### Phase 4: Deploy Using Helm 3 (Alternative)

Instead of applying individual manifests, you can deploy the complete stack using the packaged Helm chart:

```bash
cd app/helm/devops-task-tracker

# 1. Lint the Helm chart templates
helm lint .

# 2. Deploy to Minikube
helm install devops-task-tracker . \
  --namespace devops-tracker \
  --create-namespace \
  --set postgres.auth.password="postgres"
```

To uninstall:
```bash
helm uninstall devops-task-tracker -n devops-tracker
```

---

### Phase 5: Access the Application

Choose either of the two methods below to access the frontend from your browser:

#### Method A: Port Forwarding (Recommended for Local Dev)
```bash
kubectl port-forward -n devops-tracker service/frontend 3000:80
```
Open **`http://localhost:3000`** in your browser.

#### Method B: Minikube Service URL (NodePort)
```bash
minikube service frontend -n devops-tracker
```
This automatically retrieves the NodePort URL and opens your browser.

---

### Phase 6: Inspection & Debugging Commands

```bash
# View all running resources in the namespace
kubectl get all,pvc,configmaps,secrets -n devops-tracker

# Check Pod health and probes
kubectl describe pod -l app=backend -n devops-tracker

# View backend logs
kubectl logs -l app=backend -n devops-tracker -f

# View frontend reverse proxy logs
kubectl logs -l app=frontend -n devops-tracker -f

# Check database tables
kubectl exec -it deployment/postgres -n devops-tracker -- psql -U postgres -d devops_tasks -c "\dt"
```

---

## 🔒 Security & Container Hardening

* **Non-Root Execution:** All application containers drop root privileges (`USER node`, UID 1000) and enforce `runAsNonRoot: true`.
* **Privilege Restriction:** Containers set `allowPrivilegeEscalation: false` and drop all Linux capabilities (`capabilities.drop: ["ALL"]`).
* **Secret Isolation:** Database passwords and sensitive tokens are injected exclusively via Kubernetes Secrets (`secretKeyRef`).
* **Network Isolation:** PostgreSQL is exposed only via a private `ClusterIP` on port `5432`; it is not accessible from outside the cluster.

---

## 📖 Deep-Dive Learning & Reference Guides

Comprehensive step-by-step documentation created throughout this project:

| Guide | Description |
|---|---|
| [**01 - PostgreSQL in Minikube**](learning/01-deploy-postgres-container-in-minikube.md) | PVC creation, SQL init configmaps, and stateful database verification. |
| [**02 - Frontend in Minikube**](learning/02-deploy-frontend-container-in-minikube.md) | React image loading, Nginx reverse proxy routing, and NodePort access. |
| [**03 - Backend in Minikube**](learning/03-deploy-backend-container-in-minikube.md) | Probes, database connectivity, and non-root runtime verification. |
| [**Backend Minikube Reference**](learning/backend-minikube-deployment.md) | Deep-dive guide for deploying and troubleshooting backend services in Minikube. |
| [**How Frontend Connects to Backend**](learning/how-frontend-connects-to-backend.md) | Detailed walkthrough of the reverse proxy and API communication flow. |
| [**Kubectl Inspection Commands**](learning/kubectl-pods-and-services-inspection.md) | Pod states, rollout monitoring, and 3-in-1 snapshot debugging. |
| [**Kubectl Port-Forwarding Guide**](learning/kubectl-port-forward-guide.md) | Secure local tunneling to private Kubernetes services. |
| [**Environment Variables Reference**](learning/environment-variables-reference.md) | Complete reference of all `.env`, ConfigMap, and Secret values. |
| [**REST API Documentation**](docs/api-documentation.md) | Complete endpoints, request/response payloads, and authentication headers. |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
