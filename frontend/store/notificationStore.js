import { create } from "zustand";
import axios from "axios";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const useNotification = create((set) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/notification", { withCredentials: true });
      set({ notifications: res.data.payload || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch notifications", loading: false });
    }
  },

  getUnreadCount: async () => {
    try {
      const res = await axios.get("/notification/unread-count", { withCredentials: true });
      set({ unreadCount: res.data.count || 0 });
    } catch (err) {
      // silent — don't block UI for badge count
    }
  },

  markAsRead: async (id) => {
    try {
      await axios.put(`/notification/${id}/read`, {}, { withCredentials: true });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put("/notification/read-all", {}, { withCredentials: true });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      // silent
    }
  },

  deleteNotification: async (id) => {
    try {
      await axios.delete(`/notification/${id}`, { withCredentials: true });
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
    } catch (err) {
      // silent
    }
  },

  clearRead: async () => {
    try {
      await axios.delete("/notification/clear-read", { withCredentials: true });
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
      }));
    } catch (err) {
      // silent
    }
  },
}));
