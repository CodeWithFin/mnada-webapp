import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [devOTP, setDevOTP] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/otp/request', { email, isSignup: false })
      setOtpSent(true)
      // In development, show the OTP if provided
      if (response.data.devOTP) {
        setDevOTP(response.data.devOTP)
      }
      // Redirect to verification page
      navigate('/verify-otp', { state: { email, isSignup: false } })
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      const errorMessage = err.response?.data?.message || 'Failed to send OTP'
      
      // If user not found, redirect to signup
      if (errorCode === 'USER_NOT_FOUND' || err.response?.status === 404) {
        setError('Account not found. Redirecting to signup...')
        setTimeout(() => {
          navigate('/register', { state: { email, fromLogin: true } })
        }, 1500)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tighter">Login</h2>
          <p className="text-zinc-400 mt-2">Enter your email to receive a login code</p>
        </div>

        <form onSubmit={handleRequestOTP} className="mt-8 space-y-6 bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg">
          {error && (
            <div className="bg-red-950/50 border border-red-900/30 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {devOTP && (
            <div className="bg-zinc-800 border border-neon/30 text-neon px-4 py-3 rounded">
              <p className="text-sm font-mono">DEV MODE: Your OTP is {devOTP}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon text-black font-semibold py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending code...' : 'Send Login Code'}
          </button>

          <div className="text-center">
            <p className="text-sm text-zinc-400">
              We'll send a 6-digit code to your email
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
