import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clock, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";

interface CancellationRequest {
  id: number;
  userId: number;
  total: number;
  status: string;
  cancellationRequestReason: string;
  cancellationRequestedAt: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      imageUrl: string;
    };
  }[];
}

export default function OrderCancellations() {
  const [selectedRequest, setSelectedRequest] =
    useState<CancellationRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending cancellation requests
  const { data: requests, isLoading } = useQuery<CancellationRequest[]>({
    queryKey: ["/api/admin/orders/pending/cancellation"],
    enabled: true,
  });

  const processCancellationMutation = useMutation({
    mutationFn: async ({
      orderId,
      action,
      adminResponse,
    }: {
      orderId: number;
      action: "approve" | "reject";
      adminResponse?: string;
    }) => {
      return apiRequest(`/api/admin/orders/${orderId}/process-cancellation`, {
        method: "POST",
        body: JSON.stringify({ action, rejectionReason: adminResponse }),
      });
    },
    onSuccess: (_, variables) => {
      const actionText =
        variables.action === "approve" ? "approved" : "rejected";
      toast({
        title: "Request Processed",
        description: `Order cancellation request has been ${actionText}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/orders/pending/cancellation"],
      });
      setSelectedRequest(null);
      setAdminResponse("");
      setIsModalOpen(false); // Close the modal
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process cancellation request",
        variant: "destructive",
      });
    },
  });

  const handleProcessRequest = (action: "approve" | "reject") => {
    if (selectedRequest) {
      processCancellationMutation.mutate({
        orderId: selectedRequest.id,
        action,
        adminResponse: adminResponse.trim() || undefined,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancellation_requested":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "processing":
      case "confirmed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order Cancellation Requests</h1>
        </div>
        <div className="text-center py-8">Loading cancellation requests...</div>
      </div>
    );
  }

  const pendingRequests = requests || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Cancellation Requests</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-muted-foreground text-lg">
              No pending cancellation requests at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Order #HRV-{request.id}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-lg font-semibold">
                      ₹{request.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {request.customerInfo?.name ||
                          request.user?.name ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {request.customerInfo?.email ||
                          request.user?.email ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {request.customerInfo?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Request Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Requested:</strong>{" "}
                        {new Date(
                          request.cancellationRequestedAt
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          request.cancellationRequestedAt
                        ).toLocaleTimeString()}
                      </p>
                      <p>
                        <strong>Reason:</strong>{" "}
                        {request.cancellationRequestReason}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ul className="space-y-1 text-sm">
                      {request.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog
                    open={isModalOpen && selectedRequest?.id === request.id}
                    onOpenChange={setIsModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review & Process
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          Process Cancellation Request - Order #HRV-{request.id}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-800 mb-2">
                            Customer's Reason:
                          </h4>
                          <p className="text-yellow-700">
                            {request.cancellationRequestReason}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="admin-response">
                            Admin Response (Optional)
                          </Label>
                          <Textarea
                            id="admin-response"
                            placeholder="Add a note about your decision..."
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            className="mt-2"
                            rows={3}
                          />
                        </div>

                        <div className="flex flex-row justify-center gap-2 pt-4 ">
                          <Button
                            onClick={() => handleProcessRequest("approve")}
                            disabled={processCancellationMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {processCancellationMutation.isPending
                              ? "Processing..."
                              : "Approve Cancellation"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleProcessRequest("reject")}
                            disabled={
                              processCancellationMutation.isPending ||
                              (adminResponse.trim().length > 0 &&
                                adminResponse.trim().length < 5)
                            }
                            className="border-gray-300"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Request
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedRequest(null);
                              setAdminResponse("");
                              setIsModalOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
