# Assets Directory (`/frontend/src/assets`)

This directory stores static media assets required by the application.

## Contents
- **Images/SVGs**: Contains lightweight vectors and branding assets (like logos, placeholder graphics, or custom illustrations).

## Best Practices
- Assets placed here are processed by Vite during the build step. They are hashed for cache-busting and optimized.
- For dynamic or user-uploaded media (like avatars or attachments), do not store them here. They should be uploaded to Cloudinary via the backend.
