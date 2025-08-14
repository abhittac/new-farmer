import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, KeyRound, Delete } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProductRatingModal from "@/components/ProductRatingModal";
import { OTPInput } from "@/components/ui/otp-input";
import DeleteAccount from "./DeleteAccount";
import ChangeNumberUser from "./ChangeNumberUser";
import ChangeEmailUser from "./ChangeEmailUser";
import { formatSnakeCase } from "@/utils/formatSnakeCase";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, token, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    orderId: number;
    productId: number;
    productName: string;
  }>({
    isOpen: false,
    orderId: 0,
    productId: 0,
    productName: "",
  });

  // Password change state
  const [passwordChangeStep, setPasswordChangeStep] = useState<"form" | "otp">(
    "form"
  );
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [otp, setOtp] = useState("");
  const [userMobile, setUserMobile] = useState("");

  const { toast } = useToast();
  window.scrollTo(0, 0);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Send OTP for password change
  const sendPasswordChangeOtp = useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile: (user as any)?.mobile,
          purpose: "password_reset",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send OTP");
      }

      return response.json();
    },
    onSuccess: () => {
      setPasswordChangeStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send OTP",
      });
    },
  });

  // Change password with OTP verification
  const changePassword = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      otp: string;
    }) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setShowPasswordChange(false);
      setPasswordChangeStep("form");
      setOtp("");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
      });
      setPasswordChangeStep("form");
    },
  });

  const onPasswordChangeSubmit = async (data: PasswordChangeFormData) => {
    if (!(user as any)?.mobile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mobile number not found. Please contact support.",
      });
      return;
    }
    sendPasswordChangeOtp.mutate(data);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
      });
      return;
    }

    const formData = passwordForm.getValues();
    changePassword.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      otp,
    });
  };

  const resendOtp = () => {
    const formData = passwordForm.getValues();
    sendPasswordChangeOtp.mutate(formData);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
      });
    }
  }, [user, form]);

  // Fetch payment history
  useEffect(() => {
    if (token && activeTab === "payments") {
      fetchPayments();
    }
  }, [token, activeTab]);

  // Fetch subscription data
  useEffect(() => {
    if (token && activeTab === "subscriptions") {
      fetchSubscriptions();
    }
  }, [token, activeTab]);

  // Fetch order history
  useEffect(() => {
    if (token && activeTab === "orders") {
      fetchOrders();
    }
  }, [token, activeTab]);

  // Fetch delivered orders
  useEffect(() => {
    if (token && activeTab === "delivered-orders") {
      fetchDeliveredOrders();
    }
  }, [token, activeTab]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/payments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Payment data:", data);
      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/subscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Subscription data:", data);
      setSubscriptions(
        Array.isArray(data.subscriptions) ? data.subscriptions : []
      );
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Order data:", data);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders/delivered", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Delivered order data:", data);
      setDeliveredOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch delivered orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const success = await updateProfile(data.name);
    if (success) {
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your subscription has been canceled",
        });
        // Refresh subscriptions list
        fetchSubscriptions();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect
  }

  return (
    // <Layout>
    // abhi
    <div className="min-h-screen bg-background relative top-12  ">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">My Account</h1>

        <div className="mb-6">
          <Button
            onClick={() => navigate("/order-history")}
            variant="outline"
            className="mb-4"
          >
            View Order History
          </Button>
        </div>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-8 w-full grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="delivered-orders">Delivered Orders</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={logout}
                        >
                          Logout
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              {/* change number card  */}
              <ChangeNumberUser />
              {/* change email card  */}
              <ChangeEmailUser />
              {/* Password Change Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Change your password using SMS OTP verification for security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showPasswordChange ? (
                    <Button
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  ) : (
                    <div className="space-y-6">
                      {passwordChangeStep === "form" ? (
                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm.handleSubmit(
                              onPasswordChangeSubmit
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Enter current password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Enter new password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Confirm new password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center gap-4">
                              <Button
                                type="submit"
                                disabled={sendPasswordChangeOtp.isPending}
                                className="flex items-center gap-2"
                              >
                                {sendPasswordChangeOtp.isPending
                                  ? "Sending OTP..."
                                  : "Send OTP"}
                              </Button>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                  setShowPasswordChange(false);
                                  passwordForm.reset();
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">
                              We've sent a 6-digit verification code to your
                              mobile number
                            </p>
                            <OTPInput
                              length={6}
                              value={otp}
                              onChange={setOtp}
                              onComplete={setOtp}
                              disabled={changePassword.isPending}
                            />
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={handleOtpSubmit}
                              className="w-full"
                              disabled={
                                changePassword.isPending || otp.length !== 6
                              }
                            >
                              {changePassword.isPending
                                ? "Changing Password..."
                                : "Verify & Change Password"}
                            </Button>

                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                onClick={resendOtp}
                                disabled={sendPasswordChangeOtp.isPending}
                                className="text-sm"
                              >
                                {sendPasswordChangeOtp.isPending
                                  ? "Resending..."
                                  : "Resend OTP"}
                              </Button>

                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setPasswordChangeStep("form");
                                  setOtp("");
                                }}
                                className="text-sm"
                              >
                                ← Back to Form
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* account delete card  */}
              <DeleteAccount />
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your recent payments</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    Loading payment history...
                  </div>
                ) : payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Date</th>
                          <th className="py-2 px-4 text-left">Amount</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Payment ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-2 px-4">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4">
                              {payment.currency} {payment.amount.toFixed(2)}
                            </td>
                            <td className="py-2 px-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {payment.razorpayPaymentId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You don't have any payment history yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Track all your previous orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading orders...</div>
                ) : orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Order ID</th>
                          <th className="py-2 px-4 text-left">Date</th>
                          <th className="py-2 px-4 text-left">Total</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">#{order.id}</td>
                            <td className="py-3 px-4">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You haven't placed any orders yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivered Orders Tab */}
          <TabsContent value="delivered-orders">
            <Card>
              <CardHeader>
                <CardTitle>Delivered Orders</CardTitle>
                <CardDescription>
                  View your successfully delivered orders and rate products
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    Loading delivered orders...
                  </div>
                ) : deliveredOrders.length > 0 ? (
                  <div className="space-y-6">
                    {deliveredOrders.map((order: any) => (
                      <Card
                        key={order.id}
                        className="border-l-4 border-l-green-500"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                Order #{order.id}
                              </CardTitle>
                              <CardDescription>
                                Ordered:{" "}
                                {new Date(order.createdAt).toLocaleDateString()}{" "}
                                • Delivered:{" "}
                                {order.deliveredAt
                                  ? new Date(
                                      order.deliveredAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ₹{order.total.toFixed(2)}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-green-700 border-green-300"
                              >
                                Delivered
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {order.items &&
                              order.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {item.productName || "Product"}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Quantity: {item.quantity} • Price: ₹
                                      {item.price.toFixed(2)}
                                      {item.variant && (
                                        <>
                                          {" "}• Variant: {item.variant.quantity}
                                          {formatSnakeCase(item.variant.unit!)}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {item.hasRated ? (
                                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>Rated</span>
                                      </div>
                                    ) : item.canRate ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setRatingModal({
                                            isOpen: true,
                                            orderId: order.id,
                                            productId: item.productId,
                                            productName:
                                              item.productName || "Product",
                                          })
                                        }
                                      >
                                        <Star className="w-4 h-4 mr-1" />
                                        Rate Product
                                      </Button>
                                    ) : (
                                      <span className="text-sm text-gray-400">
                                        Cannot rate
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You don't have any delivered orders yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Rating Modal */}
        <ProductRatingModal
          isOpen={ratingModal.isOpen}
          onClose={() =>
            setRatingModal({
              isOpen: false,
              orderId: 0,
              productId: 0,
              productName: "",
            })
          }
          orderId={ratingModal.orderId}
          productId={ratingModal.productId}
          productName={ratingModal.productName}
        />
      </div>
    </div>
    // </Layout>
  );
}
