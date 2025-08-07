import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import placeholderImage from "../../../../public/uploads/products/No-Image.png";
interface ProductGalleryProps {
  mainImage: string;
  additionalImages?: string[];
  videoUrl?: string | null;
  productName: string;
}

export function ProductGallery({
  mainImage,
  additionalImages = [],
  videoUrl,
  productName,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Only use actual additional images from the product data
  const actualAdditionalImages =
    additionalImages && additionalImages.length > 0 ? additionalImages : [];

  // Combine all actual images into one array
  const allImages = [mainImage, ...actualAdditionalImages];

  const handlePrev = () => {
    if (showVideo) {
      setShowVideo(false);
      return;
    }
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (showVideo) {
      return;
    }

    if (currentIndex === allImages.length - 1 && videoUrl) {
      setShowVideo(true);
    } else {
      setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
    setShowVideo(false);
  };

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  return (
    <div className="space-y-4">
      {/* Main display area */}
      <div className="relative rounded-xl overflow-hidden shadow-lg aspect-square bg-muted">
        {/* Current Image or Video */}
        <div className="w-full h-full">
          {showVideo && videoUrl ? (
            <iframe
              src={videoUrl}
              title={`${productName} video`}
              className="w-full h-full object-cover"
              allowFullScreen
            />
          ) : (
            <img
              src={allImages[currentIndex]}
              alt={`${productName} - view ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = placeholderImage;
              }}
            />
          )}
        </div>

        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none p-2">
          <Button
            onClick={handlePrev}
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md pointer-events-auto opacity-80 hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={handleNext}
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md pointer-events-auto opacity-80 hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <motion.div
            key={`thumb-${index}`}
            onClick={() => selectImage(index)}
            whileHover={{ scale: 1.05 }}
            className={`cursor-pointer rounded-md overflow-hidden w-20 h-20 shrink-0 border-2 transition-all ${
              currentIndex === index && !showVideo
                ? "border-primary"
                : "border-transparent"
            }`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = placeholderImage;
              }}
            />
          </motion.div>
        ))}

        {videoUrl && (
          <motion.div
            onClick={toggleVideo}
            whileHover={{ scale: 1.05 }}
            className={`cursor-pointer rounded-md overflow-hidden w-20 h-20 shrink-0 border-2 transition-all relative bg-muted ${
              showVideo ? "border-primary" : "border-transparent"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="text-primary h-10 w-10" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
