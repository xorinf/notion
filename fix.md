# 🛠️ Comprehensive Codebase Audit & Memory Leak Fix Report

This document outlines a thorough memory leak, socket leak, state pollution, and resource optimization audit conducted across the Notion clone workspace. It identifies key issues, provides explanation of their potential impacts, and offers exact, drop-in code fixes.

---

## 📋 Executive Summary
While the application is performant and responsive, we identified several critical architecture-level and component-level improvement areas. These include:
- **High-Severity Leaks**: Active Socket.io connection persistence on logout, global socket connection before authentication, and sensitive Zustand state pollution across browser sessions.
- **Medium-Severity Leaks**: React component timers (`setTimeout`) leaking on unmount, and orphan media assets lingering in Cloudinary cloud storage after attachment/card deletions.
- **Low-Severity/Resiliency Improvements**: Mongoose connection resilience event listeners.

Addressing these issues will ensure high security, low memory usage, and superior performance for all users.

---

## 🔍 Issue Catalog

### 1. Persistent Socket.io Connection on Logout (High Severity)
* **Category**: Memory & Network Resource Leak
* **Affected Files**: 
  - [frontend/store/authStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/authStore.js)
  - [frontend/store/socketStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/socketStore.js)

#### 🛑 The Problem
When a user logs out (`logout`) or deletes their account (`deleteAccount`), the frontend removes the JWT and clears local authentication state. However, **it fails to disconnect the active Socket.io connection**. The socket remains open in the background, consuming socket file descriptors on the browser and server, and continuing to receive background updates for boards/pages.

#### 🔧 The Fix
Call `useSocket.getState().disconnect()` inside `logout` and `deleteAccount` hooks in `authStore.js`.

##### Current Code ([authStore.js:L51-63](file:///Users/yashhwanth/Documents/notion/frontend/store/authStore.js#L51-L63))
```javascript
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.get("/auth/logout", { withCredentials: true });
      // Clear token from localStorage
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: null,
      });
    } catch (err) { ... }
  }
```

##### Drop-in Fix ([authStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/authStore.js))
```javascript
  logout: async () => {
    set({ loading: true, error: null });
    try {
      // Disconnect socket connection on logout to prevent socket leak
      const { useSocket } = await import("./socketStore.js");
      useSocket.getState().disconnect();

      await axios.get("/auth/logout", { withCredentials: true });
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: null,
      });
    } catch (err) {
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Logout failed",
      });
    }
  }
```
*(Apply the same dynamic import and disconnect call inside `deleteAccount` at line 123).*

---

### 2. Immediate Global Socket Connection at Boot (High Severity)
* **Category**: Resource Utilization & Security Leak
* **Affected File**: [frontend/src/main.jsx](file:///Users/yashhwanth/Documents/notion/frontend/src/main.jsx)

#### 🛑 The Problem
`main.jsx` runs `useSocket.getState().connect()` immediately on application boot, regardless of whether a user is logged in. This initiates connection handshakes for unauthorized users, creating unnecessary connection overhead on the server and throwing authentication errors in browser consoles.

#### 🔧 The Fix
Remove the immediate connection in `main.jsx`. Instead, connect **after** a user is verified in `checkAuth` or logs in, aligning with the "lazily connect" strategy.

##### Current Code ([main.jsx:L11-13](file:///Users/yashhwanth/Documents/notion/frontend/src/main.jsx#L11-L13))
```javascript
// Initialize socket connection lazily (will connect when user logs in)
import { useSocket } from '../store/socketStore.js'
useSocket.getState().connect()
```

##### Drop-in Fix ([main.jsx](file:///Users/yashhwanth/Documents/notion/frontend/src/main.jsx))
```javascript
// Remove immediate connection from main.jsx completely.
// Instead, update authStore.js to connect sockets on successful authentication:
```
##### And update [authStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/authStore.js):
```javascript
  // inside login:
  login: async (userCred) => {
    ...
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    set({
      loading: false,
      isAuthenticated: true,
      currentUser: res.data.payload,
      error: null,
    });
    // Lazily connect socket upon successful login
    const { useSocket } = await import("./socketStore.js");
    useSocket.getState().connect();
    return res.data;
  },
  
  // inside checkAuth:
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await axios.get("/auth/check-auth", { withCredentials: true });
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      // Lazily connect socket on successful session restoration
      const { useSocket } = await import("./socketStore.js");
      useSocket.getState().connect();
    } catch (err) { ... }
  }
```

---

### 3. sensitive Zustand State Persistence on Logout (High Severity)
* **Category**: State Pollution / Security Leak
* **Affected Files**: All frontend Zustand stores (`boardStore.js`, `workspaceStore.js`, `pageStore.js`, `notificationStore.js`, etc.)

#### 🛑 The Problem
Zustand stores are kept in-memory globally. When a user logs out, only the `authStore` is updated. Other stores (such as `useBoard`, `useWorkspace`, `usePage`, etc.) still retain all boards, workspaces, and pages in memory. If a new user logs in on the same browser session without refreshing, they will briefly see the previous user's data until they are re-fetched.

#### 🔧 The Fix
Add a `reset` or `clear` function to each store, and call them inside the logout process.

##### Drop-in Fix Structure
Add a reset method to stores, for example, in [boardStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/boardStore.js):
```javascript
const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

export const useBoard = create((set, get) => ({
  ...initialState,
  
  reset: () => set(initialState),
  // other functions...
}));
```
Then, update [authStore.js](file:///Users/yashhwanth/Documents/notion/frontend/store/authStore.js) to call these resets on logout:
```javascript
  logout: async () => {
    ...
    // Clear all Zustand states
    try {
      const { useBoard } = await import("./boardStore.js");
      const { useWorkspace } = await import("./workspaceStore.js");
      const { usePage } = await import("./pageStore.js");
      
      useBoard.getState().reset();
      useWorkspace.getState().reset();
      usePage.getState().reset();
    } catch (e) {
      console.error("Store reset failed:", e);
    }
  }
```

---

### 4. Uncleaned React Component Timers (Medium Severity)
* **Category**: Memory Leak / State Updates on Unmounted Components
* **Affected Files**: 
  - [frontend/src/components/InviteHandler.jsx](file:///Users/yashhwanth/Documents/notion/frontend/src/components/InviteHandler.jsx)
  - [frontend/src/components/Superadmin.jsx](file:///Users/yashhwanth/Documents/notion/frontend/src/components/Superadmin.jsx)

#### 🛑 The Problem
In `InviteHandler.jsx`, when accepting or declining invitations, a `setTimeout` redirects the user after 2000ms. If the user closes the tab or navigates away before the timeout completes, the timer is still active and attempts to call `navigate()`, which leads to memory warnings and unexpected router transitions. In `Superadmin.jsx`, toast dismissals create timers that can pile up.

#### 🔧 The Fix
Store the timeout IDs and clear them on component unmount in `useEffect` or via standard cleanup patterns.

##### Current Code ([InviteHandler.jsx:L54-56](file:///Users/yashhwanth/Documents/notion/frontend/src/components/InviteHandler.jsx#L54-L56))
```javascript
      setTimeout(() => {
        navigate(`/dashboard/workspace/${invite.workspace._id}`)
      }, 2000)
```

##### Drop-in Fix ([InviteHandler.jsx](file:///Users/yashhwanth/Documents/notion/frontend/src/components/InviteHandler.jsx))
```javascript
  // Add a ref to store timeouts
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAccept = async () => {
    try {
      setActionLoading(true)
      await acceptInviteStore(token)
      setSuccessMessage(`Successfully joined ${invite.workspace.name}!`)
      
      timerRef.current = setTimeout(() => {
        navigate(`/dashboard/workspace/${invite.workspace._id}`)
      }, 2000)
    } catch (err) { ... }
  };
```

---

### 5. Orphan Cloudinary Assets Leak (Medium Severity)
* **Category**: Cloud Storage Bloat / Resource Leak
* **Affected Files**: 
  - [backend/API/cardAPI.js](file:///Users/yashhwanth/Documents/notion/backend/API/cardAPI.js)
  - [backend/API/attachmentAPI.js](file:///Users/yashhwanth/Documents/notion/backend/API/attachmentAPI.js)

#### 🛑 The Problem
When a user deletes a card attachment or updates a card cover, the attachment document is deleted from MongoDB, but the actual file in Cloudinary is **never deleted**. This leaves orphaned media assets in Cloudinary storage, bloating cloud costs and storage usage.

#### 🔧 The Fix
Implement a Cloudinary deletion utility inside [backend/config/cloudinaryUpload.js](file:///Users/yashhwanth/Documents/notion/backend/config/cloudinaryUpload.js) and call it when deleting attachments or covers.

##### Drop-in Fix Deletion Utility ([backend/config/cloudinaryUpload.js](file:///Users/yashhwanth/Documents/notion/backend/config/cloudinaryUpload.js))
```javascript
import cloudinary from "./cloudinary.js";

// Utility to extract public_id from secure URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const folderIndex = parts.indexOf('notion-data');
  if (folderIndex !== -1) {
    const filenameWithExtension = parts.slice(folderIndex).join('/');
    return filenameWithExtension.split('.')[0]; // remove file extension
  }
  return null;
};

export const deleteFromCloudinary = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
};
```

##### Usage inside deletion routes ([backend/API/cardAPI.js](file:///Users/yashhwanth/Documents/notion/backend/API/cardAPI.js)):
```javascript
import { deleteFromCloudinary } from '../config/cloudinaryUpload.js';

cardAPP.delete("/:id/attachments/:attachmentId", verifyToken(), async (request, response, next) => {
    try {
        const attachment = await attachmentModel.findById(request.params.attachmentId);
        if (attachment?.url) {
            // Delete from Cloudinary to prevent asset leakage
            await deleteFromCloudinary(attachment.url);
        }

        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { attachments: request.params.attachmentId } }
        );
        await attachmentModel.findByIdAndDelete(request.params.attachmentId);
        response.status(200).json({ message: "Attachment deleted" });
    } catch (error) { next(error) }
});
```

---

### 6. Mongoose Connection Resiliency Event Listeners (Low Severity)
* **Category**: Infrastructure Resiliency
* **Affected File**: [backend/server.js](file:///Users/yashhwanth/Documents/notion/backend/server.js)

#### 🛑 The Problem
`server.js` connects to MongoDB using Mongoose, but does not subscribe to connection lifecycle events. If the database crashes or disconnects temporarily, Mongoose will try to reconnect, but the application will not log or handle these states, making connection diagnostics difficult.

#### 🔧 The Fix
Subscribe to connection lifecycle event listeners before connecting.

##### Drop-in Fix ([backend/server.js](file:///Users/yashhwanth/Documents/notion/backend/server.js))
```javascript
import mongoose from 'mongoose';

// Subscribe to connection logs
mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected from DB'));

// db connect + start
try {
  await mongoose.connect(db_address);
  ...
} catch (err) { ... }
```

---

## 💡 Developer Guidelines & Checklist
Follow these guidelines to prevent introducing memory leaks in future iterations of this app:
1. **Always clean up timers**: Any `setTimeout` or `setInterval` in a React component must return a cleanup function (`clearTimeout`/`clearInterval`) in its `useEffect`.
2. **Always clean up global event listeners**: Any listener bound to `window` or `document` inside `useEffect` must be removed in the cleanup return.
3. **Always disconnect sockets on logout**: Any persistent socket connection must be terminated cleanly upon user logout or account deletion.
4. **Reset global state stores**: Clear all global states (Zustand, Redux, etc.) when the active session changes to prevent cross-session state pollution.
5. **Always clean up external resources**: When deleting user-uploaded files, ensure you clean up their files in storage (Cloudinary, AWS S3) as well as the MongoDB records.
