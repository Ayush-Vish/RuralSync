"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Clock,
  Star,
  Users,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Navigation,
  Tractor,
  Droplets,
  Bug
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuthStore } from "@/store/store"
import { motion } from "framer-motion"

export default function HomePage() {
  const { initializeAuth, isLoading } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (location) params.set("location", location)
    if (coords) {
      params.set("lat", coords.lat.toString())
      params.set("lng", coords.lng.toString())
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        setLocation("Current Location")
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium animate-pulse">Loading RuralSync...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-48">
        {/* Abstract Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-white to-white" />
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-green-100/40 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl opacity-60" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm bg-white/80 backdrop-blur border text-green-700 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2 text-green-600" />
                Trusted by 10,000+ rural communities
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight"
            >
              Rural Services <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Made Simple
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Connect with trusted local service providers instantly.
              From farming equipment to expert consultation, find it all in one place.
            </motion.p>

            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-16 relative z-10">
                <div className="bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors w-5 h-5" />
                    <Input
                      placeholder="What service do you need?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 border-0 bg-slate-50/50 focus:bg-white rounded-2xl text-base ring-0 focus-visible:ring-1 focus-visible:ring-green-500 transition-all font-medium placeholder:font-normal"
                    />
                  </div>
                  <div className="flex-1 relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors w-5 h-5" />
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 pr-12 h-14 border-0 bg-slate-50/50 focus:bg-white rounded-2xl text-base ring-0 focus-visible:ring-1 focus-visible:ring-green-500 transition-all font-medium placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                      title="Use current location"
                    >
                      <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 md:gap-12"
            >
              {[
                { icon: Clock, label: "24/7 Booking", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Shield, label: "Verified Providers", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Star, label: "Rated Services", color: "text-amber-600", bg: "bg-amber-50" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm border border-slate-100">
                  <div className={`p-2 rounded-full ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose RuralSync?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We've built a platform that understands the unique needs of rural communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Local Experts",
                desc: "Connect with verified providers from your own community who understand local conditions.",
                icon: Users,
                color: "green"
              },
              {
                title: "Fair Pricing",
                desc: "Transparent pricing with no hidden fees. Compare rates and choose what fits your budget.",
                icon: Zap,
                color: "blue"
              },
              {
                title: "Secure Payments",
                desc: "Pay safely through our platform. We hold payments until service is completed to your satisfaction.",
                icon: Shield,
                color: "amber"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow h-full bg-slate-50/50">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 flex items-center justify-center mb-6`}>
                      <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-[15px]">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Services</h2>
              <p className="text-slate-600">Most requested by farmers in your area</p>
            </div>
            <Link href="/services">
              <Button variant="outline" className="hidden sm:flex group">
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Tractor Rental", icon: Tractor, count: 234, color: "text-orange-500", bg: "bg-orange-50" },
              { name: "Harvesting", icon: Droplets, count: 189, color: "text-blue-500", bg: "bg-blue-50" },
              { name: "Pest Control", icon: Bug, count: 145, color: "text-red-500", bg: "bg-red-50" },
              { name: "Consultation", icon: Users, count: 112, color: "text-purple-500", bg: "bg-purple-50" },
            ].map((cat, i) => (
              <Link href={`/search?category=${encodeURIComponent(cat.name)}`} key={i}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full"
                >
                  <div className={`${cat.bg} w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <cat.icon className={`w-8 h-8 ${cat.color}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 mb-1">{cat.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{cat.count}+ providers</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/services">
              <Button variant="outline" className="w-full">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-600 z-0" />
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 z-0" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Grow?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto font-light">
            Join thousands of satisfied farmers and providers transforming rural services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 h-14 px-8 text-base font-bold shadow-xl">
                Get Started Now
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:text-white h-14 px-8 text-base font-semibold backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal for now, can be expanded */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <span className="text-xl font-bold text-white">RuralSync</span>
          </div>
          <p className="text-sm"> Empowering rural communities through technology.</p>
          <div className="mt-8 text-xs text-slate-600">
            &copy; 2025 RuralSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
