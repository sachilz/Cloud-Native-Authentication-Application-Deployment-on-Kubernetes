# DevOps Task Tracker — REST API Documentation

This document describes all REST API endpoints for the DevOps Task Tracker backend service supporting the **Kubernetes Migration & Deployment to Amazon EKS** project.

## Base URL
- Local Development: `http://localhost:5000/api`
- Inside Docker Compose: `http://backend:5000/api`
- Reverse Proxy: `/api`

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Basic service health & DB status |
| `GET` | `/health/live` | Kubernetes Liveness Probe |
| `GET` | `/health/ready` | Kubernetes Readiness Probe (verifies database) |
| `GET` | `/stats` | Aggregate dashboard metrics and category breakdown |
| `GET` | `/tasks` | List tasks with pagination, filtering & sorting |
| `GET` | `/tasks/:id` | Get details of a single task |
| `POST` | `/tasks` | Create a new DevOps task |
| `PUT` | `/tasks/:id` | Update an existing DevOps task |
| `DELETE` | `/tasks/:id` | Delete a DevOps task |

---

## 1. Health Checks

### GET `/api/health`
Returns service status, uptime, and database connectivity.

**Response `200 OK`:**
```json
{
  "status": "OK",
  "service": "devops-task-tracker-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-23T06:25:00.000Z",
  "uptimeSeconds": 142,
  "database": "connected"
}
```

### GET `/api/health/live`
Kubernetes liveness probe. Returns `200 UP` as long as Node.js process is responsive.

**Response `200 OK`:**
```json
{
  "status": "UP",
  "timestamp": "2026-10-23T06:25:00.000Z"
}
```

### GET `/api/health/ready`
Kubernetes readiness probe. Checks active PostgreSQL database connectivity.

**Response `200 OK` (Database Healthy):**
```json
{
  "status": "READY",
  "database": "connected",
  "timestamp": "2026-10-23T06:25:00.000Z"
}
```

**Response `503 Service Unavailable` (Database Down):**
```json
{
  "status": "NOT_READY",
  "database": "disconnected",
  "error": "Connection terminated unexpectedly",
  "timestamp": "2026-10-23T06:25:00.000Z"
}
```

---

## 2. Dashboard Statistics

### GET `/api/stats`
Returns aggregated counts for dashboard cards, category distributions, and recent tasks.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 2,
    "inProgress": 3,
    "pending": 5,
    "completionPercentage": 20.0,
    "byPriority": {
      "High": 5,
      "Medium": 4,
      "Low": 1
    },
    "byCategory": [
      { "category": "Kubernetes", "count": 3 },
      { "category": "CI/CD", "count": 2 },
      { "category": "Monitoring", "count": 2 },
      { "category": "AWS Cloud", "count": 1 },
      { "category": "Docker", "count": 1 },
      { "category": "Infrastructure", "count": 1 }
    ],
    "recentTasks": [
      {
        "id": 1,
        "title": "Provision AWS VPC and Networking via Terraform",
        "category": "AWS Cloud",
        "status": "Done",
        "priority": "High",
        "due_date": "2026-10-20",
        "created_at": "2026-10-23T06:15:00.000Z"
      }
    ]
  }
}
```

---

## 3. Task Management

### GET `/api/tasks`
Lists tasks with support for pagination, keyword search, filtering, and sorting.

**Query Parameters:**
- `page` (integer, default `1`): Current page number.
- `limit` (integer, default `10`, max `100`): Items per page.
- `search` (string, optional): Search keyword matched against `title` and `description` (case-insensitive).
- `status` (string, optional): Filter by status: `Todo`, `In Progress`, `Done`.
- `priority` (string, optional): Filter by priority: `Low`, `Medium`, `High`.
- `category` (string, optional): Filter by category.
- `sortBy` (string, default `created_at`): Sort field (`due_date`, `created_at`, `title`, `priority`, `status`).
- `order` (string, default `DESC`): Sort direction (`ASC` or `DESC`).

**Example Request:**
```http
GET /api/tasks?search=EKS&status=In%20Progress&sortBy=due_date&order=ASC HTTP/1.1
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "title": "Configure Amazon EKS Cluster with Managed Node Groups",
      "description": "Deploy Kubernetes 1.30 control plane on AWS with auto-scaling node groups.",
      "category": "Kubernetes",
      "status": "In Progress",
      "priority": "High",
      "due_date": "2026-10-25",
      "created_at": "2026-10-23T06:15:00.000Z",
      "updated_at": "2026-10-23T06:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET `/api/tasks/:id`
Retrieves a single task by its integer primary key.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Provision AWS VPC and Networking via Terraform",
    "description": "Set up multi-AZ VPC with public and private subnets, NAT gateways, and route tables.",
    "category": "AWS Cloud",
    "status": "Done",
    "priority": "High",
    "due_date": "2026-10-20",
    "created_at": "2026-10-23T06:15:00.000Z",
    "updated_at": "2026-10-23T06:15:00.000Z"
  }
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Task with ID 999 not found."
}
```

---

### POST `/api/tasks`
Creates a new task.

**Request Body:**
```json
{
  "title": "Implement AWS IRSA for Pod IAM Roles",
  "description": "Configure IAM Roles for Service Accounts (IRSA) with OIDC provider for secure AWS API access.",
  "category": "Kubernetes",
  "status": "Todo",
  "priority": "High",
  "due_date": "2026-10-30"
}
```

**Validation Rules:**
- `title`: Required string, 1 to 255 characters.
- `description`: Optional string.
- `category`: Optional string (defaults to `General`).
- `status`: Optional, one of `Todo`, `In Progress`, `Done` (defaults to `Todo`).
- `priority`: Optional, one of `Low`, `Medium`, `High` (defaults to `Medium`).
- `due_date`: Optional valid date string (`YYYY-MM-DD` or ISO 8601).

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 11,
    "title": "Implement AWS IRSA for Pod IAM Roles",
    "description": "Configure IAM Roles for Service Accounts (IRSA) with OIDC provider for secure AWS API access.",
    "category": "Kubernetes",
    "status": "Todo",
    "priority": "High",
    "due_date": "2026-10-30",
    "created_at": "2026-10-23T06:28:00.000Z",
    "updated_at": "2026-10-23T06:28:00.000Z"
  }
}
```

**Response `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Task title is required and cannot be empty."
  ]
}
```

---

### PUT `/api/tasks/:id`
Updates one or more fields of an existing task.

**Request Body (Partial update supported):**
```json
{
  "status": "Done"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 11,
    "title": "Implement AWS IRSA for Pod IAM Roles",
    "status": "Done",
    "priority": "High",
    "due_date": "2026-10-30",
    "updated_at": "2026-10-23T06:30:00.000Z"
  }
}
```

---

### DELETE `/api/tasks/:id`
Deletes an existing task by ID.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Task 11 deleted successfully."
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Task with ID 11 not found."
}
```
