"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { toast } from "sonner"

interface CreateReviewDialogProps {
  serviceProviderId: string
  serviceId: string
  serviceName?: string
  providerName?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CreateReviewDialog({
  serviceProviderId,
  serviceId,
  serviceName,
  providerName,
  trigger,
  onSuccess,
}: CreateReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!comment.trim()) {
      toast.error("Please write a comment")
      return
    }

    setLoading(true)

    try {
      await apiService.createReview({
        serviceProviderId,
        serviceId,
        rating,
        comment: comment.trim(),
      })

      toast.success("Review submitted successfully!")
      setOpen(false)
      setRating(0)
      setComment("")
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Failed to create review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setRating(0)
    setComment("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Write Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {providerName || "this service provider"}
            {serviceName && ` for ${serviceName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this service..."
              rows={5}
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset()
                setOpen(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0 || !comment.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
