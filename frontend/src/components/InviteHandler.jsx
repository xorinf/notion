import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import axios from 'axios'
import { useWorkspace } from '../../store/workspaceStore'
import { useAuth } from '../../store/authStore'
import { Loader2, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { primaryBtn, secondaryBtn } from '../styles/common'

// For API calls, configure base URL if needed
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6767'
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true
})

function InviteHandler() {
  const { token } = useParams()
  const navigate = useNavigate()
  const checkAuth = useAuth(state => state.checkAuth)
  const acceptInviteStore = useWorkspace(state => state.acceptInvite)
  const declineInviteStore = useWorkspace(state => state.declineInvite)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    async function getInviteDetails() {
      try {
        setLoading(true)
        // Authenticate user first
        await checkAuth()
        const res = await api.get(`/invite/details/${token}`)
        setInvite(res.data.payload)
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Invalid or expired invitation link.')
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      getInviteDetails()
    }
  }, [token, checkAuth])

  const handleAccept = async () => {
    try {
      setActionLoading(true)
      await acceptInviteStore(token)
      setSuccessMessage(`Successfully joined ${invite.workspace.name}!`)
      timerRef.current = setTimeout(() => {
        navigate(`/dashboard/workspace/${invite.workspace._id}`)
      }, 2000)
    } catch (err) {
      setError('Failed to accept the invitation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    try {
      setActionLoading(true)
      await declineInviteStore(token)
      setSuccessMessage('Invitation declined.')
      timerRef.current = setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Failed to decline the invitation.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fbfbfa]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1a73e8] animate-spin mx-auto mb-4" />
          <p className="text-[#5f6368] text-sm">Verifying invitation details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#fbfbfa]">
      <div className="w-full max-w-md bg-white border border-[#dadce0] rounded-3xl shadow-xl overflow-hidden p-8 transition-all hover:shadow-2xl">
        
        {/* Error State */}
        {error && !successMessage && (
          <div className="text-center py-4">
            <XCircle className="w-16 h-16 text-[#d93025] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Invitation Error</h2>
            <p className="text-sm text-[#5f6368] mb-6">{error}</p>
            <button onClick={() => navigate('/dashboard')} className={primaryBtn}>
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-[#1e8e3e] mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Success!</h2>
            <p className="text-sm text-[#5f6368] mb-2">{successMessage}</p>
            <p className="text-xs text-[#a1a1a6]">Redirecting you now...</p>
          </div>
        )}

        {/* Active Invite Display */}
        {invite && !error && !successMessage && (
          <div>
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#1a73e8]/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-[#1a73e8]" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-[#1d1d1f] mb-2">
              Workspace Invitation
            </h2>
            <p className="text-sm text-center text-[#5f6368] mb-6">
              You've been invited to collaborate!
            </p>

            {/* Invite Box */}
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-5 mb-6 text-center">
              <div className="text-3xl mb-2">{invite.workspace.icon || '💼'}</div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">{invite.workspace.name}</h3>
              {invite.workspace.description && (
                <p className="text-xs text-[#5f6368] mt-1 line-clamp-2">
                  {invite.workspace.description}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-[#dadce0]/50 flex items-center justify-center gap-2">
                <span className="text-xs text-[#80868b]">Invited by:</span>
                <span className="text-xs font-semibold text-[#1d1d1f]">
                  {invite.invitedBy.firstName} {invite.invitedBy.lastName} ({invite.invitedBy.email})
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="text-[10px] bg-[#1a73e8]/10 text-[#1a73e8] font-semibold px-2 py-0.5 rounded-full">
                  Role: {invite.role}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                disabled={actionLoading}
                onClick={handleAccept}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a73e8] hover:bg-[#1558b0] text-white font-medium rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50`}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Join Workspace'}
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDecline}
                className="w-full text-center py-2.5 text-sm font-medium text-[#d93025] hover:bg-[#d93025]/5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                Decline Invitation
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default InviteHandler
