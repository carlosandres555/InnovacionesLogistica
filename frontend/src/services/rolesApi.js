import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const rolesApi = {
  // Obtener todos los roles
  getAllRoles: async () => {
    const { data } = await axios.get(`${API_URL}/roles`)
    return data
  },

  // Obtener un rol específico
  getRoleByName: async (roleName) => {
    const { data } = await axios.get(`${API_URL}/roles/${roleName}`)
    return data
  },

  // Actualizar módulos de un rol
  updateRoleModules: async (roleName, modules, description) => {
    const { data } = await axios.put(`${API_URL}/roles/${roleName}/modules`, {
      modules,
      description
    })
    return data
  }
}
