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
  Phone,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Service } from "@/types";
import {
  TARGET_CITIES,
  CITY_DISPLAY_NAMES,
  SERVICE_CATEGORIES,
  SERVICE_DISPLAY_NAMES,
  SERVICE_API_NAMES,
} from "@/lib/seo-constants";

// API Base URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://ruralsyncapi.vercel.app"
    : "http://localhost:5000";

interface PageProps {
  params: Promise<{
    city: string;
    service: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city, service } = await params;

  const cityName = CITY_DISPLAY_NAMES[city.toLowerCase()] || city;
  const serviceName = SERVICE_DISPLAY_NAMES[service.toLowerCase()] || service;

  const title = `Best ${serviceName} Services in ${cityName} | RuralSync`;
  const description = `Find top-rated ${serviceName.toLowerCase()} services in ${cityName}. Compare prices, read reviews, and book trusted local ${serviceName.toLowerCase()} professionals on RuralSync. Fast, reliable service guaranteed.`;

  return {
    title,
    description,
    keywords: [
      `${serviceName} in ${cityName}`,
      `${serviceName.toLowerCase()} services ${cityName}`,
      `best ${serviceName.toLowerCase()} ${cityName}`,
      `${cityName} ${serviceName.toLowerCase()}`,
      `local ${serviceName.toLowerCase()} near me`,
      `affordable ${serviceName.toLowerCase()} ${cityName}`,
      `professional ${serviceName.toLowerCase()} services`,
      "RuralSync",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      siteName: "RuralSync",
      url: `https://ruralsync.vercel.app/${city}/${service}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://ruralsync.vercel.app/${city}/${service}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Generate static params for all city-service combinations
export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];

  for (const city of TARGET_CITIES) {
    for (const service of SERVICE_CATEGORIES) {
      params.push({ city, service });
    }
  }

  return params;
}

// Fetch services from API
async function fetchServices(
  city: string,
  category: string
): Promise<Service[]> {
  try {
    const categoryName = SERVICE_API_NAMES[category.toLowerCase()] || category;
    const params = new URLSearchParams({
      locationText: city,
      category: categoryName,
      limit: "20",
    });

    const response = await fetch(
      `${API_BASE}/api/client/search?${params.toString()}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      console.error("API Error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.services || data.data || [];
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

// JSON-LD Schema for SEO
function generateJsonLd(
  city: string,
  service: string,
  services: Service[]
): object {
  const cityName = CITY_DISPLAY_NAMES[city.toLowerCase()] || city;
  const serviceName = SERVICE_DISPLAY_NAMES[service.toLowerCase()] || service;

  // Service schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${serviceName} Services in ${cityName}`,
    description: `Professional ${serviceName.toLowerCase()} services available in ${cityName}. Book trusted local professionals on RuralSync.`,
    provider: {
      "@type": "Organization",
      name: "RuralSync",
      url: "https://ruralsync.vercel.app",
    },
    areaServed: {
      "@type": "City",
      name: cityName,
      "@id": `https://www.wikidata.org/wiki/${cityName}`,
    },
    serviceType: serviceName,
    offers: services.length > 0 ? {
      "@type": "AggregateOffer",
      lowPrice: Math.min(...services.map((s) => s.basePrice)),
      highPrice: Math.max(...services.map((s) => s.basePrice)),
      priceCurrency: "INR",
      offerCount: services.length,
    } : undefined,
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: serviceName,
        item: `https://ruralsync.vercel.app/${city}/${service}`,
      },
    ],
  };

  // LocalBusiness schema for each service provider
  const localBusinessSchemas = services.slice(0, 5).map((s) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.organization?.name || s.name,
    description: s.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "IN",
    },
    priceRange: `₹${s.basePrice}+`,
    aggregateRating: s.rating ? {
      "@type": "AggregateRating",
      ratingValue: s.rating,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }));

  return [serviceSchema, breadcrumbSchema, ...localBusinessSchemas];
}

export default async function CityServicePage({ params }: PageProps) {
  const { city, service } = await params;

  // Validate city and service
  const cityLower = city.toLowerCase();
  const serviceLower = service.toLowerCase();

  if (
    !TARGET_CITIES.includes(cityLower) ||
    !SERVICE_CATEGORIES.includes(serviceLower)
  ) {
    notFound();
  }

  const cityName = CITY_DISPLAY_NAMES[cityLower] || city;
  const serviceName = SERVICE_DISPLAY_NAMES[serviceLower] || service;
  const categoryIcon = categoryIcons[serviceName] || "📦";

  // Fetch services
  const services = await fetchServices(cityLower, serviceLower);

  // Generate JSON-LD
  const jsonLd = generateJsonLd(cityLower, serviceLower, services);

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
        <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center gap-2 text-sm text-green-100 mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link
                  href={`/search?locationText=${cityLower}`}
                  className="hover:text-white transition-colors"
                >
                  {cityName}
                </Link>
                <span>/</span>
                <span className="text-white font-medium">{serviceName}</span>
              </nav>

              {/* Icon */}
              <div className="text-7xl mb-6">{categoryIcon}</div>

              {/* H1 - Optimized for Local SEO */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best {serviceName} Services in {cityName}
              </h1>

              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
                Find trusted {serviceName.toLowerCase()} professionals in{" "}
                {cityName}. Compare prices, read reviews, and book instantly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/search?category=${serviceName}&locationText=${cityLower}`}
                >
                  <Button
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 py-6 text-lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search {serviceName} Services
                  </Button>
                </Link>
                <Link href="/search">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
                  >
                    View All Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mt-12 text-green-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {services.length}+
                  </div>
                  <div className="text-sm">Services Available</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.5+</div>
                  <div className="text-sm">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Services Grid */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {serviceName} Services in {cityName}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {services.length > 0
                    ? `Found ${services.length} services matching your search`
                    : `No ${serviceName.toLowerCase()} services found in ${cityName} yet`}
                </p>
              </div>
              <Link
                href={`/search?category=${serviceName}&locationText=${cityLower}`}
              >
                <Button variant="outline" className="hidden sm:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="text-6xl mb-4">{categoryIcon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No {serviceName} Services Found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We&apos;re expanding to {cityName} soon! In the meantime,
                    try searching in nearby areas or check back later.
                  </p>
                  <Link href="/search">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Search className="mr-2 h-4 w-4" />
                      Browse All Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Why Choose Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Why Choose RuralSync for {serviceName} in {cityName}?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
                <p className="text-muted-foreground">
                  All {serviceName.toLowerCase()} service providers are
                  background-verified and trained professionals.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Top-Rated Services</h3>
                <p className="text-muted-foreground">
                  Read genuine reviews and choose from the highest-rated{" "}
                  {serviceName.toLowerCase()} experts in {cityName}.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Book {serviceName.toLowerCase()} services online in minutes.
                  No hassle, no hidden charges.
                </p>
              </Card>
            </div>
          </section>

          {/* FAQ Section for SEO */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How much does {serviceName.toLowerCase()} cost in {cityName}?
                </h3>
                <p className="text-muted-foreground">
                  {serviceName} service prices in {cityName} vary based on the
                  type of work and complexity. On RuralSync, you can compare
                  prices from multiple providers and choose the best option for
                  your budget.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How do I book a {serviceName.toLowerCase()} service?
                </h3>
                <p className="text-muted-foreground">
                  Simply search for {serviceName.toLowerCase()} services, compare
                  providers, select your preferred time slot, and book online.
                  You&apos;ll receive confirmation and the professional will arrive
                  at your location.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Are the {serviceName.toLowerCase()} professionals verified?
                </h3>
                <p className="text-muted-foreground">
                  Yes! All service providers on RuralSync undergo thorough
                  background verification. We ensure only trained and trusted
                  professionals serve our customers in {cityName}.
                </p>
              </Card>
            </div>
          </section>

          {/* Related Services */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Other Services in {cityName}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {SERVICE_CATEGORIES.filter((s) => s !== serviceLower).map(
                (serviceSlug) => (
                  <Link key={serviceSlug} href={`/${cityLower}/${serviceSlug}`}>
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                    >
                      {categoryIcons[SERVICE_DISPLAY_NAMES[serviceSlug]] || "📦"}{" "}
                      {SERVICE_DISPLAY_NAMES[serviceSlug]}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </section>

          {/* Other Cities */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              {serviceName} Services in Other Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {TARGET_CITIES.filter((c) => c !== cityLower).map((citySlug) => (
                <Link key={citySlug} href={`/${citySlug}/${serviceLower}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {CITY_DISPLAY_NAMES[citySlug]}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Footer CTA */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Book {serviceName} in {cityName}?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust RuralSync for
              their home service needs.
            </p>
            <Link
              href={`/search?category=${serviceName}&locationText=${cityLower}`}
            >
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 font-semibold px-8 py-6 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Find {serviceName} Services Now
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
