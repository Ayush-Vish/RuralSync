"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  ArrowLeft,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { apiService, type ExtraTask, type Location } from "@/lib/api-service";
import { Header } from "@/components/header";
import { useAuthStore } from "@/store/store";

interface Service {
  _id: string;
  serviceName: string;
  description: string;
  basePrice: number;
  duration: string;
  serviceProvider: {
    companyName: string;
    rating: number;
  };
}

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    bookingTime: "",
    address: "",
    extraTasks: [] as ExtraTask[],
    location: null as Location | null,
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phone || "",
    specialInstructions: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    // Update customer info when user data is available
    if (user) {
      setBookingData((prev) => ({
        ...prev,
        customerName: user.name || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
      }));
    }
  }, [user]);

  const fetchService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getServiceById(serviceId);
      setService(response?.data ?? null);
    } catch (error) {
      console.error("Failed to fetch service:", error);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        };
        setBookingData((prev) => ({ ...prev, location }));
        setGettingLocation(false);
        setUseCurrentLocation(true);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Failed to get current location");
        setGettingLocation(false);
      }
    );
  };

  const handleAddExtraTask = () => {
    setBookingData((prev) => ({
      ...prev,
      extraTasks: [...prev.extraTasks, { description: "", extraPrice: 0 }],
    }));
  };

  const handleRemoveExtraTask = (index: number) => {
    setBookingData((prev) => ({
      ...prev,
      extraTasks: prev.extraTasks.filter((_, i) => i !== index),
    }));
  };

  const handleExtraTaskChange = (
    index: number,
    field: keyof ExtraTask,
    value: string | number
  ) => {
    setBookingData((prev) => ({
      ...prev,
      extraTasks: prev.extraTasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      ),
    }));
  };

  const calculateTotal = () => {
    if (!service) return 0;
    const extraTasksTotal = bookingData.extraTasks.reduce(
      (sum, task) => sum + task.extraPrice,
      0
    );
    return service.basePrice + extraTasksTotal;
  };

  const validateBookingTime = (time: string): boolean => {
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;
    return timeRegex.test(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate booking time format
    if (!validateBookingTime(bookingData.bookingTime)) {
      setError('Invalid booking time format. Use format like "10:00 AM"');
      setSubmitting(false);
      return;
    }

    try {
      const bookingPayload = {
        services: [
          {
            serviceId: service?._id || "",
            bookingDate: bookingData.bookingDate, // YYYY-MM-DD format
            bookingTime: bookingData.bookingTime, // HH:MM AM/PM format
            extraTasks: bookingData.extraTasks.filter(
              (task) => task.description.trim() !== ""
            ),
            location: bookingData.location || undefined,
            address: bookingData.address,
          },
        ],
      };

      // For authenticated users, use the authenticated endpoint
     
        await apiService.createBooking(bookingPayload)

      setSuccess(true);
      setTimeout(() => {
        if (isLoggedIn) {
          router.push("/bookings");
        } else {
          router.push("/");
        }
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Service not found
          </h2>
          <p className="text-gray-600 mb-4">
            The service you're trying to book doesn't exist.
          </p>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Your booking has been submitted successfully. You'll receive a
              confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={`/services/${service._id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Service Details
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Service</CardTitle>
                <CardDescription>
                  Fill in the details to book {service.serviceName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Customer Information - Only show for guest users */}
                  {!isLoggedIn && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Contact Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerName">Full Name</Label>
                          <Input
                            id="customerName"
                            value={bookingData.customerName}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                customerName: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerPhone">Phone Number</Label>
                          <Input
                            id="customerPhone"
                            type="tel"
                            value={bookingData.customerPhone}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                customerPhone: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customerEmail">Email Address</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={bookingData.customerEmail}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              customerEmail: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Booking Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bookingDate">Preferred Date</Label>
                        <Input
                          id="bookingDate"
                          type="date"
                          value={bookingData.bookingDate}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              bookingDate: e.target.value,
                            }))
                          }
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bookingTime">Preferred Time</Label>
                        <Select
                          value={bookingData.bookingTime}
                          onValueChange={(value) => {
                            setBookingData((prev) => ({
                              ...prev,
                              bookingTime: value,
                            }));
                            // Clear error when changing selection
                            if (error.includes("time format")) setError("");
                          }}
                        >
                          <SelectTrigger
                            className={
                              error.includes("time format")
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "8:00 AM",
                              "9:00 AM",
                              "10:00 AM",
                              "11:00 AM",
                              "12:00 PM",
                              "1:00 PM",
                              "2:00 PM",
                              "3:00 PM",
                              "4:00 PM",
                              "5:00 PM",
                            ].map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {error.includes("time format") && (
                          <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Service Address</Label>
                        <Input
                          id="address"
                          value={bookingData.address}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter the address where service is needed"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <Navigation className="w-4 h-4" />
                          {gettingLocation
                            ? "Getting Location..."
                            : "Use Current Location"}
                        </Button>
                        {useCurrentLocation && bookingData.location && (
                          <span className="text-sm text-green-600">
                            ✓ Location captured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extra Tasks */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Additional Tasks (Optional)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddExtraTask}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                    </div>
                    {bookingData.extraTasks.map((task, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Task Description</Label>
                          <Input
                            value={task.description}
                            onChange={(e) =>
                              handleExtraTaskChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe the additional task"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Extra Price ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={task.extraPrice}
                            onChange={(e) =>
                              handleExtraTaskChange(
                                index,
                                "extraPrice",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveExtraTask(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <Label htmlFor="specialInstructions">
                      Special Instructions (Optional)
                    </Label>
                    <Textarea
                      id="specialInstructions"
                      value={bookingData.specialInstructions}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          specialInstructions: e.target.value,
                        }))
                      }
                      placeholder="Any special requirements or instructions for the service provider"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Creating Booking..."
                      : `Book Service - $${calculateTotal()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{service.serviceName}</h4>
                  <p className="text-sm text-gray-600">
                    by {service.serviceProvider.companyName}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${service.basePrice}</span>
                  </div>
                  {bookingData.extraTasks.map(
                    (task, index) =>
                      task.description && (
                        <div key={index} className="flex justify-between">
                          <span className="truncate mr-2">
                            {task.description}:
                          </span>
                          <span>+${task.extraPrice}</span>
                        </div>
                      )
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">${calculateTotal()}</span>
                  </div>
                </div>

                {bookingData.bookingDate && bookingData.bookingTime && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(bookingData.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{bookingData.bookingTime}</span>
                    </div>
                    {bookingData.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{bookingData.address}</span>
                      </div>
                    )}
                    {useCurrentLocation && bookingData.location && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Navigation className="w-4 h-4" />
                        <span>GPS Location Included</span>
                      </div>
                    )}
                  </div>
                )}

                {isLoggedIn && user && (
                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Booking for:</h5>
                    <div className="text-sm text-gray-600">
                      <p>{user.name}</p>
                      <p>{user.email}</p>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
