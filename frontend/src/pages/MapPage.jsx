import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import L from 'leaflet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Fix for default marker icon in Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.setIcon(defaultIcon)

export default function MapPage() {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments-map'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/shipments?limit=100`)
      return data.data.filter(s => s.destLat && s.destLng)
    }
  })

  const centerLat = 0
  const centerLng = 0
  const zoom = 2

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Mapa de Envíos</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Cargando mapa...
          </div>
        ) : (
          <MapContainer center={[centerLat, centerLng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution={import.meta.env.VITE_LEAFLET_ATTRIBUTION}
              url={import.meta.env.VITE_LEAFLET_TILE_URL}
            />

            {shipments?.map(shipment => (
              <Marker
                key={shipment.id}
                position={[shipment.destLat, shipment.destLng]}
                icon={defaultIcon}
              >
                <Popup>
                  <div className="w-48">
                    <p className="font-bold text-sm">{shipment.trackingNumber}</p>
                    <p className="text-xs text-gray-600">{shipment.destAddress}</p>
                    <p className="text-xs mt-2">
                      <span className="font-semibold">Estado:</span> {shipment.status}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {shipments?.length || 0} envíos mostrados en el mapa
        </p>
      </div>
    </div>
  )
}
