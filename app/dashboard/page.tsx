"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Star, MapPin, Phone, Mail, Clock, Activity, CreditCard, Settings } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/store"
import { AuthGuard } from "@/components/auth-gaurd"
import { Header } from "@/components/header"
import { apiService } from "@/lib/api-service"

interface DashboardStats {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  totalSpent: number
  averageRating: number
  totalReviews: number
}

interface RecentBooking {
  _id: string
  services: Array<{
    serviceId: {
      serviceName: string
      serviceProvider: {
        companyName: string
      }
    }
    bookingDate: string
    bookingTime: string
  }>
  status: string
  totalAmount: number
}

interface RecentReview {
  _id: string
  rating: number
  comment: string
  serviceProvider: {
    companyName: string
  }
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    totalReviews: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch bookings
      const bookings = await apiService.getUserBookings()
      setRecentBookings(bookings.slice(0, 5))

      // Calculate stats from bookings
      const totalBookings = bookings.length
      const completedBookings = bookings.filter((b: any) => b.status.toLowerCase() === "completed").length
      const pendingBookings = bookings.filter((b: any) => b.status.toLowerCase() === "pending").length
      const totalSpent = bookings.reduce((sum: number, booking: any) => sum + booking.totalAmount, 0)

      // Fetch reviews
      const reviews = await apiService.getCustomerReviews()
      setRecentReviews(reviews.slice(0, 3))

      const averageRating =
        reviews.length > 0 ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length : 0

      setStats({
        totalBookings,
        completedBookings,
        pendingBookings,
        totalSpent,
        averageRating,
        totalReviews: reviews.length,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
              </div>
              <Link href="/services">
                <Button className="bg-green-600 hover:bg-green-700">Book New Service</Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">{stats.completedBookings} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpent}</div>
                <p className="text-xs text-muted-foreground">Across all services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">From {stats.totalReviews} reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>Your latest service bookings</CardDescription>
                    </div>
                    <Link href="/bookings">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{booking.services[0]?.serviceId.serviceName}</h4>
                            <p className="text-sm text-gray-600">
                              by {booking.services[0]?.serviceId.serviceProvider.companyName}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(booking.services[0]?.bookingDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.services[0]?.bookingTime}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            <div className="text-lg font-semibold text-green-600 mt-1">${booking.totalAmount}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No bookings yet</p>
                      <Link href="/services">
                        <Button className="mt-2 bg-green-600 hover:bg-green-700">Book Your First Service</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Profile updated successfully</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">New booking confirmed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Review submitted</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-lg">{user?.name}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user?.name}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{user?.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <Link href="/dashboard/settings">
                    <Button variant="outline" className="w-full mt-4">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Reviews</CardTitle>
                      <CardDescription>Your latest service reviews</CardDescription>
                    </div>
                    <Link href="/reviews">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentReviews.length > 0 ? (
                    <div className="space-y-4">
                      {recentReviews.map((review) => (
                        <div key={review._id} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm font-medium">{review.serviceProvider.companyName}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/services">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book New Service
                    </Button>
                  </Link>
                  <Link href="/bookings">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Bookings
                    </Button>
                  </Link>
                  <Link href="/reviews">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="w-4 h-4 mr-2" />
                      Manage Reviews
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
