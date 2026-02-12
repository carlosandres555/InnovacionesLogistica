import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { deliveryStatusApi } from '../services/deliveryStatusApi'

export default function DeliveryStatusModal({ entrega, isOpen, onClose, onSave }) {
  const [statuses, setStatuses] = useState([])
  const [reasons, setReasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    statusId: '',
    reasonId: '',
    observaciones: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, entrega])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load statuses
      const statusesData = await deliveryStatusApi.getDeliveryStatuses()
      setStatuses(statusesData)

      // Load current status if exists
      const currentStatus = await deliveryStatusApi.getEntregaStatus(entrega.id)
      if (currentStatus) {
        setFormData({
          statusId: currentStatus.status?.id || '',
          reasonId: currentStatus.reason?.id || '',
          observaciones: currentStatus.observaciones || '',
        })

        // Load reasons for current status
        if (currentStatus.status?.id) {
          const reasonsData = await deliveryStatusApi.getReasonsByStatus(
            currentStatus.status.id
          )
          setReasons(reasonsData)
        }
      }
    } catch (err) {
      setError('Error al cargar datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (e) => {
    const statusId = e.target.value
    setFormData(prev => ({
      ...prev,
      statusId,
      reasonId: '', // Reset reason when status changes
    }))

    if (statusId) {
      try {
        const reasonsData = await deliveryStatusApi.getReasonsByStatus(statusId)
        setReasons(reasonsData)
      } catch (err) {
        setReasons([])
        console.error(err)
      }
    } else {
      setReasons([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.statusId) {
      setError('El estado es requerido')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await deliveryStatusApi.updateEntregaStatus(
        entrega.id,
        formData.statusId,
        formData.reasonId || null,
        formData.observaciones
      )

      onSave()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar estado')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Estado de Entrega
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Entrega Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Cliente:</span> {entrega.nombreCliente}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Ruta:</span> {entrega.ruta}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Status Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estado de Entrega *
                </label>
                <select
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleStatusChange}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar estado...</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Selector - Conditional */}
              {reasons.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Motivo
                  </label>
                  <select
                    name="reasonId"
                    value={formData.reasonId}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seleccionar motivo (opcional)</option>
                    {reasons.map(reason => (
                      <option key={reason.id} value={reason.id}>
                        {reason.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observations */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Agregar observaciones (opcional)"
                  rows="3"
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
