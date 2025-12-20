"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Check, CheckCircle2, CreditCard, ChevronRight, ChevronLeft, Loader2, Info, MapPin, Star, Clock, Phone, Mail, ArrowLeft, ArrowRight, Share2, Heart, CameraOff, Shield } from "lucide-react"
  ;

import Link from "next/link";
import { apiService } from "@/lib/api-service";
import { Header } from "@/components/header";
import { ServiceDetail, Review } from "@/types";
import { format } from "date-fns";

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchServiceDetail(params.id as string).catch((error) => {
        console.error("Failed to load service:", error);
      });
      fetchServiceReviews(params.id as string).catch((error) => {
        console.error("Failed to load reviews:", error);
      });
    }
  }, [params.id]);

  const fetchServiceDetail = async (serviceId: string) => {
    try {
      setLoading(true)
      const response = await apiService.getServiceById(serviceId)
      // console.log("Service data:", response) 
      setService(response?.data ?? null)
    } catch (error) {
      console.error("Failed to fetch service details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceReviews = async (serviceProviderId: string) => {
    try {
      const data = await apiService.getProviderReviews(serviceProviderId);
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded-2xl"></div>
                <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="h-96 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <CalendarIcon className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Not Found</h2>
          <p className="text-slate-600 mb-6 text-center max-w-sm">
            Unfortunately, the service you are looking for is no longer available or has been removed.
          </p>
          <Link href="/services">
            <Button>Back to All Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Back to Services</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm border-slate-200">
              <Share2 className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm border-slate-200">
              <Heart className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery Placeholder - In real app, make this a carousel */}
            <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden shadow-inner relative group">
              {service.images?.length ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <CameraOff className="w-5 h-5" /> No Image Available
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-slate-900 hover:bg-white text-sm font-semibold shadow-sm backdrop-blur-sm">
                  {service.category}
                </Badge>
              </div>
            </div>

            {/* Title & Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  {service.name || "Unnamed Service"}
                </h1>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{service.finalPrice || service.basePrice}
                  </div>
                  {service.estimatedDuration && (
                    <span className="text-sm text-slate-500 font-medium">per {service.estimatedDuration} hrs</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                {service.organization?.name && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Verified Provider</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-slate-900">{service.ratings?.average?.toFixed(1) || "New"}</span>
                  <span>({service.ratings?.count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{service.address?.city || "Local Service"}, {service.address?.state}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-3">About this service</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {service.description || "No description provided by the provider."}
                </p>
              </div>
            </div>

            {/* Provider Info Card */}
            {service.serviceProvider && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                        {service.serviceProvider.companyName?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 mb-1">
                        {service.serviceProvider.companyName || "Service Provider"}
                      </h4>
                      <p className="text-sm text-slate-500 mb-3">Member since 2024</p>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {service.serviceProvider.description || "Dedicated to providing high quality rural services."}
                      </p>
                      <Link href={`/providers/${service.serviceProvider._id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review._id} className="border-0 shadow-sm bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-slate-100 text-slate-600">
                                {review.customer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900">{review.customer.name}</p>
                              <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Star className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No reviews yet</p>
                    <p className="text-sm text-slate-400">Be the first to review this service!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-green-600 h-2 w-full" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">₹{service.finalPrice || service.basePrice}</span>
                    <span className="text-sm text-slate-500 font-normal">starting form</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Link href={`/book/${service._id}`}>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Book This Service
                    </Button>
                  </Link>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {service.estimatedDuration || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">
                          {service.category || "Uncategorized"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">
                          {service.ratings?.average
                            ? service.ratings.average.toFixed(1)
                            : "N/A"}
                          /5
                        </span>
                      </div>
                      {service.additionalTasks?.length ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Add-ons:</span>
                          <span className="font-medium">
                            {service.additionalTasks.length} available
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Available Days</h4>
                    {service.availability?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {service.availability.map((schedule, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {schedule.day}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No availability information
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Provider Info */}
              {service.serviceProvider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {service.serviceProvider.companyName?.charAt(0) || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">
                          {service.serviceProvider.companyName ||
                            "Unknown Provider"}
                        </div>
                        {service.serviceProvider.contactPerson && (
                          <div className="text-sm text-gray-600">
                            {service.serviceProvider.contactPerson}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{service.serviceProvider.rating || 0}</span>
                          <span className="text-gray-500">
                            ({service.serviceProvider.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {service.serviceProvider.description && (
                      <p className="text-gray-700 text-sm mb-4">
                        {service.serviceProvider.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {service.serviceProvider.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{service.serviceProvider.email}</span>
                        </div>
                      )}
                      {service.serviceProvider.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{service.serviceProvider.phone}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {service.serviceProvider._id && (
                      <Link href={`/providers/${service.serviceProvider._id}`}>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          View Provider Profile
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
