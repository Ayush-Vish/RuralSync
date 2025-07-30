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
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { apiService } from "@/lib/api-service";
import { Header } from "@/components/header";

interface ServiceDetail {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedDuration: string;
  serviceProvider?: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    rating: number;
    totalReviews: number;
    description: string;
  };
  serviceCompany?: {
    _id: string;
    name: string;
    description: string;
  };
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  additionalTasks?: Array<{
    description: string;
    extraPrice: number;
    timeAdded?: string;
  }>;
  ratings?: {
    average: number;
    count: number;
  };
  images?: string[];
  tags?: string[];
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  customer: {
    name: string;
  };
  createdAt: string;
}

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
  }, [params.id ]);

 const fetchServiceDetail = async (serviceId: string) => {
  try {
    setLoading(true)
    const response = await apiService.getServiceById(serviceId)
    console.log("Service data:", response) // Add this line
    setService(response?.data?? null )
  } catch (error) {
    console.error("Failed to fetch service details:", error)
    // You might want to set some error state here
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Service not found
          </h2>
          <p className="text-gray-600 mb-4">
            The service you're looking for doesn't exist.
          </p>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }
  console.log("Service details:", service);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
          <ArrowLeft className="w-4 h-4" />
          {
            service.name
          }
          Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {service.name || "Unnamed Service"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      by {service?.serviceCompany?.name || "Unknown Company"}
                    </CardDescription>
                    {service.serviceCompany?.name && (
                      <CardDescription className="text-sm text-gray-500">
                        Company: {service.serviceCompany.name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {service.category || "Uncategorized"}
                    </Badge>
                    {service.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  {service.ratings?.average ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {service.ratings.average.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({service.ratings.count || 0} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No ratings yet</div>
                  )}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-5 h-5" />
                    <span>
                      {service.estimatedDuration || "Duration not specified"}
                    </span>
                  </div>
                  {service.address?.city && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {service.address.city}, {service.address.state}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Service Images */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Service Images</CardTitle>
              </CardHeader>
              <CardContent>
                {service.images?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {service.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${service.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No images available</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {service.description || "No description provided."}
                </p>
                {service.serviceCompany?.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">
                      About {service.serviceCompany.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {service.serviceCompany.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Tasks */}
            {service.additionalTasks?.length ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Available Add-ons</CardTitle>
                  <CardDescription>
                    Optional services you can add to your booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {service.additionalTasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{task.description}</p>
                          {task.timeAdded && (
                            <p className="text-sm text-gray-500">
                              Additional time: {task.timeAdded}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-green-600">
                          +${task.extraPrice || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Availability Schedule */}
            {service.availability?.length ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Availability Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.availability.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium capitalize">
                          {schedule.day}
                        </span>
                        <span className="text-sm text-gray-600">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Location Details */}
            {service.address && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Service Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.address.street && (
                      <p className="font-medium">{service.address.street}</p>
                    )}
                    {service.address.city && (
                      <p className="text-gray-600">
                        {service.address.city}, {service.address.state}{" "}
                        {service.address.zipCode}
                      </p>
                    )}
                    {service.address.country && (
                      <p className="text-gray-600">{service.address.country}</p>
                    )}
                    {service.location?.coordinates && (
                      <p className="text-sm text-gray-500">
                        Coordinates: {service.location.coordinates[1]},{" "}
                        {service.location.coordinates[0]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review._id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">
                            {review.customer.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Enhanced Booking Card */}
            <Card className="mb-6 sticky top-24">
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${service.finalPrice || service.basePrice || 0}
                  </div>
                  <div className="text-gray-500">
                    {service.finalPrice &&
                    service.finalPrice !== service.basePrice
                      ? "Final Price"
                      : "Starting Price"}
                  </div>
                  {service.finalPrice &&
                    service.finalPrice !== service.basePrice && (
                      <div className="text-sm text-gray-400 line-through">
                        Was ${service.basePrice}
                      </div>
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/book/${service._id}`}>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
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
  );
}
