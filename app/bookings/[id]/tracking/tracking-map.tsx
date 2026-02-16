"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const AGENT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]

function createAgentIcon(name: string, color: string, isActive: boolean) {
  const initial = name?.charAt(0).toUpperCase() || "A"
  return L.divIcon({
    className: "custom-agent-marker",
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        ${
          isActive
            ? `<div style="
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 48px; height: 48px; border-radius: 50%;
            background: ${color}20;
            animation: agentPulse 2s ease-in-out infinite;
          "></div>`
            : ""
        }
        <div style="
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 36px; height: 36px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 10px ${color}60;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          ${isActive ? "" : "opacity: 0.5; filter: grayscale(0.5);"}
        ">${initial}</div>
      </div>
      <style>
        @keyframes agentPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  })
}

const destinationIcon = L.divIcon({
  className: "destination-marker",
  html: `
    <div style="
      position: relative; width: 32px; height: 32px;
    ">
      <div style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 28px; height: 28px; border-radius: 50%;
        background: #ef4444; border: 3px solid white;
        box-shadow: 0 2px 10px rgba(239, 68, 68, 0.5);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
})

// Auto-fit bounds helper
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 })
    }
  }, [positions.length]) // Only re-fit when count changes

  return null
}

interface TrackingMapProps {
  trackingData: {
    booking: {
      location?: { type: string; coordinates: [number, number] }
      address?: string
    }
    agents: Array<{
      _id: string
      name: string
      role: string
      location: {
        coordinates: [number, number]
        isActive: boolean
        speed: number
        heading: number
        lastUpdated: string
      } | null
    }>
  }
}

export default function TrackingMap({ trackingData }: TrackingMapProps) {
  const { booking, agents } = trackingData

  const bookingPos: [number, number] | null = booking.location?.coordinates
    ? [booking.location.coordinates[1], booking.location.coordinates[0]]
    : null

  const agentPositions = useMemo(() => {
    return agents
      .filter((a) => a.location?.coordinates)
      .map((a, i) => ({
        id: a._id,
        name: a.name,
        role: a.role,
        lat: a.location!.coordinates[1],
        lng: a.location!.coordinates[0],
        isActive: a.location!.isActive,
        speed: a.location!.speed || 0,
        color: AGENT_COLORS[i % AGENT_COLORS.length],
        lastUpdated: a.location!.lastUpdated,
      }))
  }, [agents])

  const allPositions: [number, number][] = useMemo(() => {
    const pts: [number, number][] = agentPositions.map((a) => [a.lat, a.lng])
    if (bookingPos) pts.push(bookingPos)
    return pts
  }, [agentPositions, bookingPos])

  const center: [number, number] =
    allPositions.length > 0
      ? allPositions[0]
      : bookingPos || [20.5937, 78.9629] // Default India center

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds positions={allPositions} />

      {/* Destination Marker */}
      {bookingPos && (
        <Marker position={bookingPos} icon={destinationIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">Service Location</p>
              {booking.address && (
                <p className="text-xs text-gray-500 mt-1">{booking.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Agent Markers */}
      {agentPositions.map((agent) => (
        <Marker
          key={agent.id}
          position={[agent.lat, agent.lng]}
          icon={createAgentIcon(agent.name, agent.color, agent.isActive)}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">{agent.name}</p>
              <p className="text-xs text-gray-500 capitalize">{agent.role.toLowerCase()}</p>
              {agent.isActive && (
                <p className="text-xs text-emerald-600 mt-1">
                  {agent.speed.toFixed(1)} m/s
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Polylines from agents to destination */}
      {bookingPos &&
        agentPositions
          .filter((a) => a.isActive)
          .map((agent) => (
            <Polyline
              key={`line-${agent.id}`}
              positions={[[agent.lat, agent.lng], bookingPos]}
              pathOptions={{
                color: agent.color,
                weight: 2,
                opacity: 0.5,
                dashArray: "8, 8",
              }}
            />
          ))}
    </MapContainer>
  )
}
