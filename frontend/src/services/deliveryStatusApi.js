import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const deliveryStatusApi = {
  // Obtener todos los estados disponibles
  getDeliveryStatuses: async () => {
    const { data } = await axios.get(`${API_URL}/delivery-status`)
    return data
  },

  // Obtener estado de una entrega específica
  getEntregaStatus: async (entregaId) => {
    try {
      const { data } = await axios.get(`${API_URL}/delivery-status/entrega/${entregaId}`)
      return data
    } catch (error) {
      // Si no existe, retornar null
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  // Actualizar estado de una entrega
  updateEntregaStatus: async (entregaId, statusId, observaciones = '') => {
    const { data } = await axios.put(`${API_URL}/delivery-status/entrega/${entregaId}`, {
      statusId,
      observaciones,
    })
    return data
  },

  // Crear nuevo estado (admin only)
  createDeliveryStatus: async (nombre, descripcion = '', color = '') => {
    const { data } = await axios.post(`${API_URL}/delivery-status`, {
      nombre,
      descripcion,
      color,
    })
    return data
  },
}
