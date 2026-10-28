# CaféHub — Deployment Guide

> **Stack:** React + Vite (frontend) · Node/Express (backend) · MongoDB Atlas (database)
> **Hosting:** Vercel (frontend) · Render (backend)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Running Locally](#2-running-locally)
3. [MongoDB Atlas Setup](#3-mongodb-atlas-setup)
4. [Deploy Backend → Render](#4-deploy-backend--render)
5. [Deploy Frontend → Vercel](#5-deploy-frontend--vercel)
6. [Connecting Everything](#6-connecting-everything)
7. [Seeding the Database](#7-seeding-the-database)
8. [Default Login Credentials](#8-default-login-credentials)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| Git | any | `git --version` |

You'll also need free accounts on:
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — hosted database
- [Render](https://render.com) — backend hosting
- [Vercel](https://vercel.com) — frontend hosting

---

## 2. Running Locally

### Step 1 — Clone the repo

```bash
git clone https://github.com/bhaveshpatilrm7-ui/cafe-hub.git
cd cafe-hub
```

### Step 2 — Install all dependencies

```bash
# Install root dev tools (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

Or all at once:
```bash
npm run setup
```

### Step 3 — Create the server `.env` file

```bash
cp .env.example server/.env
```

Then open `server/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cafehub   # or your Atlas URI
JWT_SECRET=any_long_random_secret_string
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Tip:** For local dev you can use a local MongoDB instance (`mongodb://127.0.0.1:27017/cafehub`) or an Atlas free cluster — both work.

### Step 4 — Start the dev servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:5173`

The Vite dev server proxies all `/api` requests to the backend automatically — no extra configuration needed.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend + backend in watch mode |
| `npm run server` | Backend only (nodemon) |
| `npm run client` | Frontend only (Vite) |
| `npm run seed` | Seed the database with sample data |
| `npm start` | Production start (backend only) |

---

## 3. MongoDB Atlas Setup

> Skip this if you're using a local MongoDB for dev. **You must use Atlas for production** (Render/Vercel have no built-in database).

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. Create a **free M0 cluster** (choose any region).
3. Under **Database Access** → Add a new database user with a strong password.
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — required for Render).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<password>`, and append `/cafehub` before the `?`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/cafehub?retryWrites=true&w=majority
   ```
7. Save this — it's your `MONGO_URI`.

---

## 4. Deploy Backend → Render

### Step 1 — Create a new Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your GitHub repo (`cafe-hub`).
3. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `cafe-hub-api` (or anything) |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Instance Type** | Free |

### Step 2 — Add Environment Variables

In the Render dashboard → your service → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | *(your Atlas connection string)* |
| `JWT_SECRET` | *(a long random string — keep this secret!)* |
| `JWT_EXPIRE` | `30d` |
| `CLIENT_URL` | *(leave blank for now — fill in after Vercel deploy)* |

### Step 3 — Deploy

Click **Create Web Service**. Render will build and deploy automatically.

Once deployed, your backend URL will be something like:
```
https://cafe-hub-rp34.onrender.com
```

> **Note:** Free Render instances **spin down after 15 minutes of inactivity**. The first request after a spin-down takes ~30 seconds. This is normal on the free tier.

### Verify it's working

Open in your browser:
```
https://your-render-url.onrender.com/api/health
```

You should see:
```json
{ "status": "UP", "message": "CaféHub Server is running smoothly" }
```

---

## 5. Deploy Frontend → Vercel

### Step 1 — Import the project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your `cafe-hub` GitHub repo.
3. Vercel will auto-detect the `vercel.json` config and use these settings:

   | Setting | Auto-detected value |
   |---------|-------------------|
   | **Build Command** | `cd client && npm install && npm run build` |
   | **Output Directory** | `client/dist` |
   | **Framework** | Vite |

### Step 2 — Add Environment Variables

Before clicking **Deploy**, go to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |

> ⚠️ **Important:** Variable names must start with `VITE_` to be accessible in the React app. Replace the URL with your actual Render backend URL.

### Step 3 — Deploy

Click **Deploy**. Vercel will build and deploy. Your frontend URL will look like:
```
https://cafe-hub-xxxx.vercel.app
```

---

## 6. Connecting Everything

After both services are deployed, you need to link them together.

### Update Render — allow your Vercel frontend

1. Go to Render → your backend service → **Environment**.
2. Set `CLIENT_URL` to your Vercel frontend URL (no trailing slash):
   ```
   https://cafe-hub-xxxx.vercel.app
   ```
3. If you have **multiple URLs** to allow (e.g. a custom domain + Vercel preview), separate them with commas:
   ```
   https://cafe-hub-xxxx.vercel.app,https://www.mycafe.com
   ```
4. Click **Save Changes** — Render will redeploy automatically.

### Verify the connection

1. Open your Vercel frontend URL.
2. Go to the **Menu** page — products should load from the backend.
3. Open browser DevTools → **Network** tab — API calls should return `200 OK`.

---

## 7. Seeding the Database

The seed script populates the database with sample categories, products, tables, coupons, and users.

### Locally

```bash
# Make sure server/.env has the correct MONGO_URI
npm run seed
```

### On Atlas (from local machine pointing to production DB)

```bash
cd server
MONGO_URI="mongodb+srv://..." node seed.js
```

> ⚠️ **Warning:** The seed script **deletes all existing data** before inserting. Only run it on a fresh database or when you want to reset.

---

## 8. Default Login Credentials

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@cafehub.com` | `admin123` |
| **Staff** | `staff@cafehub.com` | `staff123` |
| **Customer** | `customer@cafehub.com` | `customer123` |

> 🔒 Change these passwords immediately in any production environment.

---

## 9. Troubleshooting

### ❌ CORS error in browser console

- Make sure `CLIENT_URL` on Render is set to your exact Vercel URL (no trailing slash).
- Check that `NODE_ENV=production` is set on Render.
- After updating env vars, wait for Render to redeploy (~1–2 min).

### ❌ API calls fail / Network error on Vercel

- Confirm `VITE_API_URL` is set in Vercel's Environment Variables (not just in a `.env` file).
- After adding env vars in Vercel, **redeploy** (Vercel → your project → Deployments → Redeploy).

### ❌ Page refresh gives 404 on Vercel

- Make sure `vercel.json` is in the **root** of the repo and has been committed and pushed.
- It should contain the SPA rewrite rule (`"source": "/(.*)"` → `"/index.html"`).

### ❌ Render backend is slow / timing out

- Free tier instances sleep after inactivity. The first request after a cold start can take up to 30 seconds — this is expected.
- You can use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 5 minutes to keep it warm.

### ❌ MongoDB connection error on Render

- Go to MongoDB Atlas → **Network Access** → confirm `0.0.0.0/0` is in the allow list.
- Double-check the `MONGO_URI` value on Render for typos (username, password, cluster name).

### ❌ `npm run dev` fails locally

- Make sure `server/.env` exists (copy from `.env.example`).
- Run `npm run setup` to install all dependencies first.
- Check that port `5000` and `5173` are not in use by another process.

---

*Last updated: October 2026*
