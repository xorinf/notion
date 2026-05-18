import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useBoard } from '../../store/boardStore'
import { useList } from '../../store/listStore'
import { useCard } from '../../store/cardStore'
import { ArrowLeft, Plus, X, MoreHorizontal, Loader2, Trash2 } from 'lucide-react'
import { primaryBtn, secondaryBtn, inputClass, labelClass } from '../styles/common'

const PRIORITY_COLORS = {
  LOW: '#0f9d58',
  MEDIUM: '#f4b400',
  HIGH: '#ff7043',
  URGENT: '#db4437',
}

function Board() {
  const { workspaceId, boardId } = useParams()
  const navigate = useNavigate()

  // Board store
  const getBoardById = useBoard(state => state.getBoardById)
  const currentBoard = useBoard(state => state.currentBoard)
  const boardLoading = useBoard(state => state.loading)

  // List store
  const createList = useList(state => state.createList)
  const updateList = useList(state => state.updateList)
  const deleteList = useList(state => state.deleteList)

  // Card store
  const createCard = useCard(state => state.createCard)
  const deleteCard = useCard(state => state.deleteCard)

  // Local state
  const [isAddingList, setIsAddingList] = useState(false)
  const [addingListTitle, setAddingListTitle] = useState('')
  const [addingCardToList, setAddingCardToList] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editingListId, setEditingListId] = useState(null)
  const [editingListTitle, setEditingListTitle] = useState('')

  // Fetch board on mount
  useEffect(() => {
    if (boardId) {
      getBoardById(boardId)
    }
  }, [boardId, getBoardById])

  // Refresh helper — re-fetch board after any mutation
  const refreshBoard = () => getBoardById(boardId)

  // Handlers
  const handleAddList = async (e) => {
    e.preventDefault()
    if (!addingListTitle.trim()) return
    const position = currentBoard?.lists?.length || 0
    await createList({ title: addingListTitle.trim(), board: boardId, position })
    setAddingListTitle('')
    setIsAddingList(false)
    refreshBoard()
  }

  const handleDeleteList = async (listId) => {
    await deleteList(listId)
    refreshBoard()
  }

  const handleUpdateListTitle = async (listId) => {
    if (!editingListTitle.trim()) {
      setEditingListId(null)
      return
    }
    await updateList(listId, editingListTitle.trim())
    setEditingListId(null)
    setEditingListTitle('')
    refreshBoard()
  }

  const handleAddCard = async (e, listId) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    const list = currentBoard?.lists?.find(l => l._id === listId)
    const position = list?.cards?.length || 0
    await createCard({ title: newCardTitle.trim(), list: listId, board: boardId, position })
    setNewCardTitle('')
    setAddingCardToList(null)
    refreshBoard()
  }

  const handleDeleteCard = async (cardId) => {
    await deleteCard(cardId)
    refreshBoard()
  }

  // Loading state
  if (boardLoading && !currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
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

  const bgColor = currentBoard.background || '#1e1e2e'

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">

      {/* Board Header */}
      <div className="flex items-center gap-4 px-6 py-4" style={{ backgroundColor: bgColor }}>
        <button
          onClick={() => navigate(`/dashboard/workspace/${workspaceId}`)}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-tight">{currentBoard.title}</h1>
        <span className="text-sm text-white/60 ml-auto">
          {currentBoard.members?.length || 0} member{currentBoard.members?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lists Area — horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-white">
        <div className="flex gap-4 items-start h-full">

          {/* Render each list */}
          {currentBoard.lists?.map((list) => (
            <div
              key={list._id}
              className="w-[300px] min-w-[300px] bg-[#f7f7f5] rounded-2xl flex flex-col max-h-[calc(100vh-160px)]"
            >
              {/* List Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                {editingListId === list._id ? (
                  <input
                    autoFocus
                    value={editingListTitle}
                    onChange={(e) => setEditingListTitle(e.target.value)}
                    onBlur={() => handleUpdateListTitle(list._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateListTitle(list._id)
                      if (e.key === 'Escape') setEditingListId(null)
                    }}
                    className="text-sm font-semibold text-[#1d1d1f] bg-white border border-[#dadce0] rounded-lg px-2 py-1 w-full focus:outline-none focus:border-[#1a73e8]"
                  />
                ) : (
                  <h3
                    className="text-sm font-semibold text-[#1d1d1f] cursor-pointer hover:text-[#1a73e8] transition-colors"
                    onClick={() => {
                      setEditingListId(list._id)
                      setEditingListTitle(list.title)
                    }}
                  >
                    {list.title}
                  </h3>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#80868b] mr-1">{list.cards?.length || 0}</span>
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="p-1 rounded-md hover:bg-[#dadce0] text-[#80868b] hover:text-[#db4437] transition-colors"
                    title="Delete list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-2">
                {list.cards?.map((card) => (
                  <div
                    key={card._id}
                    className="bg-white rounded-xl p-3 border border-[#e8e8e6] hover:border-[#1a73e8] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Labels */}
                    {card.labels?.length > 0 && (
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {card.labels.map((label, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Title + Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#1d1d1f] font-medium leading-snug">{card.title}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCard(card._id)
                        }}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#ff3b30]/10 text-[#80868b] hover:text-[#ff3b30] transition-all shrink-0"
                        title="Delete card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Card Footer — priority + members */}
                    <div className="flex items-center justify-between mt-2">
                      {card.priority && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: PRIORITY_COLORS[card.priority] || '#5f6368' }}
                        >
                          {card.priority}
                        </span>
                      )}
                      {card.members?.length > 0 && (
                        <div className="flex -space-x-1.5 ml-auto">
                          {card.members.slice(0, 3).map((member, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-[#1a73e8]/15 text-[#1a73e8] text-[9px] font-bold flex items-center justify-center border border-white"
                              title={`${member.firstName || ''} ${member.lastName || ''}`}
                            >
                              {member.firstName?.[0]?.toUpperCase() || '?'}
                            </div>
                          ))}
                          {card.members.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-[#efefed] text-[#5f6368] text-[9px] font-bold flex items-center justify-center border border-white">
                              +{card.members.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Card Form (inline) */}
                {addingCardToList === list._id ? (
                  <form onSubmit={(e) => handleAddCard(e, list._id)} className="mt-1">
                    <textarea
                      autoFocus
                      placeholder="Enter card title..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAddCard(e, list._id)
                        }
                        if (e.key === 'Escape') {
                          setAddingCardToList(null)
                          setNewCardTitle('')
                        }
                      }}
                      className="w-full text-sm bg-white border border-[#dadce0] rounded-xl p-3 focus:outline-none focus:border-[#1a73e8] resize-none min-h-[60px]"
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#1558b0] transition-colors">
                        Add Card
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingCardToList(null); setNewCardTitle('') }}
                        className="p-1.5 rounded-lg hover:bg-[#dadce0] text-[#5f6368] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => { setAddingCardToList(list._id); setNewCardTitle('') }}
                    className="w-full flex items-center gap-2 text-sm text-[#5f6368] hover:text-[#1d1d1f] hover:bg-[#efefed] rounded-xl px-3 py-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add a card
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add List Button / Form */}
          {isAddingList ? (
            <div className="w-[300px] min-w-[300px] bg-[#f7f7f5] rounded-2xl p-4">
              <form onSubmit={handleAddList}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter list title..."
                  value={addingListTitle}
                  onChange={(e) => setAddingListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAddingList(false)
                      setAddingListTitle('')
                    }
                  }}
                  className="w-full text-sm bg-white border border-[#dadce0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a73e8] mb-3"
                />
                <div className="flex gap-2">
                  <button type="submit" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#1558b0] transition-colors">
                    Add List
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingList(false); setAddingListTitle('') }}
                    className="p-1.5 rounded-lg hover:bg-[#dadce0] text-[#5f6368] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-[300px] min-w-[300px] bg-[#efefed] hover:bg-[#e0e0de] text-[#5f6368] rounded-2xl p-4 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-5 h-5" /> Add a list
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default Board