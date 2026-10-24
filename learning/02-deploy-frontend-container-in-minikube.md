# 02 - How to Deploy Frontend Container Inside Minikube

## Overview
This step-by-step guide explains how to build, transfer, deploy, and access the **React Frontend** container (served by Nginx) inside Minikube.

---

## Architecture Flow

```
[ Your Laptop Browser ]
        │
        ▼ (http://localhost:3000)
[ kubectl port-forward ]
        │
        ▼
[ Kubernetes Service: frontend (NodePort / Port 80) ]
        │
        ▼
[ Kubernetes Pod: frontend (app-frontend:latest) ]
        ├── Nginx serves built React static files (HTML, JS, CSS)
        └── Nginx proxies any /api calls internally to http://backend:5000
```

---

## Step 1: Build the Frontend Docker Image
Build the production Docker image containing the compiled React app and Nginx server:

```bash
docker build -t app-frontend:latest app/frontend
```

Verify that the image is built locally:
```bash
docker images | grep app-frontend
```

---

## Step 2: Load the Image Into Minikube
Because Minikube runs inside its own isolated VM/Docker container, it cannot see your laptop’s local Docker images automatically. Load the image into Minikube’s local image cache:

```bash
minikube image load app-frontend:latest
```

> **Why this step is critical:**  
> In `k8s/frontend.yaml`, `imagePullPolicy: Never` is configured. If you do not run `minikube image load`, Kubernetes cannot find the image and the pod will get stuck in **`ErrImageNeverPull`**!

Verify the image is inside Minikube:
```bash
minikube image ls | grep app-frontend
```

---

## Step 3: Validate and Apply Frontend Manifests
Validate the YAML syntax, then apply the Deployment and Service to the `devops-tracker` namespace:

```bash
# 1. Dry-run client-side syntax validation
kubectl apply --dry-run=client -f k8s/frontend.yaml

# 2. Apply resources to cluster
kubectl apply -f k8s/frontend.yaml
```

---

## Step 4: Monitor Rollout Progress
Wait for the deployment to finish pulling the local image and pass the startup/liveness probes:

```bash
kubectl rollout status deployment/frontend -n devops-tracker --timeout=180s
```

### Expected Output:
```text
deployment "frontend" successfully rolled out
```

---

## Step 5: Verify Pod and Service Status
Check that the frontend pod is `Running` with `1/1` containers ready:

```bash
kubectl get pods,svc -n devops-tracker -l app=frontend
```

### Expected Output:
```text
NAME                            READY   STATUS    RESTARTS   AGE
pod/frontend-79d8bcbf94-nxp2z   1/1     Running   0          2m

NAME               TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/frontend   NodePort   10.108.26.26   <none>        80:30080/TCP   2m
```

---

## Step 6: Access the Frontend in Your Browser
Because Minikube runs inside Docker on Windows/WSL, forward the service port to your local machine:

```bash
kubectl port-forward -n devops-tracker service/frontend 3000:80
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

### Why Port-Forwarding the Frontend is Enough:
Your frontend Nginx configuration contains:
```nginx
location /api {
    proxy_pass http://backend:5000;
}
```
When you make API calls from the browser (e.g. login, register, create tasks), Nginx **internally forwards** the request to the Kubernetes `backend` service inside the cluster. You do not need a separate port forward for the backend!
