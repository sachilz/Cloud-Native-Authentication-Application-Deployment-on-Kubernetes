# Understanding Kubernetes Verification & Inspection Commands

## Overview

When deploying stateful workloads (such as PostgreSQL) to Kubernetes using manifests (`postgres.yaml`, `postgres-pvc.yaml`), several essential `kubectl` commands are used to monitor rollouts, verify health, and inspect compute, storage, and networking resources inside the namespace:

```bash
# 1. Wait for deployment rollout to succeed
kubectl rollout status deployment/postgres -n devops-tracker --timeout=180s

# 2. Complete 3-in-1 health snapshot (Compute + Storage + Networking)
kubectl get pods,pvc,svc -n devops-tracker

# 3. Individual resource inspection
kubectl get pods -n devops-tracker
kubectl get svc -n devops-tracker
```

---

## 1. `kubectl rollout status deployment/postgres -n devops-tracker --timeout=180s`

### Purpose
Synchronously **waits and monitors** the deployment until the pod is fully created, running, and passes its readiness probe.

### Why It Is Used (CI/CD Pipelines)
* `kubectl apply -f postgres.yaml` only submits the manifest to the API server and exits immediately with code `0`, without waiting to see if the container actually starts.
* `kubectl rollout status` blocks until the pod is verified healthy (`1/1 Running`).
* If something fails (bad credentials, failing PVC, or crashing container), the command times out after 180 seconds and exits with an error code (`1`), automatically halting CI/CD pipelines (Jenkins / GitHub Actions).

### Expected Output
* **While waiting:**
  ```text
  Waiting for deployment "postgres" rollout to finish: 0 of 1 updated replicas are available...
  ```
* **When healthy (Exit code 0):**
  ```text
  deployment "postgres" successfully rolled out
  ```
* **On failure/timeout (Exit code 1):**
  ```text
  error: timed out waiting for the condition
  ```

---

## 2. `kubectl get pods,pvc,svc -n devops-tracker` (3-in-1 Snapshot)

### Purpose
Queries three different resource types in a single command to verify the three pillars of a stateful application: **Compute**, **Storage**, and **Networking**.

### Expected Output
```text
NAME                            READY   STATUS    RESTARTS   AGE
pod/postgres-78649bd8fc-x8k2l   1/1     Running   0          2m

NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/postgres   ClusterIP   10.100.145.210   <none>        5432/TCP   2m

NAME                                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/postgres-pvc   Bound    pvc-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d   2Gi        RWO            gp2            2m
```

### Verification Checklist:

| Resource | Target Field | Healthy Value | Why It Matters |
|---|---|---|---|
| **`pod`** | `STATUS` & `READY` | **`Running`** & **`1/1`** | Container is up and `readinessProbe` (`pg_isready`) passed. |
| **`pvc`** | `STATUS` | **`Bound`** | Cloud storage (EBS) successfully provisioned and attached. If **`Pending`**, the pod cannot start! |
| **`svc`** | `TYPE` & `PORT(S)` | **`ClusterIP`** / **`5432/TCP`** | Internal DNS hostname `postgres` is ready to accept backend connections. |

---

## 3. Individual Resource Breakdown

### A. `kubectl get pods -n devops-tracker`
```text
NAME                        READY   STATUS    RESTARTS   AGE
postgres-78649bd8fc-x8k2l   1/1     Running   0          45s
```

* **NAME**: `<deployment-name>-<pod-template-hash>-<random-id>`.
* **READY (`1/1`)**: `<ready-containers>/<total-containers>`. Only switches to `1/1` once the `readinessProbe` executes successfully.
* **STATUS**:
  * `ContainerCreating`: Pulling image or attaching volume (`postgres-pvc`).
  * `Running`: Container process is active.
  * `CreateContainerConfigError`: Missing Secret (`db-credentials`) or ConfigMap (`postgres-init`).
  * `CrashLoopBackOff`: Container crashed (bad credentials or syntax error in init SQL).
  * `Pending`: Cluster lacks resources or PVC is not bound.
* **RESTARTS**: Count of container crashes/restarts.
* **AGE**: Time since creation.

---

### B. `kubectl get svc -n devops-tracker`
```text
NAME       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
postgres   ClusterIP   10.100.145.210   <none>        5432/TCP   2m
```

* **NAME (`postgres`)**: Internal DNS name. Inside this namespace, services reach it via `postgres:5432`.
* **TYPE (`ClusterIP`)**: Secure internal-only service (database is not exposed to the public internet).
* **CLUSTER-IP**: Static internal virtual IP routing traffic to pods with `app: postgres`.
* **EXTERNAL-IP (`<none>`)**: Kept empty because databases should not have public IPs.
* **PORT(S) (`5432/TCP`)**: Mapped to the container's `targetPort: 5432`.

---

## Internal DNS Resolution

* **Same Namespace** (`devops-tracker`):
  ```text
  DB_HOST=postgres
  DB_PORT=5432
  ```
* **Across Namespaces** (FQDN):
  ```text
  postgres.devops-tracker.svc.cluster.local:5432
  ```

---

## Companion Troubleshooting Commands

```bash
# Watch pods update in real-time
kubectl get pods -n devops-tracker -w

# Describe pod to inspect events and failure reasons
kubectl describe pod <pod-name> -n devops-tracker

# View live database logs
kubectl logs -l app=postgres -n devops-tracker -f

# Inspect PVC binding details
kubectl describe pvc postgres-pvc -n devops-tracker
```
