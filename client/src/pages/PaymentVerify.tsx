import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useCartStore } from '../store/cartStore'

export default function PaymentVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference found')
      return
    }

    api
      .get(`/payment/verify/${reference}`)
      .then((res) => {
        if (res.data.success && res.data.orderId) {
          setStatus('success')
          clearCart()
          setTimeout(() => {
            navigate(`/orders/${res.data.orderId}`)
          }, 2000)
        } else {
          setStatus('failed')
          setMessage(res.data.message || 'Verification failed')
        }
      })
      .catch((err) => {
        setStatus('failed')
        setMessage(err.response?.data?.message || 'Payment verification failed')
      })
  }, [searchParams, navigate, clearCart])

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg">
            <p className="text-lg text-zinc-300">Verifying your payment...</p>
            <div className="mt-4 h-8 w-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
        {status === 'success' && (
          <div className="bg-green-950/30 border border-green-900/30 p-8 rounded-lg">
            <p className="text-green-400 font-semibold text-lg">Payment successful!</p>
            <p className="text-zinc-400 mt-2">Redirecting to your order...</p>
          </div>
        )}
        {status === 'failed' && (
          <div className="bg-red-950/30 border border-red-900/30 p-8 rounded-lg">
            <p className="text-red-400 font-semibold text-lg">Verification failed</p>
            <p className="text-zinc-400 mt-2">{message}</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-6 px-6 py-2 bg-neon text-black font-semibold rounded hover:bg-white transition-colors"
            >
              View orders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
