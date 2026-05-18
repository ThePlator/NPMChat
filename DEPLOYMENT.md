# Deployment Guide

This document explains why and how NPMChat's backend is deployed on **Render** instead of Vercel, and how to set up both services.

---

## Why Not Vercel for the Backend?

NPMChat uses **Socket.IO** for real-time messaging, online presence, and live message delivery — all of which require **persistent WebSocket connections**.

Vercel deploys backend code as **serverless functions** which are:

- **Stateless** — no in-memory state (e.g., `userSocketMap`) survives between invocations
- **Short-lived** — functions timeout after 10–30 seconds, killing any open socket
- **No WebSocket upgrade** — the `101 Switching Protocols` response is not supported

This is a [known Vercel limitation](https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections). Vercel recommends using a dedicated server for WebSocket workloads.

---

## Architecture

```
┌──────────────┐     HTTPS/WSS      ┌──────────────────┐      MongoDB
│   Browser    │◄───────────────────►│  Render (Docker)  │◄──────────►  Atlas
│              │                     │  Express+Socket.IO │
└──────┬───────┘                     └──────────────────┘
       │
       │  HTTPS (SSR + Static)
       ▼
┌──────────────┐
│   Vercel     │
│   (Next.js)  │
└──────────────┘
```

| Component | Platform | Why |
|-----------|----------|-----|
| Frontend (Next.js) | Vercel | SSR, edge routing, static assets — Vercel excels here |
| Backend (Express + Socket.IO) | Render | Persistent WebSocket connections, in-memory state |
| Database (MongoDB) | Atlas | Managed, free tier available |

---

## Render Backend Setup

### Option A: Blueprint (Recommended)

1. Fork the repo on GitHub
2. Go to [render.com/blueprints](https://render.com/blueprints)
3. Click **New Blueprint Instance**
4. Connect your forked repo
5. Render reads `render.yaml` and auto-configures the service
6. Set the secret environment variables in the dashboard:

| Variable | Description |
|----------|-------------|
| `CLIENT_URL` | Your frontend URL (e.g., `https://npmchat.vercel.app`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

7. Click **Deploy**

### Option B: Manual Setup

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `npmchat-backend`
   - **Region:** Oregon (or closest)
   - **Runtime:** Docker
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
4. Add the environment variables from the table above, plus:
   - `PORT=8080`
   - `NODE_ENV=production`
5. Set **Health Check Path** to `/api/health`
6. Deploy

---

## Vercel Frontend Setup

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add this environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL (e.g., `https://npmchat-backend.onrender.com`) |

4. Deploy

---

## CI Pipeline

A GitHub Actions workflow (`.github/workflows/backend-ci.yml`) runs on every push/PR that touches `backend/**` files. It:

1. Builds the Docker image
2. Starts a container with placeholder env vars
3. Validates the `/api/health` health check returns HTTP 200
4. Prints container logs for debugging

This catches Dockerfile issues and server startup crashes before code reaches Render.

---

## Local Development

### With Docker (Recommended)

```bash
# 1. Configure backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 2. Start backend
docker-compose up --build

# 3. Start frontend (in another terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Without Docker

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (another terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| CORS errors in browser console | `CLIENT_URL` doesn't match frontend URL | Set `CLIENT_URL` in Render to your exact Vercel URL |
| Socket.IO connection timeout | Backend not running or wrong URL | Check `NEXT_PUBLIC_API_URL` in Vercel points to Render |
| "WebSocket connection failed" | Using Vercel for backend | Deploy backend on Render (this guide) |
| Backend returns 503 after idle | Render free tier spins down after 15 min | Upgrade to Starter plan ($7/mo) for always-on |
| Docker build fails in CI | Missing dependency or file | Check `docker logs` in the CI output |

---

## Important Notes

> **Render Free Tier:** Spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds (cold start). For production, use the Starter plan ($7/month) for always-on.

> **Environment Variable Sync:** When you update `CLIENT_URL` on Render (e.g., after changing your Vercel domain), Render will auto-redeploy with the new value.
