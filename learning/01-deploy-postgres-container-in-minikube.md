# 01 - How to Deploy PostgreSQL Container Inside Minikube

## Overview
This step-by-step guide walks through deploying the **PostgreSQL 16** database container inside Minikube with persistent storage, database initialization SQL scripts, secure credentials, health probes, and internal networking.

---

## Architecture Flow

```
[ Namespace: devops-tracker ]
  ├── 1. Secret: db-credentials (User & Password)
  ├── 2. ConfigMap: postgres-init (01_init.sql & 02_seed.sql)
  ├── 3. PersistentVolumeClaim: postgres-pvc (2Gi Storage)
  ├── 4. Deployment: postgres (Image: postgres:16-alpine)
  └── 5. Service: postgres (ClusterIP Port 5432)
```

---

## Step 1: Ensure Namespace Exists
Create the isolated namespace for the project if it does not already exist:
```bash
kubectl create namespace devops-tracker --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 2: Create Database Credentials Secret
Create a Kubernetes Secret storing the PostgreSQL username and password securely:
```bash
kubectl create secret generic db-credentials \
  --namespace devops-tracker \
  --from-literal=DB_USER=devops_user \
  --from-literal=DB_PASSWORD=devops_password \
  --dry-run=client -o yaml | kubectl apply -f -
```
* **Why Secret:** Prevents committing raw database passwords into Git repository manifests.

---

## Step 3: Create Database Init & Seed ConfigMap
PostgreSQL automatically executes any `.sql` scripts placed inside `/docker-entrypoint-initdb.d/` on first startup. We package the migration and seed SQL files into a ConfigMap:

```bash
kubectl create configmap postgres-init \
  --namespace devops-tracker \
  --from-file=01_init.sql=app/backend/src/db/migrations/001_init.sql \
  --from-file=02_seed.sql=app/backend/src/db/seeds/001_seed_tasks.sql \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 4: Provision Persistent Storage (PVC)
To ensure database records survive pod restarts or node rescheduling, create the Persistent Volume Claim:

```bash
kubectl apply -f k8s/postgres-pvc.yaml
```

Verify storage binding:
```bash
kubectl get pvc -n devops-tracker
```
* **Expected STATUS:** `Bound` (Minikube automatically provisions storage using its default `standard` storage class).

---

## Step 5: Deploy PostgreSQL Deployment & Service
Apply the PostgreSQL deployment and ClusterIP service manifest:

```bash
# Validate syntax first
kubectl apply --dry-run=client -f k8s/postgres.yaml

# Apply to Minikube
kubectl apply -f k8s/postgres.yaml
```

---

## Step 6: Monitor Rollout and Health
Wait for the deployment to complete and verify the pod passes its readiness checks (`pg_isready`):

```bash
kubectl rollout status deployment/postgres -n devops-tracker --timeout=180s
```

### Expected Output:
```text
deployment "postgres" successfully rolled out
```

---

## Step 7: Verify Everything is Running
Run the 3-in-1 snapshot to confirm Pod, Service, and PVC:

```bash
kubectl get pods,pvc,svc -n devops-tracker -l app=postgres
```

### Expected Output:
```text
NAME                            READY   STATUS    RESTARTS   AGE
pod/postgres-599587dc4b-4prgc   1/1     Running   0          5m

NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/postgres   ClusterIP   10.105.53.38   <none>        5432/TCP   5m

NAME                                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/postgres-pvc   Bound    pvc-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d   2Gi        RWO            standard       5m
```

---

## Step 8 (Optional): Direct Database Connection for Testing
If you want to test connecting directly to PostgreSQL from your laptop:
```bash
# In Terminal 1: Port-forward port 5432
kubectl port-forward -n devops-tracker service/postgres 5432:5432

# In Terminal 2: Test connection via psql or DBeaver
psql -h localhost -p 5432 -U devops_user -d devops_tasks
```
