import { create } from 'zustand';
import axios from 'axios';

export const useSuperadmin = create((set) => ({
  stats: null,
  users: [],
  loading: false,
  error: null,

  getStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/superadmin/stats', { withCredentials: true });
      set({ loading: false, stats: res.data.payload });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load stats' });
      throw err;
    }
  },

  getUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/superadmin/users', { withCredentials: true });
      set({ loading: false, users: res.data.payload });
      return res.data.payload;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load users' });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/superadmin/users/${id}`, { withCredentials: true });
      set((state) => ({
        loading: false,
        users: state.users.filter((u) => u._id !== id),
        stats: state.stats
          ? { ...state.stats, users: Math.max(0, state.stats.users - 1) }
          : state.stats,
      }));
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to delete user' });
      throw err;
    }
  },

  clearAllCollections: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post('/superadmin/clear-all', {}, { withCredentials: true });
      set({
        loading: false,
        users: [],
        stats: { users: 1, workspaces: 0, boards: 0, pages: 0, cards: 0, lists: 0, invites: 0 },
      });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to clear collections' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
