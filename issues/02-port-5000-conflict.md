# Issue 02: Backend Unreachable on Port 5000 (`ERR_CONNECTION_RESET`)

## 📌 Summary
After successfully starting the Docker Compose containers, opening `http://localhost:5000/api/health` directly in the web browser resulted in a connection error.

---

## 🔍 Symptoms & Error Logs
- **Browser Error**:
  ```text
  This site can’t be reached
  The connection was reset.
  ERR_CONNECTION_RESET
  ```
- **PowerShell / Curl Probe**:
  ```text
  Invoke-RestMethod : The underlying connection was closed: An unexpected error occurred on a receive.
  ```
- **Docker Container Status**:
  The backend container was running and healthy inside the Docker network (`docker compose ps` showed `healthy`), but requests to `localhost:5000` failed on the Windows host.

---

## 🧠 Root Cause Analysis
1. **Host Port Collision**:
   - Inspection of host port bindings using `netstat -ano | findstr :5000` revealed:
     ```text
     TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    7956
     TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    25000
     ```
   - Process ID `7956` belonged to a local Windows process (`postgres.exe`).
   - Process ID `25000` belonged to Docker Desktop proxy (`com.docker.backend.exe`).
2. **Network Collision**:
   - Because Windows already had port `5000` bound to a local PostgreSQL instance, incoming HTTP browser requests intended for the backend container were intercepted by the local PostgreSQL process, which immediately terminated/reset the connection (`ERR_CONNECTION_RESET`).

---

## 🛠️ Solution Implemented
1. **Updated Host Port Mapping in `docker-compose.yml`**:
   - Changed backend port exposure from `5000:5000` to `5001:5000`:
     ```yaml
     backend:
       ports:
         - "5001:5000"
     ```
2. **Result**:
   - Avoided host port conflict with the Windows `postgres` process.
   - The backend API is now directly accessible on host port `5001`: `http://localhost:5001/api/health`.
   - The frontend reverse proxy on port `3000` also cleanly forwards to the backend: `http://localhost:3000/api/health`.
