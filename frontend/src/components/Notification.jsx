import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useNotification } from '../../store/notificationStore'
import {
  Bell, CheckCheck, Trash2, Loader2, Mail, Users, Calendar, MessageSquare, LayoutGrid, X
} from 'lucide-react'
import { primaryBtn, secondaryBtn, pageTitleClass } from '../styles/common'

const TYPE_CONFIG = {
  ASSIGNED: { icon: Users, color: '#1a73e8' },
  MENTIONED: { icon: Mail, color: '#8e24aa' },
  DUE_SOON: { icon: Calendar, color: '#e65100' },
  COMMENT: { icon: MessageSquare, color: '#2e7d32' },
  INVITE: { icon: Users, color: '#00897b' },
  BOARD_UPDATE: { icon: LayoutGrid, color: '#1558b0' },
}

function Notification() {
  const navigate = useNavigate()
  const notifications = useNotification(state => state.notifications)
  const loading = useNotification(state => state.loading)
  const fetchNotifications = useNotification(state => state.fetchNotifications)
  const markAsRead = useNotification(state => state.markAsRead)
  const markAllAsRead = useNotification(state => state.markAllAsRead)
  const deleteNotification = useNotification(state => state.deleteNotification)
  const clearRead = useNotification(state => state.clearRead)
  const getUnreadCount = useNotification(state => state.getUnreadCount)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading && notifications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={pageTitleClass}>Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[#5f6368] mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => { markAllAsRead(); getUnreadCount() }} className={secondaryBtn}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button onClick={() => { clearRead(); getUnreadCount() }} className={secondaryBtn}>
            <Trash2 className="w-4 h-4" /> Clear read
          </button>
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#dadce0]">
          <Bell className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#202124] mb-2">All caught up!</h3>
          <p className="text-sm text-[#80868b]">You have no notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || { icon: Bell, color: '#80868b' }
            const Icon = cfg.icon
            return (
              <div
                key={n._id}
                onClick={() => {
                  if (n.link) {
                    markAsRead(n._id)
                    navigate(n.link)
                  }
                }}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                  n.link ? 'cursor-pointer hover:border-[#1a73e8]/30 hover:shadow-sm' : ''
                } ${
                  n.isRead
                    ? 'bg-white border-[#dadce0]'
                    : 'bg-[#1a73e8]/[0.03] border-[#1a73e8]/20'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cfg.color + '15' }}
                >
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? 'text-[#5f6368]' : 'text-[#1d1d1f] font-medium'}`}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-xs text-[#80868b] mt-1 truncate">{n.message}</p>
                  )}
                  <p className="text-[10px] text-[#a1a1a6] mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); getUnreadCount() }}
                      className="p-1.5 hover:bg-[#1a73e8]/10 rounded-lg text-[#1a73e8] transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); getUnreadCount() }}
                    className="p-1.5 hover:bg-[#ff3b30]/10 rounded-lg text-[#ff3b30] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notification