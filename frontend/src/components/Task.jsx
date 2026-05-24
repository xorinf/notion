/**
 * @file Task.jsx
 * @module Task
 * @description React component for Task. Handles UI rendering, local state, and event interactions.
 */

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useWorkspace } from '../../store/workspaceStore'
import { useBoard } from '../../store/boardStore'
import { useAuth } from '../../store/authStore'
import CardModal from './CardModal'
import {
  CheckSquare, Loader2, Search, Flag, Calendar, Clock,
  AlertCircle, CheckCircle2, Circle, LayoutGrid
} from 'lucide-react'
import {
  pageWrapper, headingClass, inputClass, mutedText,
  sectionHeader, filterBtn, filterBtnActive,
  taskColumn, taskColumnHeader, taskColumnTitle, taskColumnCount, taskCard,
  badgeClass, emptyStateCard, emptyStateIcon, emptyStateTitle, emptyStateText
} from '../styles/common'

const PRIORITY_COLORS = {
  LOW: 'bg-[#e8f5e9] text-[#2e7d32]',
  MEDIUM: 'bg-[#fff3e0] text-[#e65100]',
  HIGH: 'bg-[#fce4ec] text-[#c62828]',
  URGENT: 'bg-[#f44336] text-white',
}

function Task() {
  const workspaces = useWorkspace(state => state.workspaces)
  const fetchWorkspaces = useWorkspace(state => state.fetchWorkspaces)
  const fetchBoards = useBoard(state => state.fetchBoards)
  const getBoardById = useBoard(state => state.getBoardById)
  const updateCard = useBoard(state => state.updateCard)
  const moveCard = useBoard(state => state.moveCard)
  const currentUser = useAuth(state => state.currentUser)

  const [allCards, setAllCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    const loadAllCards = async () => {
      setLoading(true)
      const cards = []
      for (const ws of workspaces) {
        try {
          await fetchBoards(ws._id)
          const boards = useBoard.getState().boards
          for (const board of boards) {
            try {
              const boardData = await useBoard.getState().getBoardById(board._id)
              if (boardData?.lists) {
                for (const list of boardData.lists) {
                  for (const card of (list.cards || [])) {
                    cards.push({
                      ...card,
                      listTitle: list.title,
                      boardTitle: board.title,
                      boardId: board._id,
                      workspaceName: ws.name,
                    })
                  }
                }
              }
            } catch (e) { /* skip */ }
          }
        } catch (e) { /* skip */ }
      }
      setAllCards(Array.from(new Map(cards.map(c => [c._id, c])).values()))
      setLoading(false)
    }
    if (workspaces.length > 0) loadAllCards()
    else setLoading(false)
  }, [workspaces, fetchBoards, getBoardById])

  const handleCardUpdated = async () => {
    // Reload would be expensive, just close modal
    setSelectedCard(null)
  }

  // Filter cards
  const filtered = allCards.filter(c => {
    const matchSearch = !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter
    return matchSearch && matchPriority && !c.archived
  })

  // Categorize using card.completed (if backend supports it) or listTitle fallback
  const isTodo = (c) => !c.completed && c.listTitle?.toLowerCase().includes('to do')
  const isDone = (c) => c.completed || c.listTitle?.toLowerCase().includes('done')
  const isInProgress = (c) => !c.completed && !isTodo(c) && !isDone(c)

  const todo = filtered.filter(isTodo)
  const inProgress = filtered.filter(isInProgress)
  const completed = filtered.filter(isDone)

  // Fallback uncategorized -> in-progress
  const uncategorized = filtered.filter(c =>
    !todo.includes(c) && !inProgress.includes(c) && !completed.includes(c)
  )
  const finalInProgress = [...inProgress, ...uncategorized]

  const columns = [
    { title: 'To Do', icon: Circle, color: '#80868b', cards: todo },
    { title: 'In Progress', icon: Clock, color: '#1a73e8', cards: finalInProgress },
    { title: 'Completed', icon: CheckCircle2, color: '#34a853', cards: completed },
  ]

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const card = allCards.find(c => c._id === draggableId)
    if (!card) return

    const targetStatus = destination.droppableId
    const updatedCard = { ...card }

    // Optimistic Update
    if (targetStatus === 'Completed') {
      updatedCard.completed = true
      updatedCard.listTitle = 'Done'
    } else {
      updatedCard.completed = false
      if (targetStatus === 'To Do') updatedCard.listTitle = 'To Do'
      if (targetStatus === 'In Progress') updatedCard.listTitle = 'In Progress'
    }

    setAllCards(prev => prev.map(c => c._id === draggableId ? updatedCard : c))

    try {
      const boardData = await getBoardById(card.boardId)
      if (!boardData?.lists?.length) return

      let targetListId = boardData.lists[0]._id // Default To Do
      if (targetStatus === 'Completed') {
        targetListId = boardData.lists[boardData.lists.length - 1]._id
      } else if (targetStatus === 'In Progress') {
        targetListId = boardData.lists[Math.floor(boardData.lists.length / 2)]._id
      }

      await updateCard(card._id, { completed: targetStatus === 'Completed' })
      
      if (card.list !== targetListId) {
        await moveCard(card._id, targetListId, 0)
      }
    } catch (err) {
      console.error("Failed to move card cross-board:", err)
      // On error, let the next refresh fix the state
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  return (
    <div className={`${pageWrapper} w-full max-w-6xl mx-auto`}>
      {/* Header */}
      <div className={sectionHeader}>
        <div>
          <h1 className={headingClass}>My Tasks</h1>
          <p className={`${mutedText} mt-1`}>{filtered.length} tasks across all workspaces</p>
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
            placeholder="Search tasks..."
            className={`${inputClass} pl-10 !text-sm`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={priorityFilter === p ? filterBtnActive : filterBtn}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Columns */}
      {allCards.length === 0 ? (
        <div className={emptyStateCard}>
          <CheckSquare className={emptyStateIcon} />
          <h3 className={emptyStateTitle}>No tasks yet</h3>
          <p className={emptyStateText}>
            Tasks will appear here once you create cards in your boards. Go to a workspace and create a board to get started.
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {columns.map(col => (
              <Droppable key={col.title} droppableId={col.title}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${taskColumn} ${snapshot.isDraggingOver ? 'ring-2 ring-[#1a73e8]/20 bg-[#1a73e8]/[0.02]' : ''}`}
                  >
                    <div className={taskColumnHeader}>
                      <h3 className={taskColumnTitle}>
                        <col.icon className="w-4 h-4" style={{ color: col.color }} />
                        {col.title}
                        <span className={taskColumnCount}>{col.cards.length}</span>
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[150px]">
                      {col.cards.length === 0 ? (
                        <p className="text-xs text-[#80868b] text-center py-6">Drop tasks here</p>
                      ) : (
                        col.cards.map((card, index) => (
                          <Draggable key={card._id} draggableId={card._id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => setSelectedCard(card)}
                                className={`${taskCard} ${dragSnapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-1 z-50 border-[#1a73e8]/50' : ''}`}
                              >
                                {/* Labels */}
                                {card.labels?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {card.labels.slice(0, 3).map((label, i) => (
                                      <span
                                        key={i}
                                        className={`${badgeClass}`}
                                        style={{ backgroundColor: label.color + '22', color: label.color }}
                                      >
                                        {label.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm text-[#1d1d1f] font-medium leading-snug">{card.title}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {card.priority && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[card.priority] || ''}`}>
                                      {card.priority}
                                    </span>
                                  )}
                                  {card.dueDate && (
                                    <span className="text-[10px] text-[#80868b] flex items-center gap-0.5">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(card.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {card.checklist?.length > 0 && (
                                    <span className="text-[10px] text-[#80868b]">
                                      ✓ {card.checklist.filter(c => c.completed).length}/{card.checklist.length}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f1f3f4]">
                                  <span className="text-[10px] text-[#a1a1a6] truncate flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3" />
                                    {card.boardTitle}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdated={handleCardUpdated}
        />
      )}
    </div>
  )
}

export default Task