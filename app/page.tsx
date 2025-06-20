import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Clock, Star, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RuralSync</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
              Services
            </Link>
            <Link href="/providers" className="text-gray-600 hover:text-green-600 transition-colors">
              Providers
            </Link>
            <Link href="/bookings" className="text-gray-600 hover:text-green-600 transition-colors">
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Rural Services
            <span className="text-green-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with trusted local service providers in your area. From farming to maintenance, find the help you
            need when you need it.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-lg shadow-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="What service do you need?" className="pl-10 border-0 focus-visible:ring-0" />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="Enter your location" className="pl-10 border-0 focus-visible:ring-0" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700 px-8">Search Services</Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              24/7 Booking
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verified Providers
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rated Services
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RuralSync?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and book reliable rural services with trusted local providers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Trusted Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All service providers are verified and rated by the community for your peace of mind.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Quick Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book services instantly with our easy-to-use platform. No phone calls needed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Secure & Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your bookings and payments are protected with our secure platform and insurance coverage.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p className="text-gray-600">Discover the most requested services in your area</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Farm Equipment Rental", icon: "🚜", bookings: "150+ bookings" },
              { name: "Crop Harvesting", icon: "🌾", bookings: "200+ bookings" },
              { name: "Livestock Care", icon: "🐄", bookings: "120+ bookings" },
              { name: "Equipment Repair", icon: "🔧", bookings: "180+ bookings" },
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.bookings}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust RuralSync for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Create Account
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RS</span>
                </div>
                <span className="text-xl font-bold">RuralSync</span>
              </div>
              <p className="text-gray-400">Connecting rural communities with trusted local service providers.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white">
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link href="/providers" className="hover:text-white">
                    Find Providers
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-white">
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RuralSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

