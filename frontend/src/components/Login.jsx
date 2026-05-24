/**
 * @file Login.jsx
 * @module Login
 * @description React component for Login. Handles UI rendering, local state, and event interactions.
 */

import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Feather, Loader2 } from 'lucide-react'
import { useAuth } from '../../store/authStore'
import {
  formCard,
  formTitle,
  labelClass,
  inputClass,
  formGroup,
  submitBtn,
  errorClass,
  successClass,
  linkClass,
  mutedText,
  ghostBtn,
} from '../styles/common'

function Login() {
  const navigate = useNavigate()
  const login = useAuth((state) => state.login)
  const loading = useAuth((state) => state.loading)
  const storeError = useAuth((state) => state.error)
  const clearError = useAuth((state) => state.clearError)

  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const onLogin = async (data) => {
    setSubmitError('')
    clearError()
    try {
      await login({ email: data.email, password: data.password })
      navigate('/dashboard')
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
    }
  }

  const errorMsg = submitError || storeError

  return (
    <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-12 bg-white">
      <div className={`${formCard} w-full max-w-sm`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Feather className="w-6 h-6 text-[#0066cc]" strokeWidth={2} />
          <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">Taskify</span>
        </div>

        <h1 className={formTitle}>Sign in</h1>

        {/* Global error */}
        {errorMsg && (
          <div className={`${errorClass} mb-5`} role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onLogin)} noValidate>
          {/* Email */}
          <div className={formGroup}>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`${inputClass} ${errors.email ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-[#cc2f26] text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className={formGroup}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#6e6e73]">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputClass} pr-10 ${errors.password ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a6] hover:text-[#1d1d1f] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[#cc2f26] text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className={`${submitBtn} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-[#e8e8ed]" />
          <span className={mutedText}>or</span>
          <span className="flex-1 h-px bg-[#e8e8ed]" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[#6e6e73]">
          Don&apos;t have an account?{' '}
          <NavLink to="/register" className={linkClass}>
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  )
}

export default Login