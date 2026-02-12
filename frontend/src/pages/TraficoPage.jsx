import { useState, useEffect } from 'react'
import { Zap, ChevronDown, ChevronUp, Filter, Truck, Check, AlertCircle, XCircle, Loader, Edit } from 'lucide-react'
import { smApi } from '../services/smApi'
import { deliveryStatusApi } from '../services/deliveryStatusApi'
import DeliveryStatusModal from '../components/DeliveryStatusModal'

export default function TraficoPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedCarga, setExpandedCarga] = useState(null)
  const [deliveryStatuses, setDeliveryStatuses] = useState([])
  const [entregaStatuses, setEntregaStatuses] = useState({}) // { entregaId: { id, status, ... } }
  const [updatingEntrega, setUpdatingEntrega] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntrega, setSelectedEntrega] = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    fecha: '',
    ruta: '',
    ciudad: '',
    codCliente: ''
  })

  useEffect(() => {
    loadDeliveryStatuses()
    loadTraficoData()
  }, [page, filters])

  const loadDeliveryStatuses = async () => {
    try {
      const statuses = await deliveryStatusApi.getDeliveryStatuses()
      setDeliveryStatuses(statuses)
    } catch (err) {
      console.error('Error cargando estados de entrega:', err)
    }
  }

  const loadTraficoData = async () => {
    try {
      setLoading(true)
      const result = await smApi.getTraficoData({
        ...filters,
        page,
        limit: 500 // Aumentar para obtener todas las cargas
      })
      setData(result.details)
      setTotalPages(result.pagination.pages)
      setError(null)
    } catch (err) {
      setError('Error al cargar datos de tráfico')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPage(1)
  }

  const loadEntregaStatus = async (entregaId) => {
    try {
      const status = await deliveryStatusApi.getEntregaStatus(entregaId)
      setEntregaStatuses(prev => ({
        ...prev,
        [entregaId]: status
      }))
    } catch (err) {
      console.error('Error cargando estado de entrega:', err)
    }
  }

  const handleModalSave = async () => {
    // Reload the status for the updated entrega
    if (selectedEntrega) {
      await loadEntregaStatus(selectedEntrega.id)
    }
  }

  const handleUpdateEntregaStatus = async (entregaId, statusId) => {
    setUpdatingEntrega(entregaId)
    try {
      await deliveryStatusApi.updateEntregaStatus(entregaId, statusId)
      await loadEntregaStatus(entregaId)
    } catch (err) {
      console.error('Error actualizando estado:', err)
      alert('Error al actualizar estado de entrega')
    } finally {
      setUpdatingEntrega(null)
    }
  }

  const getStatusIcon = (statusNombre) => {
    switch (statusNombre?.toUpperCase()) {
      case 'EXITOSA':
        return <Check className="w-4 h-4 text-green-600" />
      case 'PARCIAL':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'NO EXITOSA':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (statusNombre) => {
    switch (statusNombre?.toUpperCase()) {
      case 'EXITOSA':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PARCIAL':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'NO EXITOSA':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getProgressData = (entregas) => {
    const total = entregas.length
    const asignadas = entregas.filter(e => entregaStatuses[e.id]?.status).length
    const porcentaje = total > 0 ? Math.round((asignadas / total) * 100) : 0
    return { total, asignadas, porcentaje }
  }

  const getProgressColor = (porcentaje) => {
    if (porcentaje === 100) return 'bg-green-500'
    if (porcentaje >= 75) return 'bg-blue-500'
    if (porcentaje >= 50) return 'bg-yellow-500'
    if (porcentaje >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Agrupar por numCarga
  const groupedByNumCarga = data.reduce((acc, item) => {
    if (!acc[item.numCarga]) {
      acc[item.numCarga] = []
    }
    acc[item.numCarga].push(item)
    return acc
  }, {})

  // Convertir a array y ordenar
  const cargasArray = Object.entries(groupedByNumCarga).map(([numCarga, entregas]) => ({
    numCarga,
    placa: [...new Set(entregas.map(e => e.cargas))].join(' / '), // Placas únicas
    entregas,
    totalEntregas: entregas.length,
    totalCarga: entregas.reduce((sum, e) => sum + e.totalGeneral, 0),
    ciudades: [...new Set(entregas.map(e => e.ciudad))].join(', '),
    rutas: [...new Set(entregas.map(e => e.ruta))].join(', ')
  }))

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
          Tráfico
        </h1>
        <p className="text-gray-600">Monitoreo y seguimiento de cargas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="text"
              placeholder="ej: 11-Feb"
              value={filters.fecha}
              onChange={(e) => handleFilterChange('fecha', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ruta
            </label>
            <input
              type="text"
              placeholder="ej: Q0210"
              value={filters.ruta}
              onChange={(e) => handleFilterChange('ruta', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              placeholder="ej: Barranquilla"
              value={filters.ciudad}
              onChange={(e) => handleFilterChange('ciudad', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cód. Cliente
            </label>
            <input
              type="text"
              placeholder="ej: 110501"
              value={filters.codCliente}
              onChange={(e) => handleFilterChange('codCliente', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Datos */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay datos de tráfico disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cargas agrupadas */}
          <div className="space-y-3">
            {cargasArray.map((carga) => (
              <div key={carga.numCarga} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header de carga */}
                <button
                  onClick={() => {
                    const isExpanding = expandedCarga !== carga.numCarga
                    setExpandedCarga(isExpanding ? carga.numCarga : null)
                    // Cargar estados de entregas cuando se expande
                    if (isExpanding) {
                      carga.entregas.forEach(entrega => {
                        if (!entregaStatuses[entrega.id]) {
                          loadEntregaStatus(entrega.id)
                        }
                      })
                    }
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900"># {carga.numCarga}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {carga.placa}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {carga.totalEntregas} entregas • Total: {carga.totalCarga} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-700">{carga.rutas}</p>
                    <p className="text-xs text-gray-500">{carga.ciudades}</p>
                  </div>
                  {expandedCarga === carga.numCarga ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Barra de progreso de asignación */}
                {(() => {
                  const progress = getProgressData(carga.entregas)
                  return (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-700">
                          Estados Asignados: {progress.asignadas} de {progress.total}
                        </p>
                        <p className="text-xs font-bold text-gray-900">{progress.porcentaje}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.porcentaje)}`}
                          style={{ width: `${progress.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })()}

                {/* Detalles de entregas */}
                {expandedCarga === carga.numCarga && (
                  <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-3 space-y-3">
                    {carga.entregas.map((entrega, index) => (
                        <div key={entrega.id} className="px-5 py-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Información de entrega - Lado izquierdo */}
                          <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Cliente</p>
                                <p className="text-gray-900">{entrega.nombreCliente}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Ruta / Ciudad</p>
                                <p className="text-gray-900">{entrega.ruta} - {entrega.ciudad}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Cód. Cliente</p>
                                <p className="text-gray-900">{entrega.codCliente}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Secuencia</p>
                                <p className="text-gray-900">{entrega.secuencia}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Productos</p>
                                <p className="text-gray-900">
                                  Alq: {entrega.alqueria} | Yog: {entrega.yogurt} | Que: {entrega.quesos}
                                </p>
                              </div>
                              {entrega.ordenCompra && (
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Orden Compra</p>
                                  <p className="text-gray-900">{entrega.ordenCompra}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Estado de entrega - Lado derecho */}
                          <div className="flex flex-col sm:flex-row items-start lg:items-center gap-2 whitespace-nowrap">
                            {updatingEntrega === entrega.id ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Actualizando...</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                  {entregaStatuses[entrega.id]?.status ? (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(entregaStatuses[entrega.id].status.nombre)}`}>
                                      {getStatusIcon(entregaStatuses[entrega.id].status.nombre)}
                                      {entregaStatuses[entrega.id].status.nombre}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500">Sin estado</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedEntrega(entrega)
                                    setModalOpen(true)
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                  title="Editar estado"
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                  <span>Editar</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Status Modal */}
      {selectedEntrega && (
        <DeliveryStatusModal
          entrega={selectedEntrega}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedEntrega(null)
          }}
          onSave={handleModalSave}
        />
      )}
    </div>
  )
}
