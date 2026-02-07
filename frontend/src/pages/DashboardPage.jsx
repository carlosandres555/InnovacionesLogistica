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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent shipments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Envíos Recientes</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : shipments && shipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Peso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.destAddress}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay envíos</p>
          </div>
        )}
      </div>
    </div>
  )
}
