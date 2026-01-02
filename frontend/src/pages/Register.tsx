import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOTP, setDevOTP] = useState<string | null>(null)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/otp/request', { email, isSignup: true })
      setDevOTP(response.data.devOTP || null)
      // Redirect to verification page with signup flag
      navigate('/verify-otp', { state: { email, isSignup: true } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tighter">Sign Up</h2>
          <p className="text-zinc-400 mt-2">
            {location.state?.fromLogin 
              ? 'Account not found. Enter your email to create an account'
              : 'Enter your email to create an account'}
          </p>
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
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>

          <div className="text-center">
            <p className="text-sm text-zinc-400">
              We'll send a 6-digit code to your email
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-neon hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
