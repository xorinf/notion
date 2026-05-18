import { create } from "zustand";
import axios from "axios";

export const useList = create((set, get) => ({
  lists: [],
  loading: false,
  error: null,

  // fetch all lists for a board
  fetchLists: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/list?board=${boardId}`, {
        withCredentials: true,
      });
      set({
        lists: res.data.payload || [],
        loading: false,
      });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch lists",
        loading: false,
      });
    }
  },

  // create a new list in a board
  createList: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/list", data, {
        withCredentials: true,
      });
      const newList = res.data.payload;
      set((state) => ({
        lists: [...state.lists, newList],
        loading: false,
      }));
      return newList;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create list",
        loading: false,
      });
      throw err;
    }
  },

  // update list title
  updateList: async (id, title) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/list/${id}`, { title }, {
        withCredentials: true,
      });
      const updatedList = res.data.payload;
      set((state) => ({
        lists: state.lists.map((l) => (l._id === id ? updatedList : l)),
        loading: false,
      }));
      return updatedList;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update list",
        loading: false,
      });
      throw err;
    }
  },

  //delete a list
  deleteList: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/list/${id}`, { withCredentials: true });
      set((state) => ({
        lists: state.lists.filter((l) => l._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete list",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
