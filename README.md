# Taskify (Notion Clone)

Taskify is a comprehensive, full-stack application inspired by modern workspace tools like Notion and Trello. It provides a unified workspace for rich-text document editing, Kanban-style task management, and real-time team collaboration.

## High-Level Architecture

The project is structured as a monolithic repository containing two distinct applications:

1. **`frontend/`**: A React application built with Vite, TailwindCSS, and Zustand for state management. It communicates with the backend via REST APIs and WebSockets.
2. **`backend/`**: A Node.js/Express REST API using MongoDB (via Mongoose) for persistence and Socket.io for real-time bidirectional events.

## Features

- **Rich Text Pages**: Create documents with formatting, embedded code blocks, and lists using Quill.
- **Kanban Boards**: Drag and drop cards across lists, assign due dates, and add attachments (via Cloudinary).
- **Workspaces & Roles**: Group users into workspaces with Member or Admin roles. Secure invitations via tokenized links.
- **Real-Time Collaboration**: Changes to boards and tasks are instantly broadcasted to active users via WebSockets.
- **Audit Journal**: An activity feed that tracks all actions performed within a workspace.
- **Superadmin Dashboard**: A hidden administrative route for viewing global metrics and managing users.

## Deployment

- The **frontend** is deployed on **Vercel**.
- The **backend** is deployed on **Render** (Node service) connected to a MongoDB Atlas cluster.
- Image storage and processing are handled by **Cloudinary**.

---

*For detailed instructions on running, configuring, or exploring the application, refer to the respective `frontend/README.md` and `backend/README.md` files.*