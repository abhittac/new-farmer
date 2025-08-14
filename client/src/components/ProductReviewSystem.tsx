import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { Star, StarHalf } from "lucide-react";

// Review schema for validation
const reviewSchema = z.object({
  userId: z.number(),
  productId: z.number(),
  rating: z.number().min(1, "Please select a rating").max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters long"),
  customerName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[A-Za-z]+(\s[A-Za-z])?(\s[A-Za-z]+)*$/, "Invalid name format. Last name can be a single character."),
});

// Type definition for our form
type ReviewFormData = z.infer<typeof reviewSchema>;

interface ProductReviewSystemProps {
  productId: number;
}

export default function ProductReviewSystem({ productId }: ProductReviewSystemProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the current user from auth context
  const { user } = useAuth();

  // Check if the user can review this product (if they've purchased and received it)
  const { data: canReview, isLoading: checkingEligibility } = useQuery({
    queryKey: [`/api/products/${productId}/can-review`],
    enabled: !!productId && !!user?.id,
  });

  // Fetch existing reviews for this product
  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  // Set up the form with validation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userId: user?.id || 0,
      productId: productId,
      rating: 0,
      reviewText: "",
      customerName: user?.name || "",
    }
  });

  // Watch the rating field for real-time updates
  const currentRating = watch("rating");

  // Set up the mutation to submit the review
  const mutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      console.log('Submitting review data:', data);
      try {
        const response = await apiRequest(`/api/products/${productId}/reviews`, {
          method: "POST",
          body: JSON.stringify(data)
        });
        console.log('Review submission response:', response);
        return response;
      } catch (error) {
        console.error('Review submission error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your feedback.",
        variant: "default"
      });
      
      // Reset the form
      reset();
      
      // Show success state
      setIsSuccess(true);
      
      // Hide success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      
      // Invalidate the cache to refresh the reviews
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/can-review`] });
    },
    onError: (error) => {
      console.error('Review submission failed:', error);
      // Show error message
      toast({
        title: "Failed to submit review",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive"
      });
      console.error("Review submission error:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    // Ensure the data includes the user ID and product ID
    const reviewData = {
      ...data,
      userId: user?.id || 0,
      productId: productId
    };
    mutation.mutate(reviewData as ReviewFormData);
  };

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  // Format the average rating to display stars
  const averageRating = calculateAverageRating();
  const roundedRating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5

  // Helper to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }
    
    return stars;
  };

  if (checkingEligibility) {
    return <div className="p-4 text-center">Checking if you can review this product...</div>;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      {/* Display comprehensive rating summary */}
      {!loadingReviews && reviews && Array.isArray(reviews) && reviews.length > 0 && (
        <div className="bg-background p-6 rounded-lg mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(roundedRating)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>
            
            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = reviews.filter((review: any) => review.rating === starCount).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={starCount} className="flex items-center space-x-2 text-sm">
                    <span className="w-2">{starCount}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User can write a review section */}
      {canReview && (
        <div className="bg-background p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Write a Review</h3>
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
              <p className="font-medium">Thank you for your review!</p>
              <p>Your feedback helps other customers make informed decisions.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setValue("rating", rating)}
                      className="focus:outline-none"
                      aria-label={`Rate ${rating} stars`}
                    >
                      <Star 
                        className={`h-8 w-8 cursor-pointer ${
                          currentRating >= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-sm text-red-500">{errors.rating.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="customerName" className="block text-sm font-medium">Your Name</label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Enter your name"
                  {...register("customerName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-invalid={!!errors.customerName}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="reviewText" className="block text-sm font-medium">Your Review</label>
                <Textarea
                  id="reviewText"
                  placeholder="Share your experience with this product..."
                  rows={5}
                  {...register("reviewText")}
                  aria-invalid={!!errors.reviewText}
                />
                {errors.reviewText && (
                  <p className="text-sm text-red-500">{errors.reviewText.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {(isSubmitting || mutation.isPending) ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Display existing reviews */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold mb-4">
          {reviews && Array.isArray(reviews) && reviews.length > 0
            ? "Customer Reviews"
            : "No reviews yet"}
        </h3>
        
        {loadingReviews ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="divide-y">
            {reviews && Array.isArray(reviews) && reviews.map((review: any, index: number) => (
              <div key={index} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{review.customerName || "Verified Customer"}</span>
                      {review.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{review.reviewText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}