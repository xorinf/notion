import { create } from 'zustand'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6767'

const useSocket = create((set, get) => ({
  socket: null,
  connected: false,
  currentBoardId: null,
  currentPageId: null,

  /**
   * Connect to socket server
   */
  connect: () => {
    if (get().socket?.connected) return

    const socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      set({ connected: true })
      // Rejoin rooms after reconnect
      const { currentBoardId, currentPageId } = get()
      if (currentBoardId) socket.emit('join-board', currentBoardId)
      if (currentPageId) socket.emit('join-page', currentPageId)
    })

    socket.on('disconnect', () => {
      set({ connected: false })
    })

    set({ socket })
  },

  /**
   * Disconnect from socket server
   */
  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false, currentBoardId: null, currentPageId: null })
    }
  },

  /**
   * Join a board room for real-time updates
   */
  joinBoard: (boardId) => {
    const { socket } = get()
    if (socket && boardId) {
      socket.emit('join-board', boardId)
      set({ currentBoardId: boardId })
    }
  },

  /**
   * Leave a board room
   */
  leaveBoard: (boardId) => {
    const { socket } = get()
    if (socket && boardId) {
      socket.emit('leave-board', boardId)
      set({ currentBoardId: null })
    }
  },

  /**
   * Join a page room for real-time presence
   */
  joinPage: (pageId) => {
    const { socket } = get()
    if (socket && pageId) {
      socket.emit('join-page', pageId)
      set({ currentPageId: pageId })
    }
  },

  /**
   * Leave a page room
   */
  leavePage: (pageId) => {
    const { socket } = get()
    if (socket && pageId) {
      socket.emit('leave-page', pageId)
      set({ currentPageId: null })
    }
  },

  /**
   * Emit a card move event
   */
  emitCardMoved: ({ boardId, cardId, sourceListId, destListId, sourceIndex, destIndex }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('card-moved', { boardId, cardId, sourceListId, destListId, sourceIndex, destIndex })
    }
  },

  /**
   * Emit a card update event
   */
  emitCardUpdated: ({ boardId, cardId, updates }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('card-updated', { boardId, cardId, updates })
    }
  },

  /**
   * Emit a card created event
   */
  emitCardCreated: ({ boardId, card }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('card-created', { boardId, card })
    }
  },

  /**
   * Emit a page updated event (for presence)
   */
  emitPageUpdated: ({ pageId, userId, userName }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('page-updated', { pageId, userId, userName })
    }
  },

  /**
   * Emit a page editing event (for presence)
   */
  emitPageEditing: ({ pageId, userId, userName }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('page-editing', { pageId, userId, userName })
    }
  },

  /**
   * Emit a card deleted event
   */
  emitCardDeleted: ({ boardId, cardId, listId }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('card-deleted', { boardId, cardId, listId })
    }
  },

  /**
   * Emit a list created event
   */
  emitListCreated: ({ boardId, list }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('list-created', { boardId, list })
    }
  },

  /**
   * Emit a list updated event
   */
  emitListUpdated: ({ boardId, listId, updates }) => {
    const { socket } = get()
    if (socket) {
      socket.emit('list-updated', { boardId, listId, updates })
    }
  },
}))

export { useSocket }
