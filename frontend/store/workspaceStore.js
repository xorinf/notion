import { create } from "zustand";
import axios from "axios";

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

export const useWorkspace = create((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/workspace", { withCredentials: true });
      set({
        workspaces: res.data.payload || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch workspaces",
        loading: false,
      });
    }
  },

  getWorkspaceById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/workspace/${id}`, { withCredentials: true });
      set({
        currentWorkspace: res.data.payload,
        loading: false,
      });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch workspace",
        loading: false,
      });
    }
  },

  createWorkspace: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/workspace", data, { withCredentials: true });
      const newWorkspace = res.data.payload;
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        loading: false,
      }));
      return newWorkspace;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create workspace",
        loading: false,
      });
      throw err;
    }
  },

  updateWorkspace: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/workspace/${id}`, data, { withCredentials: true });
      const updatedWorkspace = res.data.payload;
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w._id === id ? updatedWorkspace : w)),
        currentWorkspace: state.currentWorkspace?._id === id ? updatedWorkspace : state.currentWorkspace,
        loading: false,
      }));
      return updatedWorkspace;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update workspace",
        loading: false,
      });
      throw err;
    }
  },

  deleteWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/workspace/${id}`, { withCredentials: true });
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w._id !== id),
        currentWorkspace: state.currentWorkspace?._id === id ? null : state.currentWorkspace,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete workspace",
        loading: false,
      });
      throw err;
    }
  },

  addMember: async (workspaceId, userId, role = "MEMBER") => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`/workspace/${workspaceId}/members`, { userId, role }, { withCredentials: true });
      const updatedWorkspace = res.data.payload;
      set((state) => ({
        currentWorkspace: updatedWorkspace,
        workspaces: state.workspaces.map((w) => (w._id === workspaceId ? updatedWorkspace : w)),
        loading: false,
      }));
      return updatedWorkspace;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add member",
        loading: false,
      });
      throw err;
    }
  },

  updateMemberRole: async (workspaceId, userId, role) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/workspace/${workspaceId}/members/${userId}`, { role }, { withCredentials: true });
      const updatedWorkspace = res.data.payload;
      set((state) => ({
        currentWorkspace: updatedWorkspace,
        workspaces: state.workspaces.map((w) => (w._id === workspaceId ? updatedWorkspace : w)),
        loading: false,
      }));
      return updatedWorkspace;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update role",
        loading: false,
      });
      throw err;
    }
  },

  removeMember: async (workspaceId, userId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`/workspace/${workspaceId}/members/${userId}`, { withCredentials: true });
      const updatedWorkspace = res.data.payload;
      set((state) => ({
        currentWorkspace: updatedWorkspace,
        workspaces: state.workspaces.map((w) => (w._id === workspaceId ? updatedWorkspace : w)),
        loading: false,
      }));
      return updatedWorkspace;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to remove member",
        loading: false,
      });
      throw err;
    }
  },

  fetchWorkspaceActivity: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/workspace/${workspaceId}/activity`, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch activity",
        loading: false,
      });
      throw err;
    }
  },

  // ── Invites ───────────────────────────────────────────────

  sendInvite: async (workspaceId, email, role = "MEMBER") => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/invite", { workspace: workspaceId, email, role }, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to send invite", loading: false });
      throw err;
    }
  },

  fetchPendingInvites: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/invite?workspace=${workspaceId}`, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch pending invites", loading: false });
      throw err;
    }
  },

  acceptInvite: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`/invite/accept/${token}`, {}, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to accept invite", loading: false });
      throw err;
    }
  },

  declineInvite: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`/invite/decline/${token}`, {}, { withCredentials: true });
      set({ loading: false });
      return res.data.payload;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to decline invite", loading: false });
      throw err;
    }
  },

  cancelInvite: async (inviteId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/invite/${inviteId}`, { withCredentials: true });
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to cancel invite", loading: false });
      throw err;
    }
  },

  resendInvite: async (inviteId) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`/invite/${inviteId}/resend`, {}, { withCredentials: true });
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to resend invite", loading: false });
      throw err;
    }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  clearError: () => set({ error: null }),
}));
