import { useEffect, useState } from 'react'
import { BarChart3, Package, AlertCircle, TrendingUp, Loader } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Card from '../components/Card'
import { smApi } from '../services/smApi'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await smApi.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900">{error || 'Error al cargar estadísticas'}</h3>
              <button
                onClick={loadStats}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const progressDonutData = [
    { name: 'Con Estado', value: stats.hoy.conEstado },
    { name: 'Sin Estado', value: stats.hoy.sinEstado },
  ]

  const estadosBarData = stats.estadosHoy.map(e => ({
    name: e.nombre,
    count: e.count,
    color: e.color,
  }))

  const ciudadesTableData = stats.ciudadesHoy

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Estadísticas del módulo SM - Entregas y Tráfico</p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entregas Hoy */}
        <Card className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="text-blue-600 text-sm font-medium">Entregas Hoy</div>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.hoy.total}</div>
          <div className="text-xs text-gray-500 mt-2">Registros para entregar</div>
        </Card>

        {/* Completadas Hoy */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-green-600 text-sm font-medium">Completadas</div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900">{stats.hoy.porcentaje}%</div>
            <div className="text-sm text-gray-600">({stats.hoy.conEstado}/{stats.hoy.total})</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Del total del día</div>
        </Card>

        {/* Pendientes */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-orange-600 text-sm font-medium">Pendientes</div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.pendientes.total}</div>
          <div className="text-xs text-gray-500 mt-2">De fechas pasadas sin estado</div>
        </Card>

        {/* Total Histórico */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-medium">Total Histórico</div>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totales.total}</div>
          <div className="text-xs text-gray-500 mt-2">Registros en el sistema</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Progreso del Día */}
        <Card className="animate-slide-in-left">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Progreso del Día</h3>
          {stats.hoy.total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip formatter={(value) => `${value} entregas`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Sin datos disponibles
            </div>
          )}
        </Card>

        {/* Bar Chart - Estados del Día */}
        <Card className="animate-slide-in-right">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Estados del Día</h3>
          {estadosBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadosBarData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => `${value} entregas`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {estadosBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Sin datos disponibles
            </div>
          )}
        </Card>
      </div>

      {/* Ciudades Table */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-bold text-slate-900 mb-6">Entregas por Ciudad (Hoy)</h3>

        {ciudadesTableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Ciudad</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-green-600">Exitosas</th>
                  <th className="text-center py-3 px-4 font-semibold text-orange-600">Parciales</th>
                  <th className="text-center py-3 px-4 font-semibold text-red-600">No Exitosas</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Sin Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">% Completadas</th>
                </tr>
              </thead>
              <tbody>
                {ciudadesTableData.map((ciudad, idx) => {
                  const completadas = ciudad.exitosas + ciudad.parciales
                  const porcentaje = ciudad.total > 0 ? Math.round((completadas / ciudad.total) * 100) : 0
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{ciudad.ciudad}</td>
                      <td className="py-3 px-4 text-center text-slate-900 font-semibold">{ciudad.total}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-medium">{ciudad.exitosas}</td>
                      <td className="py-3 px-4 text-center text-orange-600 font-medium">{ciudad.parciales}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-medium">{ciudad.noExitosas}</td>
                      <td className="py-3 px-4 text-center text-gray-600 font-medium">{ciudad.sinEstado}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 w-8 text-right">
                            {porcentaje}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Sin entregas para hoy</div>
        )}
      </Card>
    </div>
  )
}
