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

  // Obtener datos para módulo de Tráfico (solo hoy)
  getTraficoData: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/sm/trafico`, { params })
    return data
  },

  // Obtener datos históricos (solo entregas pasadas)
  getHistoricoData: async (params = {}) => {
    const { data } = await axios.get(`${API_URL}/sm/historico`, { params })
    return data
  },

  // Exportar histórico a Excel
  exportHistoricoExcel: async (params = {}) => {
    const response = await axios.get(`${API_URL}/sm/historico/export`, {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `historico_rutero_${timestamp}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
