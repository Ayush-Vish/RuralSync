"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Activity,
  CreditCard,
  Settings,
  CheckCircle2,
  Briefcase,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

import { useAuthStore } from "@/store/store"
import { AuthGuard } from "@/components/auth-gaurd"
import { Header } from "@/components/header"
import { apiService } from "@/lib/api-service"
import { DashboardStats, RecentBooking, RecentReview } from "@/types"

/* ----------------------------- Stat Card ----------------------------- */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition">
      <CardHeader className="flex flex-row justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-green-100 rounded-lg">
          <Icon className="h-4 w-4 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

/* --------------------------- Dashboard Page --------------------------- */

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

  /* -------------------------- Data Fetching -------------------------- */

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const bookingRes = await apiService.getUserBookings()
      const bookings: RecentBooking[] = Array.isArray(bookingRes?.data) ? bookingRes.data : []

      setRecentBookings(bookings.slice(0, 5))

      const completed = bookings.filter((b: RecentBooking) => b?.status === "COMPLETED").length
      const pending = bookings.filter(
        (b: RecentBooking) => b?.status === "PENDING" || b?.status === "NOT_ASSIGNED"
      ).length

      const totalSpent = bookings.reduce((sum: number, b: RecentBooking) => {
        const extras =
          b?.extraTasks?.reduce(
            (s: number, t: any) => s + (Number(t?.extraPrice) || 0),
            0
          ) || 0
        return sum + (b?.totalPrice || 0) + extras
      }, 0)

      let reviews: any[] = []
      try {
        const reviewRes = await apiService.getClientReviews()
        reviews = reviewRes?.data?.reviews || []
      } catch {}

      setRecentReviews(reviews.slice(0, 3))

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + (r?.rating || 0), 0) / reviews.length
          : 0

      setStats({
        totalBookings: bookings.length,
        completedBookings: completed,
        pendingBookings: pending,
        totalSpent,
        averageRating: avgRating,
        totalReviews: reviews.length,
      })
    } finally {
      setLoading(false)
    }
  }

  const completionRate =
    stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800"
      case "PENDING":
      case "NOT_ASSIGNED":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  /* ------------------------------- UI ------------------------------- */

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "Guest"}
              </p>
            </div>
            <Link href="/services">
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <Briefcase className="h-4 w-4" />
                Book New Service
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              description={`${stats.pendingBookings} pending`}
              icon={Calendar}
              loading={loading}
            />
            <StatCard
              title="Completed"
              value={stats.completedBookings}
              description={`${completionRate}% completion`}
              icon={CheckCircle2}
              loading={loading}
            />
            <StatCard
              title="Total Spent"
              value={`₹${stats.totalSpent.toFixed(0)}`}
              description="Across all services"
              icon={CreditCard}
              loading={loading}
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              description={`From ${stats.totalReviews} reviews`}
              icon={Star}
              loading={loading}
            />
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Bookings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest services</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map(b => (
                      <div
                        key={b._id}
                        className="flex justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{b.service?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(b.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(b.status)}>
                            {b.status}
                          </Badge>
                          <p className="font-semibold mt-1">
                            ₹{b.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No bookings yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
