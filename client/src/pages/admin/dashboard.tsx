import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminNav from "../../components/admin/AdminNav";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  users: {
    totalUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    recentUsers: number;
  };
  orders: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    recentOrders: number;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast({
          title: "Error",
          description:
            err instanceof Error
              ? err.message
              : "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  // Sample data for charts
  const orderStatusData = stats
    ? [
        { name: "Pending", value: stats.orders.pendingOrders },
        { name: "Processing", value: stats.orders.processingOrders },
        { name: "Shipped", value: stats.orders.shippedOrders },
        { name: "Delivered", value: stats.orders.deliveredOrders },
        { name: "Cancelled", value: stats.orders.cancelledOrders },
      ]
    : [];

  const productStockData = stats
    ? [
        { name: "In Stock", value: stats.products.inStock },
        { name: "Low Stock", value: stats.products.lowStock },
        { name: "Out of Stock", value: stats.products.outOfStock },
      ]
    : [];

  // // Monthly sales data (this would typically come from the backend)
  // const monthlySalesData = [
  //   { name: "Jan", sales: 4000 },
  //   { name: "Feb", sales: 3000 },
  //   { name: "Mar", sales: 5000 },
  //   { name: "Apr", sales: 4500 },
  //   { name: "May", sales: 6000 },
  //   { name: "Jun", sales: 5500 },
  // ];
  // abhi
  const monthlySalesData = stats?.monthlySalesStats;
  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container ">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container ">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto  ">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            <div className="flex space-x-3">
              <button
                onClick={() => setLocation("/admin/enhanced-products")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Products
              </button>
              <button
                onClick={() => setLocation("/admin/orders")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Orders
              </button>
              <button
                onClick={() => setLocation("/admin/users")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Users
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Users:
                    </span>
                    <span className="font-medium">
                      {stats.users.totalUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Verified Users:
                    </span>
                    <span className="font-medium">
                      {stats.users.verifiedUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Admin Users:
                    </span>
                    <span className="font-medium">
                      {stats.users.adminUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      New Users (30 days):
                    </span>
                    <span className="font-medium">
                      {stats.users.recentUsers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Order Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Orders:
                    </span>
                    <span className="font-medium">
                      {stats.orders.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Pending Orders:
                    </span>
                    <span className="font-medium">
                      {stats.orders.pendingOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Orders (30 days):
                    </span>
                    <span className="font-medium">
                      {stats.orders.recentOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Revenue:
                    </span>
                    <span className="font-medium">
                      ₹{stats.orders.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Product Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Products:
                    </span>
                    <span className="font-medium">
                      {stats.products.totalVariants}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      In Stock:
                    </span>
                    <span className="font-medium">
                      {stats.products.inStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Low Stock:
                    </span>
                    <span className="font-medium">
                      {stats.products.lowStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Out of Stock:
                    </span>
                    <span className="font-medium">
                      {stats.products.outOfStock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Order Status Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#ccc",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Stock Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Product Inventory Status
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productStockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#ccc",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Sales Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#ccc",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#4f46e5"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation("/admin/enhanced-products")}
            >
              <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add, edit, or remove products from your inventory
              </p>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation("/admin/orders")}
            >
              <h3 className="text-lg font-semibold mb-2">Manage Orders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View and update order status, process refunds
              </p>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation("/admin/users")}
            >
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View user details, update roles, and manage accounts
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderDashboard();
}
