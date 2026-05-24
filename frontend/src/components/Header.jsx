/**
 * @file Header.jsx
 * @module Header
 * @description React component for Header. Handles UI rendering, local state, and event interactions.
 */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { Feather, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../store/authStore'
import {
  navbarClass,
  navContainerClass,
  navBrandClass,
  navLinksClass,
  navMobileLinksClass,
  navLinkClass,
  navLinkActiveClass,
  primaryBtn,
  secondaryBtn,
} from '../styles/common'

function Header() {
  const navigate = useNavigate()
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const currentUser = useAuth((state) => state.currentUser)
  const logout = useAuth((state) => state.logout)
  const loading = useAuth((state) => state.loading)

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    navigate('/')
  }

  const navLinkCls = ({ isActive }) =>
    isActive ? navLinkActiveClass : navLinkClass

  return (
    <header className={navbarClass}>
      <div className={navContainerClass}>
        {/* Brand */}
        <NavLink to="/" className={`${navBrandClass} flex items-center gap-1.5`}>
          <Feather className="w-4 h-4 text-[#1a73e8]" strokeWidth={2.5} />
          Taskify
        </NavLink>

        {/* Desktop links */}
        <nav className={navLinksClass}>
          <NavLink to="/" end className={navLinkCls}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkCls}>
                Dashboard
              </NavLink>
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                disabled={loading}
                className={secondaryBtn}
              >
                <LogOut className="w-3.5 h-3.5" />
                {loading ? 'Signing out…' : 'Sign out'}
              </button>
              {/* User avatar pill */}
              <div className="flex items-center gap-2 text-[0.8rem] text-[#6e6e73]">
                <span className="w-7 h-7 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-xs font-semibold">
                  {currentUser?.firstName?.[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="hidden lg:block font-medium text-[#1d1d1f]">
                  {currentUser?.firstName}
                </span>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkCls}>
                Sign in
              </NavLink>
              <NavLink to="/register" className={primaryBtn}>
                Get started
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden text-[#1d1d1f] p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className={navMobileLinksClass}>
          <NavLink
            to="/"
            end
            className={navLinkCls}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={navLinkCls}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </NavLink>
              <button
                id="mobile-logout-btn"
                onClick={handleLogout}
                disabled={loading}
                className="text-left text-[0.8rem] text-[#ff3b30] font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                {loading ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={navLinkCls}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className={navLinkCls}
                onClick={() => setMobileOpen(false)}
              >
                Create account
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header