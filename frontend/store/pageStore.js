/**
 * @file pageStore.js
 * @module pageStore
 * @description Zustand global state store for pageStore. Manages React state and API integrations.
 */

import { create } from "zustand";
import axios from "axios";

const initialState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
};

export const usePage = create((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchPages: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/page?workspace=${workspaceId}`, { withCredentials: true });
      set({ pages: res.data.payload || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch pages", loading: false });
    }
  },

  getPageById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/page/${id}`, { withCredentials: true });
      set({ currentPage: res.data.payload, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch page", loading: false });
    }
  },

  createPage: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/page", data, { withCredentials: true });
      const newPage = res.data.payload;
      
      // If it's a top level page, we add it to the state list
      if (!data.parent) {
        set((state) => ({ pages: [...state.pages, newPage], loading: false }));
      } else {
        // If it's a sub-page, we might need to refresh the current page to show children
        set({ loading: false });
      }
      return newPage;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create page", loading: false });
      throw err;
    }
  },

  updatePage: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}`, data, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        pages: state.pages.map((p) => (p._id === id ? { ...p, ...updated } : p)),
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, ...updated } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update page", loading: false });
      throw err;
    }
  },

  updateCover: async (id, coverImage) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}/cover`, { coverImage }, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        pages: state.pages.map((p) => (p._id === id ? { ...p, coverImage: updated.coverImage } : p)),
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, coverImage: updated.coverImage } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update cover", loading: false });
      throw err;
    }
  },

  movePage: async (id, parent) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}/move`, { parent }, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, ...updated } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to move page", loading: false });
      throw err;
    }
  },

  archivePage: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}/archive`, {}, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        pages: state.pages.filter((p) => p._id !== id),
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, isArchived: true } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to archive page", loading: false });
      throw err;
    }
  },

  unarchivePage: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}/unarchive`, {}, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, isArchived: false } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to unarchive page", loading: false });
      throw err;
    }
  },

  toggleFavorite: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/page/${id}/favorite`, {}, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        pages: state.pages.map((p) => (p._id === id ? { ...p, isFavorite: updated.isFavorite } : p)),
        currentPage: state.currentPage?._id === id ? { ...state.currentPage, isFavorite: updated.isFavorite } : state.currentPage,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to toggle favorite", loading: false });
      throw err;
    }
  },

  deletePage: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/page/${id}`, { withCredentials: true });
      set((state) => ({
        pages: state.pages.filter((p) => p._id !== id),
        currentPage: state.currentPage?._id === id ? null : state.currentPage,
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete page", loading: false });
      throw err;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  clearError: () => set({ error: null }),
}));
