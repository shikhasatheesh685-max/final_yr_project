# Deployment Guide: Art Gallery Showcase

This guide walks you through hosting the project for free using:

- **Vercel** — Frontend (React/Vite)
- **Render** — Backend (Node.js/Express)
- **MongoDB Atlas** — Cloud database

You can update the frontend URL anytime via **Render → Environment → FRONTEND_URL** without pushing code to GitHub.

---

## Prerequisites

- GitHub repository with your code (you already push in stages)
- Accounts (free): [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Render](https://render.com), [Vercel](https://vercel.com)

---

## 1. MongoDB Atlas (Database)

### 1.1 Create cluster and database user

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in (or create account).
2. **Create a project** (e.g. “Art Gallery”) if needed.
3. **Build a cluster**: Choose **M0 Free** → pick a region close to you → Create.
4. **Database Access** (left sidebar):
   - Add New Database User → Authentication: Password → set username and password (save them).
   - User Privileges: **Atlas admin** or **Read and write to any database**.
5. **Network Access** (left sidebar):
   - Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect. (For production you can later restrict to Render’s IPs if needed.)

### 1.2 Get connection string

1. In Atlas, click **Database** → **Connect** on your cluster.
2. Choose **Connect your application** → Driver: **Node.js**.
3. Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your DB user. If the password has special characters, URL-encode them (e.g. `@` → `%40`).
5. Add a database name (e.g. `artgallery`) before the `?`:
   ```text
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/artgallery?retryWrites=true&w=majority
   ```
   This value is your **MONGO_URI** for the backend.

---

## 2. Render (Backend)

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your GitHub account if needed, then select the **art_gallery_showcase** repo.
3. Configure:
   - **Name**: e.g. `art-gallery-api`
   - **Region**: Choose closest to your users.
   - **Root Directory**: `server`
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.2 Environment variables (Render)

In the same Web Service, open **Environment** and add:

| Key           | Value |
|---------------|--------|
| `PORT`        | Leave as-is (Render sets this) or `5000` |
| `MONGO_URI`   | Your full MongoDB Atlas connection string from step 1.2 |
| `JWT_SECRET`  | A long random string (e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `FRONTEND_URL`| Your Vercel frontend URL — set this **after** you deploy the frontend (e.g. `https://your-app.vercel.app`). No trailing slash. |

**CORS:** The backend uses `FRONTEND_URL` for CORS. When you change the frontend URL (e.g. new Vercel project or custom domain), update **only** `FRONTEND_URL` in Render and redeploy; no code push needed.

### 2.3 Deploy

Click **Create Web Service**. Render will build and deploy. Note the service URL (e.g. `https://art-gallery-api.onrender.com`). This is your **backend API URL**; the frontend will call `https://art-gallery-api.onrender.com/api`.

### 2.4 Optional: seed admin user

If you need the default admin on the hosted DB:

- In Render, open your service → **Shell** tab (or use “Run background task” if available).
- Run: `cd server && npm run seed:admin` (or run the seed script locally once with `MONGO_URI` set to the Atlas URI).

---

## 3. Vercel (Frontend)

### 3.1 Import project

1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. **Add New** → **Project** → Import your **art_gallery_showcase** repo.
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (or leave default and set it to `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (Vite default)

### 3.2 Environment variable (Vercel)

Add one variable:

| Key             | Value |
|-----------------|--------|
| `VITE_API_URL`  | Your Render backend API base URL, e.g. `https://art-gallery-api.onrender.com/api` (no trailing slash). |

Vite only exposes variables prefixed with `VITE_` to the browser, so the client will use this for all API requests.

### 3.3 Deploy

Click **Deploy**. When finished, copy your frontend URL (e.g. `https://art-gallery-showcase.vercel.app`).

### 3.4 Point backend CORS to frontend

1. In **Render** → your backend service → **Environment**.
2. Set **FRONTEND_URL** to your Vercel URL (e.g. `https://art-gallery-showcase.vercel.app`).
3. Save; Render will redeploy. After that, the browser will be allowed to call your API from the frontend.

---

## 4. Summary: URLs and env vars

| Where   | What to set |
|--------|-------------|
| **MongoDB Atlas** | Nothing else; backend uses MONGO_URI. |
| **Render (backend)** | `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` (and optionally `PORT`). |
| **Vercel (frontend)** | `VITE_API_URL` = `https://YOUR-RENDER-APP.onrender.com/api`. |

After any change to **FRONTEND_URL** (e.g. new Vercel URL or custom domain), update it in Render only; CORS is driven by that env var.

---

## 5. File uploads (important)

The app stores uploaded images in `server/uploads/`. On Render, the filesystem is **ephemeral**: files are lost on redeploy or restart.

- **For a demo or lightweight use:** This is acceptable; uploads will disappear after redeploys.
- **For production:** Use cloud storage (e.g. AWS S3, Cloudinary) and change the server to save files there and serve URLs. That would require code changes and is not covered in this guide.

---

## 6. Checklist

- [ ] MongoDB Atlas: cluster created, DB user and network access set, MONGO_URI copied.
- [ ] Render: Web Service created from `server`, env vars set (MONGO_URI, JWT_SECRET, FRONTEND_URL).
- [ ] Render: Service URL noted (e.g. `https://xxx.onrender.com`).
- [ ] Vercel: Project imported from repo, root = `client`, `VITE_API_URL` = `https://xxx.onrender.com/api`.
- [ ] Vercel: Frontend URL noted; FRONTEND_URL in Render set to that URL.
- [ ] Test: Open frontend URL, log in or register, and confirm API calls work (no CORS errors in browser console).

---

## 7. Troubleshooting

- **CORS errors in browser:** Ensure **FRONTEND_URL** in Render exactly matches the origin (scheme + host, no trailing slash), e.g. `https://your-app.vercel.app`.
- **401 / auth issues:** Check that **JWT_SECRET** is the same for all backend instances and that the frontend is sending the token (e.g. from localStorage).
- **Cannot connect to database:** Check **MONGO_URI** (correct DB name, encoded password), and that Atlas **Network Access** allows `0.0.0.0/0` (or Render’s IPs).
- **Render free tier:** Service may spin down after inactivity; first request can be slow (cold start).

Once these steps are done, your app will be live with frontend on Vercel, backend on Render, and database on MongoDB Atlas, and you can change the frontend URL anytime via **FRONTEND_URL** on Render.
