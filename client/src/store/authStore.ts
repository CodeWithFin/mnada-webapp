import { create } from 'zustand'
import api from '../utils/api'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  verifyOTP: (email: string, code: string, username?: string, firstName?: string, lastName?: string) => Promise<{ isNewUser?: boolean } | void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ token, user })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  register: async (email: string, username: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await api.post('/auth/register', { email, username, password, firstName, lastName })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ token, user })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  verifyOTP: async (email: string, code: string, username?: string, firstName?: string, lastName?: string) => {
    try {
      const response = await api.post('/otp/verify', { email, code, username, firstName, lastName })
      const { token, user, isNewUser } = response.data
      localStorage.setItem('token', token)
      set({ token, user })
      return { isNewUser }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid verification code')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, token: null })
      return
    }

    try {
      const response = await api.get('/auth/me')
      set({ user: response.data, token })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', data)
      set({ user: response.data })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed')
    }
  }
}))



