"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Phone, Mail, Star, X, Navigation, MapPin } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api-service"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-gaurd"
import { Booking } from "@/types"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await apiService.getUserBookings()
      setBookings(data.data)
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        await apiService.cancelBooking(bookingId)
        fetchBookings() // Refresh the list
      } catch (error) {
        console.error("Failed to cancel booking:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBookings = bookings.length > 0 ? bookings?.filter((booking) => {
    if (activeTab === "all") return true
    return booking.status.toLowerCase() === activeTab
  }) : []

  const calculateBookingTotal = (booking: Booking) => {
    const extraTasksTotal = booking.extraTasks?.reduce((sum, task) => sum + task.extraPrice, 0) || 0
    // Note: You might need to fetch service base price or include it in the booking response
    return extraTasksTotal // Base price would need to be added here
  }
  if (!bookings) {
    return <div>Loading...</div>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">Manage your service bookings and track their status</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-6">
                  {filteredBookings.map((booking) => (
                    <Card key={booking._id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Booking #{booking._id.slice(-8)}</CardTitle>
                            <CardDescription>
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            {booking.status.toLowerCase() === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="mb-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.service.name || booking.service.name}
                              </h3>
                              <p className="text-gray-600">
                                by{" "}
                                {booking.serviceProvider?._id ? (
                                  <Link
                                    href={`/providers/${booking.serviceProvider._id}`}
                                    className="font-medium text-green-700 hover:text-green-800 hover:underline"
                                  >
                                    {booking.organization?.name || booking.serviceProvider?.name || "Provider"}
                                  </Link>
                                ) : (
                                  booking.organization?.name || booking.serviceProvider?.name || "Provider"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{booking.bookingTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {booking?.organization?.phone ? (
                                <a
                                  href={`tel:${booking.organization.phone}`}
                                  className="hover:text-green-700 hover:underline"
                                >
                                  {booking.organization.phone}
                                </a>
                              ) : booking.serviceProvider?.email ? (
                                <a
                                  href={`mailto:${booking.serviceProvider.email}`}
                                  className="hover:text-green-700 hover:underline"
                                >
                                  {booking.serviceProvider.email}
                                </a>
                              ) : (
                                <span>Contact unavailable</span>
                              )}
                            </div>
                            {booking.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Navigation className="w-4 h-4" />
                                <span>GPS Location Included</span>
                              </div>
                            )}
                          </div>

                          {booking.extraTasks && booking.extraTasks.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Extra Tasks:</h4>
                              <ul className="space-y-1">
                                {booking.extraTasks.map((task, taskIndex) => (
                                  <li key={taskIndex} className="flex justify-between text-sm">
                                    <span>{task.description}</span>
                                    <span className="font-medium">+${task.extraPrice}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="flex items-center gap-4 flex-wrap">
                              {booking.serviceProvider?._id && (
                                <Link href={`/providers/${booking.serviceProvider._id}`}>
                                  <Button variant="outline" size="sm">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    View Provider
                                  </Button>
                                </Link>
                              )}
                              {(booking.serviceProvider?.email || booking.organization?.phone) && (
                                <a
                                  href={
                                    booking.serviceProvider?.email
                                      ? `mailto:${booking.serviceProvider.email}`
                                      : `tel:${booking.organization?.phone}`
                                  }
                                >
                                  <Button variant="outline" size="sm">
                                    <Mail className="w-4 h-4 mr-1" />
                                    Contact Provider
                                  </Button>
                                </a>
                              )}
                              {(booking.status.toUpperCase() === "CONFIRMED" ||
                                booking.status.toUpperCase() === "IN_PROGRESS") && (
                                <Link href={`/bookings/${booking._id}/tracking`}>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    Track Agent Live
                                  </Button>
                                </Link>
                              )}
                              {booking.status.toLowerCase() === "completed" && (
                                <Link
                                  href={`/reviews/new?serviceProvider=${
                                    booking.service.serviceProvider?._id || booking.serviceProvider?._id
                                  }`}
                                >
                                  <Button variant="outline" size="sm">
                                    <Star className="w-4 h-4 mr-1" />
                                    Leave Review
                                  </Button>
                                </Link>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">${calculateBookingTotal(booking)}</div>
                              <div className="text-sm text-gray-500">Extra Tasks Total</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === "all" ? "You haven't made any bookings yet" : `No ${activeTab} bookings found`}
                  </p>
                  <Link href="/services">
                    <Button className="bg-green-600 hover:bg-green-700">Browse Services</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
