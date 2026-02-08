import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          })

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true
          })

          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`

          return data
        } catch (error) {
          throw error.response?.data?.error || 'Login failed'
        }
      },

      register: async (email, password, firstName, lastName, phone) => {
        try {
          const { data } = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            firstName,
            lastName,
            phone
          })

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true
          })

          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`

          return data
        } catch (error) {
          throw error.response?.data?.error || 'Registration failed'
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })

        delete axios.defaults.headers.common['Authorization']
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) throw new Error('No refresh token')

          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          })

          set({ accessToken: data.accessToken })
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`

          return data.accessToken
        } catch (error) {
          get().logout()
          throw error
        }
      },

      initializeAuth: () => {
        const state = get()
        if (state.accessToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
