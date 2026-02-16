// ==========================================
// User & Auth Types
// ==========================================

export interface User {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  address?: string
  role: "CLIENT" | "SERVICE_PROVIDER" | "AGENT"
  createdAt: string
  profileImage?: string
}

// ==========================================
// Location Types
// ==========================================

export interface GeoLocation {
  type: string
  coordinates: [number, number] // [longitude, latitude]
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// ==========================================
// Service Provider Types
// ==========================================

export interface ServiceProviderBasic {
  _id: string
  name?: string
  companyName?: string
  email: string
  phone?: string
}

export interface ServiceProviderDetail {
  _id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  rating: number
  totalReviews: number
  description: string
}

export interface ServiceProvider {
  _id: string
  name: string
  email: string
  phone?: string
  address?: ServiceProviderAddress
  rating?: number
  location?: GeoLocation
  services?: string[]
  service?: ServiceBasic[]
  serviceCompany?: ServiceCompanyDetail
}
export interface ServiceProviderAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface ServiceCompanyDetail {
  _id: string
  name: string
  categories: string[]
  description?: string
  images?: string[]
  logo?: string
  rating?: number
  reviewCount?: number
  location?: GeoLocation
  address?: ServiceProviderAddress
  phone?: string
  website?: string
  businessHours?: BusinessHours[]
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

export interface BusinessHours {
  day: string
  open: string
  close: string
  isClosed?: boolean
}

export interface ServiceBasic {
  _id: string
  name: string
  description?: string
  price?: number
  duration?: number
  images?: string[]
  category?: string
  rating?: number
  reviewCount?: number
}

// ==========================================
// Organization Types
// ==========================================

export interface Organization {
  _id: string
  name: string
  description?: string
  phone?: string
}

// ==========================================
// Service Types
// ==========================================

export interface ServiceAvailability {
  day: string
  startTime: string
  endTime: string
}

export interface AdditionalTask {
  description: string
  extraPrice: number
  timeAdded?: string
}

export interface ServiceRatings {
  average: number
  count: number
}

export interface ServiceFeature {
  icon?: string
  title: string
  description?: string
}

export interface ServiceFAQ {
  question: string
  answer: string
}

export interface ServicePricingTier {
  name: string
  price: number
  duration: string
  description?: string
  isPopular?: boolean
}

export interface ServiceAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  landmark?: string
}

export interface ServiceArea {
  radius: number
  cities?: string[]
}

export interface SocialLinks {
  website?: string
  facebook?: string
  instagram?: string
  youtube?: string
}

export interface Service {
  _id: string
  name: string
  description: string
  shortDescription?: string
  category: string
  subCategory?: string
  basePrice: number
  estimatedDuration: string
  serviceProvider: {
    _id: string
    name: string
    email: string
  }
  organization: Organization
  availability: ServiceAvailability[]
  location: GeoLocation
  address?: ServiceAddress
  rating?: number
  reviewCount?: number
  tags?: string[]
  images?: string[]
  coverImage?: string
  isFeatured?: boolean
  completedBookings?: number
  // Fields added by search API
  distance?: number // in meters
  distanceInKm?: number | null // in kilometers (rounded)
}

export interface ServiceDetail {
  _id: string
  name: string
  description: string
  shortDescription?: string
  category: string
  subCategory?: string
  basePrice: number
  estimatedDuration: string
  serviceProvider?: ServiceProviderDetail
  organization?: Organization
  availability?: ServiceAvailability[]
  location?: GeoLocation
  address?: ServiceAddress
  additionalTasks?: AdditionalTask[]
  ratings?: ServiceRatings
  images?: string[]
  coverImage?: string
  videoUrl?: string
  tags?: string[]
  finalPrice?: number
  isFeatured?: boolean
  isActive?: boolean
  
  // Enhanced Fields
  features?: ServiceFeature[]
  faqs?: ServiceFAQ[]
  pricingTiers?: ServicePricingTier[]
  requirements?: string[]
  cancellationPolicy?: string
  warrantyInfo?: string
  serviceArea?: ServiceArea
  minBookingNotice?: number
  maxBookingsPerDay?: number
  completedBookings?: number
  viewCount?: number
  contactPhone?: string
  contactEmail?: string
  socialLinks?: SocialLinks
  assignedAgents?: Array<{
    _id: string
    name: string
    profileImage?: string
  }>
  
  createdAt: string
  updatedAt: string
}

// ==========================================
// Booking Types
// ==========================================

export interface ExtraTask {
  description: string
  extraPrice: number
}

export interface Booking {
  _id: string
  client: string
  service: ServiceDetail & {
    bookingDate: string
    bookingTime: string
  }
  serviceProvider: ServiceProviderBasic
  organization?: Organization
  bookingDate: string
  bookingTime: string
  extraTasks?: ExtraTask[]
  location?: GeoLocation
  status: string
  createdAt: string
  updatedAt: string
}

export interface RecentBooking {
  _id: string
  service: {
    _id: string
    name: string
    description?: string
  }
  serviceProvider: {
    _id: string
    name: string
    email: string
  }
  bookingDate: string
  bookingTime: string
  status: string
  totalPrice?: number
  paymentStatus?: string
  extraTasks?: Array<{
    description: string
    extraPrice: string
  }>
}

// ==========================================
// Review Types
// ==========================================

export interface Review {
  _id: string
  rating: number
  comment: string
  customer: {
    name: string
  }
  createdAt: string
}

export interface RecentReview {
  _id: string
  rating: number
  comment: string
  serviceProvider: {
    companyName: string
  }
  createdAt: string
}

// ==========================================
// Dashboard Types
// ==========================================

export interface DashboardStats {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  totalSpent: number
  averageRating: number
  totalReviews: number
}

// ==========================================
// Component Props Types
// ==========================================

export interface MapViewProps {
  latitude: number
  longitude: number
  zoom?: number
  markers?: Array<{
    lat: number
    lng: number
    title?: string
  }>
}

export interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

export interface CreateReviewDialogProps {
  serviceProviderId: string
  serviceId: string
  onReviewCreated?: () => void
}

export interface AuthGuardProps {
  children: React.ReactNode
}
