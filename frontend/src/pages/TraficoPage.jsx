import { useState, useEffect } from 'react'
import { Zap, Search, Filter } from 'lucide-react'
import { smApi } from '../services/smApi'

export default function TraficoPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
        limit: 50
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
          {/* Tabla para desktop */}
          <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ruta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ciudad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Carga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.fecha}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.ruta}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.ciudad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{item.nombreCliente}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.numCarga}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.totalGeneral}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas para mobile */}
          <div className="sm:hidden space-y-3">
            {data.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-600">Fecha</p>
                    <p className="font-semibold text-gray-900">{item.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-semibold text-lg text-gray-900">{item.totalGeneral}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">{item.ruta}</span>
                  <span className="text-gray-600">{item.ciudad}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.nombreCliente}</p>
                <p className="text-xs font-mono text-gray-500">Carga: {item.numCarga}</p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
              </div>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
