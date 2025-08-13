import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProductRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  productId: number;
  productName: string;
}

export default function ProductRatingModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
}: ProductRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { rating: number; reviewText: string }) => {
      return apiRequest(`/api/orders/${orderId}/rate-product`, {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating: data.rating,
          reviewText: data.reviewText,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/orders/delivered"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${productId}/reviews`],
      });

      // Reset form and close modal
      setRating(0);
      setReviewText("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    submitRatingMutation.mutate({ rating, reviewText });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={`transition-colors ${
            isActive ? "text-yellow-400" : "text-gray-300"
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Product</DialogTitle>
          <DialogDescription>
            How was your experience with <strong>{productName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Tap a star to rate</p>
            <div className="flex justify-center space-x-1">{renderStars()}</div>
            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Write a Review (Optional)
            </label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitRatingMutation.isPending || rating === 0}
          >
            {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
