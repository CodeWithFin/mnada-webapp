import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPassword() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/products')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tighter">Password Login</h2>
          <p className="text-zinc-400 mt-2">Welcome back to Mnada</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg">
          {error && (
            <div className="bg-red-950/50 border border-red-900/30 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon text-black font-semibold py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-center text-sm text-zinc-400">
              Prefer passwordless login?{' '}
              <Link to="/login" className="text-neon hover:underline">
                Use magic link
              </Link>
            </p>
            <p className="text-center text-sm text-zinc-400 mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-neon hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

