import { useState, useEffect, useRef } from "react";
import { usePage } from "../../store/pageStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Loader2, Star, Trash2, Edit2, Check, LayoutGrid, List } from "lucide-react";

export default function PageView({ workspaceId, pageId, onBack }) {
  const { currentPage, getPageById, updatePage, toggleFavorite, deletePage, updateCover } = usePage();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    setLoading(true);
    const p = await getPageById(pageId);
    if (p) {
      setTitle(p.title);
      setContent(p.content || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updatePage(pageId, { title, content });
    setEditing(false);
    setSaving(false);
    loadPage();
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(pageId);
    loadPage();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this page?")) {
      await deletePage(pageId);
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  if (!currentPage) return <div className="p-8 text-gray-500 text-center">Page not found.</div>;

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto relative">
      {/* Cover Image Placeholder - could be an image upload in the future */}
      <div 
        className="w-full h-48 bg-gradient-to-r from-blue-100 to-indigo-100 relative group"
        style={currentPage.coverImage ? { backgroundImage: `url(${currentPage.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <button className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-sm px-3 py-1.5 rounded-md text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Change Cover
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 lg:px-16 pb-32">
        <div className="flex items-center justify-between py-6">
          <div className="text-sm text-gray-500 font-medium">
            Workspace / {currentPage.title}
          </div>
          <div className="flex gap-2">
            <button onClick={handleToggleFavorite} className={`p-2 rounded hover:bg-gray-100 ${currentPage.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}>
              <Star className="w-5 h-5" fill={currentPage.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleDelete} className="p-2 rounded hover:bg-red-50 text-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={() => setEditing(!editing)} className="p-2 rounded hover:bg-gray-100 text-gray-600">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-bold w-full outline-none border-b-2 border-transparent focus:border-blue-500 pb-2 bg-transparent text-gray-900 placeholder:text-gray-300"
              placeholder="Page Title"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 outline-none bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 ring-blue-500/10 text-gray-800 resize-y font-mono text-sm leading-relaxed"
              placeholder="Start typing markdown here..."
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">{currentPage.title}</h1>
            <div className="prose prose-lg prose-blue max-w-none text-gray-700">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-400 italic text-xl">Empty page. Click edit to add content.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
