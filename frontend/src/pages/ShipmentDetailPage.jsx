import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { MapPin, Package, Truck, Calendar } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function ShipmentDetailPage() {
  const { id } = useParams()

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/shipments/${id}`)
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
        Cargando...
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="text-center py-12 text-red-600 text-sm sm:text-base">
        Envío no encontrado
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-all">
          {shipment.trackingNumber}
        </h1>
        <span
          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
            shipment.status === 'DELIVERED'
              ? 'bg-green-100 text-green-800'
              : shipment.status === 'IN_TRANSIT'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {shipment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Información de envío */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Información del Envío
          </h2>

          <div>
            <p className="text-xs sm:text-sm text-gray-600">Descripción</p>
            <p className="text-sm sm:text-base text-gray-900">{shipment.description}</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-gray-600">Peso</p>
            <p className="text-sm sm:text-base text-gray-900">{shipment.weight} kg</p>
          </div>

          {shipment.dimensions && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Dimensiones</p>
              <p className="text-sm sm:text-base text-gray-900">
                {shipment.dimensions}
              </p>
            </div>
          )}

          {shipment.value && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Valor</p>
              <p className="text-sm sm:text-base text-gray-900">${shipment.value}</p>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Ubicación
          </h2>

          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Origen</p>
              <p className="text-sm sm:text-base text-gray-900 break-words">
                {shipment.originAddress}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Destino</p>
              <p className="text-sm sm:text-base text-gray-900 break-words">
                {shipment.destAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asignación y cronograma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Asignación
          </h2>

          {shipment.assignedDriver && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Conductor</p>
              <p className="text-sm sm:text-base text-gray-900">
                {shipment.assignedDriver.firstName}{' '}
                {shipment.assignedDriver.lastName}
              </p>
            </div>
          )}

          {shipment.vehicle && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Vehículo</p>
              <p className="text-sm sm:text-base text-gray-900">
                {shipment.vehicle.plate}
              </p>
            </div>
          )}

          {!shipment.assignedDriver && (
            <p className="text-gray-500 text-xs sm:text-sm">No asignado aún</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Cronograma
          </h2>

          {shipment.scheduledDate && (
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Fecha Programada</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {new Date(shipment.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {shipment.deliveryTime && (
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Entregado</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {new Date(shipment.deliveryTime).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial de ubicación */}
      {shipment.locations && shipment.locations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Historial de Ubicación
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {shipment.locations.map((location, idx) => (
              <div
                key={location.id}
                className="flex gap-3 sm:gap-4 pb-3 border-b border-gray-200 last:border-0"
              >
                <div className="text-lg sm:text-2xl font-semibold text-gray-400 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                    {location.address ||
                      `${location.latitude}, ${location.longitude}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(location.timestamp).toLocaleString()}
                  </p>
                  {location.speed && (
                    <p className="text-xs text-gray-600">
                      Velocidad: {location.speed} km/h
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
