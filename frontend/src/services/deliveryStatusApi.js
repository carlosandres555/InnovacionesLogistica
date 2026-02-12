import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const deliveryStatusApi = {
  // Obtener todos los estados disponibles
  getDeliveryStatuses: async () => {
    const { data } = await axios.get(`${API_URL}/delivery-status`)
    return data
  },

  // Obtener motivos para un estado específico
  getReasonsByStatus: async (statusId) => {
    try {
      const { data } = await axios.get(`${API_URL}/delivery-status/reasons/${statusId}`)
      return data
    } catch (error) {
      if (error.response?.status === 404) {
        return []
      }
      throw error
    }
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

  // Actualizar estado de una entrega (con motivo opcional y devolución)
  updateEntregaStatus: async (entregaId, statusId, reasonId = null, observaciones = '', recogioDevoluccion = false) => {
    const { data } = await axios.put(`${API_URL}/delivery-status/entrega/${entregaId}`, {
      statusId,
      reasonId,
      observaciones,
      recogioDevoluccion,
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

  // Crear nuevo motivo para un estado (admin only)
  createDeliveryStatusReason: async (statusId, nombre, descripcion = '') => {
    const { data } = await axios.post(`${API_URL}/delivery-status/reasons`, {
      statusId,
      nombre,
      descripcion,
    })
    return data
  },

  // Eliminar un motivo (admin only)
  deleteDeliveryStatusReason: async (reasonId) => {
    const { data } = await axios.delete(`${API_URL}/delivery-status/reasons/${reasonId}`)
    return data
  },
}
