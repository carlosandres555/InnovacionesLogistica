import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { deliveryStatusApi } from '../services/deliveryStatusApi'

export default function AdminPage() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedStatus, setExpandedStatus] = useState(null)
  const [reasonsLoading, setReasonsLoading] = useState({})
  const [statusReasons, setStatusReasons] = useState({}) // { statusId: [reasons] }
  const [showReasonForm, setShowReasonForm] = useState(null) // statusId or null
  const [reasonFormSubmitting, setReasonFormSubmitting] = useState(false)
  const [deletingReason, setDeletingReason] = useState(null) // reasonId being deleted

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: 'gray',
  })

  const [reasonFormData, setReasonFormData] = useState({
    nombre: '',
    descripcion: '',
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

  const loadReasonsByStatus = async (statusId) => {
    try {
      setReasonsLoading(prev => ({ ...prev, [statusId]: true }))
      const reasons = await deliveryStatusApi.getReasonsByStatus(statusId)
      setStatusReasons(prev => ({
        ...prev,
        [statusId]: reasons,
      }))
    } catch (err) {
      console.error('Error cargando motivos:', err)
    } finally {
      setReasonsLoading(prev => ({ ...prev, [statusId]: false }))
    }
  }

  const handleReasonInputChange = (e) => {
    const { name, value } = e.target
    setReasonFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddReason = async (e, statusId) => {
    e.preventDefault()

    if (!reasonFormData.nombre.trim()) {
      setError('El nombre del motivo es requerido')
      return
    }

    setReasonFormSubmitting(true)
    setError(null)

    try {
      await deliveryStatusApi.createDeliveryStatusReason(
        statusId,
        reasonFormData.nombre,
        reasonFormData.descripcion
      )

      setSuccessMessage(`Motivo "${reasonFormData.nombre}" creado exitosamente`)
      setReasonFormData({ nombre: '', descripcion: '' })
      setShowReasonForm(null)

      // Reload reasons
      await loadReasonsByStatus(statusId)

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Error al crear motivo de entrega')
      }
      console.error(err)
    } finally {
      setReasonFormSubmitting(false)
    }
  }

  const handleDeleteReason = async (reasonId, statusId, reasonName) => {
    if (!window.confirm(`¿Eliminar motivo "${reasonName}"?`)) {
      return
    }

    setDeletingReason(reasonId)
    setError(null)

    try {
      await deliveryStatusApi.deleteDeliveryStatusReason(reasonId)

      setSuccessMessage(`Motivo "${reasonName}" eliminado exitosamente`)

      // Reload reasons
      await loadReasonsByStatus(statusId)

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar motivo')
      console.error(err)
    } finally {
      setDeletingReason(null)
    }
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
          <div className="grid grid-cols-1 gap-4">
            {statuses.map(status => (
              <div
                key={status.id}
                className={`rounded-lg border-2 border-opacity-50 ${getColorBg(status.color)}`}
              >
                {/* Status Header */}
                <button
                  onClick={() => {
                    const isExpanding = expandedStatus !== status.id
                    setExpandedStatus(isExpanding ? status.id : null)
                    if (isExpanding && !statusReasons[status.id]) {
                      loadReasonsByStatus(status.id)
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-black/5 rounded-t-lg transition-colors"
                >
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {status.nombre}
                    </h3>
                    {status.descripcion && (
                      <p className="text-sm text-gray-700 mt-1">
                        {status.descripcion}
                      </p>
                    )}
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${getColorBg(status.color)}`}>
                      Color: {status.color}
                    </span>
                  </div>
                  {expandedStatus === status.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {/* Status Details - Reasons */}
                {expandedStatus === status.id && (
                  <div className="border-t border-opacity-50 p-4 bg-black/2">
                    {/* Reasons List */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Motivos Asociados
                      </h4>

                      {reasonsLoading[status.id] ? (
                        <div className="text-center py-4">
                          <Loader className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                        </div>
                      ) : statusReasons[status.id]?.length === 0 ? (
                        <p className="text-sm text-gray-600 italic">
                          No hay motivos asociados
                        </p>
                      ) : (
                        <div className="space-y-2 mb-3">
                          {statusReasons[status.id]?.map(reason => (
                            <div
                              key={reason.id}
                              className="bg-white rounded p-3 text-sm flex items-start justify-between group hover:bg-red-50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{reason.nombre}</p>
                                {reason.descripcion && (
                                  <p className="text-xs text-gray-600">{reason.descripcion}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteReason(reason.id, status.id, reason.nombre)}
                                disabled={deletingReason === reason.id}
                                className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Eliminar motivo"
                              >
                                {deletingReason === reason.id ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Reason Form */}
                    {showReasonForm === status.id ? (
                      <form
                        onSubmit={(e) => handleAddReason(e, status.id)}
                        className="bg-white rounded-lg p-3 space-y-3 border border-gray-200"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-gray-900 mb-1">
                            Nombre del Motivo *
                          </label>
                          <input
                            type="text"
                            name="nombre"
                            value={reasonFormData.nombre}
                            onChange={handleReasonInputChange}
                            placeholder="ej: Producto dañado"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={reasonFormSubmitting}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-900 mb-1">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            value={reasonFormData.descripcion}
                            onChange={handleReasonInputChange}
                            placeholder="Descripción (opcional)"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={reasonFormSubmitting}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={reasonFormSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-1 px-3 rounded text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            {reasonFormSubmitting ? (
                              <>
                                <Loader className="w-3 h-3 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Crear Motivo
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReasonForm(null)
                              setReasonFormData({ nombre: '', descripcion: '' })
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-1 px-3 rounded text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowReasonForm(status.id)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Motivo
                      </button>
                    )}
                  </div>
                )}
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
