# Components Directory (`/frontend/src/components`)

This directory contains all the React components that make up the user interface. 

## Component Categories

1. **Pages / Route Views**: Top-level components rendered directly by the React Router in `App.jsx`.
   - `Home.jsx`, `Register.jsx`, `Login.jsx` (Public routes)
   - `DashBoard.jsx`, `Workspace.jsx`, `BoardView.jsx`, `Page.jsx` (Protected app views)
   - `Superadmin.jsx` (Hidden admin dashboard)
2. **Layout & Shell**: Structural components that wrap the application content.
   - `RootLayout.jsx`, `Sidebar.jsx`, `Header.jsx`, `Footer.jsx`
3. **Features & Modals**: Complex interactive features.
   - `CardModal.jsx`: The detailed view for a Kanban card (editing descriptions, checklists, attachments).
   - `Editor.jsx`: The Quill-based rich-text editor wrapper.
   - `GlobalSearch.jsx` / `Search.jsx`: Application-wide search interfaces.
4. **Utility**:
   - `AuthGuards.jsx`: Contains `<ProtectedRoute>` and `<PublicRoute>` wrappers to redirect users based on their authentication state.

## Architecture Guidelines
- **Lazy Loading**: Heavy route components should be imported dynamically using `React.lazy()` in `App.jsx` to keep the initial bundle size small.
- **State**: Components should rely on Zustand stores (`/frontend/store`) for global state and API interactions, keeping local `useState` strictly for transient UI states (e.g., "is dropdown open").
- **Styling**: We use TailwindCSS alongside shared utility constants imported from `/frontend/src/styles/common.js`.
