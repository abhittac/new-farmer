import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { RatingDisplay } from "@/components/ui/rating-display";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Shield, Crown } from "lucide-react";
import placeholderImage from "../../../public/uploads/products/No-Image.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatSnakeCase } from "@/utils/formatSnakeCase";
import { formatUnit } from "@/utils/formatUnit";
import { useState } from "react";
interface ProductCardProps {
  product: Product;
}
// ... your imports remain unchanged ...

export default function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  const price = selectedVariant?.price || product.price || 0;
  const discountPrice =
    selectedVariant?.discountPrice ?? product.discountPrice ?? null;
  const hasDiscount = discountPrice && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice : price;
  const quantity = selectedVariant?.quantity || product.quantity || 1;
  const unit = selectedVariant?.unit || product.unit || "";
  const stockQuantity =
    selectedVariant?.stockQuantity ?? product.stockQuantity ?? 0;
  const lowStock = stockQuantity <= 10;

  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/products/${product.id}/reviews`],
    enabled: !!product.id,
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
        reviews.length
      : 0;
  const badges = [
    {
      condition: product.premiumQuality,
      icon: <Crown className="w-4 h-4" />,
      label: "Premium Quality",
      bg: "bg-yellow-100 text-yellow-800",
    },
    {
      condition: product.chemicalFree,
      icon: <Shield className="w-4 h-4" />,
      label: "Chemical Free",
      bg: "bg-green-100 text-green-800",
    },
    {
      condition: product.naturallyGrown,
      icon: <Leaf className="w-4 h-4" />,
      label: "Naturally Grown",
      bg: "bg-lime-100 text-lime-800",
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-cream rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden aspect-square">
            {/* {hasDiscount && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="destructive" className="bg-red-500 text-white">
                  {Math.round(((price - discountPrice!) / price) * 100)}% OFF
                </Badge>
              </div>
            )} */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              src={
                product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `/api/images/serve/${product.imageUrl.replace(/^\/+/, "")}`
              }
              onError={(e) => {
                e.currentTarget.src = placeholderImage;
              }}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          </div>
        </Link>

        <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
          {/* ⭐ Category Badge */}
          <div className="flex gap-2 mb-1">
            {product.category && (
              <Badge variant="default">{product.category}</Badge>
            )}
            {product.subcategory && (
              <Badge variant="info">{product.subcategory}</Badge>
            )}
          </div>

          {/* ⭐ Product Name */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {product.name}
          </h3>

          {/* ⭐ Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* ⭐ Product Tags (Premium, Chemical-Free, etc.) */}
          <div className="flex flex-wrap gap-2 my-2">
            {badges
              .filter((badge) => badge.condition)
              .map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full ${badge.bg}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              ))}
          </div>

          {/* ⭐ Variant Selector */}
          {product.variants?.length >= 1 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-2 py-1 border rounded text-sm ${
                    selectedVariant?.id === variant.id
                      ? "bg-green-600 text-white border-green-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {variant.quantity} {variant.unit}
                </button>
              ))}
            </div>
          )}

          {/* ⭐ Rating Display */}
          <div className="flex items-center gap-1 mb-2">
            <RatingDisplay rating={averageRating} />
            <span className="text-xs text-gray-500">({reviews.length})</span>
          </div>

          {/* ⭐ Price Section + Add to Cart */}
          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex flex-col space-y-1">
              {hasDiscount ? (
                <>
                  <span className="text-forest font-bold text-lg md:text-xl">
                    ₹{discountPrice!.toFixed(2)}
                  </span>
                  <span className="text-gray-500 line-through text-sm">
                    ₹{price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {Math.round(((price - discountPrice!) / price) * 100)}% OFF
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-forest font-bold text-lg md:text-xl">
                  ₹{price.toFixed(2)}
                </span>
              )}
            </div>

            {stockQuantity > 0 ? (
              <AddToCartButton
                product={product}
                selectedVariantId={selectedVariant.id}
              />
            ) : (
              <p className="text-red-600 font-semibold">Out of Stock</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
