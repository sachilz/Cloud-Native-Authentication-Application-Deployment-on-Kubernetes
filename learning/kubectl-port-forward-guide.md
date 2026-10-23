# Understanding `kubectl port-forward`

## Overview

Kubernetes `ClusterIP` services are private by default and only accessible inside the cluster network. `kubectl port-forward` creates a direct, secure TCP tunnel from your local development workstation into a cluster resource without needing to configure an Ingress controller, NodePort, or cloud LoadBalancer.

```bash
kubectl port-forward -n devops-tracker service/backend 5001:5000
```

---

## Command Syntax Breakdown

```text
kubectl port-forward  -n devops-tracker  service/backend  5001:5000
│                    │                  │                │    │
│                    │                  │                │    └── Target Container Port (in Pod)
│                    │                  │                └─────── Local Machine Port (on your PC)
│                    │                  └──────────────────────── Target Resource Type & Name
│                    └─────────────────────────────────────────── Kubernetes Namespace
└──────────────────────────────────────────────────────────────── Kubernetes CLI Command
```

| Component | Example | Explanation |
|---|---|---|
| **Command** | `kubectl port-forward` | Initiates a local proxy listener and streams TCP traffic through the Kubernetes API Server. |
| **Namespace** | `-n devops-tracker` | Specifies the namespace containing the target service. |
| **Resource** | `service/backend` | Can target a `service/<name>`, `pod/<name>`, or `deployment/<name>`. Targeting a Service automatically load-balances across healthy backend pods. |
| **Local Port** | `5001` | The port opened on your local machine (`127.0.0.1:5001` or `localhost:5001`). |
| **Remote Port** | `5000` | The port the container is listening on inside the pod (`containerPort: 5000`). |

---

## Architectural Flow

```
[ Your Browser / Postman ]
        │ (http://localhost:5001)
        ▼
[ Local Workstation (Port 5001) ]
        │
   (Secure Tunnel via Kube-API Server)
        │
        ▼
[ Minikube / EKS Cluster ]
        │
        ▼
[ Kubernetes Service: backend (Port 5000) ]
        │
        ▼
[ Backend Pod: backend-788f4b7895-7qttk (Port 5000) ]
```

---

## Expected Terminal Output

When the tunnel is successfully established, the command stays running in the foreground:

```text
Forwarding from 127.0.0.1:5001 -> 5000
Forwarding from [::1]:5001 -> 5000
```

When you make an HTTP request (e.g. `curl http://localhost:5001/api/health`), the terminal logs active connections:

```text
Handling connection for 5001
```

> **Note:** To stop the port forwarding tunnel, press `Ctrl + C`.

---

## Common Issues & Troubleshooting

### 1. `bind: address already in use`
```text
Unable to listen on port 5001: Listeners failed to create with the following errors:
unable to create listener: Error listen tcp4 127.0.0.1:5001: bind: address already in use
```
* **Cause**: Another process on your computer is already listening on local port `5001` (e.g., a background Docker Compose container `devops-backend`).
* **Fix**:
  * Stop the conflicting process:
    ```bash
    docker compose -f app/docker-compose.yml down
    # or
    docker stop devops-backend
    ```
  * Or choose a different local port (e.g., `5002`):
    ```bash
    kubectl port-forward -n devops-tracker service/backend 5002:5000
    ```

---

### 2. `connection to the server 127.0.0.1:<port> was refused`
```text
The connection to the server 127.0.0.1:2723 was refused - did you specify the right host or port?
```
* **Cause**: Minikube is stopped or Docker daemon restarted, so `kubectl` cannot reach the Kubernetes API Server.
* **Fix**: Check status and restart Minikube:
  ```bash
  minikube status
  minikube start
  ```

---

### 3. `lost connection to pod`
* **Cause**: The backend pod crashed or was restarted by a failed liveness probe while you were connected.
* **Fix**: Check pod health and recent logs:
  ```bash
  kubectl get pods -n devops-tracker
  kubectl logs deployment/backend -n devops-tracker
  ```

---

## Quick Reference Commands

```bash
# Forward to a pod directly
kubectl port-forward -n devops-tracker pod/<pod-name> 5001:5000

# Forward PostgreSQL database port
kubectl port-forward -n devops-tracker service/postgres 5432:5432

# Forward frontend service
kubectl port-forward -n devops-tracker service/frontend 3000:80

# Listen on all local interfaces (0.0.0.0) instead of just localhost
kubectl port-forward --address 0.0.0.0 -n devops-tracker service/backend 5001:5000
```
