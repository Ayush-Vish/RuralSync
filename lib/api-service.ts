export type ServiceName = "auth" | "customer" | "shopkeeper" | "agent" | "email" | "audit-log"

console.log(process.env.NEXT_PUBLIC_USE_PROXY, process.env.NEXT_PUBLIC_PROXY_BASE_URL)

export function getServiceUrl(service: ServiceName): string {
  const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true"
  const proxyBase = process.env.NEXT_PUBLIC_PROXY_BASE_URL ?? "http://localhost"

  if (useProxy) {
    return `${proxyBase}/${service}`
  }

  switch (service) {
    case "auth":
      return process.env.NEXT_PUBLIC_AUTH_URL!
    case "customer":
      return process.env.NEXT_PUBLIC_CUSTOMER_URL!
    case "shopkeeper":
      return process.env.NEXT_PUBLIC_SHOPKEEPER_URL!
    case "agent":
      return process.env.NEXT_PUBLIC_AGENT_URL!
    case "email":
      return process.env.NEXT_PUBLIC_EMAIL_URL!
    case "audit-log":
      return process.env.NEXT_PUBLIC_AUDIT_LOG_URL!
    default:
      throw new Error(`Unknown service: ${service}`)
  }
}

interface ExtraTask {
  description: string
  extraPrice: number
}

interface Location {
  type: "Point"
  coordinates: [number, number] // [longitude, latitude]
}

interface BookingService {
  serviceId: string
  bookingDate: string // YYYY-MM-DD format
  bookingTime: string // HH:MM AM/PM format
  extraTasks?: ExtraTask[]
  location?: Location
  address?: string
}

interface CreateBookingPayload {
  services: BookingService[]
}

class ApiService {
  private async request(service: ServiceName, endpoint: string, options: RequestInit = {}) {
    const baseUrl = getServiceUrl(service)
    const url = `${baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      if (response.status === 204) {
        return null // No content response
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // -------------------- Auth --------------------
  async login(email: string, password: string) {
    return this.request("auth", "/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: "CLIENT" }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    phone: string
    address: string
    role: string
  }) {
    return this.request("auth", "/register", {
      method: "POST",
      body: JSON.stringify({ ...userData, role: "CLIENT" }),
    })
  }

  async getUserDetails() {
    return this.request("auth", "/user-detail/client")
  }

  // -------------------- Services --------------------
  async getServices() {
    return this.request("customer", "/services")
  }

  async getServiceById(serviceId: string) {
    return this.request("customer", `/services/${serviceId}`)
  }

  async getServiceProviders() {
    return this.request("customer", "/services/providers")
  }

  // -------------------- Bookings --------------------
  async createBooking(bookingData: CreateBookingPayload) {
    return this.request("customer", "/booking/book", {
      method: "POST",
      body: JSON.stringify({ ...bookingData, role: "CLIENT" }),
    })
  }

  async createPublicBooking(bookingData: CreateBookingPayload) {
    return this.request("customer", "/booking/book2", {
      method: "POST",
      body: JSON.stringify(bookingData),
    })
  }

  async getUserBookings() {
    return this.request("customer", "/booking/bookings")
  }

  async getBookingsByClientId(clientId: string) {
    return this.request("customer", `/booking/bookings2/${clientId}`)
  }

  async cancelBooking(bookingId: string) {
    return this.request("customer", `/booking/bookings/${bookingId}`, {
      method: "DELETE",
    })
  }

  // -------------------- Profile --------------------
  async getCustomerProfile() {
    return this.request("customer", "/customers/profile")
  }

  async updateCustomerProfile(profileData: any) {
    return this.request("customer", "/customers/profile-update", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }) {
    return this.request("customer", "/customers/password", {
      method: "PATCH",
      body: JSON.stringify(passwordData),
    })
  }

  // -------------------- Reviews --------------------
  async createReview(reviewData: {
    serviceProviderId: string
    rating: number
    comment: string
  }) {
    return this.request("customer", "/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  async updateReview(reviewId: string, reviewData: { rating: number; comment: string }) {
    return this.request("customer", `/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    })
  }

  async deleteReview(reviewId: string) {
    return this.request("customer", `/reviews/${reviewId}`, {
      method: "DELETE",
    })
  }

  async getCustomerReviews() {
    return this.request("customer", "/customers/reviews")
  }

  async getProviderReviews(serviceProviderId: string) {
    return this.request("customer", `/review/serviceProviders/${serviceProviderId}/reviews`)
  }
}

export const apiService = new ApiService()
export type { ExtraTask, Location, BookingService, CreateBookingPayload }
