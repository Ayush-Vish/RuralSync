const API_BASE =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:5000";

class ApiService {
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const url = `${API_BASE}${endpoint}`

    const config: RequestInit = {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      if (response.status === 204) return null
      return await response.json()
    } catch (err) {
      console.error("API request failed:", err)
      throw err
    }
  }

  // -------------------- Auth --------------------
  login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: "CLIENT" }),
    })
  }

  googleLogin(token: string, role: string = 'CLIENT') {
    return this.request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ token, role }),
    })
  }

  register(userData: {
    name: string
    email: string
    password: string
    phone: string
    address: string
  }) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...userData, role: "CLIENT" }),
    })
  }

  getUserDetails() {
    return this.request("/api/auth/user-detail/client")
  }

  // -------------------- Services --------------------
  getServices() {
    return this.request("/api/client/services")
  }

  getServiceById(serviceId: string) {
    return this.request(`/api/client/services/${serviceId}`)
  }

  getServiceProviders() {
    return this.request("/api/client/services/providers")
  }

  getServiceProviderById(providerId: string) {
    return this.request(`/api/client/services/providers/${providerId}`)
  }

  // -------------------- Bookings --------------------
  createBooking(bookingData: any) {
    return this.request("/api/client/bookings", {
      method: "POST",
      body: JSON.stringify({ ...bookingData, role: "CLIENT" }),
    })
  }

  getUserBookings() {
    return this.request("/api/client/bookings")
  }

  getBookingsByClientId(clientId: string) {
    return this.request(`/api/client/bookings/${clientId}`)
  }

  checkAvailability(serviceId: string, date: string) {
    const query = new URLSearchParams()
    query.set("serviceId", serviceId)
    query.set("date", date)
    return this.request(`/api/client/bookings/availability?${query.toString()}`)
  }

  cancelBooking(bookingId: string) {
    return this.request(`/api/client/bookings/${bookingId}`, {
      method: "DELETE",
    })
  }

  // -------------------- Tracking --------------------
  getBookingTracking(bookingId: string) {
    return this.request(`/api/client/bookings/${bookingId}/tracking`)
  }

  // -------------------- Profile --------------------
  getclientProfile() {
    return this.request("/api/client/profile")
  }

  updateClientProfile(profileData: any) {
    return this.request("/api/client/profile-update", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }) {
    return this.request("/api/client/password", {
      method: "PATCH",
      body: JSON.stringify(passwordData),
    })
  }

  updateProfileImage(imageFile: File) {
    const formData = new FormData()
    formData.append("image", imageFile)

    return this.request("/api/client/profile/image", {
      method: "POST",
      body: formData,
    })
  }

  // -------------------- Reviews --------------------
  createReview(reviewData: {
    serviceProviderId: string
    serviceId: string
    rating: number
    comment: string
  }) {
    return this.request("/api/client/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  updateReview(reviewId: string, reviewData: { rating: number; comment: string }) {
    return this.request(`/api/client/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    })
  }

  deleteReview(reviewId: string) {
    return this.request(`/api/client/reviews/${reviewId}`, {
      method: "DELETE",
    })
  }

  getProviderReviews(serviceProviderId: string) {
    return this.request(`/client/reviews/provider/${serviceProviderId}`)
  }

  // Get client's own reviews
  getClientReviews() {
    return this.request("/api/client/reviews/my")
  }

  // Search
  searchServices(params: {
    q?: string;
    lat?: number;
    lng?: number;
    radiusInKm?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance' | 'duration';
    page?: number;
    limit?: number;
    locationText?: string;
  }) {
    const query = new URLSearchParams();

    if (params.q && params.q.trim()) query.set("q", params.q.trim());
    if (params.lat !== undefined && !isNaN(params.lat)) query.set("lat", params.lat.toString());
    if (params.lng !== undefined && !isNaN(params.lng)) query.set("lng", params.lng.toString());
    if (params.radiusInKm !== undefined) query.set("radiusInKm", params.radiusInKm.toString());
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
    if (params.minRating !== undefined) query.set("minRating", params.minRating.toString());
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.page !== undefined) query.set("page", params.page.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());
    if (params.locationText) query.set("locationText", params.locationText);

    return this.request(`/api/client/search?${query.toString()}`);
  }

  // Get all unique categories for filter
  getSearchCategories() {
    return this.request("/api/client/search/categories");
  }

  // Get search suggestions/autocomplete
  getSearchSuggestions(q: string, limit?: number) {
    const query = new URLSearchParams();
    query.set("q", q);
    if (limit) query.set("limit", limit.toString());
    return this.request(`/api/client/search/suggestions?${query.toString()}`);
  }

  // Advanced search with pagination info
  searchServicesAdvanced(params: {
    q?: string;
    lat?: number;
    lng?: number;
    radiusInKm?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance' | 'duration';
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();

    if (params.q && params.q.trim()) query.set("q", params.q.trim());
    if (params.lat !== undefined && !isNaN(params.lat)) query.set("lat", params.lat.toString());
    if (params.lng !== undefined && !isNaN(params.lng)) query.set("lng", params.lng.toString());
    if (params.radiusInKm !== undefined) query.set("radiusInKm", params.radiusInKm.toString());
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
    if (params.minRating !== undefined) query.set("minRating", params.minRating.toString());
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.page !== undefined) query.set("page", params.page.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());

    return this.request(`/api/client/search/advanced?${query.toString()}`);
  }
}
export const apiService = new ApiService()

