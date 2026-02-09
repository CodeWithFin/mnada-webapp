import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Feed from './pages/Feed'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import CompleteProfile from './pages/CompleteProfile'
import PostDetail from './pages/PostDetail'
import AdminDashboard from './pages/AdminDashboard'
import PaymentVerify from './pages/PaymentVerify'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Initialize Lucide icons
    const initIcons = () => {
      if (window.lucide) {
        window.lucide.createIcons()
      }
    }

    // Initialize on mount and after a short delay for dynamic content
    initIcons()
    const iconInterval = setInterval(initIcons, 1000)

    // Scroll reveal animation
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, observerOptions)

    const initObserver = () => {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el)
      })
    }

    initObserver()
    const observerInterval = setInterval(initObserver, 500)

    return () => {
      clearInterval(iconInterval)
      clearInterval(observerInterval)
      observer.disconnect()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans antialiased">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerify /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/login" element={user ? <Navigate to="/products" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/products" /> : <Register />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
