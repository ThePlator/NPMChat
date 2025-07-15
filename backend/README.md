# ChatApp Backend

This is the backend for the ChatApp open source project. It provides real-time messaging, authentication, user management, and file/image upload support for the frontend. Built with Node.js, Express, MongoDB, and Socket.IO.

---

## Features

- **User Authentication**: Sign up, login, JWT-based authentication, and profile management.
- **Real-Time Messaging**: Instant messaging using Socket.IO.
- **User Presence**: Online/offline status updates.
- **File & Image Uploads**: Upload and share images via Cloudinary.
- **RESTful API**: For user and message management.
- **MongoDB Database**: Stores users and messages.
- **Secure**: Passwords hashed with bcrypt, JWT for authentication.
- **CORS Support**: For frontend-backend communication.

---

## Tech Stack

- **Node.js** & **Express**: Server and REST API
- **MongoDB** & **Mongoose**: Database and ODM
- **Socket.IO**: Real-time communication
- **Cloudinary**: Image/file uploads
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YOUR_GITHUB_REPO.git
   cd ChatApp/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create a `.env` file in the `backend` directory with the following:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:8080` by default.

---

## API Endpoints

### Auth & User

- `POST /api/v1/auth/signup` — Register a new user
- `POST /api/v1/auth/login` — Login and receive JWT
- `GET /api/v1/auth/check` — Check authentication (protected)
- `PUT /api/v1/auth/profile` — Update user profile (protected)

### Messages

- `GET /api/v1/messages/` — Get users for sidebar (protected)
- `GET /api/v1/messages/:userId` — Get messages with a user (protected)
- `POST /api/v1/messages/:receiverId` — Send a message (protected)

### Status

- `GET /api/status` — Health check

---

## Real-Time Events (Socket.IO)

- **Connect**: Client connects with `userId` in handshake query.
- **getOnlineUsers**: Receive list of online users.
- **newMessage**: Receive new messages in real time.

---

## Project Structure

```
backend/
  controllers/      # Route handlers for users and messages
  lib/              # Database, Cloudinary, and utility functions
  middleware/       # Auth middleware
  models/           # Mongoose schemas (User, Message)
  routes/           # Express route definitions
  server.js         # Main server entry point
```

---

## Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or improvements.

---

## License

ISC
