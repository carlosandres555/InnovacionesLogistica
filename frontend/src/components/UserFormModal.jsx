import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const MODULES = ['dashboard', 'users']
const ROLES = ['CUSTOMER', 'IN_HOUSE', 'ANALISTA', 'ADMIN']

export default function UserFormModal({ isOpen, onClose, onSubmit, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
    permissions: { modules: ['dashboard'] }
  })

  const [errors, setErrors] = useState({})
  const isEditing = initialData?.id

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        password: '',
        phone: initialData.phone || '',
        role: initialData.role || 'CUSTOMER',
        permissions: initialData.permissions || { modules: ['dashboard'] }
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'CUSTOMER',
        permissions: { modules: ['dashboard'] }
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleModuleToggle = (module) => {
    setFormData(prev => {
      const modules = prev.permissions.modules.includes(module)
        ? prev.permissions.modules.filter(m => m !== module)
        : [...prev.permissions.modules, module]

      return {
        ...prev,
        permissions: { modules }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido'
    if (!formData.email.trim()) newErrors.email = 'Email requerido'
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido'
    if (!isEditing && !formData.password) newErrors.password = 'Contraseña requerida'
    if (!isEditing && formData.password.length < 6) newErrors.password = 'Contraseña mínimo 6 caracteres'
    if (formData.permissions.modules.length === 0) newErrors.modules = 'Selecciona al menos un módulo'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pérez"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="juan@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password - Only for new users */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="+57 3001234567"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Modules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Módulos Permitidos
            </label>
            <div className="space-y-2">
              {MODULES.map(module => (
                <label key={module} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.modules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700 capitalize">{module}</span>
                </label>
              ))}
            </div>
            {errors.modules && (
              <p className="text-sm text-red-500 mt-2">{errors.modules}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 order-1 sm:order-2"
            >
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
