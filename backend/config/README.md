# Configuration Directory (`/backend/config`)

This directory holds the setup and initialization logic for external services, databases, and continuous connections.

## Files

- **`db.js`**: Establishes the connection to the MongoDB cluster using Mongoose. Logs success or failure on startup.
- **`cloudinary.js`**: Configures the Cloudinary SDK using environment variables. This is required for handling image/file uploads (like card attachments or user avatars).
- **`socket.js`**: Initializes the `socket.io` server. It handles real-time bidirectional communication, manages active user sessions, and broadcasts events (like board updates or new notifications) to connected clients in specific workspace "rooms".

## Environment Variables
This directory heavily relies on `.env` variables:
- `DB_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
