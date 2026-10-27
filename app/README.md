# DevOps Task Tracker Application

A modern, responsive, full-stack **DevOps Task Tracker** designed to organize and track engineering workflows for the **Cloud-Native Kubernetes (Minikube)** deployment project.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, Lucide React icons
- **Backend**: Node.js, Express.js, REST API, Parameterized SQL
- **Database**: PostgreSQL 16
- **DevOps / Containers**: Multi-stage Dockerfiles, Docker Compose, Nginx reverse proxy

---

## 📁 Application Structure

```text
app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL Pool & health probe
│   │   ├── controllers/
│   │   │   ├── healthController.js   # Liveness, readiness, service health
│   │   │   ├── statsController.js    # Aggregates, domain breakdowns, metrics
│   │   │   └── taskController.js     # Task CRUD, pagination, filtering, sorting
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   │   └── 001_init.sql      # PostgreSQL schema & indexes
│   │   │   ├── seeds/
│   │   │   │   └── 001_seed_tasks.sql# Realistic DevOps seed tasks
│   │   │   ├── migrate.js            # Migration runner script
│   │   │   └── seed.js               # Database seed runner script
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Central error & 404 handler
│   │   │   └── validator.js          # Payload validation & sanitization
│   │   ├── routes/
│   │   │   ├── healthRoutes.js       # /api/health routes
│   │   │   ├── statsRoutes.js        # /api/stats routes
│   │   │   └── taskRoutes.js         # /api/tasks routes
│   │   ├── app.js                    # Express app configuration & middleware
│   │   └── server.js                 # HTTP listener & graceful shutdown
│   ├── tests/
│   │   ├── health.test.js            # Health & readiness probe tests
│   │   └── tasks.test.js             # API CRUD & validation tests
│   ├── .env.example
│   ├── Dockerfile                    # Multi-stage production container
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardStats.jsx    # Metrics cards & readiness bar
│   │   │   ├── DeleteConfirmModal.jsx# Delete confirmation dialog
│   │   │   ├── Navbar.jsx            # Brand, DB status, view switch, CTA
│   │   │   ├── TaskBoard.jsx         # 3-column Kanban board
│   │   │   ├── TaskCard.jsx          # Kanban card with quick status & actions
│   │   │   ├── TaskFilter.jsx        # Search, filters, sort, reset
│   │   │   ├── TaskFormModal.jsx     # Create/Edit modal with validation
│   │   │   ├── TaskTable.jsx         # Tabular data grid view
│   │   │   └── Toast.jsx             # Floating notification alerts
│   │   ├── services/
│   │   │   └── api.js                # REST API client
│   │   ├── App.jsx                   # Main dashboard application
│   │   ├── index.css                 # Dark navy styling & gradients
│   │   └── main.jsx                  # React DOM entrypoint
│   ├── index.html
│   ├── nginx.conf                    # Nginx reverse proxy & SPA fallback
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   ├── Dockerfile                    # Multi-stage Nginx build
│   └── package.json
├── .env.example                      # Root compose environment sample
├── docker-compose.yml                # Full stack orchestration (App + DB)
└── Dockerfile                        # Root multi-target Dockerfile
```

---

## 🚀 Getting Started

### Option A: Running with Docker Compose (Recommended)

To run the entire stack (PostgreSQL + Backend + Frontend) in isolated containers:

```powershell
# 1. Navigate to the app directory
cd app

# 2. Copy the sample environment file
cp .env.example .env

# 3. Build and launch all containers
docker compose up -d --build

# 4. View running services and health status
docker compose ps
```

Once running:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Readiness Probe**: [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready)

To shut down containers and preserve the PostgreSQL volume:
```powershell
docker compose down
```

---

### Option B: Local Development (Without Docker)

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running locally

#### 1. Setup Backend
```powershell
cd app/backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Run database migration
npm run migrate

# Seed database with sample DevOps tasks
npm run seed

# Run unit and integration tests
npm test

# Start backend server in development mode (with auto-reload)
npm run dev
```
The backend will be live at `http://localhost:5000`.

#### 2. Setup Frontend
Open a new terminal window:
```powershell
cd app/frontend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will open at `http://localhost:5173`. Vite automatically proxies `/api` calls to `http://localhost:5000`.

---

## 🧪 Running Automated Tests

To run the backend test suite:
```powershell
cd app/backend
npm test
```
The test suite validates:
- Liveness probe (`/api/health/live`)
- Readiness probe with database connection state (`/api/health/ready`)
- Service information (`/api/health`)
- Task pagination, search, status, and priority query filters
- ID parameter validation (e.g. non-numeric inputs)
- Payload schema validation (empty titles, illegal status values)
- CRUD operations (Create, Read, Update, Delete)
- Dashboard metric aggregation (`/api/stats`)

---

## 📦 Building for Production

### Frontend Production Bundle:
```powershell
cd app/frontend
npm run build
```
Creates an optimized static bundle in `app/frontend/dist`.

### Backend Production Start:
```powershell
cd app/backend
npm start
```
Runs the Express application with security headers, production logging, and graceful shutdown handlers (`SIGTERM`, `SIGINT`).
