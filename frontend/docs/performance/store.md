# Store & API Performance Audit

This document details the performance optimizations and strategies related to state management and network requests handled in `frontend/store`.

## Key Findings

### 1. Redundant Network Requests
**Issue**: Stores like `authStore.js` and `workspaceStore.js` fire initialization API requests (`/auth/check-auth`, `/workspace`) frequently on component mounts or layout renders.
**Observation**: `App.jsx` correctly calls `checkAuth()` once in a top-level `useEffect`, which minimizes redundant requests at the root level.
**Recommendation**: For future complex API states, consider implementing a `StaleWhileRevalidate` strategy (e.g., using React Query or Workbox for service workers) or simple timestamp-based cache invalidation directly in Zustand to avoid hammering the backend on rapid navigation.

### 2. Store Normalization
**Observation**: The stores maintain a flat, normalized state where possible, which ensures fast updates and minimizes expensive nested object cloning operations.

### 3. Error Handling and State Cleansing
**Observation**: Loading and error states are correctly decoupled in stores like `authStore.js` and `superadminStore.js`. This prevents UI thrashing or unmount/remount loops (which was previously an issue during auth checking).

### General Store Best Practices
- **Do not** store derived data in Zustand if it can be cheaply computed via selectors.
- **Debounce** search API calls (e.g., in `Search.jsx`) to avoid redundant server round-trips.
- Keep the global state lean. Store UI-specific transient state (like "is modal open") locally in the component `useState`.
