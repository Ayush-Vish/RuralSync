"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, Check, CheckCircle2, CreditCard, ChevronRight, ChevronLeft, Loader2, Info, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { apiService } from "@/lib/api-service"
import { useAuthStore } from "@/store/store"
import { useLocationStore } from "@/store/location-store"

const steps = [
  { id: 1, name: "Date & Time" },
  { id: 2, name: "Details" },
  { id: 3, name: "Review" },
  { id: 4, name: "Payment" },
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { latitude, longitude, displayName, city } = useLocationStore()

  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [bookingNotes, setBookingNotes] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // Initialize address from location store
  useEffect(() => {
    if (displayName) {
      setAddress(displayName)
    } else if (city) {
      setAddress(city)
    }
  }, [displayName, city])

  // Mock slots for now - in real app, fetch from API based on date
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ]

  useEffect(() => {
    // Fetch service details
    const fetchService = async () => {
      try {
        if (!params.id) return
        setLoading(true)
        const data = await apiService.getServiceById(params.id as string)
        if (data.success) {
          setService(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch service", error)
        toast.error("Failed to load service details")
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [params.id])

  // Fetch availability when date or service changes
  useEffect(() => {
    const checkSlots = async () => {
      if (!service || !date) return

      try {
        const dateStr = format(date, "yyyy-MM-dd")
        const res = await apiService.checkAvailability(service._id, dateStr)
        if (res.success) {
          setBookedSlots(res.data || [])
        }
      } catch (err) {
        console.error("Failed to check availability", err)
      }
    }

    checkSlots()
  }, [date, service])

  const handleNext = () => {
    if (step === 1 && (!date || !selectedSlot)) {
      toast.error("Please select a date and time")
      return
    }
    if (step === 2 && !isLoggedIn) {
      // Force login if not logged in (simplified)
      toast.error("Please login to continue")
      router.push(`/login?redirect=/book/${params.id}`)
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleBook = async () => {
    try {
      setSubmitting(true)

      // Use location from store or default to service location
      const bookingLocation = latitude && longitude 
        ? { type: "Point", coordinates: [longitude, latitude] }
        : service.location || { type: "Point", coordinates: [0, 0] }

      const payload = {
        services: [
          {
            serviceId: service._id,
            bookingDate: format(date!, "yyyy-MM-dd"),
            bookingTime: selectedSlot,
            extraTasks: [],
            address: address || displayName || city || "Customer Address",
            location: bookingLocation,
            notes: bookingNotes
          }
        ]
      }

      // Call API
      const response = await apiService.createBooking(payload)

      if (response.success) {
        toast.success("Booking confirmed successfully!")
        router.push("/bookings")
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Booking failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!service) return <div>Service not found</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Complete your Booking</h1>
          <p className="opacity-90">for {service.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Wizard */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                {/* Stepper */}
                <div className="flex items-center justify-between px-2 sm:px-8 mb-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                        step >= s.id ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium",
                        step >= s.id ? "text-green-600" : "text-slate-400"
                      )}>{s.name}</span>
                    </div>
                  ))}
                  {/* Progress Bar background - simplistic version */}
                  <div className="absolute top-12 left-10 right-10 h-[2px] bg-slate-100 -z-0 hidden sm:block" />
                </div>
              </CardHeader>
              <CardContent className="p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold">Select Date & Time</h2>
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                          <Label className="mb-3 block">Pick a Date</Label>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm mx-auto"
                            disabled={{ before: new Date() }}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="mb-3 block">Available Slots</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => {
                              const isBooked = bookedSlots.includes(slot)
                              return (
                                <button
                                  key={slot}
                                  onClick={() => !isBooked && setSelectedSlot(slot)}
                                  disabled={isBooked}
                                  className={cn(
                                    "p-3 text-sm rounded-lg border transition-all",
                                    selectedSlot === slot
                                      ? "bg-green-50 border-green-600 text-green-700 font-medium ring-1 ring-green-600"
                                      : isBooked
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                                        : "hover:border-green-300 hover:bg-slate-50"
                                  )}
                                >
                                  {slot}
                                  {isBooked && <span className="block text-[10px] text-red-400">Booked</span>}
                                </button>
                              )
                            })}
                          </div>
                          {selectedSlot && (
                            <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Selected: {format(date!, "MMM dd, yyyy")} at {selectedSlot}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold">Booking Details</h2>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Service Location</Label>
                          <div className="flex gap-2">
                            <Input
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                            <Button variant="outline"><MapPin className="w-4 h-4" /></Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Special Instructions (Optional)</Label>
                          <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Any specific requirements for the provider?"
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-700 text-sm">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p>The provider will contact you to confirm the exact location details if needed.</p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold">Review Booking</h2>
                      <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Service</span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>
                          <span className="font-medium">{date ? format(date, "MMMM dd, yyyy") : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Time</span>
                          <span className="font-medium">{selectedSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location</span>
                          <span className="font-medium truncate max-w-[200px]">{address || "Not specified"}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                          <span>Total</span>
                          <span>₹{service.basePrice}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold">Payment Method</h2>

                      <div className="grid gap-4">
                        <div className="border p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-xs text-slate-500">Pay securely with your card</p>
                          </div>
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        </div>
                        <div className="border p-4 rounded-xl flex items-center gap-4 cursor-pointer border-green-500 bg-green-50">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-green-700 text-xs">UPI</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">UPI / Net Banking</p>
                            <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                          </div>
                          <div className="w-4 h-4 rounded-full border border-green-600 bg-green-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="border p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-slate-600">💵</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Pay on Completion</p>
                            <p className="text-xs text-slate-500">Pay cash after service</p>
                          </div>
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              <CardFooter className="flex justify-between p-6 border-t bg-slate-50/50">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || submitting}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < 4 ? (
                  <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleBook} disabled={submitting} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Booking Summary Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <Card className="sticky top-24 border-0 shadow-lg">
              <CardHeader className="bg-green-50 rounded-t-xl">
                <CardTitle className="text-green-800">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="aspect-video bg-slate-100 rounded-lg mb-4">
                  {/* Placeholder for service image */}
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Service Image
                  </div>
                </div>
                <h3 className="font-bold text-lg">{service.name}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Price</span>
                    <span>₹{service.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxes & Fees</span>
                    <span>₹{(service.basePrice * 0.18).toFixed(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{(service.basePrice * 1.18).toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
