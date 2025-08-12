import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@shared/schema";
import { v4 as uuidv4 } from "uuid"; // Using UUID v4 for session IDs
import { useLocation } from "wouter";

interface CartItem {
  product: Product;
  variant: {
    id: number;
    price: number;
    discountPrice?: number;
    unit?: string;
    quantity: number;
  };
  quantity: number;
}

interface CartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    productId: number,
    variantId: number,
    quantity: number
  ) => Promise<void>;
  updateCartItem: (
    productId: number,
    variantId: number,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (productId: number, variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  totalItems: number;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [location, navigate] = useLocation();
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.variant.discountPrice ?? item.variant.price) * item.quantity,
    0
  );

  const shipping = subtotal > 0 ? 4.99 : 0;
  const total = subtotal + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize session ID and load cart on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    const newSessionId = storedSessionId || uuidv4();

    if (!storedSessionId) {
      localStorage.setItem("sessionId", newSessionId);
    }

    setSessionId(newSessionId);

    // Load cart data
    fetchCart(newSessionId);
  }, []);

  const fetchCart = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart`, {
        headers: {
          "x-session-id": id,
        },
      });
      const data = await response.json();

      console.log("Fetched cart data:", data);
      if (data && data.items) {
        setCartItems(data.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCart = () => {
    setIsCartOpen(true);
    // Prevent scrolling when cart is open
    document.body.style.overflow = "hidden";
  };

  const closeCart = () => {
    setIsCartOpen(false);
    navigate("/products");
    // Restore scrolling
    document.body.style.overflow = "auto";
  };

  const addToCart = async (
    productId: number,
    variantId: number,
    quantity: number
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
        }),
      });

      const data = await response.json();
      if (data && data.items) {
        setCartItems(data.items);
        openCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (
    productId: number,
    variantId: number,
    quantity: number
  ) => {
    if (quantity < 1) {
      return removeFromCart(productId, variantId); // also needs variant
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/cart/items/${productId}/${variantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      const data = await response.json();

      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number, variantId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/cart/items/${productId}/${variantId}`,
        {
          method: "DELETE",
          headers: {
            "x-session-id": sessionId,
          },
        }
      );

      const data = await response.json();
      if (data && data.items) {
        setCartItems(data.items);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart`, {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        setCartItems([]);
        // Fetch updated cart data to ensure synchronization
        await fetchCartData();
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        cartItems,
        openCart,
        closeCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        isLoading,
        subtotal,
        shipping,
        total,
        totalItems,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
