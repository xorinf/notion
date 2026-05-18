import { create } from "zustand";
import axios from "axios";

export const useCard = create((set, get) => ({
  currentCard: null,
  loading: false,
  error: null,

  //get card with populated members & comments
  getCardById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/card/${id}`, {
        withCredentials: true,
      });
      set({
        currentCard: res.data.payload,
        loading: false,
      });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch card",
        loading: false,
      });
    }
  },

  //create a new card in a list
  createCard: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/card", data, {
        withCredentials: true,
      });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create card",
        loading: false,
      });
      throw err;
    }
  },

  //update card fields
  updateCard: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/card/${id}`, data, {
        withCredentials: true,
      });
      const updatedCard = res.data.payload;
      set({
        currentCard: updatedCard,
        loading: false,
      });
      return updatedCard;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update card",
        loading: false,
      });
      throw err;
    }
  },

  //delete card (backend also removes from list.cards[])
  deleteCard: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/card/${id}`, { withCredentials: true });
      set({
        currentCard: null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete card",
        loading: false,
      });
      throw err;
    }
  },

  setCurrentCard: (card) => set({ currentCard: card }),
  clearError: () => set({ error: null }),
}));
