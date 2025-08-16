import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Printer,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PrintableDeliverySticker } from "@/components/admin/PrintableDeliverySticker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { getImageUrl } from "@/utils/imageUtils";
import { useAuth } from "@/context/AuthContext";
import placeholderImage from "../../../../public/uploads/products/No-Image.png";
import { formatSnakeCase } from "@/utils/formatSnakeCase";
import MainLoader from "@/utils/MainLoader";
// Order type definition for API response
interface OrderData {
  id: number;
  userId: number | null;
  sessionId: string;
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  };
  cancellationReason: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface OrdersResponse {
  orders: OrderData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Order status options with their corresponding badge colors
const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  //trackingid
  const [isTrackingIdModalOpen, setIsTrackingIdModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newTrackingId, setNewTrackingId] = useState("");
  //end tracking id
  console.log(editingOrder, newTrackingId, "nidhi");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [printStickerOrder, setPrintStickerOrder] = useState<OrderData | null>(
    null
  );
  const ordersPerPage = 10;
  const { toast } = useToast();
  // Fetch detailed order information
  const fetchOrderDetails = async (orderId: number) => {
    setOrderDetailsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/details`,

        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setSelectedOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = async (orderId: number) => {
    setSelectedOrder(orderId);
    await fetchOrderDetails(orderId);
  };

  // Fetch orders from API
  const fetchOrders = async (page = 1, search = "", status = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPerPage.toString(),
        sort: "createdAt",
        order: "desc",
      });

      if (search) {
        params.append("search", search);
      }
      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      console.log("Fetched orders:", data.orders);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders on component mount and when filters change
  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage]);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1, searchTerm, statusFilter);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh orders list
      fetchOrders(currentPage, searchTerm, statusFilter);

      toast({
        title: "Order status updated",
        description: `Order ${orderId} has been updated to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch all orders for export (without pagination)
  const fetchAllOrdersForExport = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/orders/export`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders for export");
    }

    return response.json();
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAllOrdersForExport();
      // Prepare CSV data
      const csvData = data.orders.map((order: any) => ({
        "Order ID": `ORD-${order.id}`,
        "Customer Name": order.userName || "Guest Customer",
        "Customer Email": order.userEmail || "No email",
        "Order Date": new Date(order.createdAt).toLocaleDateString("en-IN"),
        "Total Amount": `₹${order.total}`,
        "Payment Method": order.paymentMethod || "N/A",
        Status: order.status,
        "Shipping Address": order.customerInfo
          ? ` ${order.customerInfo.address || ""}, ${
              order.customerInfo.city || ""
            }, ${order.customerInfo.state || ""} - ${
              order.customerInfo.zip || ""
            }`
          : "N/A",
        "Payment ID": order.paymentId || "N/A",
        "Items Count": order.items?.length || 0,
        "Delivered Date": order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString("en-IN")
          : "Not delivered",
        "Cancellation Reason": order.cancellationReason || "N/A",
      }));

      // Convert to CSV
      const csvContent = [
        Object.keys(csvData[0]).join(","),
        ...csvData.map((row: { [key: string]: string }) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const fileName = `orders_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      saveAs(blob, fileName);

      toast({
        title: "CSV Export Complete",
        description: `Successfully exported ${data.orders.length} orders to CSV.`,
      });
    } catch (err) {
      toast({
        title: "Export Error",
        description:
          err instanceof Error ? err.message : "Failed to export orders",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAllOrdersForExport();

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Main orders sheet
      const ordersData = data.orders.map((order: any) => ({
        "Order ID": `ORD-${order.id}`,
        "Customer Name": order.userName || "Guest Customer",
        "Customer Email": order.userEmail || "No email",
        "Order Date": new Date(order.createdAt).toLocaleDateString("en-IN"),
        "Total Amount": order.total,
        "Payment Method": order.paymentMethod || "N/A",
        Status: order.status,
        "Shipping Address": order.customerInfo
          ? ` ${order.customerInfo.address || ""}, ${
              order.customerInfo.city || ""
            }, ${order.customerInfo.state || ""} - ${
              order.customerInfo.zip || ""
            }`
          : "N/A",
        // "Billing Address": order.billingAddress || "Same as shipping",
        "Payment ID": order.paymentId || "N/A",
        "Items Count": order.items?.length || 0,
        "Delivered Date": order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString("en-IN")
          : "Not delivered",
        "Cancellation Reason": order.cancellationReason || "N/A",
        "Created At": new Date(order.createdAt).toLocaleString("en-IN"),
        "Updated At": new Date(order.updatedAt).toLocaleString("en-IN"),
      }));

      const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

      // Order items details sheet
      const itemsData: any[] = [];
      data.orders.forEach((order: any) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item: any) => {
            itemsData.push({
              "Order ID": `ORD-${order.id}`,
              "Product Name": item.product?.name || "Unknown Product",
              "Product SKU": item.product?.sku || "N/A",
              Category: item.product?.category || "N/A",
              Quantity: item.quantity,
              "Unit Price": item.price,
              "Total Price": item.price * item.quantity,
              Farmer: item.product?.farmer?.name || "N/A",
              "Order Status": order.status,
              "Order Date": new Date(order.createdAt).toLocaleDateString(
                "en-IN"
              ),
            });
          });
        }
      });

      if (itemsData.length > 0) {
        const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
        XLSX.utils.book_append_sheet(workbook, itemsSheet, "Order Items");
      }

      // Summary sheet
      const statusCounts = data.orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const totalRevenue = data.orders.reduce(
        (sum: number, order: any) => sum + order.total,
        0
      );
      const averageOrderValue = totalRevenue / data.orders.length;

      const summaryData = [
        { Metric: "Total Orders", Value: data.orders.length },
        { Metric: "Total Revenue", Value: `₹${totalRevenue.toFixed(2)}` },
        {
          Metric: "Average Order Value",
          Value: `₹${averageOrderValue.toFixed(2)}`,
        },
        {
          Metric: "Export Date",
          Value: new Date().toLocaleDateString("en-IN"),
        },
        { Metric: "", Value: "" },
        { Metric: "Status Breakdown", Value: "" },
        ...Object.entries(statusCounts).map(([status, count]) => ({
          Metric: `${status.charAt(0).toUpperCase() + status.slice(1)} Orders`,
          Value: count,
        })),
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `orders_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      saveAs(blob, fileName);

      toast({
        title: "Excel Export Complete",
        description: `Successfully exported ${data.orders.length} orders to Excel with detailed sheets.`,
      });
    } catch (err) {
      toast({
        title: "Export Error",
        description:
          err instanceof Error ? err.message : "Failed to export orders",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusOption = ORDER_STATUSES.find((s) => s.value === status);
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  //tracking id
  const handleTrackingIdClick = (order) => {
    setEditingOrder(order); // Store the whole order object
    setNewTrackingId(order.trackingId || "");
    setIsTrackingIdModalOpen(true);
  };

  const handleTrackingIdSave = async () => {
    try {
      if (!editingOrder) return; // Guard clause

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${
          editingOrder.id
        }/update-tracking`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trackingId: newTrackingId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tracking ID");
      }

      const data = await response.json();
      fetchOrders();
      setIsTrackingIdModalOpen(false);

      // Optionally update local state or refresh data
      return data;
    } catch (error) {
      console.error("Failed to update tracking ID:", error);
      // You might want to show an error toast here
    }
  };

  const handleTrackingIdCancel = () => {
    setIsTrackingIdModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
          <DropdownMenuTrigger asChild>
            <Button disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export Orders"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportExcel}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Order List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <MainLoader />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-nowrap">Order ID</TableHead>
                      <TableHead className="text-nowrap">Customer</TableHead>
                      <TableHead className="text-nowrap">Date</TableHead>
                      <TableHead className="text-nowrap">Tracking ID</TableHead>
                      <TableHead className="text-nowrap">Total</TableHead>
                      <TableHead className="text-nowrap">
                        Payment Method
                      </TableHead>
                      <TableHead className="text-nowrap">Status</TableHead>
                      <TableHead className="text-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-nowrap">
                            ORD-{order.id}
                          </TableCell>
                          <TableCell className="text-nowrap">
                            <div>
                              <div>{order.userName || "Guest Customer"}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.userEmail || "No email"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-nowrap">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-nowrap">
                            <Link
                              href=""
                              className="underline"
                              onClick={() => handleTrackingIdClick(order)}
                            >
                              {order?.trackingId || "HGJ567G"}
                            </Link>
                          </TableCell>
                          <TableCell className="text-nowrap">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell className="text-nowrap capitalize">
                            {order.paymentMethod}
                          </TableCell>
                          <TableCell className="text-nowrap">
                            <Badge
                              className={getStatusBadgeClass(order.status)}
                              variant="secondary"
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-nowrap">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewOrderDetails(order.id)}
                                title="View Order Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPrintStickerOrder(order)}
                                title="Print Delivery Sticker"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Filter className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {ORDER_STATUSES.filter(
                                    (status) => status.value !== "all"
                                  ).map((status) => (
                                    <DropdownMenuItem
                                      key={status.value}
                                      onClick={() =>
                                        handleUpdateStatus(
                                          order.id,
                                          status.value
                                        )
                                      }
                                      disabled={order.status === status.value}
                                    >
                                      {status.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={() => {
          setSelectedOrder(null);
          setSelectedOrderDetails(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder}</DialogTitle>
          </DialogHeader>

          {orderDetailsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedOrderDetails ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        selectedOrderDetails.status === "delivered"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedOrderDetails.status?.charAt(0).toUpperCase() +
                        selectedOrderDetails.status?.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Order Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{selectedOrderDetails.total}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Order Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {new Date(
                        selectedOrderDetails.createdAt
                      ).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderDetails.customer?.name || "Guest Customer"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderDetails.customer?.email ||
                        "No email provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">
                      Shipping Address
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderDetails.customer
                        ? `${selectedOrderDetails.customer.address}, ${selectedOrderDetails.customer.city}, ${selectedOrderDetails.customer.state} - ${selectedOrderDetails.customer.zip}`
                        : "No address provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Payment Method
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderDetails.paymentMethod || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedOrderDetails.payment?.razorpayPaymentId ||
                        "Not available"}
                    </p>
                  </div>
                  {selectedOrderDetails.payment && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">
                          Payment Status
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrderDetails.payment.status || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Amount Paid
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          ₹
                          {selectedOrderDetails.payment.amount ||
                            selectedOrderDetails.total}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrderDetails.items &&
                  selectedOrderDetails.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrderDetails.items.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              {item.product?.imageUrl && (
                                <img
                                  src={getImageUrl(item.product?.imageUrl)}
                                  alt={item.product.name}
                                  className="w-16 h-16 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = placeholderImage;
                                  }}
                                />
                              )}
                              <div>
                                <h4 className="font-medium">
                                  {item.product?.name || "Product Name"}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  SKU: {item.variantSku || "N/A"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Variant: {item.product.variant[0].quantity}{" "}
                                  {item.product.variant[0].unit}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{item.price}</p>
                              <p className="text-sm text-muted-foreground">
                                Total: ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No items found for this order
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load order details
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isTrackingIdModalOpen}
        onOpenChange={setIsTrackingIdModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking ID</DialogTitle>
            <DialogDescription>
              Update the tracking ID for order ORD-{editingOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingId" className="text-right">
                Tracking ID
              </Label>
              <Input
                id="trackingId"
                value={newTrackingId}
                onChange={(e) => setNewTrackingId(e.target.value)}
                className="col-span-3"
                placeholder="Enter tracking ID"
              />
            </div>
          </div>
          <DialogFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button variant="outline" onClick={handleTrackingIdCancel}>
              Cancel
            </Button>
            <Button onClick={() => handleTrackingIdSave()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Print Delivery Sticker Modal */}
      {printStickerOrder && (
        <PrintableDeliverySticker
          orderId={printStickerOrder.id}
          customerName={printStickerOrder.userName || "Guest Customer"}
          customerEmail={printStickerOrder.userEmail || "No email provided"}
          shippingAddress={`${printStickerOrder.customerInfo.address}, ${printStickerOrder.customerInfo.city}, ${printStickerOrder.customerInfo.state} ${printStickerOrder.customerInfo.zip}`}
          orderTotal={printStickerOrder.total}
          orderDate={printStickerOrder.createdAt}
          paymentMethod={printStickerOrder.paymentMethod}
          onClose={() => setPrintStickerOrder(null)}
        />
      )}
    </div>
  );
}
