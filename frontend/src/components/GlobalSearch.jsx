import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSearch } from "../../store/searchStore";
import { Search, Loader2, FileText, LayoutTemplate, MessageSquare, X } from "lucide-react";

export default function GlobalSearch({ workspaceId, onClose }) {
  const navigate = useNavigate();
  const { searchResults, loading, globalSearch, clearResults } = useSearch();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() && workspaceId) {
        globalSearch(query, workspaceId);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, workspaceId]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Page': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Board': return <LayoutTemplate className="w-4 h-4 text-purple-500" />;
      case 'Card': return <MessageSquare className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'Board') navigate(`/dashboard/board/${result._id}`);
    else if (result.type === 'Page') navigate(`/dashboard/page`);
    else if (result.type === 'Card' && result.board) navigate(`/dashboard/board/${result.board}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, boards, cards..."
            className="flex-1 text-lg outline-none bg-transparent placeholder-gray-400 text-gray-800"
          />
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {!loading && query.trim() && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="py-2">
              {searchResults.map((result, idx) => (
                <button
                  key={result._id ?? idx}
                  className="w-full flex items-center px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0 group"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
                    {getEntityIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {result.title}
                    </h4>
                    {result.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {result.description}
                      </p>
                    )}
                    {result.boardTitle && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Board: {result.boardTitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 shrink-0">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Search for pages, boards, and cards</span>
          <span className="hidden sm:inline">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
