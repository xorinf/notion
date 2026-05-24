/**
 * @file PageView.jsx
 * @module PageView
 * @description React component for PageView. Handles UI rendering, local state, and event interactions.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { usePage } from "../../store/pageStore";
import { useAuth } from "../../store/authStore";
import { useSocket } from "../../store/socketStore";
import Editor from "./Editor";
import {
  ArrowLeft, Star, Trash2, Loader2, Check,
  MoreHorizontal, Smile
} from "lucide-react";

const COVER_COLORS = [
  "#1a73e8", "#8e24aa", "#34a853", "#fb8c00", "#e53935",
  "#00897b", "#f4511e", "#039be5", "#7cb342", "#546e7a",
  "#3949ab", "#d81b60", "#6d4c41", "#43a047", "#00acc1",
];

const EMOJI_LIST = [
  "📄","📝","📚","📖","💡","🎯","🚀","⭐","🔥","💎",
  "🌟","✨","🎨","🛠️","📊","📈","🗂️","💼","🏆","🌍"
];

export default function PageView({ workspaceId, pageId, onBack }) {
  const { currentPage, getPageById, updatePage, toggleFavorite, deletePage } = usePage();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cover, setCover] = useState(null);
  const [icon, setIcon] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [remoteEditors, setRemoteEditors] = useState({});

  const currentUser = useAuth((state) => state.currentUser);
  const starredPages = useAuth((state) => state.starredItems.starredPages);
  const starPage = useAuth((state) => state.starPage);
  const unstarPage = useAuth((state) => state.unstarPage);
  const { joinPage, leavePage, emitPageUpdated, emitPageEditing, socket } = useSocket();

  const saveTimerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (pageId) {
      loadPage();
      joinPage(pageId);
    }
    return () => {
      if (pageId) leavePage(pageId);
    };
  }, [pageId, joinPage, leavePage]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !pageId) return;

    const handlePageUpdated = ({ userId }) => {
      if (userId !== currentUser?._id) {
        loadPage(); // Refresh data from server
      }
    };

    const handlePageEditing = ({ userId, userName }) => {
      if (userId !== currentUser?._id) {
        setRemoteEditors(prev => ({
          ...prev,
          [userId]: { name: userName, timestamp: Date.now() }
        }));
      }
    };

    socket.on('page-updated', handlePageUpdated);
    socket.on('page-editing', handlePageEditing);

    return () => {
      socket.off('page-updated', handlePageUpdated);
      socket.off('page-editing', handlePageEditing);
    };
  }, [socket, pageId, currentUser]);

  // Cleanup old remote editors periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteEditors(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          if (now - next[key].timestamp > 4000) {
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadPage = async () => {
    setLoading(true);
    const p = await getPageById(pageId);
    if (p) {
      setTitle(p.title || "");
      setContent(p.content || "");
      setCover(p.coverImage || null);
      setIcon(p.icon || "");
    }
    setLoading(false);
    setSaved(true);
  };

  // Auto-save with debounce
  const scheduleAutoSave = useCallback((newTitle, newContent) => {
    setSaved(false);
    
    // Emit editing presence
    if (currentUser) {
      emitPageEditing({ pageId, userId: currentUser._id, userName: currentUser.firstName });
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      await updatePage(pageId, { title: newTitle, content: newContent });
      setSaving(false);
      setSaved(true);
      
      // Emit updated event
      if (currentUser) {
        emitPageUpdated({ pageId, userId: currentUser._id, userName: currentUser.firstName });
      }
    }, 1500);
  }, [pageId, updatePage, currentUser, emitPageEditing, emitPageUpdated]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    scheduleAutoSave(val, content);
  };

  const handleContentChange = (html) => {
    setContent(html);
    scheduleAutoSave(title, html);
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await unstarPage(pageId)
      } else {
        await starPage(pageId)
      }
      await toggleFavorite(pageId);
      loadPage();
    } catch (err) {
      console.error(err)
    }
  };

  const handleSetCover = async (gradient) => {
    setCover(gradient);
    setShowCoverPicker(false);
    await updatePage(pageId, { coverImage: gradient });
  };

  const handleRemoveCover = async () => {
    setCover(null);
    setShowCoverPicker(false);
    await updatePage(pageId, { coverImage: null });
  };

  const handleSetIcon = async (emoji) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
    await updatePage(pageId, { icon: emoji });
  };

  const handleDelete = async () => {
    await deletePage(pageId);
    setShowDeleteConfirm(false);
    onBack();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
          <p className="text-sm text-[#5f6368]">Loading page…</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-[#5f6368]">Page not found.</p>
      </div>
    );
  }

  const isFavorite = starredPages?.some(p => p._id === pageId || p === pageId) || currentPage.isFavorite;

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto relative flex flex-col">

      {/* Top action bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-[#f1f3f4] px-4 py-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#5f6368] hover:text-[#1d1d1f] transition-colors px-2 py-1 rounded-lg hover:bg-[#f1f3f4]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4">
          {/* Presence Indicator */}
          {Object.keys(remoteEditors).length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#1a73e8] bg-[#1a73e8]/10 px-2.5 py-1.5 rounded-full animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a73e8]"></span>
              </span>
              {Object.values(remoteEditors).map(e => e.name).join(', ')} {Object.keys(remoteEditors).length > 1 ? 'are' : 'is'} editing...
            </div>
          )}

          {/* Save indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#80868b]">
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-3 h-3 text-[#34a853]" /> Saved</>
            ) : null}
          </div>

          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-[#80868b] hover:bg-[#f1f3f4] hover:text-[#1d1d1f]'}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-[#80868b] hover:bg-[#f1f3f4] hover:text-[#1d1d1f] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#dadce0] py-1 z-20 w-44">
                  <button
                    onClick={() => { setShowCoverPicker(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f1f3f4]"
                  >
                    <Globe className="w-4 h-4 text-[#80868b]" />
                    Change cover
                  </button>
                  <button
                    onClick={() => { setShowEmojiPicker(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f1f3f4]"
                  >
                    <Smile className="w-4 h-4 text-[#80868b]" />
                    Change icon
                  </button>
                  <div className="my-1 border-t border-[#f1f3f4]" />
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#ff3b30] hover:bg-[#ff3b30]/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete page
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative group">
        <div
          className="w-full h-44 flex items-end"
          style={
            cover
              ? cover.startsWith('#')
                ? { background: cover }
                : { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "#f1f3f4" }
          }
        >
          {/* Hover overlay buttons */}
          <div className="absolute bottom-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="bg-white/90 hover:bg-white text-xs px-3 py-1.5 rounded-lg text-[#5f6368] shadow-sm font-medium transition-colors"
            >
              Change cover
            </button>
            {cover && (
              <button
                onClick={handleRemoveCover}
                className="bg-white/90 hover:bg-white text-xs px-3 py-1.5 rounded-lg text-[#ff3b30] shadow-sm font-medium transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page content area */}
      <div className="max-w-3xl mx-auto w-full px-6 md:px-12 pb-32 flex-1">

        {/* Icon */}
        <div className="relative -mt-8 mb-4">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#dadce0] flex items-center justify-center text-3xl hover:bg-[#f1f3f4] transition-colors"
            title="Change icon"
          >
            {icon || "📄"}
          </button>
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
              <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#dadce0] p-4 z-20 w-64">
                <p className="text-xs font-semibold text-[#5f6368] mb-3 uppercase tracking-wide">Choose Icon</p>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSetIcon(emoji)}
                      className="text-2xl p-1.5 rounded-lg hover:bg-[#f1f3f4] transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          rows={1}
          className="w-full text-4xl font-bold text-[#1d1d1f] bg-transparent border-none outline-none resize-none mb-4 leading-tight placeholder:text-[#dadce0] tracking-tight overflow-hidden"
          style={{ fieldSizing: "content" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />

        {/* Divider */}
        <div className="border-t border-[#f1f3f4] mb-2" />

        {/* Rich Editor */}
        <Editor
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing, or type '/' for commands…"
          className="min-h-96"
        />
      </div>

      {/* Cover Picker Modal */}
      {showCoverPicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
              <h3 className="font-semibold text-[#1d1d1f]">Choose Cover</h3>
              <button onClick={() => setShowCoverPicker(false)} className="text-[#5f6368] hover:text-[#1d1d1f]">✕</button>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#80868b] mb-3 font-medium uppercase tracking-wide">Colors</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSetCover(c)}
                    className={`h-10 rounded-lg transition-transform hover:scale-105 ring-2 hover:ring-offset-1 ${
                      cover === c ? 'ring-[#1a73e8]' : 'ring-transparent'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              {cover && (
                <button
                  onClick={handleRemoveCover}
                  className="w-full text-sm text-[#ff3b30] py-2 hover:bg-[#ff3b30]/5 rounded-xl transition-colors"
                >
                  Remove cover
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#ff3b30]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Delete page?</h2>
            <p className="text-sm text-[#5f6368] mb-6">
              This will permanently delete "{title || "Untitled"}". This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] border border-[#dadce0] rounded-full hover:bg-[#f1f3f4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#ff3b30] rounded-full hover:bg-[#d62c23] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
