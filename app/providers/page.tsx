"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Phone, Mail, Search, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { apiService } from "@/lib/api-service"
import Link from "next/link"
import { ServiceProvider } from "@/types"

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    filterProviders()
  }, [searchQuery, selectedCategory, providers])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await apiService.getServiceProviders()
      setProviders(response.data || [])
    } catch (error) {
      console.error("Failed to fetch providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProviders = () => {
    let filtered = providers

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.serviceCompany?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.serviceCompany?.categories?.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((provider) =>
        provider.serviceCompany?.categories?.includes(selectedCategory)
      )
    }

    setFilteredProviders(filtered)
  }

  const getAllCategories = () => {
    const categories = new Set<string>()
    providers.forEach((provider) => {
      provider.serviceCompany?.categories?.forEach((cat) => categories.add(cat))
    })
    return Array.from(categories)
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1">Browse and connect with verified service providers</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search providers, companies, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">All Categories</option>
              {getAllCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card key={provider._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={provider.serviceCompany?.logo || "/placeholder.svg"} />
                        <AvatarFallback>{provider.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{provider.serviceCompany?.name || provider.name}</CardTitle>
                        <CardDescription className="text-sm">{provider.name}</CardDescription>
                      </div>
                    </div>
                  </div>
                  {(provider.serviceCompany?.rating ?? provider.rating) !== undefined && (provider.serviceCompany?.rating ?? provider.rating)! > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      {renderStars(provider.serviceCompany?.rating ?? provider.rating ?? 0)}
                      {provider.serviceCompany?.reviewCount && (
                        <span className="text-xs text-gray-500">({provider.serviceCompany.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {provider.serviceCompany?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {provider.serviceCompany.description}
                    </p>
                  )}

                  {provider.serviceCompany?.categories && provider.serviceCompany.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.serviceCompany.categories.slice(0, 3).map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {provider.serviceCompany.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.serviceCompany.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    {provider.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{provider.phone}</span>
                      </div>
                    )}
                    {provider.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{provider.email}</span>
                      </div>
                    )}
                    {(provider.address && (typeof provider.address === 'string' || (provider.address as any)?.city || (provider.address as any)?.street)) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {typeof provider.address === 'string'
                            ? provider.address
                            : [(provider.address as any)?.street, (provider.address as any)?.city, (provider.address as any)?.state]
                              .filter(Boolean)
                              .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/services?provider=${provider._id}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        View Services
                      </Button>
                    </Link>
                    <Link href={`/providers/${provider._id}`} className="flex-1">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No service providers found</p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
