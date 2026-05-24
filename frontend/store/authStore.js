/**
 * @file authStore.js
 * @module authStore
 * @description Zustand global state store for authStore. Manages React state and API integrations.
 */

import { create } from "zustand";
import axios from "axios";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  starredItems: { starredBoards: [], starredPages: [] },

  login: async (userCred) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/auth/login", userCred, {
        withCredentials: true,
      });
      // Store token in localStorage for cross-domain Bearer auth
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
    } catch (err) {
      console.log("err is ", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  },

  verifyPassword: async (password) => {
    try {
      const email = useAuth.getState().currentUser?.email;
      if (!email) throw new Error("No user logged in");
      await axios.post("/auth/login", { email, password }, { withCredentials: true });
      return true;
    } catch (err) {
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      // Disconnect socket connection on logout to prevent socket leak
      const { useSocket } = await import("./socketStore.js");
      useSocket.getState().disconnect();

      // Clear all Zustand states
      try {
        const { useBoard } = await import("./boardStore.js");
        const { useWorkspace } = await import("./workspaceStore.js");
        const { usePage } = await import("./pageStore.js");
        const { useActivity } = await import("./activityStore.js");
        const { useNotification } = await import("./notificationStore.js");
        const { useSearch } = await import("./searchStore.js");
        const { useSuperadmin } = await import("./superadminStore.js");
        
        if (useBoard.getState().reset) useBoard.getState().reset();
        if (useWorkspace.getState().reset) useWorkspace.getState().reset();
        if (usePage.getState().reset) usePage.getState().reset();
        if (useActivity.getState().reset) useActivity.getState().reset();
        if (useNotification.getState().reset) useNotification.getState().reset();
        if (useSearch.getState().reset) useSearch.getState().reset();
        if (useSuperadmin.getState().reset) useSuperadmin.getState().reset();
      } catch (e) {
        console.error("Store reset failed:", e);
      }

      await axios.get("/auth/logout", { withCredentials: true });
      // Clear token from localStorage
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: null,
      });
    } catch (err) {
      // Clear token even on error
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Logout failed",
      });
    }
  },

  isCheckingAuth: true,

  // Restore login session on page refresh by verifying the httpOnly cookie
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
    } catch (err) {
      // If user is not logged in -> silently clear state and token
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        set({
          currentUser: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
        return;
      }
      // other errors
      console.error("Auth check failed:", err);
      set({ isCheckingAuth: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put("/user/me", data, { withCredentials: true });
      set({
        loading: false,
        currentUser: res.data.payload,
        error: null,
      });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to update profile",
      });
      throw err;
    }
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      // Disconnect socket connection
      const { useSocket } = await import("./socketStore.js");
      useSocket.getState().disconnect();

      // Clear all Zustand states
      try {
        const { useBoard } = await import("./boardStore.js");
        const { useWorkspace } = await import("./workspaceStore.js");
        const { usePage } = await import("./pageStore.js");
        const { useActivity } = await import("./activityStore.js");
        const { useNotification } = await import("./notificationStore.js");
        const { useSearch } = await import("./searchStore.js");
        const { useSuperadmin } = await import("./superadminStore.js");
        
        if (useBoard.getState().reset) useBoard.getState().reset();
        if (useWorkspace.getState().reset) useWorkspace.getState().reset();
        if (usePage.getState().reset) usePage.getState().reset();
        if (useActivity.getState().reset) useActivity.getState().reset();
        if (useNotification.getState().reset) useNotification.getState().reset();
        if (useSearch.getState().reset) useSearch.getState().reset();
        if (useSuperadmin.getState().reset) useSuperadmin.getState().reset();
      } catch (e) {
        console.error("Store reset failed:", e);
      }

      await axios.delete("/user/me", { withCredentials: true });
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to delete account",
      });
      throw err;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await axios.put("/user/change-password", { currentPassword, newPassword }, { withCredentials: true });
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to change password", loading: false });
      throw err;
    }
  },

  starBoard: async (boardId) => {
    try {
      const res = await axios.post(`/user/star/board/${boardId}`, {}, { withCredentials: true });
      set({ currentUser: res.data.payload });
      await useAuth.getState().fetchStarred();
    } catch (err) {
      throw err;
    }
  },

  unstarBoard: async (boardId) => {
    try {
      const res = await axios.delete(`/user/star/board/${boardId}`, { withCredentials: true });
      set({ currentUser: res.data.payload });
      await useAuth.getState().fetchStarred();
    } catch (err) {
      throw err;
    }
  },

  starPage: async (pageId) => {
    try {
      const res = await axios.post(`/user/star/page/${pageId}`, {}, { withCredentials: true });
      set({ currentUser: res.data.payload });
      await useAuth.getState().fetchStarred();
    } catch (err) {
      throw err;
    }
  },

  unstarPage: async (pageId) => {
    try {
      const res = await axios.delete(`/user/star/page/${pageId}`, { withCredentials: true });
      set({ currentUser: res.data.payload });
      await useAuth.getState().fetchStarred();
    } catch (err) {
      throw err;
    }
  },

  fetchStarred: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/user/starred", { withCredentials: true });
      const payload = res.data.payload || { starredBoards: [], starredPages: [] };
      set({ loading: false, starredItems: payload });
      return payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch starred items", loading: false });
      throw err;
    }
  },

  searchUsers: async (email) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/user/search?email=${encodeURIComponent(email)}`, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to search users",
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
