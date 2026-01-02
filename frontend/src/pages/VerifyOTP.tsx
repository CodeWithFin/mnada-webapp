import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'

export default function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyOTP } = useAuthStore()
  const [email, setEmail] = useState(location.state?.email || '')
  const [isSignup, setIsSignup] = useState(location.state?.isSignup || false)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      navigate(isSignup ? '/register' : '/login')
      return
    }
    // Focus first input
    inputRefs.current[0]?.focus()
    // Start countdown for resend
    setCountdown(60)
  }, [email, navigate, isSignup])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newCode = [...code]
    newCode[index] = value.replace(/\D/g, '') // Only numbers
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || ''
    }
    setCode(newCode)
    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = code.join('')
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await verifyOTP(email, otpCode)
      // If new user and no username set, redirect to profile completion
      if (result?.isNewUser) {
        navigate('/complete-profile', { state: { email } })
      } else {
        navigate('/products')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return

    setResendLoading(true)
    setError('')

    try {
      await api.post('/otp/resend', { email })
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tighter">
            {isSignup ? 'Verify Your Email' : 'Verify Code'}
          </h2>
          <p className="text-zinc-400 mt-2">
            Enter the 6-digit code sent to<br />
            <span className="text-neon font-mono">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-6 bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg">
          {error && (
            <div className="bg-red-950/50 border border-red-900/30 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-mono bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-neon text-black font-semibold py-3 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-400">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="text-neon hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? 'Sending...'
                : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend Code'}
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <Link
              to={isSignup ? '/register' : '/login'}
              className="block text-center text-sm text-zinc-400 hover:text-neon transition-colors"
            >
              ← Back to {isSignup ? 'signup' : 'login'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

