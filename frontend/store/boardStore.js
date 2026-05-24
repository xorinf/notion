import { create } from "zustand";
import axios from "axios";

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

export const useBoard = create((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  // ── Boards ──────────────────────────────────────────────

  fetchBoards: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/board?workspace=${workspaceId}`, { withCredentials: true });
      set({ boards: res.data.payload || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch boards", loading: false });
    }
  },

  createBoard: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/board", data, { withCredentials: true });
      const newBoard = res.data.payload;
      set((state) => ({ boards: [...state.boards, newBoard], loading: false }));
      return newBoard;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create board", loading: false });
      throw err;
    }
  },

  getBoardById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/board/${id}`, { withCredentials: true });
      set({ currentBoard: res.data.payload, loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch board", loading: false });
    }
  },

  updateBoard: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/board/${id}`, data, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => ({
        boards: state.boards.map((b) => (b._id === id ? updated : b)),
        currentBoard: state.currentBoard?._id === id ? { ...state.currentBoard, ...updated } : state.currentBoard,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update board", loading: false });
      throw err;
    }
  },

  deleteBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/board/${id}`, { withCredentials: true });
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete board", loading: false });
      throw err;
    }
  },

  // ── Lists ───────────────────────────────────────────────

  createList: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/list", data, { withCredentials: true });
      const newList = { ...res.data.payload, cards: [] };
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: [...(state.currentBoard.lists || []), newList],
          },
          loading: false,
        };
      });
      return newList;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create list", loading: false });
      throw err;
    }
  },

  updateList: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/list/${id}`, data, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) =>
              l._id === id ? { ...l, ...updated } : l
            ),
          },
          loading: false,
        };
      });
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update list", loading: false });
      throw err;
    }
  },

  deleteList: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/list/${id}`, { withCredentials: true });
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.filter((l) => l._id !== id),
          },
          loading: false,
        };
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete list", loading: false });
      throw err;
    }
  },

  archiveList: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/list/${id}/archive`, {}, { withCredentials: true });
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.filter((l) => l._id !== id),
          },
          loading: false,
        };
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to archive list", loading: false });
      throw err;
    }
  },

  reorderList: async (id, position) => {
    // No loading state — optimistic update already applied in BoardView
    try {
      await axios.put(`/list/${id}/reorder`, { position }, { withCredentials: true });
    } catch (err) {
      // Rollback: re-fetch board to restore correct state
      const boardId = get().currentBoard?._id;
      if (boardId) await get().getBoardById(boardId);
      set({ error: err.response?.data?.message || "Failed to reorder list" });
    }
  },

  // ── Cards ───────────────────────────────────────────────

  createCard: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/card", data, { withCredentials: true });
      const newCard = res.data.payload;
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) =>
              l._id === data.list ? { ...l, cards: [...(l.cards || []), newCard] } : l
            ),
          },
          loading: false,
        };
      });
      return newCard;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create card", loading: false });
      throw err;
    }
  },

  updateCard: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/card/${id}`, data, { withCredentials: true });
      const updated = res.data.payload;
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) => ({
              ...l,
              cards: (l.cards || []).map((c) => (c._id === id ? { ...c, ...updated } : c)),
            })),
          },
          loading: false,
        };
      });
      return updated;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update card", loading: false });
      throw err;
    }
  },

  deleteCard: async (id, listId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/card/${id}`, { withCredentials: true });
      set((state) => {
        if (!state.currentBoard) return { loading: false };
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) =>
              l._id === listId ? { ...l, cards: (l.cards || []).filter((c) => c._id !== id) } : l
            ),
          },
          loading: false,
        };
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete card", loading: false });
      throw err;
    }
  },

  moveCard: async (id, targetList, position) => {
    // No loading state — optimistic update already applied in BoardView
    try {
      await axios.put(`/card/${id}/move`, { targetList, position }, { withCredentials: true });
    } catch (err) {
      // Rollback: re-fetch board to restore correct state
      const boardId = get().currentBoard?._id;
      if (boardId) await get().getBoardById(boardId);
      set({ error: err.response?.data?.message || "Failed to move card" });
    }
  },

  reorderCard: async (id, position) => {
    // No loading state — optimistic update already applied in BoardView
    try {
      await axios.put(`/card/${id}/reorder`, { position }, { withCredentials: true });
    } catch (err) {
      // Rollback: re-fetch board to restore correct state
      const boardId = get().currentBoard?._id;
      if (boardId) await get().getBoardById(boardId);
      set({ error: err.response?.data?.message || "Failed to reorder card" });
    }
  },

  // Card detail actions (comments, checklist, labels)
  addComment: async (cardId, text) => {
    try {
      const res = await axios.post(`/card/${cardId}/comments`, { text }, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  deleteComment: async (cardId, commentId) => {
    try {
      await axios.delete(`/card/${cardId}/comments/${commentId}`, { withCredentials: true });
    } catch (err) {
      throw err;
    }
  },

  addChecklistItem: async (cardId, text) => {
    try {
      const res = await axios.post(`/card/${cardId}/checklist`, { text }, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  toggleChecklistItem: async (cardId, itemId, completed) => {
    try {
      const res = await axios.put(`/card/${cardId}/checklist/${itemId}`, { completed }, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  deleteChecklistItem: async (cardId, itemId) => {
    try {
      await axios.delete(`/card/${cardId}/checklist/${itemId}`, { withCredentials: true });
    } catch (err) {
      throw err;
    }
  },

  addLabel: async (cardId, name, color) => {
    try {
      const res = await axios.post(`/card/${cardId}/labels`, { name, color }, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  removeLabel: async (cardId, labelId) => {
    try {
      await axios.delete(`/card/${cardId}/labels/${labelId}`, { withCredentials: true });
    } catch (err) {
      throw err;
    }
  },

  // ── Attachments ─────────────────────────────────────────

  uploadAttachment: async (cardId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`/card/${cardId}/attachments`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  deleteAttachment: async (attachmentId) => {
    try {
      await axios.delete(`/attachment/${attachmentId}`, { withCredentials: true });
    } catch (err) {
      throw err;
    }
  },

  // ── Board Archive / Unarchive ──────────────────────────

  archiveBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/board/${id}/archive`, {}, { withCredentials: true });
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to archive board", loading: false });
      throw err;
    }
  },

  unarchiveBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/board/${id}/unarchive`, {}, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to unarchive board", loading: false });
      throw err;
    }
  },

  // ── Board Members ──────────────────────────────────────

  addBoardMember: async (boardId, userId, role = "EDIT") => {
    try {
      const res = await axios.post(`/board/${boardId}/members`, { userId, role }, { withCredentials: true });
      set((state) => ({
        currentBoard: state.currentBoard?._id === boardId ? res.data.payload : state.currentBoard,
      }));
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  updateBoardMemberRole: async (boardId, userId, role) => {
    try {
      const res = await axios.put(`/board/${boardId}/members/${userId}`, { role }, { withCredentials: true });
      set((state) => ({
        currentBoard: state.currentBoard?._id === boardId ? res.data.payload : state.currentBoard,
      }));
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  removeBoardMember: async (boardId, userId) => {
    try {
      const res = await axios.delete(`/board/${boardId}/members/${userId}`, { withCredentials: true });
      set((state) => ({
        currentBoard: state.currentBoard?._id === boardId ? res.data.payload : state.currentBoard,
      }));
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  // ── Board Templates ────────────────────────────────────

  saveAsTemplate: async (boardId) => {
    try {
      const res = await axios.post(`/board/${boardId}/save-template`, {}, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  createFromTemplate: async (templateId, title, workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/board/from-template", { templateId, title, workspace: workspaceId }, { withCredentials: true });
      const newBoard = res.data.payload;
      set((state) => ({ boards: [...state.boards, newBoard], loading: false }));
      return newBoard;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create from template", loading: false });
      throw err;
    }
  },

  getTemplates: async (workspaceId) => {
    try {
      const res = await axios.get(`/board/templates?workspace=${workspaceId}`, { withCredentials: true });
      return res.data.payload || [];
    } catch (err) {
      throw err;
    }
  },

  // ── Card Complete / Incomplete ─────────────────────────

  completeCard: async (cardId) => {
    try {
      const res = await axios.put(`/card/${cardId}/complete`, {}, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  incompleteCard: async (cardId) => {
    try {
      const res = await axios.put(`/card/${cardId}/incomplete`, {}, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  // ── Card Archive / Unarchive ───────────────────────────

  archiveCard: async (cardId) => {
    try {
      const res = await axios.put(`/card/${cardId}/archive`, {}, { withCredentials: true });
      // Remove from current board view
      const boardId = get().currentBoard?._id;
      if (boardId) await get().getBoardById(boardId);
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  unarchiveCard: async (cardId) => {
    try {
      const res = await axios.put(`/card/${cardId}/unarchive`, {}, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  // ── Card Members ───────────────────────────────────────

  assignCardMember: async (cardId, userId) => {
    try {
      const res = await axios.post(`/card/${cardId}/members`, { userId }, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  removeCardMember: async (cardId, userId) => {
    try {
      const res = await axios.delete(`/card/${cardId}/members/${userId}`, { withCredentials: true });
      return res.data.payload;
    } catch (err) {
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
}));
