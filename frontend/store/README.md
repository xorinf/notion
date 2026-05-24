# Zustand Stores Directory (`/frontend/store`)

This directory contains the global state management logic using **Zustand**. Stores act as the single source of truth for the frontend application and handle all external API requests via Axios.

## Stores Overview

- **`authStore.js`**: Manages the current user session, login/logout flows, and profile updates.
- **`workspaceStore.js`**: Fetches and caches the user's workspaces and tracks the active workspace.
- **`boardStore.js`**: Manages the complex state of a Kanban board, including optimistic UI updates for drag-and-drop operations on lists and cards.
- **`pageStore.js`**: Manages rich-text documents.
- **`activityStore.js`**: Fetches the audit journal logs.
- **`notificationStore.js`**: Manages unread notification counts and handles marking them as read.
- **`superadminStore.js`**: Dedicated store for fetching system-wide stats and managing users for the superadmin dashboard.
- **`socketStore.js`**: Manages the active Socket.io connection, handling auto-reconnects, and listening for real-time broadcasts.

## Best Practices
- **API Calls**: All Axios API calls should be encapsulated within store actions. Components should call store actions, not Axios directly.
- **Loading & Error States**: Each store typically maintains its own `loading` (boolean) and `error` (string|null) state to prevent UI jumping.
- **Optimistic Updates**: For immediate visual feedback (like moving a card in `boardStore`), update the local Zustand state immediately, then make the API call in the background. Revert the state if the API call fails.
