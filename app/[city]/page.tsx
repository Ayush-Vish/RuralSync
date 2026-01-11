import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { ServiceCard, categoryIcons } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Search,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Service } from "@/types";
import {
  TARGET_CITIES,
  CITY_DISPLAY_NAMES,
  SERVICE_CATEGORIES,
  SERVICE_DISPLAY_NAMES,
} from "@/lib/seo-constants";

// API Base URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://ruralsyncapi.vercel.app"
    : "http://localhost:5000";

interface PageProps {
  params: Promise<{
    city: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const cityLower = city.toLowerCase();

  // Check if it's a valid city
  const cityName = CITY_DISPLAY_NAMES[cityLower] || formatCityName(city);

  const title = `Local Home Services in ${cityName} | RuralSync`;
  const description = `Find and book trusted local home services in ${cityName}. Browse plumbing, electrical, cleaning, gardening, and more. Compare prices, read reviews, and book online on RuralSync.`;

  return {
    title,
    description,
    keywords: [
      `services in ${cityName}`,
      `home services ${cityName}`,
      `local services ${cityName}`,
      `${cityName} plumbing`,
      `${cityName} electrical`,
      `${cityName} cleaning`,
      `trusted professionals ${cityName}`,
      "RuralSync",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      siteName: "RuralSync",
      url: `https://ruralsync.vercel.app/${city}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://ruralsync.vercel.app/${city}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for known cities
export async function generateStaticParams() {
  return TARGET_CITIES.map((city) => ({ city }));
}

// Format city name for display
function formatCityName(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Fetch top services from API
async function fetchTopServices(city: string): Promise<Service[]> {
  try {
    const params = new URLSearchParams({
      locationText: city,
      limit: "12",
      sortBy: "rating",
    });

    const response = await fetch(
      `${API_BASE}/api/client/search?${params.toString()}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.services || data.data || [];
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

// Fetch service providers/organizations
async function fetchProviders(city: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/client/services/providers?locationText=${encodeURIComponent(city)}&limit=6`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.providers || data.data || [];
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return [];
  }
}

// Generate JSON-LD for SEO
function generateJsonLd(city: string, services: Service[]): object {
  const cityName = CITY_DISPLAY_NAMES[city.toLowerCase()] || formatCityName(city);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Local Services in ${cityName}`,
      description: `Find trusted local home services in ${cityName}`,
      url: `https://ruralsync.vercel.app/${city}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: services.length,
        itemListElement: services.slice(0, 10).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            provider: {
              "@type": "Organization",
              name: s.organization?.name || "RuralSync Provider",
            },
            areaServed: {
              "@type": "City",
              name: cityName,
            },
            offers: {
              "@type": "Offer",
              price: s.basePrice,
              priceCurrency: "INR",
            },
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://ruralsync.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: cityName,
          item: `https://ruralsync.vercel.app/${city}`,
        },
      ],
    },
  ];
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const cityLower = city.toLowerCase();
  const cityName = CITY_DISPLAY_NAMES[cityLower] || formatCityName(city);

  // Fetch data
  const [services, providers] = await Promise.all([
    fetchTopServices(cityLower),
    fetchProviders(cityLower),
  ]);

  // Generate JSON-LD
  const jsonLd = generateJsonLd(cityLower, services);

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const cat = service.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center gap-2 text-sm text-green-100 mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white font-medium">{cityName}</span>
              </nav>

              {/* Location Badge */}
              <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {cityName}, India
              </Badge>

              {/* H1 - Optimized for Local SEO */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Local Services in {cityName}
              </h1>

              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Find trusted service providers near you. Plumbing, electrical,
                cleaning, and more - all verified professionals at your service.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <Link href={`/search?locationText=${cityLower}`}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 text-white">
                      <Search className="h-6 w-6" />
                      <span className="text-lg">
                        Search for services in {cityName}...
                      </span>
                      <ArrowRight className="h-5 w-5 ml-auto" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-8 mt-10 text-green-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {services.length}+
                  </div>
                  <div className="text-sm">Services</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {providers.length}+
                  </div>
                  <div className="text-sm">Providers</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.5</div>
                  <div className="text-sm">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
              Browse Services by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {SERVICE_CATEGORIES.map((serviceSlug) => {
                const serviceName = SERVICE_DISPLAY_NAMES[serviceSlug];
                const icon = categoryIcons[serviceName] || "📦";
                return (
                  <Link
                    key={serviceSlug}
                    href={`/${cityLower}/${serviceSlug}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2.5 text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 cursor-pointer transition-all"
                    >
                      <span className="mr-2">{icon}</span>
                      {serviceName}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Top Services */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Top Services in {cityName}
                </h2>
                <p className="text-muted-foreground mt-2">
                  Highest-rated services by local customers
                </p>
              </div>
              <Link href={`/search?locationText=${cityLower}&sortBy=rating`}>
                <Button variant="outline" className="hidden sm:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.slice(0, 6).map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CardContent>
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Services Found in {cityName}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;re expanding to {cityName} soon! Check back later or
                    browse services in other cities.
                  </p>
                  <Link href="/search">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Browse All Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {services.length > 6 && (
              <div className="text-center mt-8">
                <Link href={`/search?locationText=${cityLower}`}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    View All {services.length}+ Services
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Services by Category */}
          {Object.keys(servicesByCategory).length > 1 && (
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                Services by Category
              </h2>

              <div className="space-y-12">
                {Object.entries(servicesByCategory)
                  .slice(0, 3)
                  .map(([category, categoryServices]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                          <span className="text-2xl">
                            {categoryIcons[category] || "📦"}
                          </span>
                          {category}
                        </h3>
                        <Link
                          href={`/search?locationText=${cityLower}&category=${encodeURIComponent(category)}`}
                        >
                          <Button variant="ghost" size="sm">
                            View All
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {categoryServices.slice(0, 3).map((service) => (
                          <ServiceCard key={service._id} service={service} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Why RuralSync Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Why Book on RuralSync in {cityName}?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Providers",
                  desc: "All professionals are background-checked",
                },
                {
                  icon: Star,
                  title: "Genuine Reviews",
                  desc: "Real ratings from local customers",
                },
                {
                  icon: Clock,
                  title: "Easy Booking",
                  desc: "Book services in under 2 minutes",
                },
                {
                  icon: Users,
                  title: "Local Experts",
                  desc: `Trusted professionals from ${cityName}`,
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Other Cities */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Explore Other Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {TARGET_CITIES.filter((c) => c !== cityLower).map((otherCity) => (
                <Link key={otherCity} href={`/${otherCity}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2.5 text-sm hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                  >
                    <MapPin className="h-3 w-3 mr-2" />
                    {CITY_DISPLAY_NAMES[otherCity]}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* CTA Footer */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need a Service in {cityName}?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Search from {services.length}+ services and find the perfect match
              for your needs.
            </p>
            <Link href={`/search?locationText=${cityLower}`}>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 font-semibold px-8 py-6 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Services in {cityName}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
