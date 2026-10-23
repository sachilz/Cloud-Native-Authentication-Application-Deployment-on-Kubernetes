# REST API Documentation

This document describes all REST API endpoints for the DevOps Authentication Service supporting the **Kubernetes Migration & Deployment to Amazon EKS** project.

## Base URLs
- **Via Frontend Nginx Proxy**: `http://localhost:3000/api` or `http://localhost/api`
- **Direct Backend (Host)**: `http://localhost:5001/api`
- **Internal Docker Network**: `http://backend:5000/api`

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | Service status and endpoint list |
| `GET` | `/api/health` | Service health & PostgreSQL connectivity |
| `GET` | `/api/health/live` | Kubernetes Liveness Probe |
| `GET` | `/api/health/ready` | Kubernetes Readiness Probe (verifies database) |
| `POST` | `/api/register` | Register a new user |
| `POST` | `/api/login` | Authenticate user credentials |

---

## 1. Health & Probes

### GET `/api/health`
Checks whether the service is running and PostgreSQL is connected.

**Response `200 OK`:**
```json
{
  "status": "OK",
  "service": "devops-task-tracker-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-23T09:38:23.115Z",
  "uptimeSeconds": 120,
  "database": "connected"
}
```

### GET `/api/health/live`
Kubernetes pod liveness probe.

**Response `200 OK`:**
```json
{
  "status": "UP",
  "timestamp": "2026-10-23T09:38:23.115Z"
}
```

### GET `/api/health/ready`
Kubernetes pod readiness probe. Verifies database connectivity.

**Response `200 OK`:**
```json
{
  "status": "READY",
  "database": "connected",
  "timestamp": "2026-10-23T09:38:23.115Z"
}
```

---

## 2. Authentication

### POST `/api/register`
Registers a new user in PostgreSQL with a SHA-256 hashed password.

**Request Body:**
```json
{
  "username": "sachintha",
  "email": "sachintha@example.com",
  "password": "password123"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful! You can now log in.",
  "user": {
    "id": 2,
    "username": "sachintha",
    "email": "sachintha@example.com"
  }
}
```

---

### POST `/api/login`
Validates user credentials against PostgreSQL.

**Request Body:**
```json
{
  "username": "sachintha",
  "password": "password123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful!",
  "user": {
    "id": 2,
    "username": "sachintha",
    "email": "sachintha@example.com"
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "Invalid username or password."
}
```
