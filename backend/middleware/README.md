# Middleware Directory (`/backend/middleware`)

This directory contains Express.js middleware functions that intercept incoming requests before they reach the route handlers.

## Files

- **`verifyToken.js`**: The primary authentication guard. It extracts the JWT from the `token` cookie, verifies its signature against `JWT_SECRET`, decodes the user payload, and attaches the `userId` to the `req` object. If the token is missing, invalid, or expired, it immediately returns a `401 Unauthorized` response, blocking access to protected routes.

## Usage
Middleware is typically injected directly into route definitions in the `/backend/API` directory:
```javascript
import verifyToken from '../middleware/verifyToken.js';
router.get('/protected-route', verifyToken, (req, res) => { ... });
```
