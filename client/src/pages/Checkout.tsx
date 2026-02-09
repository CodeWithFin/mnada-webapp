import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../utils/api'
import { formatPriceKSH } from '../utils/price'

export default function Checkout() {
  const { items, getTotal, fetchCart } = useCartStore()
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCart()
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [fetchCart, items.length, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      const response = await api.post('/payment/initialize', {
        items: orderItems,
        shippingAddress,
        email
      })

      const { authorizationUrl } = response.data
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      } else {
        setError('Could not start payment. Please try again.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <input
                type="text"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email (for payment receipt)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Paystack will send your receipt to this email
              </p>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/30 p-4 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon text-black font-semibold py-4 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting to Paystack...' : 'Pay with Paystack'}
            </button>
          </form>

          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-zinc-400">{item.product.name} x {item.quantity}</span>
                  <span>{formatPriceKSH(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-4 flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl text-neon font-bold">{formatPriceKSH(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
