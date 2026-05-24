# Environment Setup

To run NPMChat locally, follow these steps.

## Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)

## Backend Setup
1. Navigate to the `backend/` directory.
2. Create a `.env` file based on `.env.example`:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Frontend Setup
1. Navigate to the `frontend/` directory.
2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Troubleshooting
- **CORS Issues:** Ensure `CLIENT_URL` in the backend `.env` matches your frontend URL.
- **Socket Connection:** If the socket fails to connect, verify that the backend is running on the expected port (default: 8080).
- **Image Uploads:** If profile pictures fail to save, check your Cloudinary credentials.
