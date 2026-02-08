import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Truck, MapPin, AlertCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function DashboardPage() {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/shipments?limit=5`)
      return data.data
    }
  })

  const stats = [
    {
      label: 'Envíos Pendientes',
      value: shipments?.filter(s => s.status === 'PENDING').length || 0,
      icon: Package,
      color: 'bg-yellow-500'
    },
    {
      label: 'En Tránsito',
      value: shipments?.filter(s => s.status === 'IN_TRANSIT').length || 0,
      icon: Truck,
      color: 'bg-blue-500'
    },
    {
      label: 'Entregados',
      value: shipments?.filter(s => s.status === 'DELIVERED').length || 0,
      icon: MapPin,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-full p-2 sm:p-3 flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent shipments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Envíos Recientes</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
            Cargando...
          </div>
        ) : shipments && shipments.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Tracking
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Destino
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Peso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shipments.map(shipment => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-blue-600">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {shipment.destAddress}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {shipment.weight} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-4">
              {shipments.map(shipment => (
                <div
                  key={shipment.id}
                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-600">Tracking</span>
                    <span className="text-sm font-medium text-blue-600 text-right flex-1 ml-2">
                      {shipment.trackingNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-600">Destino</span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {shipment.destAddress}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-600">Estado</span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {shipment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-600">Peso</span>
                    <span className="text-sm text-gray-900">{shipment.weight} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm sm:text-base">No hay envíos</p>
          </div>
        )}
      </div>
    </div>
  )
}
