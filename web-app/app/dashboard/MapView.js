'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { slopesService } from '../../services/slopes'

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function MapView() {
  const [slopes, setSlopes] = useState([])
  const [center, setCenter] = useState([20.5937, 78.9629]) // Default to India center

  useEffect(() => {
    const fetchSlopes = async () => {
      try {
        const slopesData = await slopesService.getAll()
        setSlopes(
          slopesData.map((slope) => ({
            ...slope,
            lat: Number(slope.lat) || 20.5937,
            lng: Number(slope.lng) || 78.9629,
          }))
        )
      } catch (error) {
        console.error('Failed to fetch slopes:', error)
      }
    }
    fetchSlopes()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96">
      <h2 className="text-xl font-bold mb-4">Slope Locations</h2>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {slopes.map((slope) => (
          <Marker key={slope.id} position={[slope.lat, slope.lng]}>
            <Popup>
              <div>
                <h3 className="font-bold">{slope.name}</h3>
                <p className="text-sm">Risk: {slope.risk_level}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

