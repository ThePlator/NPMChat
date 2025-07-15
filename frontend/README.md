# ChatApp Frontend

This is the frontend for the open source ChatApp project, built with Next.js, React, and Tailwind CSS. It provides a modern, real-time chat experience with authentication, collaborative features, and a beautiful UI.

---

## Features

- **Authentication**: Sign up, login, JWT-based session management.
- **Real-Time Chat**: Instant messaging powered by Socket.IO.
- **Collaborative Code Editor**: Write and edit code together live (Monaco Editor).
- **Shared Scratchpads & Snippet Boards**: Share and save code snippets in chat rooms.
- **Live Interview Mode**: Real-time coding, timer, prompts, and private notes for interviews or pair programming.
- **File Sharing & Code Preview**: Upload and preview code files (.js, .py, etc.) directly in chat.
- **Code Execution**: Run code in chat using external APIs (e.g., Piston, Judge0).
- **Responsive UI**: Works on desktop and mobile.
- **Profile Management**: Update avatar, bio, and user info.
- **Open Source**: Built for learning, collaboration, and contribution.

---

## Tech Stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **Socket.IO Client**
- **Monaco Editor** (for code editing)
- **Axios** (for API requests)
- **Context API** (for state management)
- **TypeScript**

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- The backend server running (see `/backend/README.md`)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YOUR_GITHUB_REPO.git
   cd ChatApp/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create a `.env.local` file in the `frontend` directory with the following (adjust as needed):

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
frontend/
  src/
    app/              # Next.js app directory (routing, pages, context)
    components/       # UI and feature components
      chat/           # Chat-related components
      Home/           # Landing page sections
    public/           # Static assets
    styles/           # Global styles (if any)
  package.json
  tsconfig.json
  next.config.ts
  ...
```

---

## Key Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm start` — Start the production server

---

## Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or improvements.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

## License

ISC
