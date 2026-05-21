import { useState, useEffect } from 'react'
import { useActivity } from '../../store/activityStore'
import { useAuth } from '../../store/authStore'
import {
  BookOpen, Loader2, CheckCircle2, Edit, Trash2, Clock,
  FileText, LayoutTemplate, MessageSquare, Plus, Archive, Move,
  RefreshCw
} from 'lucide-react'
import {
  pageWrapper, headingClass, mutedText, sectionHeader,
  timelineItem, timelineDot, timelineConnector, timelineContent, timelineDateGroup,
  emptyStateCard, emptyStateIcon, emptyStateTitle, emptyStateText,
  secondaryBtn
} from '../styles/common'

const ACTION_CONFIG = {
  CREATED: { icon: Plus, color: '#34a853', bg: 'bg-[#34a853]/10' },
  UPDATED: { icon: Edit, color: '#1a73e8', bg: 'bg-[#1a73e8]/10' },
  DELETED: { icon: Trash2, color: '#ff3b30', bg: 'bg-[#ff3b30]/10' },
  ARCHIVED: { icon: Archive, color: '#fb8c00', bg: 'bg-[#fb8c00]/10' },
  MOVED: { icon: Move, color: '#8e24aa', bg: 'bg-[#8e24aa]/10' },
  COMPLETED: { icon: CheckCircle2, color: '#34a853', bg: 'bg-[#34a853]/10' },
}

const ENTITY_ICONS = {
  Page: FileText,
  Board: LayoutTemplate,
  Card: MessageSquare,
}

function getDateGroup(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'This Week'
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function Journal() {
  const { myActivities, loading, fetchMyActivity } = useActivity()
  const currentUser = useAuth(state => state.currentUser)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMyActivity()
  }, [fetchMyActivity])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMyActivity()
    setRefreshing(false)
  }

  // Group activities by date
  const grouped = {}
  ;(myActivities || []).forEach(activity => {
    const group = getDateGroup(activity.createdAt)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(activity)
  })

  if (loading && !myActivities?.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  return (
    <div className={`${pageWrapper} w-full max-w-3xl mx-auto`}>
      {/* Header */}
      <div className={sectionHeader}>
        <div>
          <h1 className={headingClass}>Activity Journal</h1>
          <p className={`${mutedText} mt-1`}>
            Your personal activity timeline, {currentUser?.firstName || 'there'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={secondaryBtn}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Timeline */}
      {(!myActivities || myActivities.length === 0) ? (
        <div className={emptyStateCard}>
          <BookOpen className={emptyStateIcon} />
          <h3 className={emptyStateTitle}>No activity yet</h3>
          <p className={emptyStateText}>
            Your actions across workspaces, boards, and pages will appear here as a personal journal.
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(grouped).map(([dateLabel, activities]) => (
            <div key={dateLabel}>
              <p className={timelineDateGroup}>{dateLabel}</p>
              <div className="space-y-0">
                {activities.map((activity, idx) => {
                  const actionCfg = ACTION_CONFIG[activity.action] || ACTION_CONFIG.UPDATED
                  const ActionIcon = actionCfg.icon
                  const EntityIcon = ENTITY_ICONS[activity.entityType] || Clock

                  return (
                    <div key={activity._id} className={timelineItem}>
                      {/* Connector line */}
                      {idx < activities.length - 1 && (
                        <div className={timelineConnector} />
                      )}
                      {/* Dot */}
                      <div className={`${timelineDot} ${actionCfg.bg}`}>
                        <ActionIcon className="w-4 h-4" style={{ color: actionCfg.color }} />
                      </div>
                      {/* Content */}
                      <div className={timelineContent}>
                        <div className="bg-white rounded-xl border border-[#dadce0] p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1d1d1f] font-medium">
                                {activity.action?.charAt(0) + activity.action?.slice(1).toLowerCase()}{' '}
                                <span className="inline-flex items-center gap-1 bg-[#f1f3f4] text-xs px-1.5 py-0.5 rounded text-[#5f6368] font-normal">
                                  <EntityIcon className="w-3 h-3" />
                                  {activity.entityType}
                                </span>
                              </p>
                              {activity.details && (
                                <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
                                  {activity.details}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-[#a1a1a6] whitespace-nowrap shrink-0 mt-0.5">
                              {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Journal