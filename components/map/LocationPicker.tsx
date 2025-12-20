"use client"

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation } from 'lucide-react'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void
  initialLocation?: { latitude: number; longitude: number }
  height?: string
}

// Component to handle map events
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  )
}

// Component to update map center
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function LocationPicker({ onLocationSelect, initialLocation, height = '400px' }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLocation?.latitude || 28.6139, // Default to New Delhi
    longitude: initialLocation?.longitude || 77.209,
  })
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(addr)
      onLocationSelect({ latitude: lat, longitude: lng, address: addr })
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(addr)
      onLocationSelect({ latitude: lat, longitude: lng, address: addr })
    }
  }

  // Forward geocode to get coordinates from address
  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newLocation = { latitude: parseFloat(lat), longitude: parseFloat(lon) }
        setLocation(newLocation)
        setAddress(display_name)
        onLocationSelect({ ...newLocation, address: display_name })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })
          reverseGeocode(latitude, longitude)
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoading(false)
          alert('Unable to get your location. Please enable location services.')
        }
      )
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng })
    reverseGeocode(lat, lng)
  }

  if (!mounted) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          className="flex-1"
        />
        <Button onClick={searchLocation} disabled={loading} variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button onClick={getCurrentLocation} disabled={loading} variant="outline">
          <Navigation className="h-4 w-4 mr-2" />
          Current
        </Button>
      </div>

      {/* Map Container */}
      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleMapClick} />
          <MapCenter center={[location.latitude, location.longitude]} />
        </MapContainer>
      </div>

      {/* Selected Address */}
      {address && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Selected Location</p>
              <p className="text-sm text-muted-foreground mt-1">{address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
