# Issue 01: Docker Build Failure (`npm ci` Lockfile Mismatch Across OS Platforms)

## 📌 Summary
During the initial `docker compose up -d --build` run, building the backend and frontend container images failed at the dependency installation step.

---

## 🔍 Symptoms & Error Logs
Terminal output during image build:
```text
 => ERROR [backend dependencies 1/1] RUN npm ci --only=production && npm cache clean --force
------
 > [backend dependencies 1/1] RUN npm ci --only=production && npm cache clean --force:
0.494 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
2.449 npm error code EUSAGE
2.449 npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
2.449 npm error Missing: @emnapi/core@1.11.3 from lock file
2.449 npm error Missing: @emnapi/runtime@1.11.3 from lock file
2.449 npm error Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3
------
target backend: failed to solve: process "/bin/sh -c npm ci --only=production && npm cache clean --force" did not complete successfully: exit code: 1
```

---

## 🧠 Root Cause Analysis
1. **Strict Lockfile Validation Across Operating Systems**:
   - `npm ci` requires absolute binary parity between `package.json` and `package-lock.json`.
   - Running `npm install` locally on a **Windows** host generated optional platform-specific dependencies in `package-lock.json`.
   - When building inside the **Linux (Alpine)** container, `npm ci` detected that the lockfile did not perfectly match the target Linux platform architecture.
2. **Missing Local `.dockerignore`**:
   - The Windows host `node_modules/` folders (over 80 MB) were being transferred into the Docker build context, causing bloat and potential caching conflicts.

---

## 🛠️ Solution Implemented
1. **Updated Dockerfiles**:
   - In `app/backend/Dockerfile`: Changed `npm ci --only=production` to `npm install --omit=dev && npm cache clean --force`.
   - In `app/frontend/Dockerfile`: Changed `npm ci` to `npm install`.
2. **Created `.dockerignore` Files**:
   - Created `app/backend/.dockerignore` and `app/frontend/.dockerignore` to explicitly ignore `node_modules`, `dist`, `.env`, and debug logs.
3. **Outcome**:
   - Docker build succeeded completely in seconds with clean image generation for both services.
