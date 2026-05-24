/**
 * @file CardModal.jsx
 * @module CardModal
 * @description React component for CardModal. Handles UI rendering, local state, and event interactions.
 */

import { useState, useEffect, useCallback } from 'react'
import { useBoard } from '../../store/boardStore'
import axios from 'axios'
import {
  X, Loader2, CheckSquare, MessageSquare, Trash2, Flag, Plus,
  Paperclip, Download, FileText, Users, Archive, CheckCircle2, Circle
} from 'lucide-react'
import { inputClass, labelClass, badgeClass, modalOverlay } from '../styles/common'

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const PRIORITY_COLORS = {
  LOW: '#2e7d32', MEDIUM: '#e65100', HIGH: '#c62828', URGENT: '#f44336',
}
const LABEL_PRESETS = [
  { name: 'Bug', color: '#e53935' }, { name: 'Feature', color: '#1e88e5' },
  { name: 'Enhancement', color: '#43a047' }, { name: 'Design', color: '#8e24aa' },
  { name: 'Docs', color: '#fb8c00' }, { name: 'Testing', color: '#00897b' },
]

function CardModal({ card, onClose, onUpdated }) {
  const updateCard = useBoard(s => s.updateCard)
  const deleteCard = useBoard(s => s.deleteCard)
  const addComment = useBoard(s => s.addComment)
  const deleteComment = useBoard(s => s.deleteComment)
  const addChecklistItem = useBoard(s => s.addChecklistItem)
  const toggleChecklistItem = useBoard(s => s.toggleChecklistItem)
  const deleteChecklistItem = useBoard(s => s.deleteChecklistItem)
  const addLabel = useBoard(s => s.addLabel)
  const removeLabel = useBoard(s => s.removeLabel)
  const uploadAttachment = useBoard(s => s.uploadAttachment)
  const deleteAttachment = useBoard(s => s.deleteAttachment)
  const completeCard = useBoard(s => s.completeCard)
  const incompleteCard = useBoard(s => s.incompleteCard)
  const archiveCard = useBoard(s => s.archiveCard)

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [newComment, setNewComment] = useState('')
  const [newCheckItem, setNewCheckItem] = useState('')
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [attachmentError, setAttachmentError] = useState('')

  const fetchCard = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/card/${card._id}`, { withCredentials: true })
      const c = res.data.payload
      setDetail(c)
      setTitle(c.title || '')
      setDescription(c.description || '')
      setPriority(c.priority || 'MEDIUM')
      setDueDate(c.dueDate ? c.dueDate.split('T')[0] : '')
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [card._id])

  useEffect(() => { fetchCard() }, [fetchCard])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCard(card._id, { title, description, priority, dueDate: dueDate || null })
      await fetchCard(); onUpdated?.()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    await deleteCard(card._id, card.list?._id || card.list)
    onUpdated?.(); onClose()
  }

  const handleToggleComplete = async () => {
    setSaving(true)
    try {
      if (detail?.isCompleted) await incompleteCard(card._id)
      else await completeCard(card._id)
      await fetchCard(); onUpdated?.()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleArchive = async () => {
    setSaving(true)
    try {
      await archiveCard(card._id)
      onUpdated?.(); onClose()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment(card._id, newComment)
    setNewComment(''); await fetchCard()
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(card._id, commentId); await fetchCard()
  }

  const handleAddCheckItem = async (e) => {
    e.preventDefault()
    if (!newCheckItem.trim()) return
    await addChecklistItem(card._id, newCheckItem)
    setNewCheckItem(''); await fetchCard(); onUpdated?.()
  }

  const handleToggleCheck = async (itemId, completed) => {
    await toggleChecklistItem(card._id, itemId, !completed)
    await fetchCard(); onUpdated?.()
  }

  const handleDeleteCheckItem = async (itemId) => {
    await deleteChecklistItem(card._id, itemId); await fetchCard(); onUpdated?.()
  }

  const handleAddLabel = async (preset) => {
    await addLabel(card._id, preset.name, preset.color)
    setShowLabelPicker(false); await fetchCard(); onUpdated?.()
  }

  const handleRemoveLabel = async (labelId) => {
    await removeLabel(card._id, labelId); await fetchCard(); onUpdated?.()
  }

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachmentError('')
    setSaving(true)
    try { await uploadAttachment(card._id, file); await fetchCard(); onUpdated?.() }
    catch (err) { console.error(err); setAttachmentError('Failed to upload attachment') }
    finally { setSaving(false) }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    setSaving(true)
    try { await deleteAttachment(attachmentId); await fetchCard(); onUpdated?.() }
    catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleRemoveMember = async (userId) => {
    setSaving(true)
    try { await removeCardMember(card._id, userId); await fetchCard(); onUpdated?.() }
    catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className={modalOverlay}>
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }
  if (!detail) return null

  const checklist = detail.checklist || []
  const comments = detail.comments || []
  const labels = detail.labels || []
  const attachments = detail.attachments || []
  const members = detail.members || []
  const checkDone = checklist.filter(c => c.completed).length
  const checkTotal = checklist.length

  return (
    <div className={modalOverlay}>
      <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dadce0]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={handleToggleComplete} className="shrink-0" title={detail.isCompleted ? 'Mark incomplete' : 'Mark complete'}>
              {detail.isCompleted
                ? <CheckCircle2 className="w-5 h-5 text-[#34a853]" />
                : <Circle className="w-5 h-5 text-[#dadce0] hover:text-[#1a73e8] transition-colors" />
              }
            </button>
            <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[detail.priority] || '#80868b' }} />
            <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave}
              className={`text-lg font-semibold text-[#1d1d1f] bg-transparent focus:outline-none focus:border-b focus:border-[#1a73e8] w-full ${detail.isCompleted ? 'line-through opacity-60' : ''}`}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setConfirmArchive(true)} className="p-2 hover:bg-[#fb8c00]/10 rounded-lg text-[#fb8c00] transition-colors" title="Archive">
              <Archive className="w-4 h-4" />
            </button>
            <button onClick={() => setConfirmDelete(true)} className="p-2 hover:bg-[#ff3b30]/10 rounded-lg text-[#ff3b30] transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-lg text-[#5f6368] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-3 border-b border-[#dadce0]">
          {[
            { key: 'details', label: 'Details', icon: Flag },
            { key: 'checklist', label: `Checklist ${checkTotal ? `(${checkDone}/${checkTotal})` : ''}`, icon: CheckSquare },
            { key: 'members', label: `Members (${members.length})`, icon: Users },
            { key: 'attachments', label: `Files (${attachments.length})`, icon: Paperclip },
            { key: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-2.5 px-1 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === tab.key ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-[#5f6368] hover:text-[#1d1d1f]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSave}
                  placeholder="Add a description..." className={`${inputClass} min-h-[80px] resize-none !text-sm`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} onBlur={handleSave} className={`${inputClass} !text-sm`}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onBlur={handleSave} className={`${inputClass} !text-sm`} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`${labelClass} !mb-0`}>Labels</label>
                  <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="text-xs text-[#1a73e8] hover:text-[#1558b0] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <span key={label._id} className={`${badgeClass} inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80`}
                      style={{ backgroundColor: label.color + '22', color: label.color }} onClick={() => handleRemoveLabel(label._id)} title="Click to remove">
                      {label.name}<X className="w-2.5 h-2.5" />
                    </span>
                  ))}
                  {labels.length === 0 && <span className="text-xs text-[#80868b]">No labels</span>}
                </div>
                {showLabelPicker && (
                  <div className="mt-2 flex flex-wrap gap-1.5 p-3 bg-[#f8f9fa] rounded-xl border border-[#dadce0]">
                    {LABEL_PRESETS.filter(p => !labels.some(l => l.name === p.name)).map((preset) => (
                      <button key={preset.name} onClick={() => handleAddLabel(preset)}
                        className={`${badgeClass} hover:opacity-80 transition-opacity`}
                        style={{ backgroundColor: preset.color + '22', color: preset.color }}>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              {checkTotal > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#5f6368] mb-1">
                    <span>Progress</span><span>{Math.round((checkDone / checkTotal) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a73e8] rounded-full transition-all duration-300" style={{ width: `${(checkDone / checkTotal) * 100}%` }} />
                  </div>
                </div>
              )}
              {checklist.map((item) => (
                <div key={item._id} className="flex items-center gap-3 group">
                  <button onClick={() => handleToggleCheck(item._id, item.completed)}
                    className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                      item.completed ? 'bg-[#1a73e8] border-[#1a73e8] text-white' : 'border-[#dadce0] hover:border-[#1a73e8]'
                    }`}>
                    {item.completed && <span className="text-[10px]">✓</span>}
                  </button>
                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-[#80868b]' : 'text-[#1d1d1f]'}`}>{item.text}</span>
                  <button onClick={() => handleDeleteCheckItem(item._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ff3b30]/10 rounded text-[#ff3b30] transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddCheckItem} className="flex gap-2 mt-2">
                <input value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} placeholder="Add item..." className={`${inputClass} !text-sm flex-1`} />
                <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-2 rounded-xl hover:bg-[#1558b0] shrink-0">Add</button>
              </form>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#80868b]">Members assigned to this card can be managed from the board's workspace members.</p>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-[#80868b] text-center py-6">No members assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m._id} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-xs font-bold">
                          {m.firstName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-[#80868b]">{m.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMember(m._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#ff3b30]/10 rounded-lg text-[#ff3b30] transition-all" title="Remove">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-xs bg-[#f1f3f4] text-[#1d1d1f] font-medium px-4 py-2 rounded-xl hover:bg-[#e8eaed] cursor-pointer inline-flex items-center gap-2 transition-colors">
                  <Paperclip className="w-4 h-4" /> Upload File
                  <input type="file" className="hidden" onChange={handleUploadAttachment} disabled={saving} />
                </label>
              </div>
              {attachments.length === 0 ? (
                <p className="text-sm text-[#80868b] text-center py-6">No attachments yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {attachments.map(att => (
                    <div key={att._id} className="border border-[#dadce0] rounded-xl p-3 flex gap-3 items-center group bg-white">
                      <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        {att.fileType?.includes('image') ? (
                          <img src={att.url} alt={att.filename} loading="lazy" className="w-full h-full object-cover rounded" />
                        ) : ( <FileText className="w-5 h-5" /> )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <a href={att.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#1d1d1f] hover:text-[#1a73e8] truncate block">{att.filename}</a>
                        <p className="text-[10px] text-[#80868b] mt-0.5">{new Date(att.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={att.url} download className="p-1.5 hover:bg-[#f1f3f4] rounded text-[#5f6368]"><Download className="w-3.5 h-3.5" /></a>
                        <button onClick={() => handleDeleteAttachment(att._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className={`${inputClass} !text-sm flex-1`} />
                <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-2 rounded-xl hover:bg-[#1558b0] shrink-0">Post</button>
              </form>
              {comments.length === 0 && <p className="text-sm text-[#80868b] text-center py-6">No comments yet.</p>}
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {comment.author?.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#1d1d1f]">{comment.author?.firstName} {comment.author?.lastName}</span>
                      <span className="text-[10px] text-[#80868b]">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[#3c4043] leading-relaxed">{comment.text}</p>
                  </div>
                  <button onClick={() => handleDeleteComment(comment._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ff3b30]/10 rounded text-[#ff3b30] transition-all self-start">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <span className="text-[10px] text-[#80868b]">Created {new Date(detail.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-2">
            {detail.isCompleted && <span className="text-[10px] font-semibold text-[#34a853] bg-[#34a853]/10 px-2 py-0.5 rounded-full">Completed</span>}
            {saving && <Loader2 className="w-3.5 h-3.5 text-[#1a73e8] animate-spin" />}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className={modalOverlay} style={{zIndex:60}}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#ff3b30]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Delete card?</h2>
            <p className="text-sm text-[#5f6368] mb-6">This will permanently delete "{detail.title}". This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(false)} className="px-5 py-2.5 text-sm font-medium border border-[#dadce0] rounded-full hover:bg-[#f1f3f4] transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 text-sm font-medium bg-[#ff3b30] text-white rounded-full hover:bg-[#d62c23] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirm Modal */}
      {confirmArchive && (
        <div className={modalOverlay} style={{zIndex:60}}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fb8c00]/10 flex items-center justify-center mx-auto mb-4">
              <Archive className="w-6 h-6 text-[#fb8c00]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Archive card?</h2>
            <p className="text-sm text-[#5f6368] mb-6">This card will be archived and hidden from the board. You can restore it later.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmArchive(false)} className="px-5 py-2.5 text-sm font-medium border border-[#dadce0] rounded-full hover:bg-[#f1f3f4] transition-colors">Cancel</button>
              <button onClick={handleArchive} className="px-5 py-2.5 text-sm font-medium bg-[#fb8c00] text-white rounded-full hover:bg-[#e65100] transition-colors">Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardModal
