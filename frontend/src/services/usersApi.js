import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const usersApi = {
  getUsers: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/users`, { params })
    return data
  },

  getUserById: async (id) => {
    const { data } = await axios.get(`${API_URL}/users/${id}`)
    return data
  },

  createUser: async (userData) => {
    const { data } = await axios.post(`${API_URL}/users`, userData)
    return data
  },

  updateUser: async (id, userData) => {
    const { data } = await axios.put(`${API_URL}/users/${id}`, userData)
    return data
  },

  deleteUser: async (id) => {
    const { data } = await axios.delete(`${API_URL}/users/${id}`)
    return data
  },

  resetPassword: async (id, password) => {
    const { data } = await axios.post(`${API_URL}/users/${id}/reset-password`, { password })
    return data
  }
}
