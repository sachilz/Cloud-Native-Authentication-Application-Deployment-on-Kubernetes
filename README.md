# Kubernetes Migration & Deployment to Amazon EKS

A production-grade demonstration and implementation of migrating microservices to Amazon Elastic Kubernetes Service (Amazon EKS).

## 🚀 Repository Structure

```text
Kubernetes-Migration-Deployment-to-Amazon-EKS/
├── app/                  # DevOps Task Tracker Application (Frontend + Backend + Compose)
│   ├── backend/          # Node.js + Express REST API (PostgreSQL, Dockerfile, Jest tests)
│   ├── frontend/         # React + Vite + Tailwind CSS Dark Dashboard (Nginx, Dockerfile)
│   ├── Dockerfile        # Root multi-target Dockerfile
│   ├── docker-compose.yml# Local full-stack container orchestration
│   └── README.md         # Application setup & run guide
├── docs/                 # Migration guides & API documentation
│   ├── api-documentation.md # Complete REST API reference
│   └── migration-guide.md   # Architectural & migration blueprint
├── k8s/                  # Kubernetes manifests (deployments, services, namespaces)
├── helm/                 # Helm charts for application packaging
├── terraform/            # Infrastructure as Code for AWS VPC & EKS Cluster
├── jenkins/              # CI/CD declarative pipelines
├── monitoring/           # Prometheus, Grafana, and CloudWatch configurations
└── scripts/              # Automation and deployment utility scripts
```

## 🛠️ DevOps Task Tracker Web Application

The core application under `app/` is a modern **DevOps Task Tracker** built specifically for teams managing migration deliverables:
- **Frontend**: React, Vite, Tailwind CSS, dark navy developer dashboard, Kanban board & tabular views, real-time metrics.
- **Backend**: Node.js, Express.js REST API, parameterized SQL queries, input validation, graceful shutdown.
- **Database**: PostgreSQL with automated schema migrations and realistic DevOps seed data.
- **Observability & Probes**: Liveness (`/api/health/live`) and readiness (`/api/health/ready`) probes tailored for Kubernetes deployments.

For instructions on running the application locally or via Docker Compose, see [`app/README.md`](app/README.md).

For the full REST API specification, see [`docs/api-documentation.md`](docs/api-documentation.md).