import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Product } from '../types'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatPriceKSH } from '../utils/price'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
      setSelectedImage(0)
    } catch (error) {
      console.error('Failed to fetch product:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!product) return

    try {
      await addToCart(product, quantity)
      alert('Added to cart!')
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-neon' : 'border-zinc-800'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter mb-4">{product.name}</h1>
            <p className="text-3xl text-neon font-bold mb-6">{formatPriceKSH(product.price)}</p>
            <p className="text-zinc-400 mb-8 leading-relaxed">{product.description}</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-zinc-800 rounded flex items-center justify-center hover:border-neon transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-zinc-800 rounded flex items-center justify-center hover:border-neon transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-neon text-black font-semibold py-4 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-white">Category:</span> {product.category}
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                <span className="font-semibold text-white">Stock:</span>{' '}
                {product.inStock ? `${product.stockCount} available` : 'Out of stock'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
