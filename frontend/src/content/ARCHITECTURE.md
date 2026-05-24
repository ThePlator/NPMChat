# Architecture Overview

NPMChat is a full-stack real-time chat application built using the MERN stack (with Next.js) and Socket.io.

## System Components

### 1. Backend (Node.js/Express)
The backend acts as a RESTful API and a WebSocket server.
- **REST API:** Handles authentication, user profile management, and message history retrieval.
- **WebSocket (Socket.io):** Handles real-time message delivery, online status tracking, and "typing" indicators.
- **Database (MongoDB):** Stores user profiles and message history.

### 2. Frontend (Next.js/React)
A modern, responsive UI built with TypeScript and Tailwind CSS.
- **State Management:** Uses React Context API (`AuthContext` and `MessageContext`) for global state.
- **Real-time Integration:** Uses `socket.io-client` to maintain a persistent connection with the backend.
- **Styling:** Follows a Neo-Brutalist design language.

## Data Flow
1. **Auth:** User logs in -> Backend returns JWT -> Frontend stores JWT in LocalStorage -> Frontend sends JWT in `Authorization` header for subsequent requests.
2. **Messaging:** 
   - User sends message (via REST POST).
   - Backend saves to DB.
   - Backend emits `newMessage` via Socket.io to the recipient.
   - Recipient's frontend receives socket event and updates local message state.

## Deployment Strategy
- **Frontend:** Vercel — handles Next.js SSR, static assets, and edge routing.
- **Backend:** Render Web Service (Docker) — required for persistent Socket.IO WebSocket connections. See [DEPLOYMENT.md](/DEPLOYMENT.md) for setup.
- **Database:** MongoDB Atlas (free tier available).
- **CI:** GitHub Actions — validates Docker build and health check on every PR. See `.github/workflows/backend-ci.yml`.

> **Note:** Vercel cannot host the backend because its serverless functions do not support persistent WebSocket connections. See [DEPLOYMENT.md](/DEPLOYMENT.md) for details.

