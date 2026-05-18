import React, { useEffect, useState } from 'react'
import { useWorkspace } from '../../store/workspaceStore'
import { useAuth } from '../../store/authStore'
import { useNavigate } from 'react-router'
import { Briefcase, Plus, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { cardClass, headingClass, mutedText, pageTitleClass, primaryBtn, pageWrapper, inputClass } from '../styles/common'

function HomeDashBoard() {
  const workspaces = useWorkspace((state) => state.workspaces)
  const fetchWorkspaces = useWorkspace((state) => state.fetchWorkspaces)
  const createWorkspace = useWorkspace((state) => state.createWorkspace)
  const loading = useWorkspace((state) => state.loading)
  
  const currentUser = useAuth((state) => state.currentUser)
  const navigate = useNavigate()

  const [showNewInput, setShowNewInput] = useState(false)
  const [newWsName, setNewWsName] = useState('')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    await createWorkspace({ name: newWsName, description: 'New workspace', icon: '📁' })
    setNewWsName('')
    setShowNewInput(false)
  }

  return (
    <div className={`${pageWrapper} w-full max-w-5xl mx-auto`}>
      <div className="mb-10 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f8f9fa] to-white border border-[#e8e8ed] p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-[#1a73e8]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-3">
          {getGreeting()}, <span className="bg-gradient-to-r from-[#1a73e8] to-[#9c27b0] bg-clip-text text-transparent">{currentUser?.firstName || 'there'}!</span>
        </h1>
        <p className="text-[#5f6368] text-lg max-w-xl">
          Welcome to your Taskify dashboard. Here you can organize all your projects, tasks, and team collaboration.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className={headingClass}>Your Workspaces</h2>
        {!showNewInput && (
          <button onClick={() => setShowNewInput(true)} className={primaryBtn}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Workspace
          </button>
        )}
      </div>

      {showNewInput && (
        <form onSubmit={handleCreateWorkspace} className={`${cardClass} mb-6 p-6 border-[#1a73e8]/30 shadow-[0_0_0_4px_rgba(26,115,232,0.1)] transition-all animate-in fade-in slide-in-from-top-2`}>
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Create new workspace</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name (e.g. Engineering Team)"
              className={`${inputClass} flex-1`}
              disabled={loading}
            />
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
            <button type="button" onClick={() => setShowNewInput(false)} className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {workspaces.length === 0 && !showNewInput ? (
        <div className="bg-gradient-to-b from-[#f8f9fa] to-white rounded-[24px] p-12 text-center border border-dashed border-[#dadce0] shadow-sm">
          <div className="w-16 h-16 bg-[#1a73e8]/10 text-[#1a73e8] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No workspaces yet</h3>
          <p className={`${mutedText} mb-6 max-w-md mx-auto text-base`}>Create a workspace to start organizing your projects, tasks, and pages with your team.</p>
          <button onClick={() => setShowNewInput(true)} className={primaryBtn}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Your First Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {workspaces.map((ws) => (
            <div 
              key={ws._id} 
              className={`${cardClass} flex flex-col group hover:-translate-y-1 hover:shadow-lg hover:border-[#1a73e8]/20 transition-all duration-300 cursor-pointer`}
              onClick={() => navigate(`/dashboard/workspace/${ws._id}`)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a73e8]/10 to-[#9c27b0]/10 text-[#1a73e8] flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {ws.icon || '📁'}
                </div>
                <h3 className="font-semibold text-[#1d1d1f] text-lg truncate group-hover:text-[#1a73e8] transition-colors">{ws.name}</h3>
              </div>
              <p className={`${mutedText} line-clamp-2 mb-6 flex-1 text-sm`}>
                {ws.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f1f3f4]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {ws.members?.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#e8eaed] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#5f6368]">
                        {m.user?.firstName?.[0] || m.firstName?.[0] || '?'}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#80868b]">
                    {ws.members?.length || 1} member{ws.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center group-hover:bg-[#1a73e8] group-hover:text-white text-[#dadce0] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomeDashBoard