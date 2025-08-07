import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrderCancellation() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  // Fetch orders for the authenticated user
  const { data: orders, isLoading: ordersLoading } = useQuery<{orders: Order[]}>({
    queryKey: ["/api/orders/history"],
    enabled: true,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      return apiRequest(`/api/orders/${orderId}/request-cancellation`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Cancellation Request Submitted",
        description: "Your order cancellation request has been submitted for review.",
      });
      setSelectedOrderId(null);
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit cancellation request",
        variant: "destructive",
      });
    },
  });

  const handleCancelOrder = () => {
    if (selectedOrderId && reason.trim()) {
      cancelOrderMutation.mutate({
        orderId: selectedOrderId,
        reason: reason.trim(),
      });
    }
  };

  const eligibleOrders = orders?.orders.filter(order => 
    order.status === "processing" || 
    order.status === "confirmed" || 
    order.status === "pending"
  ) || [];

  if (ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cancel Order</h1>
        
        {eligibleOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No eligible orders found for cancellation. Only orders with status 
                'processing', 'confirmed', or 'pending' can be cancelled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Order to Cancel</h2>
              <div className="grid gap-4">
                {eligibleOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`cursor-pointer transition-all ${
                      selectedOrderId === order.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Order #HRV-{order.id}</span>
                        <span className="text-lg">₹{order.total.toFixed(2)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize font-medium">{order.status}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div className="text-sm">
                          <p className="font-medium">Items:</p>
                          <ul className="list-disc list-inside ml-2">
                            {order.items.map((item, index) => (
                              <li key={index}>
                                {item.productName} × {item.quantity} - ₹{item.price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedOrderId && (
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Reason</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reason">
                      Please provide a reason for cancelling this order
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter your reason for cancellation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelOrder}
                      disabled={!reason.trim() || cancelOrderMutation.isPending}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {cancelOrderMutation.isPending
                        ? "Submitting..."
                        : "Submit Cancellation Request"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrderId(null);
                        setReason("");
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}