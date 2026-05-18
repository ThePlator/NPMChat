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
- **Frontend:** Vercel (Recommended).
- **Backend:** Railway / Render / DigitalOcean (Recommended due to WebSocket requirements).
- **Database:** MongoDB Atlas.

The backend keeps an explicit runtime check: it exports the Express app for
Vercel compatibility, but starts `server.listen()` on persistent hosts so
Socket.IO can maintain long-lived WebSocket connections.
