import { useState, useEffect, useRef } from 'react'
import { useNavigate, NavLink } from 'react-router'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Feather, Loader2  } from 'lucide-react'
import axios from 'axios'
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
} from '../styles/common'

function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm()

  const passwordVal = watch('password', '')

  const onRegister = async (data) => {
    setServerError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      await axios.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      setSuccessMsg('Account created! Redirecting to login…')
      timerRef.current = setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-12 bg-white">
      <div className={`${formCard} w-full max-w-sm`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Feather className="w-6 h-6 text-[#0066cc]" strokeWidth={2} />
          <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">Taskify</span>
        </div>

        <h1 className={formTitle}>Create your account</h1>

        {serverError && (
          <div className={`${errorClass} mb-5`} role="alert">
            {serverError}
          </div>
        )}
        {successMsg && (
          <div className={`${successClass} mb-5`} role="status">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onRegister)} noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="first name"
                className={`${inputClass} ${errors.firstName ? 'border-[#ff3b30]' : ''}`}
                {...register('firstName', { required: 'Required' })}
              />
              {errors.firstName && (
                <p className="text-[#cc2f26] text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="last name"
                className={`${inputClass} ${errors.lastName ? 'border-[#ff3b30]' : ''}`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-[#cc2f26] text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className={formGroup}>
            <label htmlFor="reg-email" className={labelClass}>
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              className={`${inputClass} ${errors.email ? 'border-[#ff3b30]' : ''}`}
              {...register('email', {
                required: 'Email is required'
              })}
            />
            {errors.email && (
              <p className="text-[#cc2f26] text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className={formGroup}>
            <label htmlFor="reg-password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="enter password"
                className={`${inputClass} pr-10 ${errors.password ? 'border-[#ff3b30]' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
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

          {/* Confirm Password */}
          <div className={formGroup}>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-[#ff3b30]' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordVal || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a6] hover:text-[#1d1d1f] transition-colors"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[#cc2f26] text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className={`${submitBtn} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-[#e8e8ed]" />
          <span className={mutedText}>or</span>
          <span className="flex-1 h-px bg-[#e8e8ed]" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-[#6e6e73]">
          Already have an account?{' '}
          <NavLink to="/login" className={linkClass}>
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  )
}

export default Register