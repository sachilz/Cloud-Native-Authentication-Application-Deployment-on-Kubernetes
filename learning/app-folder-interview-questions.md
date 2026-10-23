# Simple Interview Questions & Answers — `app/` Folder

A quick, easy-to-read guide for interviews. Each answer gives a **1-sentence direct answer** followed by **simple bullet points**.

---

## 1. Docker & Docker Compose

### Q1: What does `app/docker-compose.yml` do?
**Short Answer:**  
It runs all 3 parts of the application (Frontend, Backend, and Database) together with one single command: `docker compose up -d`.

**Key Points:**
- **`postgres`**: Runs the PostgreSQL 16 database.
- **`backend`**: Runs the Node.js Express API.
- **`frontend`**: Runs the React app inside Nginx.
- They all talk to each other automatically on an internal Docker network.

---

### Q2: Why is the backend port `5001:5000` instead of `5000:5000`?
**Short Answer:**  
To prevent a port conflict on the host machine.

**Key Points:**
- Inside the container, the backend still runs on port `5000`.
- But on the computer, port `5000` was already being used by another program.
- So we mapped host port `5001` to container port `5000`.

---

### Q3: Why is the frontend Dockerfile multi-stage?
**Short Answer:**  
To keep the final Docker image tiny (~25MB) and fast.

**Key Points:**
- **Stage 1 (Node.js)**: Installs packages and builds the React website (`npm run build`).
- **Stage 2 (Nginx)**: Copies **only** the built HTML/JS files into Nginx and deletes Node.js.
- **Result**: We don't ship heavy Node.js or `node_modules` to production.

---

### Q4: Why do we use Alpine images (`node:20-alpine`, `nginx:alpine`)?
**Short Answer:**  
Alpine is a very small, lightweight version of Linux.

**Key Points:**
- **Small Size**: Takes only ~5MB instead of ~200MB.
- **Security**: It has fewer installed tools, which means fewer security bugs.
- **Speed**: Downloads and boots much faster.

---

## 2. Nginx (`app/frontend/nginx.conf`)

### Q5: What does Nginx do in this project?
**Short Answer:**  
It serves the React website and acts as a bridge (Reverse Proxy) to the backend.

**Key Points:**
1. Serves the static website files on port `80`.
2. Forwards any `/api` requests to `http://backend:5000`.
3. Stops CORS errors because the frontend and backend appear on the same address.

---

### Q6: What does `try_files $uri /index.html;` mean in `nginx.conf`?
**Short Answer:**  
It stops 404 Not Found errors when refreshing a page in React.

**Key Points:**
- React is a Single Page Application (it only has one real file: `index.html`).
- If a user refreshes `/login`, Nginx looks for a file called `login`.
- When it doesn't find it, `try_files` tells Nginx: *"Just give them `index.html` and let React handle the page."*

---

## 3. Backend (`app/backend/`)

### Q7: What is the `db.js` file doing?
**Short Answer:**  
It connects Node.js to PostgreSQL and runs SQL queries.

**Key Points:**
- **Connection Pool (`pg.Pool`)**: Keeps a few database connections open so queries are fast.
- **Query Helper**: Runs `INSERT` and `SELECT` queries safely.
- **Health Check**: Runs `SELECT 1` to check if PostgreSQL is alive.

---

### Q8: What is the difference between `migrations` and `seeds`?
**Short Answer:**  
- **Migration (`001_init.sql`)**: Builds the empty table structure (`CREATE TABLE users`).
- **Seed (`001_seed_tasks.sql`)**: Fills the table with sample data (creates the default `admin` user).

---

### Q9: How does the backend store passwords securely?
**Short Answer:**  
It hashes passwords with **SHA-256** before saving them to the database.

**Key Points:**
- Plain text passwords are **never** stored in the database.
- If someone steals the database, they only see random characters (hash).
- During login, the backend hashes what you typed and checks if the hash matches.

---

### Q10: How do you prevent SQL Injection?
**Short Answer:**  
By using **parameterized queries** with `$1`, `$2` placeholders instead of text strings.

**Example:**
- ✅ **Safe:** `query('SELECT * FROM users WHERE username = $1', [username])`
- ❌ **Unsafe:** `query("SELECT * FROM users WHERE username = '" + username + "'")`

---

## 4. Frontend (`app/frontend/src/App.jsx`)

### Q11: How does the Frontend send login data to the Backend?
**Short Answer:**  
Using the browser's built-in `fetch()` function to send a JSON POST request.

**The Flow:**
1. User types credentials and clicks **Sign In**.
2. React calls:
   ```javascript
   fetch('/api/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password })
   });
   ```
3. Nginx passes `/api/login` to the backend.
4. Backend checks PostgreSQL and returns `{ success: true }`.
5. React saves the user and shows the **full-screen success page**.

---

## 5. Quick 10-Second Summary to memorize:

If the interviewer asks: **"Can you explain your app setup in 30 seconds?"**

> *"We have a 3-tier containerized architecture orchestrated with Docker Compose:*  
> *1. **Frontend**: A React application built with a multi-stage Dockerfile and served by Nginx.*  
> *2. **Reverse Proxy**: Nginx routes `/api` calls directly to the backend container to eliminate CORS issues.*  
> *3. **Backend**: An Express.js REST API that hashes passwords with SHA-256 and uses connection pooling to talk to PostgreSQL.*  
> *4. **Database**: PostgreSQL 16 using a persistent Docker volume and auto-initialized migration scripts."*
