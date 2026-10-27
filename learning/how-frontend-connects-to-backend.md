# How Frontend Connects to Backend in this Project

This guide explains in simple, step-by-step terms how the **React Frontend** communicates with the **Node.js Express Backend** and stores data into **PostgreSQL**.

---

## 1. The Big Picture (Architecture Diagram)

```text
  [ User Browser ]
         │
         │ 1. User types credentials & clicks "Sign In"
         ▼
  [ Frontend Container: Port 3000 / 80 ]
  (React Webpage served by Nginx)
         │
         │ 2. JavaScript calls fetch('/api/login')
         │ 3. Nginx sees "/api" and forwards it
         ▼
  [ Backend Container: Port 5000 ]
  (Node.js + Express API)
         │
         │ 4. Hashes password & checks database
         ▼
  [ Database Container: Port 5432 ]
  (PostgreSQL 16)
         │
         │ 5. Returns matching user row
         ▼
  [ Backend Container ]
         │
         │ 6. Sends back: { success: true, user: "sachintha" }
         ▼
  [ Frontend in Browser ]
         │
         │ 7. Displays "SUCCESS: You are an authorized user"
```

---

## 2. Step 1: The Frontend "Phone Call" (`fetch`)

In [`app/frontend/src/App.jsx`](../app/frontend/src/App.jsx):

When you click **Sign In**, the browser runs this JavaScript code:

```javascript
const res = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: username,
    password: password,
  }),
});
```

### What is happening here?
1. **`fetch()`**: The browser's built-in tool to send network HTTP requests.
2. **`'/api/login'`**: The destination endpoint.
3. **`method: 'POST'`**: Tells the server we are sending data (not just requesting a page).
4. **`body: JSON.stringify(...)`**: Packages your username and password into a standard JSON text string.

---

## 3. Step 2: The Bridge (Nginx Reverse Proxy)

Your browser is at `http://localhost:3000`.  
Your backend is running in its own container at `backend:5000`.

How does the browser talk to the backend without CORS errors or port issues?

In [`app/frontend/nginx.conf`](../app/frontend/nginx.conf):

```nginx
server {
    listen 80;

    # Rule 1: Serve the React Website
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }

    # Rule 2: Forward any /api requests to the Backend Container
    location /api {
        proxy_pass http://backend:5000;
    }
}
```

### Why this is important:
- When the browser calls `/api/login`, **Nginx** intercepts it.
- Nginx forwards it across the Docker network to `http://backend:5000/api/login`.
- **The user's browser never needs to know what port the backend uses.**

---

## 4. Step 3: Backend Receives and Processes the Request

### 1. The Route Handler
In [`app/backend/src/routes/authRoutes.js`](../app/backend/src/routes/authRoutes.js):
```javascript
router.post('/login', login);
router.post('/register', register);
```
Express matches `POST /api/login` and triggers the `login` function.

### 2. The Login Logic
In [`app/backend/src/controllers/authController.js`](../app/backend/src/controllers/authController.js):
```javascript
// 1. Convert plain text password into SHA-256 hash for security
const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

// 2. Query the PostgreSQL database
const result = await query(
  'SELECT id, username, email, password_hash FROM users WHERE username = $1',
  [username]
);

// 3. Compare the database password with what the user entered
if (result.rows[0].password_hash === passwordHash) {
  res.json({ success: true, user: result.rows[0] });
} else {
  res.status(401).json({ success: false, message: 'Invalid password' });
}
```

---

## 5. Step 4: Storing Data in PostgreSQL

When you click **Register**, the backend writes to PostgreSQL using parameterized SQL:

```sql
INSERT INTO users (username, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, username, email;
```

In `docker-compose.yml`, the database uses a **Docker Volume**:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```
This stores the database files on your real hard drive so your users are saved permanently even after stopping Docker.

---

## 6. Step 5: Updating the Screen

Back in [`app/frontend/src/App.jsx`](../app/frontend/src/App.jsx):

```javascript
const data = await res.json(); // Read backend response

if (res.ok) {
  setCurrentUser(data.user); // Save logged-in user in React state
}
```

When React sees `currentUser` is not null, it hides the login form and renders:

```jsx
<h1 className="text-3xl font-extrabold text-white">SUCCESS</h1>
<p className="text-2xl text-emerald-400">You are an authorized user</p>
```

---

## 7. Why This Architecture Matters for Kubernetes & Minikube

This 3-tier architecture (**Frontend -> Reverse Proxy -> Backend -> Database**) is the exact cloud-native standard used in Kubernetes:

| Component | Local Docker Compose | Minikube Kubernetes Deployment |
|---|---|---|
| **Frontend** | `devops-frontend` container | Kubernetes Deployment + NodePort / Ingress |
| **Backend** | `devops-backend` container | Kubernetes Deployment + ClusterIP Service |
| **Database** | `devops-postgres` container | Stateful PostgreSQL Deployment + PVC |
| **Routing** | Nginx `proxy_pass` | Service Discovery (`backend:5000`) |
