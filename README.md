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

<table>
  <thead>
    <tr>
      <th>Step</th>
      <th>Action</th>
      <th>Command / Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>1</b></td>
      <td><b>Install Prerequisites</b></td>
      <td>
        <ul>
          <li><a href="https://nodejs.org/">Node.js v18+</a></li>
          <li>MongoDB (local or <a href="https://www.mongodb.com/cloud/atlas">MongoDB Atlas</a>)</li>
          <li><a href="https://cloudinary.com/">Cloudinary Account</a></li>
          <li><i>(Optional)</i> Clerk account for authentication</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>2</b></td>
      <td><b>Clone Repository</b></td>
      <td>
        <pre><code>git clone https://github.com/ThePlator/NPMChat
cd NPMChat</code></pre>
      </td>
    </tr>
    <tr>
      <td><b>3</b></td>
      <td><b>Setup Backend</b></td>
      <td>
        <pre><code>cd backend
npm install</code></pre>
        <b>Configure Environment:</b> Create <code>.env</code> file in <code>backend/</code> with:<br>
        <pre><code>MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret</code></pre>
        <b>Run Backend:</b><br>
        <pre><code>npm run dev</code></pre>
        Backend runs at <b><a href="http://localhost:8080">http://localhost:8080</a></b>
      </td>
    </tr>
    <tr>
      <td><b>4</b></td>
      <td><b>Setup Frontend</b></td>
      <td>
        <pre><code>cd ../frontend
npm install</code></pre>
        <b>Configure Environment:</b> Create <code>.env.local</code> in <code>frontend/</code> with:<br>
        <pre><code>NEXT_PUBLIC_API_URL=http://localhost:8080</code></pre>
        <b>Run Frontend:</b><br>
        <pre><code>npm run dev</code></pre>
        Frontend runs at <b><a href="http://localhost:3000">http://localhost:3000</a></b>
      </td>
    </tr>
    <tr>
      <td><b>5</b></td>
      <td><b>Done! 🎉</b></td>
      <td>You now have <b>CodeChat</b> running locally with both frontend & backend active.</td>
    </tr>
  </tbody>
</table>

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
