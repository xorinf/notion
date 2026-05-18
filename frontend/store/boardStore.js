import { create } from "zustand";
import axios from "axios";

export const useBoard = create((set, get) => ({
  boards: [],           // all boards for the active workspace
  currentBoard: null,   // single board (with lists + cards) when user opens one
  loading: false,
  error: null,

  fetchBoards: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/board?workspace=${workspaceId}`, {
        withCredentials: true,
      });
      set({
        boards: res.data.payload || [],
        loading: false,
      });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch boards",
        loading: false,
      });
    }
  },

  
  getBoardById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/board/${id}`, {
        withCredentials: true,
      });
      set({
        currentBoard: res.data.payload,
        loading: false,
      });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch board",
        loading: false,
      });
    }
  },

  
  createBoard: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/board", data, {
        withCredentials: true,
      });
      const newBoard = res.data.payload;
      set((state) => ({
        boards: [newBoard, ...state.boards],
        loading: false,
      }));
      return newBoard;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create board",
        loading: false,
      });
      throw err;
    }
  },


  updateBoard: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/board/${id}`, data, {
        withCredentials: true,
      });
      const updatedBoard = res.data.payload;
      set((state) => ({
        boards: state.boards.map((b) => (b._id === id ? updatedBoard : b)),
        currentBoard:
          state.currentBoard?._id === id ? updatedBoard : state.currentBoard,
        loading: false,
      }));
      return updatedBoard;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update board",
        loading: false,
      });
      throw err;
    }
  },

  
  deleteBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/board/${id}`, { withCredentials: true });
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard:
          state.currentBoard?._id === id ? null : state.currentBoard,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete board",
        loading: false,
      });
      throw err;
    }
  },

  
  setCurrentBoard: (board) => set({ currentBoard: board }),
  clearError: () => set({ error: null }),
}));
