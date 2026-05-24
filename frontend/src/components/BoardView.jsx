import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useBoard } from '../../store/boardStore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  ArrowLeft, Plus, X, MoreHorizontal, Trash2, Edit2, Loader2, Archive,
  Settings, Save, Filter, Users, Copy
} from 'lucide-react'
import {
  primaryBtn, secondaryBtn, inputClass, labelClass, filterBtn, filterBtnActive,
  modalOverlay, badgeClass
} from '../styles/common'
import CardModal from './CardModal'

const PRIORITY_COLORS = {
  LOW: 'bg-[#e8f5e9] text-[#2e7d32]',
  MEDIUM: 'bg-[#fff3e0] text-[#e65100]',
  HIGH: 'bg-[#fce4ec] text-[#c62828]',
  URGENT: 'bg-[#f44336] text-white',
}

function BoardView() {
  const { boardId } = useParams()
  const navigate = useNavigate()

  const currentBoard = useBoard(s => s.currentBoard)
  const loading = useBoard(s => s.loading)
  const getBoardById = useBoard(s => s.getBoardById)
  const createList = useBoard(s => s.createList)
  const updateList = useBoard(s => s.updateList)
  const deleteList = useBoard(s => s.deleteList)
  const archiveList = useBoard(s => s.archiveList)
  const reorderList = useBoard(s => s.reorderList)
  const createCard = useBoard(s => s.createCard)
  const deleteCard = useBoard(s => s.deleteCard)
  const reorderCard = useBoard(s => s.reorderCard)
  const moveCard = useBoard(s => s.moveCard)
  const archiveBoard = useBoard(s => s.archiveBoard)
  const saveAsTemplate = useBoard(s => s.saveAsTemplate)
  const updateBoard = useBoard(s => s.updateBoard)

  const [showAddList, setShowAddList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [addingCardToList, setAddingCardToList] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editingListId, setEditingListId] = useState(null)
  const [editListTitle, setEditListTitle] = useState('')
  const [listMenuId, setListMenuId] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showBoardMenu, setShowBoardMenu] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (boardId) getBoardById(boardId)
  }, [boardId, getBoardById])

  const handleCreateList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    const lists = currentBoard?.lists || []
    await createList({ title: newListTitle, board: boardId, position: lists.length })
    setNewListTitle(''); setShowAddList(false)
  }

  const handleRenameList = async (id) => {
    if (!editListTitle.trim()) return
    await updateList(id, { title: editListTitle })
    setEditingListId(null)
  }

  const handleCreateCard = async (e, listId) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    const list = currentBoard?.lists?.find(l => l._id === listId)
    await createCard({ title: newCardTitle, list: listId, board: boardId, position: (list?.cards?.length || 0) })
    setNewCardTitle(''); setAddingCardToList(null)
  }

  const handleCardUpdated = async () => {
    if (boardId) await getBoardById(boardId)
  }

  const handleSaveTemplate = async () => {
    try {
      await saveAsTemplate(boardId)
      alert('Board saved as template!')
      setShowBoardMenu(false)
    } catch { alert('Failed to save template') }
  }

  const handleArchiveBoard = async () => {
    if (!confirm('Archive this board?')) return
    await archiveBoard(boardId)
    navigate(-1)
  }

  const onDragEnd = async (result) => {
    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'list') {
      const newLists = Array.from(lists)
      const [removed] = newLists.splice(source.index, 1)
      newLists.splice(destination.index, 0, removed)
      useBoard.setState(state => ({ currentBoard: { ...state.currentBoard, lists: newLists } }))
      await reorderList(result.draggableId, destination.index)
      return
    }

    if (type === 'card') {
      const sourceListId = source.droppableId
      const destListId = destination.droppableId

      if (sourceListId === destListId) {
        const listIndex = lists.findIndex(l => l._id === sourceListId)
        const list = lists[listIndex]
        const newCards = Array.from(list.cards || [])
        const [removed] = newCards.splice(source.index, 1)
        newCards.splice(destination.index, 0, removed)
        const newLists = Array.from(lists)
        newLists[listIndex] = { ...list, cards: newCards }
        useBoard.setState(state => ({ currentBoard: { ...state.currentBoard, lists: newLists } }))
        await reorderCard(result.draggableId, destination.index)
      } else {
        const sourceListIdx = lists.findIndex(l => l._id === sourceListId)
        const destListIdx = lists.findIndex(l => l._id === destListId)
        const sourceCards = Array.from(lists[sourceListIdx].cards || [])
        const destCards = Array.from(lists[destListIdx].cards || [])
        const [removed] = sourceCards.splice(source.index, 1)
        destCards.splice(destination.index, 0, removed)
        const newLists = Array.from(lists)
        newLists[sourceListIdx] = { ...lists[sourceListIdx], cards: sourceCards }
        newLists[destListIdx] = { ...lists[destListIdx], cards: destCards }
        useBoard.setState(state => ({ currentBoard: { ...state.currentBoard, lists: newLists } }))
        await moveCard(result.draggableId, destListId, destination.index)
      }
    }
  }

  if (loading && !currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  if (!currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Board not found</h2>
          <button onClick={() => navigate(-1)} className={primaryBtn}>Go Back</button>
        </div>
      </div>
    )
  }

  const lists = currentBoard.lists || []

  // Filter cards by priority
  const filterCards = (cards) => {
    if (priorityFilter === 'all') return cards || []
    return (cards || []).filter(c => c.priority === priorityFilter)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Board Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[#dadce0] bg-white flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f1f3f4] rounded-lg transition-colors text-[#5f6368]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight truncate">{currentBoard.title}</h1>
          {currentBoard.description && <p className="text-xs text-[#5f6368] truncate">{currentBoard.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* Member Avatars */}
          {currentBoard.members?.slice(0, 4).map((m) => (
            <div key={m.user?._id || m._id}
              className="w-7 h-7 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-[10px] font-bold border-2 border-white -ml-1 first:ml-0"
              title={`${m.user?.firstName || ''} ${m.user?.lastName || ''}`}>
              {m.user?.firstName?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {/* Filter Button */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-[#1a73e8]/10 text-[#1a73e8]' : 'hover:bg-[#f1f3f4] text-[#5f6368]'}`}>
            <Filter className="w-4 h-4" />
          </button>
          {/* Board Menu */}
          <div className="relative">
            <button onClick={() => setShowBoardMenu(!showBoardMenu)} className="p-2 hover:bg-[#f1f3f4] rounded-lg transition-colors text-[#5f6368]">
              <Settings className="w-4 h-4" />
            </button>
            {showBoardMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowBoardMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#dadce0] py-1 z-20 w-48">
                  <button onClick={handleSaveTemplate} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f1f3f4]">
                    <Copy className="w-4 h-4" /> Save as Template
                  </button>
                  <button onClick={handleArchiveBoard} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#fb8c00] hover:bg-[#fb8c00]/5">
                    <Archive className="w-4 h-4" /> Archive Board
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="shrink-0 px-6 py-3 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-medium text-[#5f6368] mr-2">Priority:</span>
          {['all', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={priorityFilter === p ? filterBtnActive : filterBtn}>
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      )}

      {/* Kanban Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#f8f9fa]">
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div className="flex gap-4 h-full items-start" ref={provided.innerRef} {...provided.droppableProps}>
                {lists.map((list, index) => (
                  <Draggable key={list._id} draggableId={list._id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}
                        className={`content-visibility-auto w-72 shrink-0 bg-white rounded-2xl border ${snapshot.isDragging ? 'border-[#1a73e8] shadow-lg' : 'border-[#dadce0] shadow-sm'} flex flex-col max-h-full`}>
                        {/* List Header */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-[#f1f3f4]" {...provided.dragHandleProps}>
                          {editingListId === list._id ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleRenameList(list._id) }} className="flex-1 flex gap-1">
                              <input autoFocus value={editListTitle} onChange={(e) => setEditListTitle(e.target.value)}
                                onBlur={() => handleRenameList(list._id)}
                                className="text-sm font-semibold text-[#1d1d1f] bg-transparent border-b border-[#1a73e8] focus:outline-none w-full" />
                            </form>
                          ) : (
                            <h3 className="text-sm font-semibold text-[#1d1d1f] truncate flex-1 cursor-pointer"
                              onDoubleClick={() => { setEditingListId(list._id); setEditListTitle(list.title) }}>
                              {list.title}
                              <span className="ml-2 text-xs font-normal text-[#80868b]">{filterCards(list.cards).length}</span>
                            </h3>
                          )}
                          <div className="relative">
                            <button onClick={() => setListMenuId(listMenuId === list._id ? null : list._id)}
                              className="p-1 hover:bg-[#f1f3f4] rounded-md text-[#80868b] transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {listMenuId === list._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setListMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#dadce0] py-1 z-20 w-40">
                                  <button onClick={() => { setEditingListId(list._id); setEditListTitle(list.title); setListMenuId(null) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1d1d1f] hover:bg-[#f1f3f4]">
                                    <Edit2 className="w-3.5 h-3.5" /> Rename
                                  </button>
                                  <button onClick={async () => { await archiveList(list._id); setListMenuId(null) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5f6368] hover:bg-[#f1f3f4]">
                                    <Archive className="w-3.5 h-3.5" /> Archive
                                  </button>
                                  <button onClick={async () => { await deleteList(list._id); setListMenuId(null) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ff3b30] hover:bg-[#ff3b30]/5">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cards */}
                        <Droppable droppableId={list._id} type="card">
                          {(provided, snapshot) => (
                            <div className={`flex-1 overflow-y-auto px-3 py-2 ${snapshot.isDraggingOver ? 'bg-[#f1f3f4]/50' : ''}`}
                              ref={provided.innerRef} {...provided.droppableProps}>
                              {filterCards(list.cards).map((card, index) => (
                                <Draggable key={card._id} draggableId={card._id} index={index}>
                                  {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                      onClick={() => setSelectedCard(card)}
                                      className={`bg-white border ${snapshot.isDragging ? 'border-[#1a73e8] shadow-md transform rotate-2' : 'border-[#e8e8ed] hover:shadow-md hover:border-[#1a73e8]/30'} rounded-xl p-3 transition-all cursor-pointer group mb-2`}
                                      style={provided.draggableProps.style}>
                                      {card.labels?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {card.labels.map((label, i) => (
                                            <span key={i} className={`${badgeClass}`}
                                              style={{ backgroundColor: label.color + '22', color: label.color }}>
                                              {label.name}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      <p className={`text-sm text-[#1d1d1f] font-medium leading-snug ${card.isCompleted ? 'line-through opacity-50' : ''}`}>{card.title}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        {card.priority && (
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[card.priority] || ''}`}>{card.priority}</span>
                                        )}
                                        {card.dueDate && <span className="text-[10px] text-[#80868b]">{new Date(card.dueDate).toLocaleDateString()}</span>}
                                        {card.checklist?.length > 0 && (
                                          <span className="text-[10px] text-[#80868b]">✓ {card.checklist.filter(c => c.completed).length}/{card.checklist.length}</span>
                                        )}
                                      </div>
                                      {card.members?.length > 0 && (
                                        <div className="flex -space-x-1 mt-2">
                                          {card.members.slice(0, 3).map((m) => (
                                            <div key={m._id} className="w-5 h-5 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-[8px] font-bold border border-white">
                                              {m.firstName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {/* Add Card Form */}
                              {addingCardToList === list._id ? (
                                <form onSubmit={(e) => handleCreateCard(e, list._id)} className="space-y-2 mb-2">
                                  <input autoFocus value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
                                    placeholder="Card title..." className={`${inputClass} !text-sm !py-2`} />
                                  <div className="flex gap-1">
                                    <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg hover:bg-[#1558b0]">Add</button>
                                    <button type="button" onClick={() => { setAddingCardToList(null); setNewCardTitle('') }}
                                      className="text-xs text-[#5f6368] px-2 py-1.5 hover:bg-[#f1f3f4] rounded-lg">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button onClick={() => setAddingCardToList(list._id)}
                                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#80868b] hover:text-[#1d1d1f] hover:bg-[#f1f3f4] rounded-lg transition-colors mb-2">
                                  <Plus className="w-3.5 h-3.5" /> Add card
                                </button>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add List */}
                <div className="w-72 shrink-0">
                  {showAddList ? (
                    <form onSubmit={handleCreateList} className="bg-white rounded-2xl border border-[#dadce0] p-4 shadow-sm space-y-3">
                      <input autoFocus value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="List title..." className={`${inputClass} !text-sm`} />
                      <div className="flex gap-2">
                        <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg hover:bg-[#1558b0]">Add List</button>
                        <button type="button" onClick={() => { setShowAddList(false); setNewListTitle('') }}
                          className="text-xs text-[#5f6368] px-2 py-1.5 hover:bg-[#f1f3f4] rounded-lg">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setShowAddList(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white/60 hover:bg-white border border-dashed border-[#dadce0] rounded-2xl text-sm text-[#5f6368] hover:text-[#1d1d1f] transition-all hover:border-[#1a73e8]/30">
                      <Plus className="w-4 h-4" /> Add List
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} onUpdated={handleCardUpdated} />
      )}
    </div>
  )
}

export default BoardView
