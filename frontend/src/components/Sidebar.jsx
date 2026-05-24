/**
 * @file Sidebar.jsx
 * @module Sidebar
 * @description React component for Sidebar. Handles UI rendering, local state, and event interactions.
 */

import { NavLink, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  User,
  Search,
  CheckSquare,
  BookOpen,
  LogOut,
  Feather,
  Loader2,
  Plus,
  Bell,
  ChevronDown,
  ChevronRight,
  FileText,
  Briefcase,
  Hash,
  Star,
} from 'lucide-react'
import { useAuth } from '../../store/authStore'
import { useWorkspace } from '../../store/workspaceStore'
import { usePage } from '../../store/pageStore'
import { useNotification } from '../../store/notificationStore'

function Sidebar() {
  const navigate = useNavigate()
  const logout = useAuth((state) => state.logout)
  const authLoading = useAuth((state) => state.loading)
  const currentUser = useAuth((state) => state.currentUser)
  const fetchStarred = useAuth((state) => state.fetchStarred)

  const workspaces = useWorkspace((state) => state.workspaces)
  const fetchWorkspaces = useWorkspace((state) => state.fetchWorkspaces)
  const createWorkspace = useWorkspace((state) => state.createWorkspace)
  const loading = useWorkspace((state) => state.loading)

  const fetchPages = usePage((state) => state.fetchPages)

  const unreadCount = useNotification((state) => state.unreadCount)
  const getUnreadCount = useNotification((state) => state.getUnreadCount)

  // Expanded state per workspace: { [wsId]: boolean }
  const [expandedWs, setExpandedWs] = useState({})
  // Pages per workspace: { [wsId]: Page[] }
  const [wsPages, setWsPages] = useState({})
  const [loadingPages, setLoadingPages] = useState({})

  const [showNewInput, setShowNewInput] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [selectedPageId, setSelectedPageId] = useState(null)
  const [selectedWsId, setSelectedWsId] = useState(null)
  const starredItems = useAuth((state) => state.starredItems)

  useEffect(() => {
    getUnreadCount()
    fetchWorkspaces()
    fetchStarred()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    await createWorkspace({ name: newWsName, description: 'New workspace', icon: '📁' })
    setNewWsName('')
    setShowNewInput(false)
  }

  const toggleWorkspace = async (wsId) => {
    const isOpen = expandedWs[wsId]
    setExpandedWs(prev => ({ ...prev, [wsId]: !isOpen }))

    // Lazy-load pages for this workspace
    if (!isOpen && !wsPages[wsId]) {
      setLoadingPages(prev => ({ ...prev, [wsId]: true }))
      try {
        await fetchPages(wsId)
        const pageState = usePage.getState().pages
        setWsPages(prev => ({ ...prev, [wsId]: pageState }))
      } catch (e) {
        setWsPages(prev => ({ ...prev, [wsId]: [] }))
      } finally {
        setLoadingPages(prev => ({ ...prev, [wsId]: false }))
      }
    }
  }

  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-[#9ba3af] hover:bg-white/6 hover:text-white font-normal'
    }`

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[#191919] flex flex-col select-none">
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 h-[52px] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <Feather className="w-3.5 h-3.5 text-[#191919]" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Taskify</span>
        </div>
        <NavLink
          to="/dashboard/notifications"
          className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4 text-[#9ba3af]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff3b30] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      </div>

      {/* User section */}
      {currentUser && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-full bg-[#1a73e8]/80 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.firstName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[0.65rem] text-[#6b7280] truncate">{currentUser.email}</p>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        {/* Quick links */}
        <NavLink to="/dashboard/dashboardhome" className={navLinkCls}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Home
        </NavLink>
        <NavLink to="/dashboard/search" className={navLinkCls}>
          <Search className="w-4 h-4 shrink-0" />
          Search
        </NavLink>
        <NavLink to="/dashboard/page" className={navLinkCls}>
          <FileText className="w-4 h-4 shrink-0" />
          All Pages
        </NavLink>
        <NavLink to="/dashboard/task" className={navLinkCls}>
          <CheckSquare className="w-4 h-4 shrink-0" />
          My Tasks
        </NavLink>
        <NavLink to="/dashboard/journal" className={navLinkCls}>
          <BookOpen className="w-4 h-4 shrink-0" />
          Journal
        </NavLink>
        <NavLink to="/dashboard/profile" className={navLinkCls}>
          <User className="w-4 h-4 shrink-0" />
          Profile
        </NavLink>

        {/* Favorites / Starred Section */}
        {(starredItems.starredPages?.length > 0 || starredItems.starredBoards?.length > 0) && (
          <div className="mt-5 mb-2">
            <div className="px-3 py-1 flex items-center justify-between text-[10px] font-semibold text-[#6b7280] tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Favorites
              </span>
            </div>
            <div className="space-y-0.5 mt-1 px-1">
              {starredItems.starredPages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => navigate(`/dashboard/workspace/${page.workspace}?pageId=${page._id}`)}
                  className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-[#9ba3af] hover:text-white hover:bg-white/8 transition-all text-left"
                >
                  <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                  <span className="text-xs truncate font-medium">{page.title || 'Untitled Page'}</span>
                </button>
              ))}
              {starredItems.starredBoards.map((board) => (
                <button
                  key={board._id}
                  onClick={() => navigate(`/dashboard/board/${board._id}`)}
                  className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-[#9ba3af] hover:text-white hover:bg-white/8 transition-all text-left"
                >
                  <span className="text-sm shrink-0">📋</span>
                  <span className="text-xs truncate font-medium">{board.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Section */}
        <div className="mt-5 mb-1 px-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#6b7280] tracking-widest uppercase">
            Workspaces
          </span>
          <button
            onClick={() => setShowNewInput(!showNewInput)}
            className="p-0.5 hover:text-white text-[#6b7280] transition-colors rounded"
            title="New workspace"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Workspace Input */}
        {showNewInput && (
          <form onSubmit={handleCreateWorkspace} className="px-2 mb-2 flex flex-col gap-1.5">
            <input
              type="text"
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name…"
              className="w-full text-xs px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-[#6b7280] border border-white/[0.12] focus:outline-none focus:border-[#1a73e8] transition-colors"
              disabled={loading}
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={loading}
                className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg hover:bg-[#1558b0] disabled:opacity-50 transition-colors flex-1"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowNewInput(false); setNewWsName('') }}
                className="text-xs text-[#6b7280] px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Workspace list with collapsible pages */}
        {workspaces.map((ws) => (
          <div key={ws._id}>
            {/* Workspace row */}
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => toggleWorkspace(ws._id)}
                className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg hover:bg-white/8 text-[#9ba3af] hover:text-white transition-all"
              >
                <div className="shrink-0 w-4 flex items-center justify-center">
                  {loadingPages[ws._id] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : expandedWs[ws._id] ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>
                <span className="text-base">{ws.icon || '📁'}</span>
                <span className="text-xs truncate font-medium">{ws.name}</span>
              </button>
              {/* Go to workspace */}
              <button
                onClick={() => navigate(`/dashboard/workspace/${ws._id}`)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-[#6b7280] hover:text-white transition-all shrink-0"
                title="Open workspace"
              >
                <Briefcase className="w-3 h-3" />
              </button>
            </div>

            {/* Pages list */}
            {expandedWs[ws._id] && (
              <div className="ml-6 mt-0.5 space-y-0.5 mb-1">
                {wsPages[ws._id]?.length === 0 ? (
                  <p className="text-[10px] text-[#4b5563] px-3 py-1.5 italic">No pages yet</p>
                ) : (
                  wsPages[ws._id]?.map((page) => (
                    <button
                      key={page._id}
                      onClick={() => navigate(`/dashboard/workspace/${ws._id}?pageId=${page._id}`)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/8 transition-all text-left"
                    >
                      <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                      <span className="text-xs truncate">{page.title || 'Untitled'}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          disabled={authLoading}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authLoading ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 shrink-0" />
          )}
          {authLoading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar