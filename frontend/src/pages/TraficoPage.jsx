import { useState, useEffect } from 'react'
import { Zap, ChevronDown, ChevronUp, Filter, Truck } from 'lucide-react'
import { smApi } from '../services/smApi'

export default function TraficoPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedCarga, setExpandedCarga] = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    fecha: '',
    ruta: '',
    ciudad: ''
  })

  useEffect(() => {
    loadTraficoData()
  }, [page, filters])

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  onClick={() => setExpandedCarga(expandedCarga === carga.numCarga ? null : carga.numCarga)}
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

                {/* Detalles de entregas */}
                {expandedCarga === carga.numCarga && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="divide-y divide-gray-200">
                      {carga.entregas.map((entrega) => (
                        <div key={entrega.id} className="px-6 py-4 hover:bg-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">Cliente</p>
                              <p className="text-gray-900">{entrega.nombreCliente}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">Ruta / Ciudad</p>
                              <p className="text-gray-900">{entrega.ruta} - {entrega.ciudad}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">Secuencia / Cód. Cliente</p>
                              <p className="text-gray-900">{entrega.secuencia} / {entrega.codCliente}</p>
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
