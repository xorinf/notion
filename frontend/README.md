# Taskify Frontend

The frontend of Taskify is a highly interactive Single Page Application (SPA) built with **React** and **Vite**. 

## Tech Stack

- **Framework**: React 18+ via Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM (v6+)
- **Network**: Axios
- **Real-Time**: Socket.io-client
- **Rich Text**: React-Quill
- **Icons**: Lucide React

## Architecture

The application is structured to decouple UI from business logic and data fetching:

- **`/src/components`**: Contains all React components. We utilize `React.lazy()` for route-level code splitting in `App.jsx` to maintain a small initial bundle size.
- **`/store`**: Contains Zustand stores (e.g., `workspaceStore.js`, `boardStore.js`). Stores handle all Axios API calls, optimistic UI updates, and hold the global application state. Components are purely reactive to store changes.
- **`/src/styles`**: Shared CSS utilities and Tailwind class templates (`common.js`) to enforce a uniform design system.
- **`/src/assets`**: Static branding and UI graphics.

## Core Concepts

1. **State Management Flow**:
   - A user interacts with the UI (e.g., clicks "Create List").
   - The component calls an action in `boardStore.js`.
   - The store makes an asynchronous Axios request to the backend.
   - Upon success, the store updates its internal state.
   - The component automatically re-renders with the new data.

2. **Real-Time Synchronization**:
   - `socketStore.js` maintains a persistent WebSocket connection to the backend.
   - When a real-time event is received (e.g., `boardUpdated`), the socket listener updates the specific Zustand store silently, keeping the UI in sync without requiring manual page refreshes.

3. **Performance Optimizations**:
   - The app uses `fetchpriority="high"` and `<link rel="preload">` in `index.html` to optimize the Largest Contentful Paint (LCP).
   - Images and off-screen assets utilize `loading="lazy"`.

## Running Locally

1. Create a `.env` file in the `frontend/` directory (if not using the default proxy):
   ```env
   VITE_BACKEND_URL=http://localhost:6767
   ```
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
