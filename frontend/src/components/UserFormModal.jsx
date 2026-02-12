import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const ROLES = ['CUSTOMER', 'IN_HOUSE', 'ANALISTA', 'ADMIN']

export default function UserFormModal({ isOpen, onClose, onSubmit, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
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
        role: initialData.role || 'CUSTOMER'
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'CUSTOMER'
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 sm:p-6 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 placeholder-gray-400 transition ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 placeholder-gray-400 transition ${
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
            <label className="block text-sm font-medium text-red-900 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || isEditing}
              className={`w-full px-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 placeholder-gray-400 transition ${
                errors.email ? 'border-red-500' : 'border-blue-200'
              }`}
              placeholder="juan@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password - Only for new users */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 placeholder-gray-400 transition ${
                  errors.password ? 'border-red-500' : 'border-blue-200'
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
            <label className="block text-sm font-medium text-red-900 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 placeholder-gray-400 transition"
              placeholder="+57 3001234567"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-red-900 mb-2">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900 transition"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {role === 'CUSTOMER' && '👤 CUSTOMER (Acceso básico)'}
                  {role === 'IN_HOUSE' && '🏢 IN_HOUSE (Tráfico e histórico)'}
                  {role === 'ANALISTA' && '📊 ANALISTA (Gestión de logística)'}
                  {role === 'ADMIN' && '🔐 ADMIN (Acceso total)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Los módulos se asignan automáticamente según el rol
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 text-sm text-gray-700 bg-gray-100 border border-blue-200 hover:bg-red-100 rounded-xl transition disabled:opacity-50 order-2 sm:order-1 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-3 text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition disabled:opacity-50 order-1 sm:order-2 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-900/50"
            >
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
