import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, CreditCard, Truck, Shield, Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import placeholderImage from "../../../public/uploads/products/No-Image.png";
import { formatSnakeCase } from "@/utils/formatSnakeCase";
import { apiRequest, queryClient } from "@/lib/queryClient";
// Dynamic form schema based on COD availability
const createFormSchema = (codEnabled: boolean) =>
  z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip: z.string().min(5, "ZIP code is required"),
    paymentMethod: codEnabled
      ? z.enum(["razorpay", "cod"])
      : z.literal("razorpay"),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    notes: z.string().optional(),
  });

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { cartItems, subtotal, shipping, total, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [, navigate] = useLocation();
  // Fetch available discounts
  const { data: availableDiscounts = [], isLoading: discountsLoading } =
    useQuery({
      queryKey: ["/api/discounts/active"],
    });

  // Check user's COD access status
  const { data: codAccessData, isLoading: codAccessLoading } = useQuery({
    queryKey: ["/api/user/cod-access"],
    enabled: isAuthenticated && !!token, // Only fetch if user is authenticated
  });

  // Type assertion for availableDiscounts
  const discounts = (availableDiscounts as any[]) || [];

  // Type assertion for COD access data
  const codData = codAccessData as { codEnabled: boolean } | undefined;

  // Extract COD access status (default to true if user is not authenticated or data is loading)
  const userCodEnabled =
    !isAuthenticated || codAccessLoading || codData?.codEnabled !== false;

  // Calculate total with discount
  const calculateTotal = () => {
    let finalTotal = subtotal + shipping;
    if (appliedDiscount) {
      if (appliedDiscount.type === "percentage") {
        finalTotal = finalTotal - (finalTotal * appliedDiscount.value) / 100;
      } else if (appliedDiscount.type === "fixed") {
        finalTotal = Math.max(0, finalTotal - appliedDiscount.value);
      } else if (appliedDiscount.type === "shipping") {
        finalTotal = finalTotal - shipping;
      }
    }
    return finalTotal;
  };

  const applyDiscount = async (discountId: string) => {
    if (!discountId) {
      setDiscountError("Please select a discount");
      return;
    }

    setDiscountLoading(true);
    setDiscountError("");

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: discountId,
          cartTotal: subtotal + shipping,
        }),
      });

      const result = await response.json();

      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
        toast({
          title: "Discount Applied!",
          description: `${result.discount.code} has been applied to your order`,
        });
      } else {
        setDiscountError(result.error || "Invalid discount code");
      }
    } catch (error) {
      setDiscountError("Failed to validate discount code");
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setSelectedDiscountId("");
    setDiscountError("");
    toast({
      title: "Discount Removed",
      description: "The discount has been removed from your order",
    });
  };

  const handleDiscountSelect = (discountId: string) => {
    setSelectedDiscountId(discountId);
    if (discountId && !appliedDiscount) {
      applyDiscount(discountId);
    }
  };

  // Create dynamic form schema based on COD access
  const formSchema = createFormSchema(userCodEnabled);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      paymentMethod: "razorpay",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      notes: "",
    },
  });
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated && location !== "/login") {
      console.log("Redirecting to login...");
      setTimeout(() => navigate("/login"), 0);
    }
  }, [isAuthenticated]);
  // If cart is empty, redirect to products page

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Construct customer info and order summary
      const orderCustomerInfo = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        notes: values.notes,
      };

      const orderData = {
        ...values,
        cartItems,
        subtotal,
        shipping,
        total,
      };

      console.log("orderData", orderData);

      if (values.paymentMethod === "razorpay") {
        // For Razorpay, store customer info and redirect
        sessionStorage.setItem(
          "customerInfo",
          JSON.stringify(orderCustomerInfo)
        );
        setLocation(
          `/payment?amount=${calculateTotal().toFixed(
            2
          )}&currency=INR&description=Purchase from Farm to Table`
        );
        return;
      }

      if (values.paymentMethod === "cod") {
        const sessionId = localStorage.getItem("sessionId");
        // For COD, hit your backend API to create order
        const response = await apiRequest(`/api/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // if needed
            "x-session-id": sessionId?.toString() ?? "",
          },
          body: JSON.stringify({
            paymentMethod: "cod",
            amount: calculateTotal().toFixed(2) * 100, // send in paise
            currency: "INR",
            customerInfo: orderCustomerInfo,
          }),
        });

        // if (!response.ok) {
        //   const data = await response.json();
        //   throw new Error(data.message || "COD order failed");
        // }

        // const data = await response.json();
        // console.log("COD Order Success", data);

        // Clear cart and show success
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
        setOrderComplete(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error: any) {
      console.error("Order error", error);
      toast({
        title: "Error",
        description:
          error.error || "There was a problem processing your order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }
  // Order confirmation screen
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-forest mb-4">
            Order Confirmed!
          </h1>
          <p className="text-olive mb-8">
            Thank you for your order. We've received your purchase and will
            begin processing it right away. You'll receive an email confirmation
            shortly.
          </p>
          <div className="flex flex-col space-y-4">
            <Link href="/">
              <Button className="w-full bg-primary">Return to Home</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full hover:text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background py-32">
      <div className="container mx-auto px-4">
        <Link href="/prooducts">
          <Button
            variant="ghost"
            className="mb-8 flex items-center text-muted-foreground"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="text-3xl font-heading font-bold text-forest mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-heading font-semibold text-forest mb-6">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-heading font-semibold text-forest mb-6">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="San Francisco" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="California" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="94103" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-heading font-semibold text-forest mb-6">
                    Payment Method
                  </h2>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-4"
                          >
                            <div className="flex items-center space-x-3 border p-4 rounded-md">
                              <RadioGroupItem value="razorpay" id="razorpay" />
                              <Label
                                htmlFor="razorpay"
                                className="flex items-center font-medium cursor-pointer"
                              >
                                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                                Pay with Razorpay
                              </Label>
                            </div>
                            {userCodEnabled ? (
                              <div className="flex items-center space-x-3 border p-4 rounded-md">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label
                                  htmlFor="cod"
                                  className="flex items-center font-medium cursor-pointer"
                                >
                                  <Truck className="mr-2 h-5 w-5 text-primary" />
                                  Cash on Delivery
                                </Label>
                              </div>
                            ) : (
                              isAuthenticated &&
                              !codAccessLoading && (
                                <div className="flex items-center space-x-3 border border-gray-300 p-4 rounded-md bg-gray-50 opacity-75">
                                  <div className="w-4 h-4 border border-gray-300 rounded-full bg-gray-200"></div>
                                  <Label className="flex items-center font-medium text-gray-500 cursor-not-allowed">
                                    <Truck className="mr-2 h-5 w-5 text-gray-400" />
                                    Cash on Delivery (Disabled)
                                  </Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence>
                    {form.watch("paymentMethod") === "razorpay" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6"
                      >
                        <div className="p-4 bg-gray-50 rounded-md text-sm">
                          <p className="mb-2">
                            You will be redirected to Razorpay's secure payment
                            page to complete your purchase after submitting the
                            order.
                          </p>
                          <p>
                            Razorpay accepts all major credit/debit cards, UPI,
                            wallets, and net banking options.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {form.watch("paymentMethod") === "cod" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6"
                      >
                        <div className="p-4 bg-gray-50 rounded-md text-sm">
                          <p className="mb-2">
                            Pay with cash when your order is delivered.
                          </p>
                          <p>
                            Our delivery personnel will collect the payment at
                            the time of delivery.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Additional Notes */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-heading font-semibold text-forest mb-6">
                    Additional Notes
                  </h2>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Special instructions for delivery or product handling..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Discount Selection Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-heading font-semibold  mb-6">
                    Apply Discount
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Select
                        value={selectedDiscountId}
                        onValueChange={handleDiscountSelect}
                        disabled={
                          discountLoading ||
                          !!appliedDiscount ||
                          discountsLoading
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue
                            placeholder={
                              discountsLoading
                                ? "Loading discounts..."
                                : "Select a discount"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {discounts.map((discount: any) => (
                            <SelectItem
                              key={discount.id}
                              value={discount.id.toString()}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium">
                                  {discount.code}
                                </span>
                                <span className="text-sm  ml-2">
                                  {discount.type === "percentage" &&
                                    `${discount.value}% off`}
                                  {discount.type === "fixed" &&
                                    `₹${discount.value} off`}
                                  {discount.type === "shipping" &&
                                    "Free Shipping"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {appliedDiscount && (
                        <Button
                          type="button"
                          onClick={removeDiscount}
                          variant="destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {discountError && (
                      <p className="text-red-600 text-sm">{discountError}</p>
                    )}

                    {appliedDiscount && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800">
                              {appliedDiscount.code} Applied!
                            </p>
                            <p className="text-sm text-green-600">
                              {appliedDiscount.description}
                            </p>
                          </div>
                          <div className="text-green-800 font-semibold">
                            {appliedDiscount.type === "percentage" &&
                              `-${appliedDiscount.value}%`}
                            {appliedDiscount.type === "fixed" &&
                              `-₹${appliedDiscount.value}`}
                            {appliedDiscount.type === "shipping" &&
                              "Free Shipping"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Complete Order"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-32">
              <h2 className="text-xl font-heading font-semibold text-forest mb-6">
                Order Summary
              </h2>

              <div className="max-h-96 overflow-y-auto mb-6 pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center py-3 border-b border-border/10"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium">
                        {item.product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">
                        ₹
                        {(item.variant.discountPrice * item.quantity).toFixed(
                          2
                        )}
                      </p>
                      <span className="text-gray-500 line-through text-sm">
                        ₹ {(item.variant.price * item.quantity).toFixed(2)}
                      </span>
                      <p className="text-muted-foreground text-sm">
                        {item.variant.quantity}{" "}
                        {item.variant.unit === "pcs" &&
                        item.variant.quantity === 1
                          ? "Piece"
                          : formatSnakeCase(item.variant.unit!)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Shipping</span>
                  <span>
                    {appliedDiscount?.type === "shipping" ? (
                      <span className="line-through text-muted-foreground">
                        ₹{shipping.toFixed(2)}
                      </span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>
                      {appliedDiscount.type === "percentage" &&
                        `-₹${(
                          ((subtotal + shipping) * appliedDiscount.value) /
                          100
                        ).toFixed(2)}`}
                      {appliedDiscount.type === "fixed" &&
                        `-₹${appliedDiscount.value.toFixed(2)}`}
                      {appliedDiscount.type === "shipping" &&
                        `-₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                )}

                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold text-foreground">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    Free shipping on orders over ₹50. Standard delivery 3-5
                    business days.
                  </p>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    All transactions are secure and encrypted. Pay securely with
                    Razorpay or choose Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
