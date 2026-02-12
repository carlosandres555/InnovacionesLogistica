import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const smApi = {
  // Obtener todos los uploads de SM
  getSMUploads: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/sm/uploads`, { params })
    return data
  },

  // Obtener detalles de un upload específico
  getSMDetails: async (uploadId, params = {}) => {
    const { data } = await axios.get(`${API_URL}/sm/uploads/${uploadId}/details`, { params })
    return data
  },

  // Subir archivo Excel
  uploadSMFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axios.post(`${API_URL}/sm/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  // Obtener datos para módulo de Tráfico
  getTraficoData: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/sm/trafico`, { params })
    return data
  }
}
