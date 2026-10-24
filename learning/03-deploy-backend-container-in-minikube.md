# 03 - How to Deploy Backend Container Inside Minikube

## Overview
This step-by-step guide explains how to build, transfer, configure, deploy, and verify the **Node.js Express Backend** container inside Minikube.

---

## Architecture Flow

```
[ Frontend Pod / Browser ]
        │
        ▼ (http://backend:5000)
[ Kubernetes Service: backend (ClusterIP Port 5000) ]
        │
        ▼
[ Kubernetes Pod: backend (app-backend:latest) ]
        ├── Reads DB_USER & DB_PASSWORD from Secret: db-credentials
        ├── Connects to DB_HOST: postgres:5432
        └── Serves REST APIs and Health Probes (/api/health/live, /api/health/ready)
```

---

## Prerequisites Check
Before deploying the backend, ensure that:
1. The **`devops-tracker`** namespace exists.
2. The **`postgres`** database is running (`1/1 Running`).
3. The **`db-credentials`** secret exists:
```bash
kubectl get pods,secrets -n devops-tracker -l app=postgres
```

---

## Step 1: Build the Backend Docker Image
Build the backend container image from the `app/backend/` directory:

```bash
docker build -t app-backend:latest app/backend
```

Verify that the image is available locally:
```bash
docker images | grep app-backend
```

---

## Step 2: Load the Image Into Minikube
Load the locally built image into Minikube so that Kubernetes can find it without searching Docker Hub:

```bash
minikube image load app-backend:latest
```

Verify the image is cached inside Minikube:
```bash
minikube image ls | grep app-backend
```

---

## Step 3: Validate and Apply Backend Manifests
Validate the YAML syntax using client-side dry-run, then apply the Deployment and Service:

```bash
# 1. Dry-run syntax check
kubectl apply --dry-run=client -f k8s/backend.yaml

# 2. Apply resources to cluster
kubectl apply -f k8s/backend.yaml
```

---

## Step 4: Monitor Rollout Progress
Wait for the deployment to start the container and verify that the startup probe succeeds:

```bash
kubectl rollout status deployment/backend -n devops-tracker --timeout=180s
```

### Expected Output:
```text
deployment "backend" successfully rolled out
```

---

## Step 5: Verify Pod and Service Status
Confirm the backend pod is running and has passed all health checks:

```bash
kubectl get pods,svc -n devops-tracker -l app=backend
```

### Expected Output:
```text
NAME                       READY   STATUS    RESTARTS   AGE
pod/backend-bd79bc6b8-pdzl2 1/1     Running   0          2m

NAME              TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/backend   ClusterIP   10.109.224.3   <none>        5000/TCP   2m
```

---

## Step 6: Inspect Backend & Health Check Logs
Verify that the Express server connected to PostgreSQL and that Kubelet health probes are returning HTTP 200:

```bash
kubectl logs deployment/backend -n devops-tracker
```

### Expected Output:
```text
[Server] DevOps Task Tracker Backend running on port 5000
[Server] Environment: production
[Server] Health Check available at http://localhost:5000/api/health
10.244.0.1 - - "GET /api/health/live HTTP/1.1" 200 54 "-" "kube-probe/1.37"
10.244.0.1 - - "GET /api/health/ready HTTP/1.1" 200 80 "-" "kube-probe/1.37"
```

---

## Step 7 (Optional): Test API Directly from Laptop
If you want to test the REST API or run curl commands directly against the backend:

```bash
# In Terminal 1: Forward port 5001 to backend port 5000
kubectl port-forward -n devops-tracker service/backend 5001:5000

# In Terminal 2: Test health endpoint
curl http://localhost:5001/api/health
```

### Expected Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 120
}
```
