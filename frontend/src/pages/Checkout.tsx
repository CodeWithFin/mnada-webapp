import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../utils/api'
import { formatPriceKSH, convertToKSH } from '../utils/price'

export default function Checkout() {
  const { items, getTotal, clearCart, fetchCart } = useCartStore()
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'waiting' | 'success' | 'failed'>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [fetchCart, items.length, navigate])

  // Poll for payment status
  useEffect(() => {
    if (!checkoutRequestID || paymentStatus !== 'waiting') {
      return
    }

    let pollInterval: NodeJS.Timeout | null = null
    let timeout: NodeJS.Timeout | null = null

    const currentCheckoutRequestID = checkoutRequestID
    const currentOrderId = orderId

    pollInterval = setInterval(async () => {
      try {
        const response = await api.post('/payment/stk-query', {
          checkoutRequestID: currentCheckoutRequestID
        })

        if (response.data.ResultCode === 0) {
          // Payment successful
          setPaymentStatus('success')
          clearCart()
          setTimeout(() => {
            navigate(`/orders/${currentOrderId}`)
          }, 2000)
          if (pollInterval) {
            clearInterval(pollInterval)
          }
        } else if (response.data.ResultCode && response.data.ResultCode !== 1032) {
          // Payment failed (1032 means still processing)
          setPaymentStatus('failed')
          if (pollInterval) {
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Payment status check error:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 5 minutes
    timeout = setTimeout(() => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      setPaymentStatus((prev) => {
        if (prev === 'waiting') {
          return 'failed'
        }
        return prev
      })
    }, 300000) // 5 minutes

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [checkoutRequestID, paymentStatus, orderId, navigate, clearCart])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPaymentStatus('processing')

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      // Step 1: Create order
      const orderResponse = await api.post('/orders', {
        items: orderItems,
        shippingAddress
      })

      const order = orderResponse.data
      setOrderId(order.id)

      // Step 2: Convert total to KSH and initiate STK push
      const totalKSH = convertToKSH(getTotal())

      const stkResponse = await api.post('/payment/stk-push', {
        phoneNumber,
        amount: totalKSH,
        orderId: order.id
      })

      if (stkResponse.data.responseCode === 0) {
        setCheckoutRequestID(stkResponse.data.checkoutRequestID)
        setPaymentStatus('waiting')
        // Show message to user
        alert(stkResponse.data.customerMessage || 'Please check your phone and enter your M-Pesa PIN to complete the payment.')
      } else {
        setPaymentStatus('failed')
        alert('Failed to initiate payment. Please try again.')
      }
    } catch (error: any) {
      setPaymentStatus('failed')
      alert(error.response?.data?.message || 'Checkout failed')
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
              <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0712345678 or 254712345678"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Enter your M-Pesa registered phone number
              </p>
            </div>

            {paymentStatus === 'waiting' && (
              <div className="bg-blue-950/30 border border-blue-900/30 p-4 rounded-lg">
                <p className="text-blue-400 font-semibold mb-2">Waiting for payment...</p>
                <p className="text-sm text-zinc-400">
                  Please check your phone and enter your M-Pesa PIN to complete the payment.
                </p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-950/30 border border-green-900/30 p-4 rounded-lg">
                <p className="text-green-400 font-semibold">Payment successful! Redirecting...</p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-950/30 border border-red-900/30 p-4 rounded-lg">
                <p className="text-red-400 font-semibold">Payment failed. Please try again.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || paymentStatus === 'waiting' || paymentStatus === 'success'}
              className="w-full bg-neon text-black font-semibold py-4 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : paymentStatus === 'waiting' ? 'Waiting for payment...' : paymentStatus === 'success' ? 'Payment successful!' : 'Pay with M-Pesa'}
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
