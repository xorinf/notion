/**
 * @file Logout.jsx
 * @module Logout
 * @description React component for Logout. Handles UI rendering, local state, and event interactions.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../store/authStore'
import { Loader2, LogOut } from 'lucide-react'

function Logout() {
  const navigate = useNavigate()
  const logout = useAuth(state => state.logout)
  const loading = useAuth(state => state.loading)

  useEffect(() => {
    const doLogout = async () => {
      await logout()
      navigate('/')
    }
    doLogout()
  }, [logout, navigate])

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="bg-white rounded-[24px] p-10 shadow-[0_1px_3px_rgba(60,64,67,0.16)] ring-1 ring-[#dadce0] text-center">
        <div className="w-14 h-14 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {loading ? (
            <Loader2 className="w-7 h-7 text-[#1a73e8] animate-spin" />
          ) : (
            <LogOut className="w-7 h-7 text-[#1a73e8]" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-[#202124] mb-1">Signing out...</h2>
        <p className="text-sm text-[#5f6368]">You will be redirected shortly.</p>
      </div>
    </div>
  )
}

export default Logout