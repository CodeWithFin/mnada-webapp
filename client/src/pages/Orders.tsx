import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Order } from '../types'
import { formatPriceKSH } from '../utils/price'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">No orders yet</p>
            <Link to="/products" className="inline-block bg-neon text-black font-semibold px-6 py-3 rounded hover:bg-white transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block border border-zinc-800 bg-zinc-900/20 p-6 rounded-lg hover:border-zinc-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-zinc-400">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {new Date(order.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon font-bold text-xl">{formatPriceKSH(order.totalAmount)}</p>
                    <p className="text-sm text-zinc-400 mt-1 capitalize">{order.status.toLowerCase()}</p>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-400">
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
