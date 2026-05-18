import { NavLink, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  CheckSquare,
  BookOpen,
  LogOut,
  Feather,
  Loader2,
  Plus,
  Briefcase,
  Bell
} from 'lucide-react'
import { useAuth } from '../../store/authStore'
import { useWorkspace } from '../../store/workspaceStore'
import { useNotification } from '../../store/notificationStore'

const links = [
  { to: '/dashboard/dashboardhome', label: 'Home', icon: LayoutDashboard },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/search', label: 'Search', icon: Search },
  { to: '/dashboard/page', label: 'Pages', icon: FileText },
  { to: '/dashboard/task', label: 'Tasks', icon: CheckSquare },
  { to: '/dashboard/journal', label: 'Journal', icon: BookOpen },
]

function Sidebar() {
  const navigate = useNavigate()
  const logout = useAuth((state) => state.logout)
  const authLoading = useAuth((state) => state.loading)
  const currentUser = useAuth((state) => state.currentUser)

  const workspaces = useWorkspace((state) => state.workspaces)
  const fetchWorkspaces = useWorkspace((state) => state.fetchWorkspaces)
  const createWorkspace = useWorkspace((state) => state.createWorkspace)
  const loading = useWorkspace((state) => state.loading)

  const unreadCount = useNotification((state) => state.unreadCount)
  const getUnreadCount = useNotification((state) => state.getUnreadCount)

  useEffect(() => {
    getUnreadCount()
  }, [getUnreadCount])

  const [showNewInput, setShowNewInput] = useState(false)
  const [newWsName, setNewWsName] = useState('')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

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

  const navCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 ${isActive
      ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
      : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] font-normal'
    }`

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-[#e8e8ed] bg-white flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-[#e8e8ed]">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[#0066cc]" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Taskify</span>
        </div>
        <NavLink to="/dashboard/notifications" className="relative p-1.5 hover:bg-[#f5f5f7] rounded-lg transition-colors">
          <Bell className="w-4 h-4 text-[#6e6e73]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff3b30] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      </div>

      {/* User pill */}
      {currentUser && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e8e8ed]">
          <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.firstName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1d1d1f] truncate">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[0.65rem] text-[#a1a1a6] truncate">{currentUser.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navCls}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Workspaces Section */}
        <div className="mt-6 mb-2 px-3 flex items-center justify-between text-xs font-semibold text-[#a1a1a6] tracking-wider uppercase">
          <span>Workspaces</span>
          <button
            onClick={() => setShowNewInput(!showNewInput)}
            className="hover:text-[#1d1d1f] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showNewInput && (
          <form onSubmit={handleCreateWorkspace} className="px-3 mb-2 flex flex-col gap-2">
            <input
              type="text"
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name..."
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-[#dadce0] focus:outline-none focus:border-[#1a73e8]"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="text-xs bg-[#1a73e8] text-white px-2 py-1 rounded hover:bg-[#1558b0] disabled:opacity-50">Save</button>
              <button type="button" onClick={() => setShowNewInput(false)} className="text-xs text-[#5f6368] px-2 py-1 hover:bg-[#f1f3f4] rounded">Cancel</button>
            </div>
          </form>
        )}

        {workspaces.map((ws) => (
          <NavLink key={ws._id} to={`/dashboard/workspace/${ws._id}`} className={navCls}>
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="truncate">{ws.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#e8e8ed]">
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          disabled={authLoading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#ff3b30] hover:bg-[#ff3b30]/5 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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