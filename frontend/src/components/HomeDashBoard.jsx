import React, { useEffect, useState } from 'react'
import { useWorkspace } from '../../store/workspaceStore'
import { usePage } from '../../store/pageStore'
import { useAuth } from '../../store/authStore'
import { useNavigate } from 'react-router'
import {
  Briefcase, Plus, ChevronRight, Loader2, FileText,
  LayoutGrid, Clock, ArrowRight
} from 'lucide-react'
import { cardClass, headingClass, mutedText, primaryBtn, pageWrapper, inputClass } from '../styles/common'
import PageView from './PageView'

function HomeDashBoard() {
  const workspaces = useWorkspace((state) => state.workspaces)
  const fetchWorkspaces = useWorkspace((state) => state.fetchWorkspaces)
  const createWorkspace = useWorkspace((state) => state.createWorkspace)
  const loading = useWorkspace((state) => state.loading)

  const fetchPages = usePage((state) => state.fetchPages)
  const currentUser = useAuth((state) => state.currentUser)
  const navigate = useNavigate()

  const [showNewInput, setShowNewInput] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [recentPages, setRecentPages] = useState([])
  const [loadingPages, setLoadingPages] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  useEffect(() => {
    if (workspaces.length === 0) return
    const loadRecentPages = async () => {
      setLoadingPages(true)
      const all = []
      for (const ws of workspaces.slice(0, 4)) {
        try {
          await fetchPages(ws._id)
          const pages = usePage.getState().pages
          all.push(...pages.map(p => ({ ...p, workspaceName: ws.name, workspaceId: ws._id, workspaceIcon: ws.icon })))
        } catch (e) { /* skip */ }
      }
      all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      setRecentPages(all.slice(0, 6))
      setLoadingPages(false)
    }
    loadRecentPages()
  }, [workspaces])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    await createWorkspace({ name: newWsName, description: 'New workspace', icon: '📁' })
    setNewWsName('')
    setShowNewInput(false)
  }

  if (selectedPage) {
    return (
      <PageView
        workspaceId={selectedPage.workspaceId}
        pageId={selectedPage._id}
        onBack={() => setSelectedPage(null)}
      />
    )
  }

  return (
    <div className={`${pageWrapper} w-full max-w-5xl mx-auto`}>
      {/* Greeting banner */}
      <div className="mb-10 bg-[#191919] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {getGreeting()}, {currentUser?.firstName || 'there'}!
        </h1>
        <p className="text-white/55 text-sm">
          Your Taskify workspace. Create pages, manage boards, and collaborate.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/dashboard/page')}
            className="flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" /> New Page
          </button>
          <button
            onClick={() => navigate('/dashboard/task')}
            className="flex items-center gap-2 bg-white/8 hover:bg-white/16 text-white/80 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <LayoutGrid className="w-4 h-4" /> My Tasks
          </button>
        </div>
      </div>

      {/* Recent Pages */}
      {recentPages.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[#5f6368] uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recently Edited
            </h2>
            <button
              onClick={() => navigate('/dashboard/page')}
              className="text-xs text-[#1a73e8] hover:text-[#1558b0] flex items-center gap-1 font-medium transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPages.map(page => (
              <button
                key={page._id}
                onClick={() => setSelectedPage(page)}
                className="text-left bg-white rounded-xl border border-[#e8e8ed] p-4 hover:border-[#1a73e8]/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{page.icon || '📄'}</span>
                  <span className="text-sm font-medium text-[#1d1d1f] truncate">
                    {page.title || 'Untitled'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{page.workspaceIcon || '📁'}</span>
                  <span className="text-xs text-[#80868b] truncate">{page.workspaceName}</span>
                </div>
                <p className="text-[10px] text-[#a1a1a6] mt-2">
                  {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workspaces section */}
      <div className="flex items-center justify-between mb-5">
        <h2 className={headingClass}>Your Workspaces</h2>
        {!showNewInput && (
          <button onClick={() => setShowNewInput(true)} className={primaryBtn}>
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        )}
      </div>

      {showNewInput && (
        <form
          onSubmit={handleCreateWorkspace}
          className="bg-white rounded-2xl border border-[#dadce0] p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Create new workspace</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name"
              className={`${inputClass} flex-1`}
              disabled={loading}
            />
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewInput(false)}
              className="px-4 py-2 text-sm text-[#5f6368] hover:bg-[#f1f3f4] rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {workspaces.length === 0 && !showNewInput ? (
        <div className="bg-[#f8f9fa] rounded-2xl p-12 text-center border border-dashed border-[#dadce0]">
          <div className="w-14 h-14 bg-white border border-[#dadce0] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-[#5f6368]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No workspaces yet</h3>
          <p className="text-sm text-[#5f6368] mb-6 max-w-sm mx-auto">
            Create a workspace to start organizing projects, tasks, and pages with your team.
          </p>
          <button onClick={() => setShowNewInput(true)} className={primaryBtn}>
            <Plus className="w-4 h-4" />
            Create Your First Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              className="bg-white rounded-2xl border border-[#e8e8ed] p-5 flex flex-col cursor-pointer hover:border-[#d1d5db] hover:shadow-sm transition-all duration-150"
              onClick={() => navigate(`/dashboard/workspace/${ws._id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#f1f3f4] flex items-center justify-center text-xl shrink-0">
                  {ws.icon || '📁'}
                </div>
                <h3 className="font-semibold text-[#1d1d1f] text-sm truncate">{ws.name}</h3>
              </div>
              <p className="text-xs text-[#5f6368] line-clamp-2 mb-4 flex-1">
                {ws.description || 'No description.'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[#f1f3f4]">
                <div className="flex -space-x-2">
                  {ws.members?.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-[#e8eaed] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#5f6368]"
                    >
                      {m.user?.firstName?.[0] || m.firstName?.[0] || '?'}
                    </div>
                  ))}
                  <span className="text-xs text-[#80868b] ml-2 self-center">
                    {ws.members?.length || 1} member{ws.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#dadce0]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomeDashBoard