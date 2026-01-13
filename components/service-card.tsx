import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  MapPin,
  Building2,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { Service } from "@/types";

// Category icons mapping
const categoryIcons: Record<string, string> = {
  Plumbing: "🔧",
  Electrical: "⚡",
  Cleaning: "🧹",
  Gardening: "🌱",
  Painting: "🎨",
  Carpentry: "🪚",
  "AC Repair": "❄️",
  "Pest Control": "🐛",
  "Home Repair": "🏠",
  Transportation: "🚗",
  Healthcare: "🏥",
  Education: "📚",
  Beauty: "💅",
  Fitness: "💪",
  Cooking: "👨‍🍳",
  Photography: "📷",
  "Event Planning": "🎉",
  Security: "🔒",
  "IT Services": "💻",
  Legal: "⚖️",
};

interface ServiceCardProps {
  service: Service;
  viewMode?: "list" | "grid";
}

export function ServiceCard({ service, viewMode = "grid" }: ServiceCardProps) {
  const rating = service.rating || 0;

  if (viewMode === "list") {
    return (
      <Link href={`/services/${service._id}`}>
        <Card className="overflow-hidden hover:shadow-md transition-all hover:border-green-200 group">
          <div className="flex">
            {/* Image */}
            <div className="w-48 h-36 flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative overflow-hidden">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">
                  {categoryIcons[service.category] || "📦"}
                </span>
              )}
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                    {service.distanceInKm !== undefined &&
                      service.distanceInKm !== null && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600 border-green-200"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          {service.distanceInKm} km
                        </Badge>
                      )}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {service.organization?.name || "Provider"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{service.basePrice}
                  </div>
                  <span className="text-xs text-muted-foreground">starting</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.estimatedDuration || "N/A"} hrs
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {service.address || "Multiple locations"}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/services/${service._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-green-200 group h-full">
        {/* Image Header */}
        <div className="h-40 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0]}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl">
              {categoryIcons[service.category] || "📦"}
            </span>
          )}
          <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-white">
            {service.category}
          </Badge>
          {service.distanceInKm !== undefined &&
            service.distanceInKm !== null && (
              <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                <Navigation className="h-3 w-3 mr-1" />
                {service.distanceInKm} km
              </Badge>
            )}
        </div>

        <CardContent className="p-4">
          {/* Provider & Rating */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {service.organization?.name || "Provider"}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {service.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.estimatedDuration || "N/A"} hrs
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {service.address || "Available nearby"}
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <span className="text-2xl font-bold text-green-600">
                ₹{service.basePrice}
              </span>
              <span className="text-xs text-muted-foreground ml-1">starting</span>
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
  );
}

export { categoryIcons };
