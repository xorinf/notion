# Taskify Backend

The backend of Taskify is a RESTful API built with **Node.js** and **Express**. It handles data persistence, authentication, and real-time event broadcasting.

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Real-Time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens) in HttpOnly cookies and bcrypt for password hashing.
- **File Storage**: Cloudinary (for card attachments and avatars)
- **Validation**: Joi (optional/manual) for payload validation.

## Architecture

The backend is organized into distinct domain folders:

- **`/API`**: Express route controllers grouped by entity (e.g., `boardAPI.js`, `workspaceAPI.js`).
- **`/models`**: Mongoose schemas defining the structure and relationships of MongoDB collections.
- **`/middleware`**: Express middleware (e.g., `verifyToken.js` for route protection).
- **`/config`**: Bootstrapping configurations (Database connection, Cloudinary setup, WebSockets setup).

## Core Concepts

1. **Authentication Strategy**:
   - We do not store JWTs in local storage on the client. Instead, the backend issues an `HttpOnly` cookie containing the token upon login.
   - The `verifyToken` middleware intercepts requests to protected routes, decodes the cookie, and attaches the `userId` to the request object.

2. **WebSockets (Socket.io)**:
   - Clients connect to the Socket server using their `userId`.
   - When a user opens a workspace, they join a "room" specific to that workspace ID.
   - When a mutation occurs (like moving a card), the route controller emits an event to the specific workspace room, allowing all connected clients to update their UI instantly.

## Running Locally

1. Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=6767
   FRONTEND_URL=http://localhost:5173
   DB_URL=mongodb+srv://<user>:<password>@cluster...
   JWT_SECRET=your_jwt_secret
   SALT=10
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev` (uses nodemon) or `npm start`.