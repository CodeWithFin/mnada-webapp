import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Product } from '../types'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatPriceKSH } from '../utils/price'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (search) params.search = search
      if (category) params.category = category
      
      const response = await api.get('/products', { params })
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const [addToCartMessage, setAddToCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setAddToCartMessage({ type: 'error', text: 'Please login to add items to cart' })
      setTimeout(() => setAddToCartMessage(null), 3000)
      return
    }
    try {
      await addToCart(product)
      setAddToCartMessage({ type: 'success', text: `${product.name} added to cart!` })
      setTimeout(() => setAddToCartMessage(null), 3000)
    } catch (error: any) {
      setAddToCartMessage({ type: 'error', text: error.message || 'Failed to add to cart' })
      setTimeout(() => setAddToCartMessage(null), 3000)
    }
  }

  const categories = Array.from(new Set(products.map(p => p.category)))

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {addToCartMessage && (
          <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            addToCartMessage.type === 'success' 
              ? 'bg-neon text-black' 
              : 'bg-red-500 text-white'
          }`}>
            <span>{addToCartMessage.text}</span>
            <button 
              onClick={() => setAddToCartMessage(null)}
              className="ml-2 hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        <h1 className="font-display text-4xl font-semibold tracking-tighter mb-8">Products</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="border border-zinc-800 bg-zinc-900/20 hover:border-zinc-600 transition-colors rounded-lg overflow-hidden group">
                <Link to={`/products/${product.id}`}>
                  <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                    <img
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-neon transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-neon font-bold">{formatPriceKSH(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="px-4 py-2 bg-neon text-black font-semibold text-sm rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



