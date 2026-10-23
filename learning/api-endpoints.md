# API Endpoints Guide

This document describes all REST API endpoints available in the application, including request formats, responses, and test commands.

---

## 📋 Endpoints Overview

| Method | Endpoint | Purpose | Used By |
|---|---|---|---|
| `GET` | `/api` | Service status and endpoint list | Developers / Browser check |
| `GET` | `/api/health` | Service health & PostgreSQL connectivity | Health monitoring |
| `GET` | `/api/health/live` | Liveness Probe | Kubernetes Pod Liveness |
| `GET` | `/api/health/ready` | Readiness Probe (checks Database) | Kubernetes Pod Readiness |
| `POST` | `/api/register` | Register a new user account | Frontend Register Form |
| `POST` | `/api/login` | Authenticate user credentials | Frontend Sign In Form |

---

## 1. Information & Health Endpoints

### `GET /api`
Returns general API status and lists key endpoints.

- **URL**: `http://localhost:3000/api` or `http://localhost:5001/api`
- **Response `200 OK`**:
```json
{
  "status": "online",
  "message": "DevOps Authentication Backend API",
  "endpoints": {
    "health": "/api/health",
    "login": "POST /api/login",
    "register": "POST /api/register"
  }
}
```

---

### `GET /api/health`
Checks whether the backend process is running and whether the PostgreSQL database is connected.

- **URL**: `http://localhost:3000/api/health` or `http://localhost:5001/api/health`
- **Response `200 OK`**:
```json
{
  "status": "OK",
  "service": "devops-task-tracker-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-23T09:38:23.115Z",
  "uptimeSeconds": 45,
  "database": "connected"
}
```

---

### `GET /api/health/live` (Kubernetes Liveness Probe)
Tells Kubernetes whether the Node.js container process is alive.

- **Response `200 OK`**:
```json
{
  "status": "UP",
  "timestamp": "2026-10-23T09:38:23.115Z"
}
```

---

### `GET /api/health/ready` (Kubernetes Readiness Probe)
Tells Kubernetes whether the container is ready to receive user traffic by verifying active database connectivity.

- **Response `200 OK` (Database Connected)**:
```json
{
  "status": "READY",
  "database": "connected",
  "timestamp": "2026-10-23T09:38:23.115Z"
}
```

- **Response `503 Service Unavailable` (Database Disconnected)**:
```json
{
  "status": "NOT_READY",
  "database": "disconnected",
  "error": "Connection timeout",
  "timestamp": "2026-10-23T09:38:23.115Z"
}
```

---

## 2. Authentication Endpoints

### `POST /api/register`
Creates a new user record in PostgreSQL with an encrypted SHA-256 password hash.

- **URL**: `http://localhost:3000/api/register`
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "username": "sachintha",
  "email": "sachintha@example.com",
  "password": "password123"
}
```

#### Success Response (`201 Created`):
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

#### Error Responses:
- **`400 Bad Request`** (Validation failure):
  ```json
  { "success": false, "message": "Username is required and must be at least 3 characters long." }
  ```
- **`409 Conflict`** (Username already registered):
  ```json
  { "success": false, "message": "Username already taken. Please choose another one or log in." }
  ```

---

### `POST /api/login`
Validates user credentials against the PostgreSQL database.

- **URL**: `http://localhost:3000/api/login`
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "username": "sachintha",
  "password": "password123"
}
```

#### Success Response (`200 OK`):
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

#### Error Responses:
- **`400 Bad Request`** (Missing fields):
  ```json
  { "success": false, "message": "Username and password are required." }
  ```
- **`401 Unauthorized`** (Incorrect password or user not found):
  ```json
  { "success": false, "message": "Invalid username or password." }
  ```

---

## 3. How to Test Endpoints from PowerShell / Terminal

### Test 1: Check Health
```powershell
curl.exe http://localhost:3000/api/health
```

### Test 2: Register a New User
```powershell
curl.exe -X POST http://localhost:3000/api/register `
  -H "Content-Type: application/json" `
  -d '{"username":"devops_user","password":"mypassword"}'
```

### Test 3: Sign In with the User
```powershell
curl.exe -X POST http://localhost:3000/api/login `
  -H "Content-Type: application/json" `
  -d '{"username":"devops_user","password":"mypassword"}'
```
