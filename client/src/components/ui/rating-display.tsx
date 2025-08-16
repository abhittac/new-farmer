import { Star, StarHalf } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function RatingDisplay({ 
  rating, 
  totalReviews = 0, 
  size = "md", 
  showCount = true,
  className = "" 
}: RatingDisplayProps) {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
      );
    }
    
    return stars;
  };

  if (rating === 0 && totalReviews === 0) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${sizeClasses[size]} text-gray-300`} />
          ))}
        </div>
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
          No reviews yet
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex">
        {renderStars(roundedRating)}
      </div>
      {showCount && (
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
}