import { Testimonial as TestimonialType } from "@shared/schema";
import { Star, StarHalf } from "lucide-react";
import { motion } from "framer-motion";

interface TestimonialProps {
  testimonial: TestimonialType;
}

export default function Testimonial({ testimonial }: TestimonialProps) {
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(testimonial.rating);
    const hasHalfStar = testimonial.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="fill-[#DDA15E] text-[#DDA15E] w-5 h-5" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="fill-[#DDA15E] text-[#DDA15E] w-5 h-5"
        />
      );
    }

    return stars;
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <div className="h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-hidden">
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex gap-1 mb-4">{renderStars()}</div>
            <p className="text-white/80 text-sm line-clamp-3 min-h-[102px]">
              {testimonial.content}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center">
            <div className="w-10 h-10 bg-forest-dark rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-medium text-sm">
                {testimonial.imageInitials}
              </span>
            </div>
            <div>
              <h4 className="text-white font-medium">{testimonial.name}</h4>
              <p className="text-white/60 text-xs">{testimonial.title}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
