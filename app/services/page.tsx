"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Clock, Filter } from "lucide-react";
import Link from "next/link";
import { apiService } from "@/lib/api-service";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedDuration: string;
  serviceProvider: {
    _id: string;
    name: string;
    email: string;
  };
  serviceCompany: {
    _id: string;
    name: string;
    categories: string[];
  };
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  location: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices();
      if (!Array.isArray(response.data)) {
        console.error("API did not return expected array", response);
        setServices([]);
        return;
      }
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services
    .filter(
      (service) =>
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (service) =>
        selectedCategory === "all" || service.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.basePrice - b.basePrice;
        case "rating":
          return (
            (b.serviceProvider as any).rating - (a.serviceProvider as any).rating
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categories = Array.from(
    new Set(services.map((service) => service.category))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RuralSync</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/services" className="text-green-600 font-medium">
              Services
            </Link>
            <Link
              href="/providers"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Providers
            </Link>
            <Link
              href="/bookings"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Services
          </h1>
          <p className="text-gray-600">
            Find the perfect service for your needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        by {service.serviceCompany.name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{service.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.0</span>
                      <span className="text-sm text-gray-500">(0 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {service.estimatedDuration} hrs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{service.address || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{service.basePrice}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        starting
                      </span>
                    </div>
                    <Link href={`/services/${service._id}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
