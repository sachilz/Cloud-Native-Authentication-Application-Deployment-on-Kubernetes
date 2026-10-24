# 04 - How to Push Container Images to Amazon ECR

## Overview

After testing containers locally in Minikube, the next step in migrating to **Amazon EKS** is publishing container images to **Amazon ECR (Elastic Container Registry)**. Amazon EKS clusters pull production container images directly from ECR.

This guide walks through the exact terminal commands used to authenticate Docker with AWS, tag local images, push them to private ECR repositories, and verify the uploaded artifacts.

---

## Architecture Flow

```
[ Local Docker Engine ]
  ├── app-backend:latest
  └── app-frontend:latest
           │
           │  1. Authenticate (aws ecr get-login-password | docker login)
           │  2. Tag (docker tag local:tag ecr-registry/repo:tag)
           │  3. Push (docker push ecr-registry/repo:tag)
           ▼
[ Amazon ECR (us-east-1) ]
  ├── 313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-backend:latest
  └── 313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-frontend:latest
           │
           ▼
[ Amazon EKS Cluster (Worker Nodes) ]
```

---

## Step 1: Verify Local Images

Check the built images and their local sizes:

```bash
docker images
```

### Sample Output:
```text
IMAGE                ID             DISK USAGE   CONTENT SIZE
app-backend:latest   127bb2885463   206MB        50.6MB        
app-frontend:latest  eb758131f2a5   73.9MB       21MB        
postgres:16-alpine   f46107955874   420MB        117MB        
```

---

## Step 2: Authenticate Docker to Amazon ECR

Retrieve an authentication token using your AWS CLI profile and pipe it into `docker login`:

```bash
aws ecr get-login-password \
  --region us-east-1 \
  --profile eks-devops \
| docker login \
  --username AWS \
  --password-stdin 313772261399.dkr.ecr.us-east-1.amazonaws.com
```

### Expected Output:
```text
Login Succeeded
```

> **How it works:**
> * `aws ecr get-login-password`: Generates a temporary authorization token (valid for 12 hours) using IAM credentials from profile `eks-devops`.
> * `--password-stdin`: Passes the password securely without writing it to shell history or terminal logs.
> * `313772261399.dkr.ecr.us-east-1.amazonaws.com`: ECR registry endpoint format: `<account-id>.dkr.ecr.<region>.amazonaws.com`.

---

## Step 3: Tag Local Images for ECR

ECR requires images to be tagged with the full registry repository URI before pushing:

### 1. Tag Backend Image:
```bash
docker tag app-backend:latest \
  313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-backend:latest
```

### 2. Tag Frontend Image:
```bash
docker tag app-frontend:latest \
  313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-frontend:latest
```

---

## Step 4: Push Images to Amazon ECR

Push each tagged image to its respective ECR repository:

### 1. Push Backend:
```bash
docker push \
  313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-backend:latest
```

### Expected Output:
```text
The push refers to repository [313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-backend]
44136fa355b3: Pushed
6a0ac1617861: Pushed
...
latest: digest: sha256:127bb2885463c4582b6c2a1ae8f840cadae080a65e9ec2e0f0894fee72e38867 size: 856
```

### 2. Push Frontend:
```bash
docker push \
  313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-frontend:latest
```

### Expected Output:
```text
The push refers to repository [313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-frontend]
f18232174bc9: Pushed
61ca4f733c80: Pushed
...
latest: digest: sha256:eb758131f2a589387cb4bf2033d2ec95ccce8aac5717d93f4e09f34fbe523d3c size: 856
```

---

## Step 5: Verify Uploaded Images in ECR

Query the AWS ECR registry to confirm the images exist and are marked as `ACTIVE`:

### 1. Check Backend Repository:
```bash
aws ecr describe-images \
  --repository-name devops-tracker-backend \
  --region us-east-1 \
  --profile eks-devops
```

### 2. Check Frontend Repository:
```bash
aws ecr describe-images \
  --repository-name devops-tracker-frontend \
  --region us-east-1 \
  --profile eks-devops
```

### Verification Checklist:
* `imageStatus`: **`ACTIVE`**
* `imageTags`: includes **`latest`**
* `imageDigest`: matches the SHA-256 digest reported during `docker push`.

---

## Next Steps for Amazon EKS Deployment

Once images are successfully pushed to Amazon ECR, update your Kubernetes manifests:

1. **Update image URIs in manifests:**
   * In `k8s/backend.yaml`:
     ```yaml
     image: 313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-backend:latest
     imagePullPolicy: IfNotPresent
     ```
   * In `k8s/frontend.yaml`:
     ```yaml
     image: 313772261399.dkr.ecr.us-east-1.amazonaws.com/devops-tracker-frontend:latest
     imagePullPolicy: IfNotPresent
     ```

2. **Change `imagePullPolicy` from `Never` to `IfNotPresent`:**
   In Minikube, `Never` was used because images were loaded directly into the local node. On Amazon EKS, nodes must pull images over the network from ECR, so `imagePullPolicy` must be `IfNotPresent` or `Always`.
