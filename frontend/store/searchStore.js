import { create } from "zustand";
import axios from "axios";

export const useSearch = create((set, get) => ({
  searchResults: [],
  loading: false,
  error: null,

  globalSearch: async (query, workspaceId, type = null) => {
    if (!query) {
      set({ searchResults: [] });
      return;
    }
    set({ loading: true, error: null });
    try {
      let url = `/search?q=${encodeURIComponent(query)}&workspace=${workspaceId}`;
      if (type) {
        url += `&type=${type}`;
      }
      const res = await axios.get(url, { withCredentials: true });
      set({ searchResults: res.data.payload || [], loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to execute search", loading: false });
    }
  },

  clearResults: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));
