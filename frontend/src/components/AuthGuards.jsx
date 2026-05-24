import { Navigate } from 'react-router'
import { useAuth } from '../../store/authStore'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute — wraps dashboard routes.
 * If the user is not authenticated, redirects to /login.
 */
export function ProtectedRoute({ children }) {
  const currentUser = useAuth(state => state.currentUser)
  const loading = useAuth(state => state.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
          <p className="text-sm text-[#5f6368]">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * PublicRoute — wraps login/register pages.
 * If already authenticated, redirects to /dashboard.
 */
export function PublicRoute({ children }) {
  const currentUser = useAuth(state => state.currentUser)
  const loading = useAuth(state => state.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
