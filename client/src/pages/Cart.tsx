import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { formatPriceKSH } from '../utils/price'

export default function Cart() {
  const { items, loading, fetchCart, updateQuantity, removeFromCart, getTotal } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading cart...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="font-display text-3xl font-semibold mb-4">Your Cart is Empty</h1>
          <p className="text-zinc-400 mb-8">Add some products to get started!</p>
          <Link to="/products" className="inline-block bg-neon text-black font-semibold px-6 py-3 rounded hover:bg-white transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-8">Shopping Cart</h1>

        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.id} className="border border-zinc-800 bg-zinc-900/20 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link to={`/products/${item.product.id}`} className="w-full sm:w-24 aspect-square bg-zinc-900 rounded overflow-hidden flex-shrink-0">
                <img src={item.product.images[0] || '/placeholder.jpg'} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 w-full">
                <Link to={`/products/${item.product.id}`}>
                  <h3 className="font-semibold mb-2 hover:text-neon transition-colors">{item.product.name}</h3>
                </Link>
                <p className="text-neon font-bold mb-3">{formatPriceKSH(item.product.price)}</p>
                <div className="flex items-center flex-wrap gap-3 sm:gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-zinc-800 rounded flex items-center justify-center hover:border-neon transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-zinc-800 rounded flex items-center justify-center hover:border-neon transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-left sm:text-right sm:self-start sm:w-32">
                <p className="font-semibold text-lg sm:text-base">{formatPriceKSH(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <span className="text-xl font-semibold">Total</span>
            <span className="text-2xl text-neon font-bold">{formatPriceKSH(getTotal())}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-neon text-black font-semibold py-4 rounded hover:bg-white transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
