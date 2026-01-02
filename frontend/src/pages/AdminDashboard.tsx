import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Product, Order } from '../types'
import { useAuthStore } from '../store/authStore'
import { formatPriceKSH, convertKSHToUSD, convertUSDToKSH } from '../utils/price'

export default function AdminDashboard() {
  const { user, checkAuth } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    category: '',
    stockCount: ''
  })

  useEffect(() => {
    // Always refresh user data on mount to get latest admin status
    const loadAdmin = async () => {
      await checkAuth()
      // Wait a bit for state to update
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        if (currentUser && currentUser.isAdmin) {
          if (activeTab === 'dashboard' || activeTab === 'products') {
            fetchData()
          }
        } else if (currentUser && currentUser.isAdmin === false) {
          navigate('/')
        }
      }, 200)
    }
    loadAdmin()
  }, [])

  useEffect(() => {
    // Fetch data when tab changes and user is admin
    if (user && user.isAdmin) {
      if (activeTab === 'dashboard' || activeTab === 'products') {
        fetchData()
      } else if (activeTab === 'orders') {
        fetchOrders()
      }
    }
  }, [activeTab])

  useEffect(() => {
    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, [showAddModal, editingProduct, products])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'dashboard') {
        const [statsRes, productsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/products')
        ])
        setStats(statsRes.data)
        setProducts(productsRes.data)
      } else if (activeTab === 'products') {
        const response = await api.get('/admin/products')
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await api.get('/admin/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert KSH price to USD for database storage
      const priceKSH = parseFloat(formData.price)
      const priceUSD = convertKSHToUSD(priceKSH)
      
      await api.post('/admin/products', {
        ...formData,
        price: priceUSD,
        images: formData.images.split(',').map(img => img.trim()).filter(img => img),
        stockCount: parseInt(formData.stockCount) || 0
      })
      setShowAddModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create product')
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      // Convert KSH price to USD for database storage
      const priceKSH = parseFloat(formData.price)
      const priceUSD = convertKSHToUSD(priceKSH)
      
      await api.put(`/admin/products/${editingProduct.id}`, {
        ...formData,
        price: priceUSD,
        images: formData.images.split(',').map(img => img.trim()).filter(img => img),
        stockCount: parseInt(formData.stockCount) || 0
      })
      setEditingProduct(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    // Convert USD price to KSH for form display
    const priceKSH = convertUSDToKSH(product.price)
    setFormData({
      name: product.name,
      description: product.description,
      price: priceKSH.toString(),
      images: product.images.join(', '),
      category: product.category,
      stockCount: product.stockCount.toString()
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      images: '',
      category: '',
      stockCount: ''
    })
  }

  // Show loading while checking admin status
  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  // Check admin status - show access denied only if explicitly false
  if (user.isAdmin === false) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Access Denied</p>
          <p className="text-zinc-500 text-sm mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={async () => {
              await checkAuth()
              // Force re-render
              window.location.reload()
            }}
            className="px-4 py-2 bg-neon text-black font-semibold rounded hover:bg-white transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage your store</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-neon border-b-2 border-neon'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-neon border-b-2 border-neon'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-neon border-b-2 border-neon'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {loading ? (
              <p className="text-zinc-400">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-zinc-400 text-sm mb-2">Total Products</p>
                  <p className="text-3xl font-bold text-neon">{stats.totalProducts}</p>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-zinc-400 text-sm mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-neon">{stats.totalOrders}</p>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-zinc-400 text-sm mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-neon">{stats.totalUsers}</p>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-zinc-400 text-sm mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-neon">{formatPriceKSH(stats.totalRevenue)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-semibold">Products</h2>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="bg-neon text-black font-semibold px-6 py-2 rounded hover:bg-white transition-colors"
              >
                Add Product
              </button>
            </div>

            {loading ? (
              <p className="text-zinc-400">Loading products...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="border border-zinc-800 bg-zinc-900/20 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-zinc-900 relative">
                      <img
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-neon font-bold mb-4">{formatPriceKSH(product.price)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded hover:border-zinc-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 px-4 py-2 bg-red-950/50 border border-red-900/30 rounded hover:border-red-700 transition-colors text-sm text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Orders</h2>
            
            {ordersLoading ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="border border-zinc-800 bg-zinc-900/20 rounded-lg p-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <p className="font-mono text-sm text-zinc-400">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'DELIVERED'
                                ? 'bg-green-950/50 text-green-400 border border-green-900/30'
                                : order.status === 'SHIPPED'
                                ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30'
                                : order.status === 'PROCESSING'
                                ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-900/30'
                                : order.status === 'CANCELLED'
                                ? 'bg-red-950/50 text-red-400 border border-red-900/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-950/50 text-green-400 border border-green-900/30'
                                : 'bg-red-950/50 text-red-400 border border-red-900/30'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-1">
                          Customer: {order.user?.username || order.user?.email || 'Unknown'}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Date: {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.shippingAddress && (
                          <div className="mt-2 text-sm text-zinc-400">
                            <p className="font-semibold text-white mb-1">Shipping Address:</p>
                            <p>{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.zip}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neon">
                          {formatPriceKSH(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <p className="text-sm font-semibold mb-3">Order Items:</p>
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-zinc-900/30 rounded"
                          >
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">{item.product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-zinc-400">
                                Quantity: {item.quantity} × {formatPriceKSH(item.price || item.product?.price || 0)}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {formatPriceKSH((item.price || item.product?.price || 0) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {(showAddModal || editingProduct) && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-display text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <i data-lucide="x" className="w-6 h-6"></i>
                </button>
              </div>

              <form
                onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (KSH)</label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => {
                        const value = e.target.value
                        // Round to nearest thousand if user enters a value
                        if (value && !isNaN(parseFloat(value))) {
                          const rounded = Math.round(parseFloat(value) / 1000) * 1000
                          setFormData({ ...formData, price: rounded.toString() })
                        } else {
                          setFormData({ ...formData, price: value })
                        }
                      }}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                      placeholder="e.g., 7000 (will be rounded to nearest thousand)"
                    />
                    {formData.price && !isNaN(parseFloat(formData.price)) && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Enter price in KSH (rounded to nearest thousand)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Count</label>
                    <input
                      type="number"
                      required
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URLs (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-neon text-black font-semibold py-3 rounded hover:bg-white transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                    className="flex-1 border border-zinc-800 text-white font-semibold py-3 rounded hover:border-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

