import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const contractorsApi = {
  // Obtener todos los contratistas
  getAllContractors: async () => {
    const { data } = await axios.get(`${API_URL}/contractors`)
    return data
  },

  // Obtener contratista con sus vehículos
  getContractorWithVehicles: async (contractorId) => {
    const { data } = await axios.get(`${API_URL}/contractors/${contractorId}`)
    return data
  },

  // Crear contratista
  createContractor: async (name, description, email, phone) => {
    const { data } = await axios.post(`${API_URL}/contractors`, {
      name,
      description,
      email,
      phone
    })
    return data
  },

  // Actualizar contratista
  updateContractor: async (contractorId, updates) => {
    const { data } = await axios.put(`${API_URL}/contractors/${contractorId}`, updates)
    return data
  },

  // Agregar vehículo a contratista
  addVehicle: async (contractorId, plate, model, capacity) => {
    const { data } = await axios.post(`${API_URL}/contractors/${contractorId}/vehicles`, {
      plate,
      model,
      capacity
    })
    return data
  },

  // Actualizar vehículo
  updateVehicle: async (vehicleId, updates) => {
    const { data } = await axios.put(`${API_URL}/contractors/vehicles/${vehicleId}`, updates)
    return data
  },

  // Eliminar vehículo
  deleteVehicle: async (vehicleId) => {
    const { data } = await axios.delete(`${API_URL}/contractors/vehicles/${vehicleId}`)
    return data
  }
}
