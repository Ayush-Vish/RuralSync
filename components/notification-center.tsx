"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, CalendarClock, CircleCheckBig, CircleDashed, MapPinned, TriangleAlert } from "lucide-react"

import { apiService } from "@/lib/api-service"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type NotificationTone = "info" | "success" | "warning"

interface BookingNotification {
  id: string
  bookingId: string
  title: string
  body: string
  href: string
  createdAt: string
  tone: NotificationTone
}

interface BookingListItem {
  _id: string
  bookingDate: string
  bookingTime: string
  status: string
  createdAt: string
  updatedAt: string
  service?: {
    name?: string
  }
  organization?: {
    name?: string
  }
}

const STORAGE_KEY = "ruralsync-client-notification-read"

function getNotificationCopy(booking: BookingListItem): Omit<BookingNotification, "id" | "bookingId" | "createdAt"> {
  const serviceName = booking.service?.name || "your service"
  const providerName = booking.organization?.name || "your provider"
  const status = booking.status?.toUpperCase()

  switch (status) {
    case "CONFIRMED":
      return {
        title: `${serviceName} confirmed`,
        body: `${providerName} confirmed your booking for ${booking.bookingTime}.`,
        href: `/bookings/${booking._id}/tracking`,
        tone: "success",
      }
    case "IN_PROGRESS":
      return {
        title: `${serviceName} is in progress`,
        body: `Your provider is actively working on this booking now.`,
        href: `/bookings/${booking._id}/tracking`,
        tone: "info",
      }
    case "COMPLETED":
      return {
        title: `${serviceName} completed`,
        body: `This booking has been marked complete. Review the service when you're ready.`,
        href: "/bookings",
        tone: "success",
      }
    case "CANCELLED":
      return {
        title: `${serviceName} cancelled`,
        body: `This booking is no longer active. You can rebook from your bookings page.`,
        href: "/bookings",
        tone: "warning",
      }
    default:
      return {
        title: `${serviceName} booking received`,
        body: `${providerName} has your request for ${booking.bookingTime} and will confirm next steps soon.`,
        href: "/bookings",
        tone: "info",
      }
  }
}

function getToneStyles(tone: NotificationTone) {
  switch (tone) {
    case "success":
      return {
        icon: CircleCheckBig,
        badge: "bg-emerald-100 text-emerald-700",
        border: "border-emerald-200/70",
      }
    case "warning":
      return {
        icon: TriangleAlert,
        badge: "bg-amber-100 text-amber-700",
        border: "border-amber-200/70",
      }
    default:
      return {
        icon: CalendarClock,
        badge: "bg-blue-100 text-blue-700",
        border: "border-blue-200/70",
      }
  }
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return "Just now"

  const diffMinutes = Math.round((Date.now() - timestamp) / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Date(value).toLocaleDateString()
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<BookingNotification[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setReadIds(JSON.parse(stored))
      }
    } catch {
      setReadIds([])
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return
    }

    const loadNotifications = async () => {
      try {
        const response = await apiService.getUserBookings()
        const bookings = Array.isArray(response?.data) ? response.data : []
        const items = bookings
          .slice()
          .sort((a: BookingListItem, b: BookingListItem) => {
            const left = new Date(b.updatedAt || b.createdAt).getTime()
            const right = new Date(a.updatedAt || a.createdAt).getTime()
            return left - right
          })
          .slice(0, 8)
          .map((booking: BookingListItem) => {
            const copy = getNotificationCopy(booking)
            return {
              id: `${booking._id}:${booking.status}:${booking.updatedAt || booking.createdAt}`,
              bookingId: booking._id,
              createdAt: booking.updatedAt || booking.createdAt,
              ...copy,
            }
          })

        setNotifications(items)
      } catch (error) {
        console.error("Failed to load client notifications:", error)
        setNotifications([])
      }
    }

    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length

  const persistReadIds = (next: string[]) => {
    setReadIds(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage failures.
    }
  }

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return
    persistReadIds([...readIds, id])
  }

  const markAllAsRead = () => {
    persistReadIds(notifications.map((item) => item.id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-green-50">
          <Bell className="h-5 w-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] rounded-2xl border-slate-200 p-0 shadow-xl">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">
                Booking updates from RuralSync
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-slate-600"
              onClick={markAllAsRead}
              disabled={notifications.length === 0}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3">
                <CircleDashed className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">No notifications yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Booking activity will appear here once you start using the platform.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((item) => {
                const unread = !readIds.includes(item.id)
                const tone = getToneStyles(item.tone)
                const Icon = tone.icon

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markAsRead(item.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "mb-2 flex gap-3 rounded-xl border p-3 transition-colors hover:bg-slate-50",
                      unread ? `${tone.border} bg-white` : "border-transparent bg-slate-50/70"
                    )}
                  >
                    <div className={cn("mt-0.5 rounded-xl p-2", tone.badge)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {unread && <span className="h-2 w-2 rounded-full bg-green-500" />}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                          <MapPinned className="h-3 w-3" />
                          Open booking
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
