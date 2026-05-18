# Deployment Guide

NPMChat uses Socket.IO for real-time messaging and presence. The frontend can
run on Vercel, but the backend needs a persistent Node.js process because Vercel
Serverless Functions do not keep WebSocket connections open.

## Recommended Production Topology

- **Frontend:** Vercel
- **Backend:** Render, Railway, Fly.io, DigitalOcean, or Docker on any host that
  supports long-running Node.js processes
- **Database:** MongoDB Atlas
- **Media:** Cloudinary

## Backend Environment Variables

Set these variables on the backend host:

```env
NODE_ENV=production
PORT=8080
CLIENT_URL=https://your-frontend.vercel.app
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The backend now starts its HTTP server in production unless the `VERCEL`
environment variable is present. This keeps legacy Vercel serverless exports
from calling `listen()`, while allowing persistent WebSocket platforms to run
Socket.IO correctly.

## Render Blueprint

The root `render.yaml` defines a backend web service with:

- `rootDir: backend`
- `buildCommand: npm ci`
- `startCommand: npm start`
- `healthCheckPath: /api/health`

After creating the service, set `CLIENT_URL` to the deployed frontend URL so
CORS and Socket.IO origins are restricted correctly.

## Docker

Build and run the backend container:

```bash
cd backend
docker build -t npmchat-backend .
docker run --env-file .env -p 8080:8080 npmchat-backend
```

Health check:

```bash
curl http://localhost:8080/api/health
```

## Frontend Environment Variables

Point the frontend at the persistent backend:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_AUTH_API_BASE=https://your-backend.onrender.com/api/v1/auth
NEXT_PUBLIC_MESSAGES_API_BASE=https://your-backend.onrender.com/api/v1/messages
```
