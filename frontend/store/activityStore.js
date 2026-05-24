/**
 * @file activityStore.js
 * @module activityStore
 * @description Zustand global state store for activityStore. Manages React state and API integrations.
 */

import { create } from "zustand";
import axios from "axios";

const initialState = {
  activities: [],
  myActivities: [],
  loading: false,
  error: null,
};

export const useActivity = create((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchWorkspaceActivity: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/activity?workspace=${workspaceId}`, { withCredentials: true });
      set({ activities: res.data.payload || [], loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch activities", loading: false });
    }
  },

  fetchEntityActivity: async (workspaceId, entityType, entityId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/activity?workspace=${workspaceId}&entityType=${entityType}&entityId=${entityId}`, { withCredentials: true });
      set({ activities: res.data.payload || [], loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch entity activities", loading: false });
    }
  },

  fetchMyActivity: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/activity/me`, { withCredentials: true });
      set({ myActivities: res.data.payload || [], loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch personal activities", loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
