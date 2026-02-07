import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function ShipmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['shipments', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      const { data } = await axios.get(`${API_URL}/shipments?${params}`)
      return data
    }
  })

  const shipments = shipmentsData?.data || []

  const filteredShipments = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.destAddress.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Envíos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          Nuevo Envío
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por tracking o destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="ASSIGNED">Asignado</option>
            <option value="IN_TRANSIT">En tránsito</option>
            <option value="DELIVERED">Entregado</option>
            <option value="FAILED">Fallido</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : filteredShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Origen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Peso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shipment.originAddress.substring(0, 30)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.destAddress}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.weight} kg</td>
                    <td className="px-6 py-4 text-sm">
                      <Link to={`/shipments/${shipment.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No hay envíos que coincidan con la búsqueda
          </div>
        )}
      </div>
    </div>
  )
}
