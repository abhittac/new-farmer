import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@shared/schema";
import { ShoppingBasket, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QuantitySelector } from "./quantity-selector";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  selectedVariantId?: number;
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
  showQuantitySelector?: boolean;
  max?: number;
}

export function AddToCartButton({
  product,
  quantity = 1,
  selectedVariantId,
  className = "",
  showIcon = true,
  fullWidth = false,
  showQuantitySelector = false,
  max,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  // Set max quantity to the available stock (or specified max)
  const maxQuantity = max !== undefined ? max : product.stockQuantity;

  const handleAddToCart = async () => {
    if (!isAuthenticated && location !== "/login") {
      console.log("Redirecting to login...");
      setTimeout(() => navigate("/login"), 0);
      return;
    }
    setIsAdding(true);
    try {
      if (selectedVariantId === undefined) {
        throw new Error("selectedVariantId is required");
      }
      await addToCart(product.id, selectedVariantId, selectedQuantity);

      toast({
        title: "Added to basket",
        description: `${product.name} has been added to your basket.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Failed to add item",
        description:
          "There was an error adding this item to your basket. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Animation delay
      setTimeout(() => {
        setIsAdding(false);
      }, 300);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setSelectedQuantity(newQuantity);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-4 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {showQuantitySelector && (
        <div className="mb-3 sm:mb-0">
          <QuantitySelector
            initialQuantity={selectedQuantity}
            min={1}
            max={maxQuantity}
            onChange={handleQuantityChange}
            disabled={isAdding}
          />
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        className={`bg-primary hover:bg-primary-dark text-white transition-all duration-200 ${
          isAdding ? "scale-105" : ""
        } ${
          fullWidth && !showQuantitySelector ? "w-full" : "flex-1"
        } ${className}`}
        disabled={isAdding}
      >
        {showIcon && <Plus className="h-4 w-4" />}
        {/* abhi  */}
        {/* Add to Basket */}
      </Button>
    </div>
  );
}
