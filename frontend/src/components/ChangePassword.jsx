/**
 * @file ChangePassword.jsx
 * @module ChangePassword
 * @description React component for ChangePassword. Handles UI rendering, local state, and event interactions.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, Lock, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import {
  // formCard,
  formTitle,
  labelClass,
  inputClass,
  formGroup,
  submitBtn,
  errorClass,
  successClass,
  mutedText,
  secondaryBtn,
} from '../styles/common'

function ChangePassword() {
  const navigate = useNavigate()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm()

  const newPasswordVal = watch('newPassword', '')

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      await axios.put(
        '/user/change-password',
        { currentPassword: data.currentPassword, newPassword: data.newPassword },
        { withCredentials: true }
      )
      setSuccessMsg('Password changed successfully!')
      reset()
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to change password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`${secondaryBtn} flex items-center gap-1.5 mb-6 text-xs w-fit`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {/* Icon + title */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1a73e8]/10 mx-auto mb-4">
          <Lock className="w-5 h-5 text-[#1a73e8]" />
        </div>

        <h1 className={`${formTitle} mb-2`}>Change Password</h1>
        <p className={`${mutedText} text-center mb-7`}>
          Enter your current password and choose a new one.
        </p>

        {serverError && (
          <div className={`${errorClass} mb-5`} role="alert">{serverError}</div>
        )}
        {successMsg && (
          <div className={`${successClass} mb-5`} role="status">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Current password */}
          <div className={formGroup}>
            <label htmlFor="currentPassword" className={labelClass}>
              Current password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputClass} pr-10 ${errors.currentPassword ? 'border-[#ea4335]' : ''}`}
                {...register('currentPassword', { required: 'Current password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-[#202124] transition-colors"
                aria-label={showCurrent ? 'Hide' : 'Show'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[#ea4335] text-xs mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New password */}
          <div className={formGroup}>
            <label htmlFor="newPassword" className={labelClass}>
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className={`${inputClass} pr-10 ${errors.newPassword ? 'border-[#ea4335]' : ''}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-[#202124] transition-colors"
                aria-label={showNew ? 'Hide' : 'Show'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[#ea4335] text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm new password */}
          <div className={formGroup}>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-[#ea4335]' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPasswordVal || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-[#202124] transition-colors"
                aria-label={showConfirm ? 'Hide' : 'Show'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[#ea4335] text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            id="change-password-submit-btn"
            type="submit"
            disabled={loading}
            className={`${submitBtn} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
