# Backend Documentation

The backend is a Node.js application using Express and Mongoose.

## Tech Stack
- **Framework:** Express.js (ES Modules)
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Auth:** JWT (JSON Web Tokens) & Bcrypt.js
- **File Storage:** Cloudinary

## API Reference

### Auth Routes (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Create a new user account | No |
| POST | `/login` | Authenticate user & get token | No |
| GET | `/check-auth` | Verify current token & get user data | Yes |
| PUT | `/update-profile` | Update user bio, name, or avatar | Yes |

### Message Routes (`/api/v1/messages`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get list of users for sidebar with unseen counts | Yes |
| GET | `/:userId` | Get chat history between two users | Yes |
| POST | `/send/:receiverId` | Send a new text/image message | Yes |
| PUT | `/mark-as-seen/:messageId` | Mark a specific message as read | Yes |

## Database Models

### User Schema
- `email`: String (Unique, Lowercase)
- `password`: String (Hashed)
- `name`: String
- `avatarUrl`: String (Cloudinary URL)
- `bio`: String

### Message Schema
- `senderId`: ObjectId (Ref: User)
- `receiverId`: ObjectId (Ref: User)
- `text`: String
- `image`: String (Cloudinary URL)
- `seen`: Boolean (Default: false)

## Middleware
- `protectRoute`: Verifies the JWT in the `Authorization` header. If valid, attaches the user object to `req.user`.
