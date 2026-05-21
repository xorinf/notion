import { useState, useEffect } from 'react'
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
      setAllCards(cards)
      setLoading(false)
    }
    if (workspaces.length > 0) loadAllCards()
    else setLoading(false)
  }, [workspaces])

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

  // Categorize
  const todo = filtered.filter(c => !c.isCompleted && c.listTitle?.toLowerCase().includes('to do'))
  const inProgress = filtered.filter(c => !c.isCompleted && !c.listTitle?.toLowerCase().includes('to do') && !c.listTitle?.toLowerCase().includes('done'))
  const completed = filtered.filter(c => c.isCompleted || c.listTitle?.toLowerCase().includes('done'))

  // Fallback: if categorization produces nothing meaningful, split evenly
  const uncategorized = filtered.filter(c =>
    !todo.includes(c) && !inProgress.includes(c) && !completed.includes(c)
  )
  // Add uncategorized to in-progress
  const finalInProgress = [...inProgress, ...uncategorized]

  const columns = [
    { title: 'To Do', icon: Circle, color: '#80868b', cards: todo },
    { title: 'In Progress', icon: Clock, color: '#1a73e8', cards: finalInProgress },
    { title: 'Completed', icon: CheckCircle2, color: '#34a853', cards: completed },
  ]

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map(col => (
            <div key={col.title} className={taskColumn}>
              <div className={taskColumnHeader}>
                <h3 className={taskColumnTitle}>
                  <col.icon className="w-4 h-4" style={{ color: col.color }} />
                  {col.title}
                  <span className={taskColumnCount}>{col.cards.length}</span>
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {col.cards.length === 0 ? (
                  <p className="text-xs text-[#80868b] text-center py-6">No tasks</p>
                ) : (
                  col.cards.map(card => (
                    <div
                      key={card._id}
                      onClick={() => setSelectedCard(card)}
                      className={taskCard}
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
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
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