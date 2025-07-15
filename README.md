# ChatApp

## Project Overview

ChatApp is a modern, open source real-time chat platform designed for developers and teams. It features collaborative tools, secure authentication, and a beautiful UI. The project is built to be extensible, easy to contribute to, and ideal for learning or production use.

---

## Tech Stack

- **MENN Stack**: MongoDB, Express.js, Next.js, Node.js
- **Clerk**: (Optional) For advanced authentication and user management
- **WebSockets**: Real-time communication using Socket.IO
- **Other Tools**: Tailwind CSS, Cloudinary (for file uploads), JWT, bcryptjs

---

## Features

- **Real-Time Chat**: Instant messaging with online presence
- **Authentication**: Sign up, login, JWT-based sessions (optionally Clerk)
- **Role-Based Access**: Support for different user roles and permissions
- **Collaborative Code Editor**: Live code editing and sharing
- **Shared Scratchpads & Snippet Boards**: Save and share code snippets
- **Live Interview Mode**: Coding interviews, timer, prompts, and private notes
- **File Sharing & Code Preview**: Upload and preview code files in chat
- **Code Execution**: Run code in chat using external APIs
- **Profile Management**: Update avatar, bio, and user info
- **Open Source**: Built for learning, collaboration, and contribution

---

## Setup Instructions (Run Locally)

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)
- Clerk account for advanced auth (To be implemented)
- Cloudinary account (for file uploads)

### 1. Clone the repository

```bash
git clone https://github.com/ThePlator/NPMChat
cd NPMChat
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Run the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Run the frontend:

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)

---

## Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or improvements.

---

## License

ISC
