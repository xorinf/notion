# Notion Clone Architecture & Design Document

## 1. Executive Summary
This document outlines the architecture, feature structure, application flow, entities, APIs, and scalable design for the Notion Clone application. The system provides a unified platform for workspace collaboration, kanban boards (like Trello), and document editing (like Notion).

## 2. Feature Structure
- **Authentication & User Management**: Registration, login, profile management, password change.
- **Workspaces**: Isolated environments for teams or personal use. Supports roles (Admin, Member).
- **Kanban Boards**: Boards containing lists and cards. Supports templates, member roles, and archiving.
- **Lists & Cards**: Granular task management. Cards support descriptions, checklists, labels, due dates, assignments, and attachments.
- **Document Pages (Notion-like)**: Hierarchical documents (pages and sub-pages). Supports cover images, icons, favorites, and moving across parents.
- **Collaboration & Notifications**: Activity feeds tracking changes to boards/cards/workspaces. Notification system for mentions/invites.
- **Search**: Global search across pages and cards.

## 3. Application Flow
1. **Onboarding**: User registers/logs in -> Redirected to default workspace or prompted to create one.
2. **Workspace Dashboard**: User sees Activity Feed, Notifications, Boards, and Pages.
3. **Board View**: User interacts with Lists and Cards (drag-and-drop, modals for card details).
4. **Page View**: User writes rich text in nested pages.
5. **Collaboration**: Invites sent to users -> Accepted -> User joins workspace -> Real-time updates (if applicable) and Activity Feed updates.

## 4. Database Structure & Entities (MongoDB)
- **User**: _id, firstName, lastName, email, passwordHash, avatarUrl, starredBoards[], starredPages[]
- **Workspace**: _id, name, description, icon, ownerId, members[{userId, role}]
- **Board**: _id, title, description, workspaceId, background, visibility, members[{userId, role}], isTemplate, archived
- **List**: _id, title, boardId, position, archived
- **Card**: _id, title, description, listId, boardId, position, priority, dueDate, members[], labels[], checklists[], comments[], archived
- **Attachment**: _id, filename, url, fileType, cardId
- **Page**: _id, title, icon, content, workspaceId, parentId, coverImage, isFavorite, archived
- **Invite**: _id, workspaceId, email, role, token, status
- **Notification**: _id, userId, message, read, type, link
- **Activity**: _id, workspaceId, entityType, entityId, userId, action, details

## 5. Backend Architecture
- **Framework**: Node.js + Express
- **Database**: MongoDB via Mongoose
- **Storage**: Cloudinary (via Multer) for attachments and cover images
- **Authentication**: JWT based (`verifyToken` middleware)
- **Routing Structure**: Granular API files mapped to entities (`boardAPI.js`, `pageAPI.js`, etc.)
- **Contracts**: Defined strictly in `.http` files (ping directory) acting as exact spec.

## 6. Frontend Architecture
- **Framework**: React.js (Vite)
- **State Management**: Zustand (modular stores: `authStore`, `workspaceStore`, `boardStore`, `notificationStore`)
- **Styling**: TailwindCSS / Vanilla CSS
- **Routing**: React Router DOM
- **Scalable Folder Structure**:
  - `src/components/`: Reusable UI elements and views.
  - `src/store/`: Zustand state stores handling API calls and local state.
  - `src/assets/`, `src/styles/`: Static resources and global styles.

## 7. Next Implementation Steps
1. **Zustand Stores Extension**: Add missing methods in existing stores and create new ones (e.g., `pageStore.js`, `activityStore.js`) based on `ping/*.http`.
2. **Page/Document Feature**: Implement the Notion-like rich text editor UI and hook it up to the `/page` endpoints.
3. **Board Completeness**: Finalize drag-and-drop, card modals, attachments, labels, and checklists in `BoardView.jsx`.
4. **Collaboration UI**: Implement Workspace settings, invite acceptance UI, and activity feed rendering.
