import { useState, useEffect } from 'react'
import { History, ChevronDown, ChevronUp, Filter, Truck, Check, AlertCircle, XCircle, Download, Loader } from 'lucide-react'
import { smApi } from '../services/smApi'

export default function HistoricoRuteroPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedCarga, setExpandedCarga] = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    numCarga: '',
    codCliente: '',
    nombreCliente: ''
  })

  useEffect(() => {
    loadHistoricoData()
  }, [page, filters])

  const loadHistoricoData = async () => {
    try {
      setLoading(true)
      const result = await smApi.getHistoricoData({
        ...filters,
        page,
        limit: 100
      })
      setData(result.details)
      setTotalPages(result.pagination.pages)
      setError(null)
    } catch (err) {
      setError('Error al cargar datos históricos')
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

  const handleExport = async () => {
    try {
      setExporting(true)
      await smApi.exportHistoricoExcel(filters)
    } catch (err) {
      console.error('Error al exportar:', err)
      alert('Error al exportar datos a Excel')
    } finally {
      setExporting(false)
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
    placa: [...new Set(entregas.map(e => e.cargas))].join(' / '),
    entregas,
    totalEntregas: entregas.length,
    totalCarga: entregas.reduce((sum, e) => sum + e.totalGeneral, 0),
    ciudades: [...new Set(entregas.map(e => e.ciudad))].join(', '),
    rutas: [...new Set(entregas.map(e => e.ruta))].join(', '),
    fecha: [...new Set(entregas.map(e => e.fecha))].join(', ')
  }))

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
            Histórico Rutero
          </h1>
          <p className="text-gray-600">Consulta de entregas pasadas (solo lectura)</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading || data.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          title="Descargar datos como Excel"
        >
          {exporting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </>
          )}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Rango de Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número Carga
            </label>
            <input
              type="text"
              placeholder="ej: CARGA001"
              value={filters.numCarga}
              onChange={(e) => handleFilterChange('numCarga', e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Cliente
            </label>
            <input
              type="text"
              placeholder="ej: Juan Pérez"
              value={filters.nombreCliente}
              onChange={(e) => handleFilterChange('nombreCliente', e.target.value)}
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
          <p className="text-gray-600">Cargando datos históricos...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay datos históricos disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cargas agrupadas */}
          <div className="space-y-3">
            {cargasArray.map((carga) => (
              <div key={carga.numCarga} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header de carga */}
                <button
                  onClick={() => setExpandedCarga(expandedCarga === carga.numCarga ? null : carga.numCarga)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <History className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900"># {carga.numCarga}</p>
                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {carga.placa}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {carga.totalEntregas} entregas • Total: {carga.totalCarga} unidades • Fecha: {carga.fecha}
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

                {/* Detalles de entregas */}
                {expandedCarga === carga.numCarga && (
                  <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-3 space-y-3">
                    {carga.entregas.map((entrega) => (
                      <div key={entrega.id} className="px-5 py-4 bg-white rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                        {/* Información de entrega */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
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

                        {/* Sección de auditoría - Fondo azul claro */}
                        {entrega.deliveryStatus ? (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Estado</p>
                                {entrega.deliveryStatus.status ? (
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(entrega.deliveryStatus.status.nombre)}`}>
                                    {getStatusIcon(entrega.deliveryStatus.status.nombre)}
                                    {entrega.deliveryStatus.status.nombre}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Sin estado</span>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Motivo</p>
                                <p className="text-gray-900">{entrega.deliveryStatus.reason?.nombre || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Observaciones</p>
                                <p className="text-gray-900 text-xs">{entrega.deliveryStatus.observaciones || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Recogió Devolución</p>
                                <p className="text-gray-900">{entrega.deliveryStatus.recogioDevoluccion ? 'Sí' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Actualizado Por</p>
                                <p className="text-gray-900">
                                  {entrega.deliveryStatus.updatedBy
                                    ? `${entrega.deliveryStatus.updatedBy.firstName} ${entrega.deliveryStatus.updatedBy.lastName}`
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">Fecha Actualización</p>
                                <p className="text-gray-900 text-xs">
                                  {entrega.deliveryStatus.updatedAt
                                    ? new Date(entrega.deliveryStatus.updatedAt).toLocaleString('es-CO')
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm text-gray-600">Sin información de auditoría</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {!loading && data.length > 0 && (
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
