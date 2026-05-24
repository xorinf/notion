# API Routes Directory (`/backend/API`)

This directory contains all the Express.js route handlers and controllers for the application. It acts as the interface between the client frontend and the database models.

## Structure and Responsibilities

Each file in this directory represents a specific feature domain and exports an Express router (`express.Router()`).

- **`authAPI.js`**: Handles user authentication (registration, login, logout, password resets) and session validation. Uses JWT cookies.
- **`userAPI.js`**: Manages user profiles, fetching user data, and tracking recently viewed or starred items.
- **`workspaceAPI.js`**: CRUD operations for Workspaces, including member invitations, role management, and access control.
- **`boardAPI.js`**: Manages Kanban boards within a workspace. Handles lists, cards, dragging/reordering logic, and board configurations.
- **`pageAPI.js`**: Handles the creation, saving, and deletion of rich-text document pages.
- **`activityAPI.js`**: Logs and retrieves chronological activity events (e.g., "User A created Card B") for the audit journal.
- **`notificationAPI.js`**: Manages user notifications (unread counts, marking as read, fetching history).
- **`superadminAPI.js`**: Protected administrative routes for viewing system-wide stats, managing all users, and wiping collections (requires a specific hardcoded secret key).
- **`attachmentAPI.js`**: Handles file uploads via Cloudinary for card attachments.

## Conventions
- Routes should always use the `verifyToken` middleware (from `/backend/middleware`) if they require an authenticated user.
- All endpoints must return JSON responses.
- Use `try/catch` blocks for all async operations to prevent unhandled promise rejections from crashing the server.
- Errors should return appropriate HTTP status codes (e.g., `400` for bad request, `401` for unauthorized, `404` for not found, `500` for internal server error).
