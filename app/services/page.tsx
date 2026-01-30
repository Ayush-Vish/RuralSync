"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Search, MapPin, Star, Clock, Filter, Building2, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { apiService } from "@/lib/api-service";
import { Service } from "@/types";

// Category icons
const categoryIcons: Record<string, string> = {
  "Farm Equipment": "🚜",
  "Harvesting": "🌾",
  "Livestock": "🐄",
  "Repair": "🔧",
  "Transport": "🚛",
  "Irrigation": "💧",
  "Pest Control": "🐛",
  "Consulting": "📊",
};

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
          return 0; // Would sort by rating if available
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categories = Array.from(
    new Set(services.map((service) => service.category))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
            Browse Services
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Available Services
          </h1>
          <p className="text-slate-600 text-lg">
            Find the perfect service for your needs from our trusted providers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryIcons[category] || "📦"} {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredServices.length}</span> services
          </p>
          <Link href="/search">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Advanced Search
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No services found
            </h3>
            <p className="text-slate-600 mb-6">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Link href={`/services/${service._id}`} key={service._id}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  {/* Image Header */}
                  <div className="h-40 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center relative">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {categoryIcons[service.category] || "📦"}
                    </span>
                    <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-white">
                      {service.category}
                    </Badge>
                  </div>

                  <CardContent className="p-5">
                    {/* Provider & Rating */}
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {service.organization?.name || "Provider"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">4.0</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {service.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {service.estimatedDuration || "N/A"} hrs
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {service.address?.street || "Available nearby"} {service.address?.city || ""}
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{service.basePrice}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">starting</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1 group-hover:gap-2 transition-all"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
