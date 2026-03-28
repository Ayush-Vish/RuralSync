"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { apiService } from "@/lib/api-service"
import { AuthGuard } from "@/components/auth-gaurd"
import {
  ArrowLeft,
  Navigation,
  Phone,
  Radio,
  Clock,
  Gauge,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronUp,
  ChevronDown,
  Users,
  Shield,
  Wrench,
} from "lucide-react"

// Dynamically import the map to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import("./tracking-map"), { ssr: false }) as any

interface AgentLocationData {
  coordinates: [number, number]
  heading?: number
  speed?: number
  accuracy?: number
  isActive: boolean
  lastUpdated: string
}

interface AgentWithTracking {
  _id: string
  name: string
  phoneNumber?: string
  profileImage?: string
  status?: string
  role: string
  assignedAt: string
  location: AgentLocationData | null
}

interface TrackingData {
  booking: {
    _id: string
    status: string
    bookingDate: string
    bookingTime: string
    address?: string
    location?: { type: string; coordinates: [number, number] }
    service?: { name: string }
    serviceProvider?: { name: string }
  }
  agents: AgentWithTracking[]
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  PRIMARY: { label: "Lead", icon: Shield, color: "text-blue-600" },
  SUPPORT: { label: "Support", icon: Wrench, color: "text-amber-600" },
  ASSISTANT: { label: "Assistant", icon: Users, color: "text-violet-600" },
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [panelOpen, setPanelOpen] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTracking = useCallback(async () => {
    try {
      const res = await apiService.getBookingTracking(bookingId)
      setTrackingData(res.data)
      setUpdateCount((p) => p + 1)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load tracking data")
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchTracking, 5000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isLive, fetchTracking])

  const liveAgents = trackingData?.agents?.filter((a) => a.location?.isActive) || []
  const totalAgents = trackingData?.agents?.length || 0

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Loading live tracking...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="max-w-sm w-full p-8 text-center space-y-4">
            <WifiOff className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Tracking Unavailable</h2>
            <p className="text-sm text-gray-500">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
              </Button>
              <Button size="sm" onClick={fetchTracking}>
                <RefreshCw className="w-4 h-4 mr-1" /> Retry
              </Button>
            </div>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="h-screen w-full flex flex-col relative overflow-hidden bg-gray-950">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-none">
                  {trackingData?.booking.service?.name || "Booking"} — Live Tracking
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  #{bookingId.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 text-xs h-8 ${
                  isLive ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live
                  </>
                ) : (
                  <>
                    <Radio className="h-3 w-3" />
                    Paused
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 px-4 pb-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalAgents} agent{totalAgents !== 1 && "s"}
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-emerald-500" />
              {liveAgents.length} broadcasting
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {updateCount} updates
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          {trackingData && <TrackingMap trackingData={trackingData} />}
        </div>

        {/* Bottom Agent Cards */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-[1000] transition-transform duration-300 ease-out ${
            panelOpen ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
          }`}
        >
          {/* Toggle Handle */}
          <div
            className="flex justify-center cursor-pointer"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <div className="bg-white rounded-t-xl px-6 py-1.5 shadow-lg border border-b-0 flex items-center gap-2">
              {panelOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs font-medium text-gray-500">
                {totalAgents} Agent{totalAgents !== 1 && "s"} Assigned
              </span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md border-t max-h-[45vh] overflow-y-auto">
            <div className="p-4 space-y-3">
              {trackingData?.agents?.map((agent) => {
                const roleConfig = ROLE_CONFIG[agent.role] || ROLE_CONFIG.PRIMARY
                const RoleIcon = roleConfig.icon
                const isOnline = agent.location?.isActive

                return (
                  <div
                    key={agent._id}
                    className={`rounded-xl p-4 border transition-all ${
                      isOnline
                        ? "bg-white border-emerald-200 shadow-sm"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className={`h-11 w-11 rounded-full flex items-center justify-center font-semibold text-sm ${
                              isOnline
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {agent.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {agent.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 ${roleConfig.color} border-current/20`}
                            >
                              <RoleIcon className="h-2.5 w-2.5 mr-0.5" />
                              {roleConfig.label}
                            </Badge>
                            {isOnline ? (
                              <span className="text-[10px] text-emerald-600 font-medium">
                                Live
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400">Offline</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {agent.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${agent.phoneNumber}`}
                            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a
                            href={`tel:${agent.phoneNumber}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Call agent
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Location Details */}
                    {isOnline && agent.location && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span className="truncate">
                            {agent.location.coordinates[1]?.toFixed(4)},{" "}
                            {agent.location.coordinates[0]?.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                          <Gauge className="h-3 w-3 text-amber-500" />
                          <span>{(agent.location.speed || 0).toFixed(1)} m/s</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5">
                          <Clock className="h-3 w-3 text-violet-500" />
                          <span>{formatTime(agent.location.lastUpdated)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {totalAgents === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No agents assigned yet</p>
                  <p className="text-xs mt-1">
                    Agents will appear here once assigned to your booking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
