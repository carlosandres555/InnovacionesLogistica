import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, AlertCircle, Loader } from 'lucide-react'
import { deliveryStatusApi } from '../services/deliveryStatusApi'

export default function AdminPage() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: 'gray',
  })

  const colorOptions = [
    { value: 'green', label: '🟢 Verde (Exitosa)', bg: 'bg-green-100', text: 'text-green-900' },
    { value: 'orange', label: '🟠 Naranja (Parcial)', bg: 'bg-orange-100', text: 'text-orange-900' },
    { value: 'red', label: '🔴 Rojo (No Exitosa)', bg: 'bg-red-100', text: 'text-red-900' },
    { value: 'blue', label: '🔵 Azul', bg: 'bg-blue-100', text: 'text-blue-900' },
    { value: 'yellow', label: '🟡 Amarillo', bg: 'bg-yellow-100', text: 'text-yellow-900' },
    { value: 'gray', label: '⚫ Gris', bg: 'bg-gray-100', text: 'text-gray-900' },
  ]

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    try {
      setLoading(true)
      const data = await deliveryStatusApi.getDeliveryStatuses()
      setStatuses(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar estados de entrega')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await deliveryStatusApi.createDeliveryStatus(
        formData.nombre,
        formData.descripcion,
        formData.color
      )

      setSuccessMessage(`Estado "${formData.nombre}" creado exitosamente`)
      setFormData({ nombre: '', descripcion: '', color: 'gray' })
      setShowForm(false)

      // Recargar estados
      await loadStatuses()

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Error al crear estado de entrega')
      }
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const getColorBg = (color) => {
    const option = colorOptions.find(opt => opt.value === color)
    return option ? option.bg : 'bg-gray-100'
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
          Administración
        </h1>
        <p className="text-gray-600">Gestiona los estados de entrega</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Sección: Estados Actuales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Estados de Entrega</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Estado
          </button>
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4 border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Estado *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="ej: ENTREGADO, EN TRÁNSITO, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del estado (opcional)"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Color
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Estado
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de estados */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-2">Cargando estados...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay estados creados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statuses.map(status => (
              <div
                key={status.id}
                className={`p-4 rounded-lg border-2 ${getColorBg(status.color)} border-opacity-50`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {status.nombre}
                </h3>
                {status.descripcion && (
                  <p className="text-sm text-gray-700 mb-3">
                    {status.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getColorBg(status.color)}`}>
                    Color: {status.color}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Los estados creados aparecerán automáticamente en el selector de Tráfico</li>
          <li>• No se pueden eliminar estados una vez creados (para mantener historial)</li>
          <li>• El color solo es para referencia visual</li>
          <li>• Los usuarios con permiso pueden asignar estados a entregas en Tráfico</li>
        </ul>
      </div>
    </div>
  )
}
