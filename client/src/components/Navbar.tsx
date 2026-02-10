import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { fetchCart, getItemCount } = useCartStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user, fetchCart])

  useEffect(() => {
    // Initialize Lucide icons when menu opens or user state changes
    if (window.lucide) {
      setTimeout(() => window.lucide?.createIcons(), 100)
    }
  }, [mobileMenuOpen, user])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-display font-semibold tracking-tighter text-lg uppercase" onClick={() => setMobileMenuOpen(false)}>
          Mnada
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium hover:text-neon transition-colors">
            Shop
          </Link>
          {user ? (
            <>
              <Link to="/feed" className="text-sm font-medium hover:text-neon transition-colors">
                Feed
              </Link>
              <Link to="/explore" className="text-sm font-medium hover:text-neon transition-colors">
                Explore
              </Link>
              <Link to="/cart" className="relative text-sm font-medium hover:text-neon transition-colors">
                Cart
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-neon text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              <Link to={`/profile/${user.id}`} className="text-sm font-medium hover:text-neon transition-colors">
                Profile
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-sm font-medium hover:text-neon transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm font-medium hover:text-neon transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-neon transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-neon text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-white transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile cart and menu buttons */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link 
              to="/cart" 
              className="relative text-white p-2 hover:bg-zinc-800 rounded transition-colors"
              aria-label="Cart"
            >
              <i data-lucide="shopping-cart" className="w-6 h-6"></i>
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>
          )}
          <button 
            onClick={toggleMobileMenu}
            className="text-white p-2 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <i data-lucide="x" className="w-6 h-6"></i>
            ) : (
              <i data-lucide="menu" className="w-6 h-6"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-zinc-800 pt-4">
          <div className="flex flex-col gap-4">
            <Link 
              to="/products" 
              className="text-sm font-medium hover:text-neon transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            {user ? (
              <>
                <Link 
                  to="/feed" 
                  className="text-sm font-medium hover:text-neon transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link 
                  to="/explore" 
                  className="text-sm font-medium hover:text-neon transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link 
                  to="/cart" 
                  className="relative text-sm font-medium hover:text-neon transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart
                  {getItemCount() > 0 && (
                    <span className="ml-2 bg-neon text-black text-xs font-bold rounded-full px-2 py-0.5">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
                <Link 
                  to={`/profile/${user.id}`} 
                  className="text-sm font-medium hover:text-neon transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium hover:text-neon transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="text-left text-sm font-medium hover:text-neon transition-colors py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-medium hover:text-neon transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-neon text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-white transition-colors inline-block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}



