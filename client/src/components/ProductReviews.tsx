import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductReview } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ProductReviewsProps {
  productId: number;
}

const reviewSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  reviewText: z.string().min(10, "Review must be at least 10 characters long"),
  rating: z.coerce.number().min(1).max(5)
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Fetch product reviews
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId
  });
  
  // Check if user can review this product (has purchased and received it)
  const { data: canReview = false, isLoading: isCheckingReviewEligibility } = useQuery({
    queryKey: [`/api/products/${productId}/can-review`],
    enabled: !!productId && isAuthenticated,
  });
  
  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: '',
      reviewText: '',
      rating: 5
    }
  });
  
  // Submit review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          customerName: user?.name || data.customerName,
          reviewText: data.reviewText,
          rating: data.rating,
          productId: productId,
          userId: user?.id,
          verified: true
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your thoughts.",
      });
      reset();
      refetch();
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
    },
    onError: () => {
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: ReviewFormData) => {
    data.rating = selectedRating;
    addReviewMutation.mutate(data);
  };
  
  // Calculate average rating
  const averageRating = reviews.length ? 
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 
    0;
  
  // Helper to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="fill-[#DDA15E] text-[#DDA15E] w-5 h-5" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-[#DDA15E] text-[#DDA15E] w-5 h-5" />);
    }
    
    for (let i = Math.ceil(rating); i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 w-5 h-5" />);
    }
    
    return stars;
  };
  
  return (
    <div className="mt-16">
      <h2 className="font-heading text-forest text-2xl md:text-3xl font-bold mb-8">
        Customer Reviews
      </h2>
      
      {/* Review summary */}
      <div className="flex items-start flex-wrap gap-8 mb-12">
        <div className="bg-muted rounded-lg p-6 flex flex-col items-center min-w-[200px]">
          <h3 className="text-forest font-bold text-4xl mb-2">
            {averageRating.toFixed(1)}
          </h3>
          <div className="flex mb-2">
            {renderStars(averageRating)}
          </div>
          <p className="text-olive text-sm">
            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-forest font-bold text-xl mb-4">Add Your Review</h3>
          
          {isAuthenticated && !canReview && !isCheckingReviewEligibility && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 text-amber-700 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">You can only review products you've purchased and received</p>
                <p className="text-sm mt-1">Once your order is delivered, you'll be able to share your experience with this product.</p>
              </div>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 text-blue-700 flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sign in to leave a review</p>
                <p className="text-sm mt-1">
                  <a href="/login" className="text-primary underline">Log in</a> or <a href="/register" className="text-primary underline">create an account</a> to share your experience with this product.
                </p>
              </div>
            </div>
          )}
          
          {((isAuthenticated && canReview) || !isAuthenticated) && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input 
                placeholder="Your Name" 
                {...register("customerName")}
              />
              {errors.customerName && (
                <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-olive font-medium">Your Rating:</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSelectedRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 ${selectedRating >= rating ? 'fill-[#DDA15E] text-[#DDA15E]' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Textarea 
                placeholder="Write your review here" 
                className="min-h-[120px]"
                {...register("reviewText")}
              />
              {errors.reviewText && (
                <p className="text-destructive text-sm mt-1">{errors.reviewText.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={addReviewMutation.isPending}
            >
              {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
          )}
        </div>
      </div>
      
      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-forest font-bold text-xl mb-6">
          {reviews.length ? 'Customer Feedback' : 'Be the first to review this product!'}
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/6 mb-4"></div>
                <div className="h-20 bg-muted rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="mb-4 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-forest">{review.customerName}</h4>
                        <div className="flex mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="text-sm text-olive">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <p className="text-olive mt-3">{review.reviewText}</p>
                    {review.verified && (
                      <div className="mt-3 inline-flex items-center text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Purchase
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}