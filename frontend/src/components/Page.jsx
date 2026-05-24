/**
 * @file Page.jsx
 * @module Page
 * @description React component for Page. Handles UI rendering, local state, and event interactions.
 */

import { useState, useEffect } from 'react'
import { useWorkspace } from '../../store/workspaceStore'
import { usePage } from '../../store/pageStore'
import { useAuth } from '../../store/authStore'
import PageView from './PageView'
import {
  FileText, Plus, Loader2, Star, ChevronRight, Briefcase, Search
} from 'lucide-react'
import {
  cardClass, primaryBtn, headingClass, inputClass, pageWrapper,
  sectionHeader, sectionTitle, emptyStateCard, emptyStateIcon,
  emptyStateTitle, emptyStateText, filterBtn, filterBtnActive,
  mutedText, badgeClass, badgeBlue
} from '../styles/common'

function Page() {
  const workspaces = useWorkspace(state => state.workspaces)
  const fetchWorkspaces = useWorkspace(state => state.fetchWorkspaces)
  const wsLoading = useWorkspace(state => state.loading)

  const pages = usePage(state => state.pages)
  const fetchPages = usePage(state => state.fetchPages)
  const createPage = usePage(state => state.createPage)
  const pageLoading = usePage(state => state.loading)

  const currentUser = useAuth(state => state.currentUser)

  const [allPages, setAllPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPageId, setSelectedPageId] = useState(null)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null)
  const [filterWs, setFilterWs] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  useEffect(() => {
    const loadAllPages = async () => {
      setLoading(true)
      const results = []
      for (const ws of workspaces) {
        try {
          await fetchPages(ws._id)
          const pagesState = usePage.getState().pages
          results.push(...pagesState.map(p => ({ ...p, workspaceName: ws.name, workspaceId: ws._id, workspaceIcon: ws.icon })))
        } catch (e) { /* skip */ }
      }
      setAllPages(results)
      setLoading(false)
    }
    if (workspaces.length > 0) loadAllPages()
    else setLoading(false)
  }, [workspaces])

  const handleCreatePage = async (wsId) => {
    const newPage = await createPage({ title: 'Untitled Page', workspace: wsId })
    if (newPage) {
      setSelectedPageId(newPage._id)
      setSelectedWorkspaceId(wsId)
    }
  }

  if (selectedPageId && selectedWorkspaceId) {
    return (
      <PageView
        workspaceId={selectedWorkspaceId}
        pageId={selectedPageId}
        onBack={() => { setSelectedPageId(null); setSelectedWorkspaceId(null) }}
      />
    )
  }

  const filteredPages = allPages.filter(p => {
    const matchWs = filterWs === 'all' || p.workspaceId === filterWs
    const matchSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchWs && matchSearch
  })

  // Group pages by workspace
  const grouped = {}
  filteredPages.forEach(p => {
    if (!grouped[p.workspaceId]) {
      grouped[p.workspaceId] = { name: p.workspaceName, icon: p.workspaceIcon, pages: [] }
    }
    grouped[p.workspaceId].pages.push(p)
  })

  if (loading || wsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  return (
    <div className={`${pageWrapper} w-full max-w-5xl mx-auto`}>
      {/* Header */}
      <div className={sectionHeader}>
        <div>
          <h1 className={headingClass}>All Pages</h1>
          <p className={`${mutedText} mt-1`}>{allPages.length} pages across {workspaces.length} workspaces</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className={`${inputClass} pl-10 !text-sm`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterWs('all')}
            className={filterWs === 'all' ? filterBtnActive : filterBtn}
          >
            All
          </button>
          {workspaces.map(ws => (
            <button
              key={ws._id}
              onClick={() => setFilterWs(ws._id)}
              className={filterWs === ws._id ? filterBtnActive : filterBtn}
            >
              {ws.icon || '📁'} {ws.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {allPages.length === 0 ? (
        <div className={emptyStateCard}>
          <FileText className={emptyStateIcon} />
          <h3 className={emptyStateTitle}>No pages yet</h3>
          <p className={emptyStateText}>
            Create a page in any workspace to start writing documents, notes, and specifications.
          </p>
          {workspaces.length > 0 && (
            <button
              onClick={() => handleCreatePage(workspaces[0]._id)}
              disabled={pageLoading}
              className={`${primaryBtn} mt-6`}
            >
              {pageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Your First Page
            </button>
          )}
        </div>
      ) : filteredPages.length === 0 ? (
        <div className={emptyStateCard}>
          <Search className={emptyStateIcon} />
          <h3 className={emptyStateTitle}>No results found</h3>
          <p className={emptyStateText}>Try a different search term or filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([wsId, group]) => (
            <div key={wsId}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{group.icon || '📁'}</span>
                  <h2 className={sectionTitle}>{group.name}</h2>
                  <span className={`${badgeClass} ${badgeBlue}`}>{group.pages.length}</span>
                </div>
                <button
                  onClick={() => handleCreatePage(wsId)}
                  disabled={pageLoading}
                  className={primaryBtn}
                >
                  <Plus className="w-4 h-4" /> New Page
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.pages.map(page => (
                  <div
                    key={page._id}
                    onClick={() => { setSelectedPageId(page._id); setSelectedWorkspaceId(wsId) }}
                    className={`${cardClass} flex flex-col group cursor-pointer hover:border-[#1a73e8]/30 hover:-translate-y-0.5 transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-lg shrink-0">
                        {page.icon || <FileText className="w-4 h-4" />}
                      </div>
                      <h3 className="font-semibold text-[#202124] truncate flex-1 text-sm">{page.title || 'Untitled'}</h3>
                      {page.isFavorite && (
                        <Star className="w-3.5 h-3.5 text-[#fb8c00] fill-[#fb8c00] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5f6368] mt-1 line-clamp-2 flex-1">
                      {page.content ? page.content.substring(0, 120) + '...' : 'Empty page'}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f3f4]">
                      <span className="text-xs text-[#80868b]">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Page