import { create } from 'zustand'
import api from '../utils/api'
import { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  addToCart: (product: Product, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true })
      const response = await api.get('/cart')
      set({ items: response.data, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  addToCart: async (product: Product, quantity = 1) => {
    try {
      await api.post('/cart', { productId: product.id, quantity })
      await get().fetchCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add to cart')
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await get().removeFromCart(itemId)
      } else {
        await api.put(`/cart/${itemId}`, { quantity })
        await get().fetchCart()
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update cart')
    }
  },

  removeFromCart: async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`)
      await get().fetchCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove from cart')
    }
  },

  clearCart: () => {
    set({ items: [] })
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  }
}))



