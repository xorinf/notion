import { useState, useEffect } from 'react'
import { Search as SearchIcon, Loader2, FileText, LayoutTemplate, MessageSquare, Briefcase } from 'lucide-react'
import { useWorkspace } from '../../store/workspaceStore'
import { useSearch } from '../../store/searchStore'
import {
  inputClass,
  cardClass,
  headingClass,
  bodyText,
  emptyStateClass,
  errorClass,
  filterBtn,
  filterBtnActive,
} from '../styles/common'
import { useNavigate } from 'react-router'

const getEntityIcon = (type) => {
  switch (type) {
    case 'Page': return <FileText className="w-5 h-5 text-blue-500" />;
    case 'Board': return <LayoutTemplate className="w-5 h-5 text-purple-500" />;
    case 'Card': return <MessageSquare className="w-5 h-5 text-orange-500" />;
    default: return <Briefcase className="w-5 h-5 text-gray-500" />;
  }
};

function Search() {
  const navigate = useNavigate();
  const workspaces = useWorkspace(state => state.workspaces)
  const fetchWorkspaces = useWorkspace(state => state.fetchWorkspaces)
  const currentWorkspace = useWorkspace(state => state.currentWorkspace)
  const { searchResults, loading, error, globalSearch, clearResults } = useSearch();
  const [query, setQuery] = useState('')
  const [selectedWs, setSelectedWs] = useState('all')
  const [typeFilter, setTypeFilter] = useState(null)

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        const wsId = selectedWs === 'all'
          ? (currentWorkspace?._id || workspaces[0]?._id)
          : selectedWs
        if (wsId) {
          globalSearch(query, wsId, typeFilter);
        }
      } else {
        clearResults();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedWs, typeFilter, currentWorkspace?._id]);

  const handleResultClick = (item) => {
    if (item.type === 'Board') {
      navigate(`/dashboard/board/${item._id}`)
    } else if (item.type === 'Page') {
      const wsId = item.workspace || selectedWs || currentWorkspace?._id || workspaces[0]?._id
      if (wsId) {
        navigate(`/dashboard/workspace/${wsId}?pageId=${item._id}`)
      } else {
        navigate(`/dashboard/page`)
      }
    } else if (item.type === 'Card' && item.board) {
      navigate(`/dashboard/board/${item.board}`)
    }
  }

  const activeWs = selectedWs === 'all'
    ? (currentWorkspace || workspaces[0])
    : workspaces.find(w => w._id === selectedWs)

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
      <h1 className={`${headingClass} mb-6 flex`}>Search</h1>

      {/* Search bar */}
      <div className="relative flex items-center mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80868b]" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search across ${activeWs?.name || 'workspace'}...`}
          className={`${inputClass} pl-12 py-4 text-lg shadow-sm`}
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Workspace filter */}
        <button onClick={() => setSelectedWs('all')}
          className={selectedWs === 'all' ? filterBtnActive : filterBtn}>
          All Workspaces
        </button>
        {workspaces.map(ws => (
          <button key={ws._id} onClick={() => setSelectedWs(ws._id)}
            className={selectedWs === ws._id ? filterBtnActive : filterBtn}>
            {ws.icon || '📁'} {ws.name}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-6 bg-[#dadce0] mx-1 self-center" />

        {/* Type filter */}
        {['Board', 'Page', 'Card'].map(t => (
          <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={typeFilter === t ? filterBtnActive : filterBtn}>
            {t}s
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className={`${errorClass} mb-6`}>{error}</div>}

      {/* Results */}
      {query.trim() && !loading && searchResults.length === 0 && (
        <p className={emptyStateClass}>No results found for "{query}"</p>
      )}

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          {searchResults.map((item, i) => (
            <div 
              key={item._id ?? i} 
              className={`${cardClass} flex gap-4 cursor-pointer hover:border-blue-500 transition-colors group`}
              onClick={() => handleResultClick(item)}
            >
              <div className="mt-1 bg-gray-50 p-2.5 rounded-xl group-hover:bg-blue-50 transition-colors">
                {getEntityIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[#202124] group-hover:text-blue-600 transition-colors">
                    {item.title ?? item.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                    {item.type}
                  </span>
                </div>
                {item.description && (
                  <p className={`${bodyText} text-sm line-clamp-2`}>{item.description}</p>
                )}
                {item.boardTitle && (
                  <p className="text-xs text-[#80868b] mt-1">Board: {item.boardTitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Idle state */}
      {!query.trim() && !error && (
        <div className="text-center py-16">
          <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">Search across pages, boards, and cards</p>
        </div>
      )}
    </div>
  )
}

export default Search