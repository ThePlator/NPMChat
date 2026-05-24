# Frontend Documentation

The frontend is a Next.js application built with TypeScript and Tailwind CSS.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **State:** React Context API
- **Networking:** Fetch API (Custom wrapper) + Socket.io-client
- **Animations:** Lenis (Smooth Scroll) + Framer Motion (planned)

## Project Structure
- `src/app`: Routes and Page layouts.
- `src/components`: UI components (organized by feature).
- `src/lib`: Utility functions and shared helpers.
- `src/app/AuthContext.tsx`: Manages user login/logout/session.
- `src/app/MessageContext.tsx`: Manages active chat state, socket events, and message history.

## State Management

### AuthContext
Stores the `user` object and provides methods:
- `login(data)`
- `signup(data)`
- `logout()`
- `updateProfile(data)`

### MessageContext
The "Engine" of the chat UI:
- Manages `socket` connection.
- Stores `users` (sidebar list) and `messages` (active conversation).
- Handles real-time listeners for `newMessage` and `getOnlineUsers`.

## Real-time Logic
The socket is initialized in `MessageContext` as soon as the user is authenticated.
- **Connection:** `io(BACKEND_URL, { query: { userId } })`
- **Events Emitted:** `send-message`
- **Events Received:** `newMessage`, `getOnlineUsers`, `messageSeen`

## Styling Guidelines
The project uses a **Neo-Brutalist** aesthetic:
- Thick black borders (`border-2 border-black`).
- Harsh shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
- High contrast colors (Vibrant greens, purples, and yellows).
