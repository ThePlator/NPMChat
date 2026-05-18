<!-- markdownlint-disable MD033 -->
# NPMChat

<h3 style="text-align: center; font-weight: normal;">
  Real-Time Chat & Code Collaboration for Developers
</h3>

<p style="text-align: center; margin: auto;">
  CodeChat is an open-source platform that lets developers chat, share code, run snippets,  
  and collaborate in real time — all in one place. Designed for coding interviews,  
  pair programming, and learning together.
</p>

## Project Overview

<p style="text-align: center;">
  <img src="https://img.shields.io/github/stars/ThePlator/NPMChat?style=flat-square" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/ThePlator/NPMChat?style=flat-square" alt="GitHub forks" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" alt="License ISC" />
  <img src="https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20Next.js%20%7C%20Node.js-brightgreen?style=flat-square" alt="Tech Stack" />
</p>

---

## ⚡ Tech Stack

### Core Framework & Backend

- **MongoDB** – NoSQL database for storing chat data and user info
- **Express.js** – Backend framework for API and server-side logic
- **Next.js** – React framework for building the frontend with SSR & routing
- **Node.js** – JavaScript runtime powering the backend

### Authentication & User Management

- **Clerk** *(Optional)* – Advanced authentication, user profiles, and management
- **JWT & bcryptjs** – Secure token-based authentication and password hashing

### Real-Time Communication

- **Socket.IO** – WebSocket-based real-time messaging

---

## Features

<table>
  <tr>
    <td>💬 <b>Real-Time Chat</b><br>Instant messaging with live user presence indicators</td>
    <td>🔐 <b>Secure Authentication</b><br>Sign up, log in, and manage sessions with JWT or Clerk integration</td>
  </tr>
  <tr>
    <td>🛡 <b>Role-Based Access Control</b><br>Assign different roles and permissions for better management</td>
    <td>💻 <b>Collaborative Code Editor</b><br>Edit and share code in real-time with syntax highlighting</td>
  </tr>
  <tr>
    <td>📂 <b>Shared Scratchpads & Snippets</b><br>Save, organize, and share reusable code snippets</td>
    <td>🎯 <b>Live Interview Mode</b><br>Built-in timer, problem prompts, and private interviewer notes</td>
  </tr>
  <tr>
    <td>📎 <b>File Sharing & Code Preview</b><br>Upload files and preview supported code formats directly in chat</td>
    <td>⚡ <b>In-Chat Code Execution</b><br>Run and test code instantly using integrated APIs</td>
  </tr>
  <tr>
    <td>👤 <b>Profile Management</b><br>Customize avatar, bio, and personal information</td>
    <td>🌍 <b>Open Source</b><br>Free to use, improve, and contribute to the community</td>
  </tr>
</table>

---

## 📸 Screenshots

| ![Landing Page](Assets/landing.png) | ![Sign-Up](Assets/signup.png) | ![Chat Interface](Assets/chat.png) |
|-------------------------------------|--------------------------------|------------------------------------|
| 🏠 Landing Page                     | 📝 Sign-Up & Authentication   | 💬 Real-Time Chat Interface        |

---

## ⚙️ Setup Instructions (Run Locally)

Follow these steps to set up **CodeChat** on your local machine.

---

| Step | Action | Command / Details |
|------|--------|-------------------|
| **1**| **Install Prerequisites**  | - [Node.js v18+](https://nodejs.org/) <br> - MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) <br> - [Cloudinary Account](https://cloudinary.com/) <br> - *(Optional)* Clerk account for authentication |
| **2** | **Clone Repository** | ```bash<br>git clone https://github.com/ThePlator/NPMChat<br>cd NPMChat<br>``` |
| **3** | **Setup Backend** | ```bash<br>cd backend<br>npm install<br>``` |
|      | **Configure Environment** | Create `.env` file in `backend/` with: <br>```env<br>PORT=8080<br>NODE_ENV=development<br>CLIENT_URL=http://localhost:3000<br>MONGODB_URI=your_mongodb_connection_string<br>JWT_SECRET=your_jwt_secret<br>CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name<br>CLOUDINARY_API_KEY=your_cloudinary_api_key<br>CLOUDINARY_API_SECRET=your_cloudinary_api_secret<br>``` |
|      | **Run Backend** | ```bash<br>npm run dev<br>``` <br>Backend runs at **[http://localhost:8080](http://localhost:8080)** |
| **4**| **Setup Frontend** | ```bash<br>cd ../frontend<br>npm install<br>``` |
|      | **Configure Environment** | Create `.env.local` in `frontend/` with: <br>```env<br>NEXT_PUBLIC_API_URL=http://localhost:8080<br>``` |
|      | **Run Frontend** | ```bash<br>npm run dev<br>``` <br>Frontend runs at **[http://localhost:3000](http://localhost:3000)** |
| **5**| **Done! 🎉** | You now have **CodeChat** running locally with both frontend & backend active. |

---

## Deployment

Deploy the frontend to Vercel and the Socket.IO backend to a persistent Node.js
host such as Render, Railway, Fly.io, DigitalOcean, or Docker. Vercel Serverless
Functions do not keep WebSocket connections open, so the backend should not be
hosted there for production real-time chat.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the Render blueprint, Docker
commands, health check endpoint, and frontend environment variables.


## Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or improvements.

---

## License

ISC
