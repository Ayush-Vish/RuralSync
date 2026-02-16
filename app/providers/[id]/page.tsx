"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Building2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import { Header } from "@/components/header"
import { apiService } from "@/lib/api-service"
import Link from "next/link"
import { ServiceProvider, ServiceBasic } from "@/types"

interface Review {
  _id: string
  rating: number
  comment: string
  createdAt: string
  client?: {
    name: string
    profileImage?: string
  }
}

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string

  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (providerId) {
      fetchProviderDetails()
      fetchProviderReviews()
    }
  }, [providerId])

  const fetchProviderDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getServiceProviderById(providerId)
      setProvider(response.data)
    } catch (error) {
      console.error("Failed to fetch provider details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviderReviews = async () => {
    try {
      const response = await apiService.getProviderReviews(providerId)
      setReviews(response.data || [])
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    }
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const formatBusinessHours = (hours: { day: string; open: string; close: string; isClosed?: boolean }[]) => {
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    return hours.sort((a, b) => dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase()))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">Service provider not found</p>
              <Button onClick={() => router.push("/providers")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Providers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const company = provider.serviceCompany
  const rating = company?.rating ?? provider.rating ?? 0
  const reviewCount = company?.reviewCount ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover Image */}
          {company?.images && company.images.length > 0 && (
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src={company.images[0]}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg -mt-12 relative z-10">
                  <AvatarImage src={company?.logo || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {(company?.name || provider.name).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {company?.name || provider.name}
                    </h1>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-gray-600 mb-2">{provider.name}</p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {renderStars(rating)}
                      <span className="text-gray-600">
                        {rating.toFixed(1)} ({reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Categories */}
                  {company?.categories && company.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {company.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 md:ml-auto">
                <Link href={`/services?provider=${provider._id}`}>
                  <Button className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Services
                  </Button>
                </Link>
                {(company?.phone || provider.phone) && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${company?.phone || provider.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">
                    {company?.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {((typeof company?.address === 'object' && ((company?.address as any)?.city || (company?.address as any)?.street)) ||
                    (typeof provider.address === 'object' && ((provider.address as any)?.city || (provider.address as any)?.street)) ||
                    (typeof company?.address === 'string' && company?.address) ||
                    (typeof provider.address === 'string' && provider.address)) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">
                          {typeof company?.address === 'object' || typeof provider.address === 'object'
                            ? [
                              ((company?.address as any)?.street || (provider.address as any)?.street),
                              ((company?.address as any)?.city || (provider.address as any)?.city),
                              ((company?.address as any)?.state || (provider.address as any)?.state)
                            ].filter(Boolean).join(', ')
                            : (company?.address || provider.address)}
                        </span>
                      </div>
                    )}
                  {(company?.phone || provider.phone) && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{company?.phone || provider.phone}</span>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 break-all">{provider.email}</span>
                    </div>
                  )}
                  {company?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Business Hours */}
            {company?.businessHours && company.businessHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {formatBusinessHours(company.businessHours).map((hours, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{hours.day}</span>
                        <span className="text-gray-600">
                          {hours.isClosed ? "Closed" : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {company?.images && company.images.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {company.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provider.service && provider.service.length > 0 ? (
                provider.service.map((service: ServiceBasic) => (
                  <Card key={service._id} className="hover:shadow-lg transition-shadow">
                    {service.images && service.images[0] && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          {service.category && (
                            <Badge variant="outline" className="mt-1">
                              {service.category}
                            </Badge>
                          )}
                        </div>
                        {service.price && (
                          <span className="text-lg font-bold text-green-600">
                            ₹{service.price}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {service.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {service.duration && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                        )}
                        <Link href={`/book/${service._id}`}>
                          <Button size="sm">Book Now</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No services listed yet</p>
                    <Link href={`/services?provider=${provider._id}`}>
                      <Button variant="outline" className="mt-4">
                        Browse All Services
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Reviews</CardTitle>
                  <div className="flex items-center gap-2">
                    {renderStars(rating)}
                    <span className="text-gray-600">
                      {rating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.client?.profileImage} />
                            <AvatarFallback>
                              {review.client?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {review.client?.name || "Anonymous"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {((typeof company?.address === 'object' && ((company?.address as any)?.city || (company?.address as any)?.street)) ||
                    (typeof provider.address === 'object' && ((provider.address as any)?.city || (provider.address as any)?.street)) ||
                    (typeof company?.address === 'string' && company?.address) ||
                    (typeof provider.address === 'string' && provider.address)) && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-gray-600">
                            {typeof company?.address === 'object' || typeof provider.address === 'object'
                              ? [
                                ((company?.address as any)?.street || (provider.address as any)?.street),
                                ((company?.address as any)?.city || (provider.address as any)?.city),
                                ((company?.address as any)?.state || (provider.address as any)?.state),
                                ((company?.address as any)?.zipCode || (provider.address as any)?.zipCode)
                              ].filter(Boolean).join(', ')
                              : (company?.address || provider.address)}
                          </p>
                        </div>
                      </div>
                    )}
                  {(company?.phone || provider.phone) && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${company?.phone || provider.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {company?.phone || provider.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-blue-600 hover:underline break-all"
                        >
                          {provider.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {company?.website && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media */}
              {company?.socialMedia && (
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {company.socialMedia.facebook && (
                        <a
                          href={company.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Facebook className="w-6 h-6 text-blue-600" />
                          <span className="font-medium">Facebook</span>
                        </a>
                      )}
                      {company.socialMedia.twitter && (
                        <a
                          href={company.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                        >
                          <Twitter className="w-6 h-6 text-sky-500" />
                          <span className="font-medium">Twitter</span>
                        </a>
                      )}
                      {company.socialMedia.instagram && (
                        <a
                          href={company.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                        >
                          <Instagram className="w-6 h-6 text-pink-600" />
                          <span className="font-medium">Instagram</span>
                        </a>
                      )}
                      {company.socialMedia.linkedin && (
                        <a
                          href={company.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Linkedin className="w-6 h-6 text-blue-700" />
                          <span className="font-medium">LinkedIn</span>
                        </a>
                      )}
                    </div>
                    {!company.socialMedia.facebook &&
                      !company.socialMedia.twitter &&
                      !company.socialMedia.instagram &&
                      !company.socialMedia.linkedin && (
                        <p className="text-gray-500 text-center py-4">
                          No social media links available
                        </p>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
