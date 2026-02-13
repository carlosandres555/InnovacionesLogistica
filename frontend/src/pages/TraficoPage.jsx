import { useState, useEffect } from 'react'
import { Zap, ChevronDown, ChevronUp, Filter, Truck, Check, AlertCircle, XCircle, Loader, Edit } from 'lucide-react'
import { smApi } from '../services/smApi'
import { deliveryStatusApi } from '../services/deliveryStatusApi'
import DeliveryStatusModal from '../components/DeliveryStatusModal'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

export default function TraficoPage() {
  // TAB STATE
  const [activeTab, setActiveTab] = useState('hoy')

  // HOY TAB
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedCarga, setExpandedCarga] = useState(null)
  const [deliveryStatuses, setDeliveryStatuses] = useState([])
  const [entregaStatuses, setEntregaStatuses] = useState({})
  const [updatingEntrega, setUpdatingEntrega] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntrega, setSelectedEntrega] = useState(null)
  const [progressByRoute, setProgressByRoute] = useState({})

  const [filters, setFilters] = useState({
    ruta: '',
    ciudad: '',
    codCliente: '',
    nombreCliente: ''
  })

  // PENDIENTE TAB
  const [pendienteData, setPendienteData] = useState([])
  const [pendienteLoading, setPendienteLoading] = useState(false)
  const [pendienteError, setPendienteError] = useState(null)
  const [pendientePage, setPendientePage] = useState(1)
  const [pendienteTotalPages, setPendienteTotalPages] = useState(1)
  const [expandedPendienteCarga, setExpandedPendienteCarga] = useState(null)
  const [pendienteEntregaStatuses, setPendienteEntregaStatuses] = useState({})
  const [pendienteUpdatingEntrega, setPendienteUpdatingEntrega] = useState(null)

  const [pendienteFilters, setPendienteFilters] = useState({
    ruta: '',
    ciudad: '',
    codCliente: '',
    nombreCliente: ''
  })

  const [pendienteTotal, setPendienteTotal] = useState(0)

  useEffect(() => {
    loadDeliveryStatuses()
    // Load pendiente count on initial render
    loadPendienteDataCount()
  }, [])

  useEffect(() => {
    if (activeTab === 'hoy') {
      loadTraficoData()
    } else if (activeTab === 'pendiente') {
      loadPendienteData()
    }
  }, [page, filters, pendientePage, pendienteFilters, activeTab])

  const loadDeliveryStatuses = async () => {
    try {
      const statuses = await deliveryStatusApi.getDeliveryStatuses()
      setDeliveryStatuses(statuses)
    } catch (err) {
      console.error('Error cargando estados de entrega:', err)
    }
  }

  const loadPendienteDataCount = async () => {
    try {
      const result = await smApi.getPendienteData({
        page: 1,
        limit: 1
      })
      setPendienteTotal(result.pagination.total)
    } catch (err) {
      console.error('Error cargando count de pendiente:', err)
    }
  }

  const loadTraficoData = async () => {
    try {
      setLoading(true)
      const result = await smApi.getTraficoData({
        ...filters,
        page,
        limit: 500
      })
      setData(result.details)
      setTotalPages(result.pagination.pages)
      setProgressByRoute(result.progressByRoute || {})
      setError(null)
    } catch (err) {
      setError('Error al cargar datos de tráfico')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadPendienteData = async () => {
    try {
      setPendienteLoading(true)
      const result = await smApi.getPendienteData({
        ...pendienteFilters,
        page: pendientePage,
        limit: 50
      })
      setPendienteData(result.details)
      setPendienteTotalPages(result.pagination.pages)
      setPendienteTotal(result.pagination.total)
      setPendienteError(null)
    } catch (err) {
      setPendienteError('Error al cargar tráfico pendiente')
      console.error(err)
    } finally {
      setPendienteLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPage(1)
  }

  const handlePendienteFilterChange = (field, value) => {
    setPendienteFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPendientePage(1)
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

  const loadPendienteEntregaStatus = async (entregaId) => {
    try {
      const status = await deliveryStatusApi.getEntregaStatus(entregaId)
      setPendienteEntregaStatuses(prev => ({
        ...prev,
        [entregaId]: status
      }))
    } catch (err) {
      console.error('Error cargando estado de entrega pendiente:', err)
    }
  }

  const handleModalSave = async () => {
    if (selectedEntrega) {
      if (activeTab === 'hoy') {
        await loadEntregaStatus(selectedEntrega.id)
        await loadTraficoData()
      } else if (activeTab === 'pendiente') {
        await loadPendienteData()
        await loadPendienteDataCount()
      }
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

  const getProgressData = (numCarga) => {
    return progressByRoute[numCarga] || { total: 0, asignadas: 0, porcentaje: 0 }
  }

  const getProgressColor = (porcentaje) => {
    if (porcentaje === 100) return 'bg-green-500'
    if (porcentaje >= 75) return 'bg-blue-500'
    if (porcentaje >= 50) return 'bg-yellow-500'
    if (porcentaje >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Agrupar por numCarga para HOY
  const groupedByNumCarga = data.reduce((acc, item) => {
    if (!acc[item.numCarga]) {
      acc[item.numCarga] = []
    }
    acc[item.numCarga].push(item)
    return acc
  }, {})

  const cargasArray = Object.entries(groupedByNumCarga).map(([numCarga, entregas]) => ({
    numCarga,
    placa: [...new Set(entregas.map(e => e.cargas))].join(' / '),
    entregas,
    totalEntregas: entregas.length,
    totalCarga: entregas.reduce((sum, e) => sum + e.totalGeneral, 0),
    ciudades: [...new Set(entregas.map(e => e.ciudad))].join(', '),
    rutas: [...new Set(entregas.map(e => e.ruta))].join(', ')
  }))

  // Agrupar por numCarga para PENDIENTE
  const groupedByNumCargaPendiente = pendienteData.reduce((acc, item) => {
    if (!acc[item.numCarga]) {
      acc[item.numCarga] = []
    }
    acc[item.numCarga].push(item)
    return acc
  }, {})

  const cargasArrayPendiente = Object.entries(groupedByNumCargaPendiente).map(([numCarga, entregas]) => ({
    numCarga,
    placa: [...new Set(entregas.map(e => e.cargas))].join(' / '),
    entregas,
    totalEntregas: entregas.length,
    totalCarga: entregas.reduce((sum, e) => sum + e.totalGeneral, 0),
    ciudades: [...new Set(entregas.map(e => e.ciudad))].join(', '),
    rutas: [...new Set(entregas.map(e => e.ruta))].join(', '),
    fechasRepresentadas: [...new Set(entregas.flatMap(e => e.fechasRepresentadas || []))]
  }))

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
          Tráfico
        </h1>
        <p className="text-gray-600">Monitoreo y seguimiento de entregas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('hoy')
            setPage(1)
          }}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'hoy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tráfico - Hoy
        </button>
        <button
          onClick={() => {
            setActiveTab('pendiente')
            setPendientePage(1)
          }}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pendiente'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tráfico Pendiente por Atender
          {pendienteTotal > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">
              {pendienteTotal}
            </span>
          )}
        </button>
      </div>

      {/* HOY TAB */}
      {activeTab === 'hoy' && (
        <>
          {/* Filtros */}
          <Card className="animate-slide-in-left">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Ruta"
                type="text"
                placeholder="ej: Q0210"
                value={filters.ruta}
                onChange={(e) => handleFilterChange('ruta', e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="ej: Barranquilla"
                  value={filters.ciudad}
                  onChange={(e) => handleFilterChange('ciudad', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Cód. Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej: 110501"
                  value={filters.codCliente}
                  onChange={(e) => handleFilterChange('codCliente', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Nombre Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej: Juan Pérez"
                  value={filters.nombreCliente}
                  onChange={(e) => handleFilterChange('nombreCliente', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </Card>

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
              <div className="space-y-3">
                {cargasArray.map((carga) => (
                  <Card key={carga.numCarga} noPadding className="overflow-hidden">
                    {/* Header de carga */}
                    <button
                      onClick={async () => {
                        const isExpanding = expandedCarga !== carga.numCarga
                        setExpandedCarga(isExpanding ? carga.numCarga : null)

                        if (isExpanding) {
                          for (const entrega of carga.entregas) {
                            if (!entregaStatuses[entrega.id]) {
                              await loadEntregaStatus(entrega.id)
                            }
                          }
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

                    {/* Progress bar */}
                    {(() => {
                      const progress = getProgressData(carga.numCarga)
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

                    {/* Detalles */}
                    {expandedCarga === carga.numCarga && (
                      <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-3 space-y-3">
                        {carga.entregas.map((entrega) => (
                          <div key={entrega.id} className="px-5 py-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                                    ) : entrega.deliveryStatus?.id ? (
                                      <span className="text-sm text-gray-600">
                                        ✓ Cargando...
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
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* PENDIENTE TAB */}
      {activeTab === 'pendiente' && (
        <>
          {/* Filtros */}
          <Card className="animate-slide-in-left">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-slate-900">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Ruta"
                type="text"
                placeholder="ej: Q0210"
                value={pendienteFilters.ruta}
                onChange={(e) => handlePendienteFilterChange('ruta', e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="ej: Barranquilla"
                  value={pendienteFilters.ciudad}
                  onChange={(e) => handlePendienteFilterChange('ciudad', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Cód. Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej: 110501"
                  value={pendienteFilters.codCliente}
                  onChange={(e) => handlePendienteFilterChange('codCliente', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Nombre Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej: Juan Pérez"
                  value={pendienteFilters.nombreCliente}
                  onChange={(e) => handlePendienteFilterChange('nombreCliente', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </Card>

          {/* Datos */}
          {pendienteError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold">{pendienteError}</p>
            </div>
          ) : pendienteLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">Cargando tráfico pendiente...</p>
            </div>
          ) : pendienteData.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Check className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-600">¡Excelente! No hay tráfico pendiente por atender</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {cargasArrayPendiente.map((carga) => (
                  <Card key={carga.numCarga} noPadding className="overflow-hidden">
                    {/* Header de carga */}
                    <button
                      onClick={async () => {
                        const isExpanding = expandedPendienteCarga !== carga.numCarga
                        setExpandedPendienteCarga(isExpanding ? carga.numCarga : null)

                        if (isExpanding) {
                          for (const entrega of carga.entregas) {
                            if (!pendienteEntregaStatuses[entrega.id]) {
                              await loadPendienteEntregaStatus(entrega.id)
                            }
                          }
                        }
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <Truck className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900"># {carga.numCarga}</p>
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                              {carga.placa}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {carga.totalEntregas} entregas • Total: {carga.totalCarga} unidades
                          </p>
                          <p className="text-xs text-orange-600 font-semibold mt-1">
                            Fechas: {carga.fechasRepresentadas.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-700">{carga.rutas}</p>
                        <p className="text-xs text-gray-500">{carga.ciudades}</p>
                      </div>
                      {expandedPendienteCarga === carga.numCarga ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Detalles */}
                    {expandedPendienteCarga === carga.numCarga && (
                      <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-3 space-y-3">
                        {carga.entregas.map((entrega) => (
                          <div key={entrega.id} className="px-5 py-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md hover:bg-orange-50/30 transition-all duration-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Fecha</p>
                                  <p className="text-orange-600 font-semibold">{entrega.fecha}</p>
                                </div>
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
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start lg:items-center gap-2 whitespace-nowrap">
                              {pendienteUpdatingEntrega === entrega.id ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>Actualizando...</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedEntrega(entrega)
                                    setModalOpen(true)
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold cursor-pointer transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Asignar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
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
          showFechaEntrega={activeTab === 'pendiente'}
          autoFechaHoy={activeTab === 'hoy'}
        />
      )}
    </div>
  )
}
