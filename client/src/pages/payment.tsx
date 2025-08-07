import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// This is needed for typescript to recognize the Razorpay global variable
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const [, navigate] = useLocation();
  const { isAuthenticated, token, user } = useAuth();
  const { sessionId, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    amount: number;
    currency: string;
    description: string;
  } | null>(null);

  // Get the order amount and details from URL parameters or set defaults
  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(window.location.search);
    const amount = Number(searchParams.get("amount")) || 100;
    const currency = searchParams.get("currency") || "INR";
    const description =
      searchParams.get("description") || "Purchase from Farm to Table";

    setOrderDetails({
      amount,
      currency,
      description,
    });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=payment");
    }
  }, [isAuthenticated, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initializeRazorpay = async () => {
      const res = await loadRazorpayScript();
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load. Please try again later.",
          variant: "destructive",
        });
      }
    };

    initializeRazorpay();
  }, [toast]);

  const handlePayment = async () => {
    if (!orderDetails || !token || !user) return;

    try {
      setIsLoading(true);

      // Make sure Razorpay is loaded
      if (typeof window.Razorpay === "undefined") {
        // Try loading it again
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.body.appendChild(script);

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
          // If script fails to load in 5 seconds, continue anyway
          setTimeout(resolve, 5000);
        });

        // Check again
        if (typeof window.Razorpay === "undefined") {
          throw new Error(
            "Razorpay SDK failed to load. Please refresh the page and try again."
          );
        }
      }

      // Initialize payment with the server
      // const response = await fetch("/api/payments/initialize", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     amount: orderDetails.amount,
      //     currency: orderDetails.currency,
      //   }),
      // });
      // abhi
      const data = await apiRequest("/api/payments/initialize", {
        method: "POST",
        body: JSON.stringify({
          amount: orderDetails.amount,
          currency: orderDetails.currency,
        }),
      });

      console.log("Payment initialization successful:", orderDetails);
      const customerInfo = JSON.parse(
        sessionStorage.getItem("customerInfo") || "{}"
      );
      const appliedDiscount = JSON.parse(
        sessionStorage.getItem("appliedDiscount") || "null"
      );
      // Configure Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Farm to Table",
        description: orderDetails.description,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment with the server
            const verifyData = await apiRequest("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-session-id": sessionId,
              },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                amount: data.amount,
                currency: data.currency,
                customerInfo: customerInfo,
                appliedDiscount: appliedDiscount, // Include applied discount
              }),
            });

            // Clear session storage for applied discount
            if (appliedDiscount) {
              sessionStorage.removeItem("appliedDiscount");
            }
            sessionStorage.removeItem("customerInfo");
            
            // Clear the cart from frontend context
            await clearCart();

            // Invalidate cart and order history queries
            queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            queryClient.invalidateQueries({
              queryKey: ["/api/orders/history"],
            });

            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully.",
            });

            // Redirect to success page
            navigate("/payment-success");
          } catch (error) {
            console.error("Payment verification error:", error);
            let errorMessage = "Payment verification failed";
            if (error instanceof Error) {
              errorMessage = error.message;
            }

            toast({
              title: "Payment Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "", // You can add user's phone number if available
        },
        theme: {
          color: "#16a34a",
        },
      };

      try {
        // Create and open Razorpay payment form
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (razorpayError) {
        console.error("Razorpay widget error:", razorpayError);
        toast({
          title: "Payment Error",
          description: "Could not open payment window. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      let errorMessage = "Failed to initialize payment";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !orderDetails) {
    return null;
  }

  return (
    //  <Layout>
    // abhi
    <div className="container mx-auto py-10 flex justify-center relative top-16 mb-14">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Secure payment via Razorpay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Order Summary</h3>
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span>{orderDetails.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    {orderDetails.currency} {orderDetails.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                Your payment is secured by Razorpay. We do not store your
                payment details.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
    // </Layout>
  );
}
