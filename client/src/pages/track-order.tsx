import { useState } from "react";
import { MapPin, Package, Truck, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<null | {
    orderNumber: string;
    status: "processing" | "shipped" | "out-for-delivery" | "delivered";
    statusDate: string;
    estimatedDelivery: string;
    items: { name: string; quantity: number }[];
    shippingAddress: string;
    trackingEvents: { date: string; status: string; location: string }[];
  }>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");
  //   setIsLoading(true);

  //   // In a real application, this would make an API call to get tracking information
  //   // For demo purposes, we'll simulate a response after a short delay
  //   setTimeout(() => {
  //     setIsLoading(false);

  //     // Demo only: Show error for empty fields
  //     if (!orderNumber.trim() || !email.trim()) {
  //       setError("Please enter both order number and email address.");
  //       return;
  //     }

  //     // Demo only: Show error for invalid order number format
  //     if (!/^[A-Z]{2}\d{6}$/.test(orderNumber)) {
  //       setError("Order number should be in format: XX123456");
  //       return;
  //     }

  //     // Demo only: Simulate tracking result for a specific order number
  //     if (orderNumber === "HD123456") {
  //       setTrackingResult({
  //         orderNumber: "HD123456",
  //         status: "shipped",
  //         statusDate: "May 23, 2025",
  //         estimatedDelivery: "May 26, 2025",
  //         items: [
  //           { name: "Mountain Coffee Beans", quantity: 2 },
  //           { name: "Himalayan Honey", quantity: 1 },
  //         ],
  //         shippingAddress: "123 Green Street, Bangalore, Karnataka 560001",
  //         trackingEvents: [
  //           {
  //             date: "May 23, 2025, 10:30 AM",
  //             status: "Shipped",
  //             location: "Warehouse, Delhi",
  //           },
  //           {
  //             date: "May 22, 2025, 3:45 PM",
  //             status: "Packed",
  //             location: "Warehouse, Delhi",
  //           },
  //           {
  //             date: "May 22, 2025, 11:20 AM",
  //             status: "Processing",
  //             location: "Warehouse, Delhi",
  //           },
  //           {
  //             date: "May 21, 2025, 2:15 PM",
  //             status: "Order Confirmed",
  //             location: "Online",
  //           },
  //         ],
  //       });
  //     } else {
  //       // Demo only: For any other order number, show an error
  //       setError(
  //         "No order found with this order number and email combination. Please check and try again."
  //       );
  //     }
  //   }, 1500);
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setTrackingResult(null); // Clear previous result

    if (!orderNumber.trim()) {
      setError("Please enter tracking number.");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    window.open(
      "https://www.indiapost.gov.in/vas/Pages/IndiaPostHome.aspx",
      "_blank"
    );

    // try {
    //   const res = await fetch("/api/orders/tracking", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ orderNumber, email }),
    //   });

    //   const data = await res.json();

    //   if (!res.ok) {
    //     throw new Error(data.message || "Failed to fetch tracking info");
    //   }

    //   // Format tracking events for UI if needed
    //   const formattedEvents = (data.trackingEvents || []).map((event: any) => ({
    //     date: new Date(event.date).toLocaleString(),
    //     status: event.status,
    //     location: event.location || "Online", // fallback if not available
    //   }));

    //   setTrackingResult({
    //     orderNumber: data.orderNumber,
    //     status: data.status,
    //     statusDate: new Date(data.statusDate).toLocaleDateString(),
    //     estimatedDelivery: data.estimatedDelivery
    //       ? new Date(data.estimatedDelivery).toLocaleDateString()
    //       : "",
    //     shippingAddress: data.shippingAddress,
    //     items: data.items,
    //     trackingEvents: formattedEvents,
    //   });
    // } catch (err: any) {
    //   setError(err.message || "Something went wrong");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const getStatusStep = () => {
    if (!trackingResult) return 0;
    switch (trackingResult.status) {
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "out-for-delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const statusStep = getStatusStep();

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-forest text-4xl md:text-5xl font-bold mb-4">
              Track Your Order
            </h1>
            <p className="text-olive text-lg max-w-2xl mx-auto">
              Enter your order details below to get real-time updates on your
              delivery status.
            </p>
          </div>

          {/* Tracking Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                {/* Tracking ID Input */}
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="block text-gray-800 font-semibold mb-2"
                  >
                    Tracking ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) =>
                      setOrderNumber(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. HD123456"
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">
                    Found in your order confirmation email
                  </p> */}
                </div>

                {/* Submit Button */}
                <div className="md:pt-[30px] relative -top-0">
                  <button
                    // type="submit"

                    // disabled={isLoading}
                    className="w-full px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isLoading && (
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    )}
                    {isLoading ? "Tracking..." : "Track Order"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Demo Note */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 text-blue-700 text-sm">
            <strong>Demo Note:</strong> For testing, use order number "HD123456"
            with any email address.
          </div> */}

          {/* Tracking Results */}
          {trackingResult && (
            <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="font-heading text-forest text-2xl font-bold mb-2">
                  Order #{trackingResult.orderNumber}
                </h2>
                <p className="text-olive">
                  Estimated delivery:{" "}
                  <span className="font-medium">
                    {trackingResult.estimatedDelivery}
                  </span>
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="mb-10">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-200"></div>
                  <div
                    className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500"
                    style={{ width: `${(statusStep / 4) * 100}%` }}
                  ></div>

                  {/* Steps */}
                  <div className="flex justify-between relative">
                    {/* Processing */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          statusStep >= 1
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Package size={20} />
                      </div>
                      <span className="text-sm font-medium mt-2 text-forest">
                        Processing
                      </span>
                    </div>

                    {/* Shipped */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          statusStep >= 2
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Truck size={20} />
                      </div>
                      <span className="text-sm font-medium mt-2 text-forest">
                        Shipped
                      </span>
                    </div>

                    {/* Out for Delivery */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          statusStep >= 3
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <MapPin size={20} />
                      </div>
                      <span className="text-sm font-medium mt-2 text-forest">
                        Out for Delivery
                      </span>
                    </div>

                    {/* Delivered */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          statusStep >= 4
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-sm font-medium mt-2 text-forest">
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Order Details */}
                <div className="md:col-span-2">
                  <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                    Order Items
                  </h3>
                  <div className="bg-background rounded-md p-4 mb-6">
                    <ul className="space-y-3">
                      {trackingResult.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="text-olive">{item.name}</span>
                          <span className="text-forest font-medium">
                            Qty: {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                    Shipping Address
                  </h3>
                  <div className="bg-background rounded-md p-4">
                    <p className="text-olive">
                      {trackingResult.shippingAddress}
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div>
                  <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                    Current Status
                  </h3>
                  <div
                    className={`p-4 rounded-md ${
                      statusStep === 4
                        ? "bg-green-50 border border-green-200"
                        : statusStep === 3
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        statusStep === 4
                          ? "text-green-700"
                          : statusStep === 3
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }`}
                    >
                      {trackingResult.status === "processing" && "Processing"}
                      {trackingResult.status === "shipped" && "Shipped"}
                      {trackingResult.status === "out-for-delivery" &&
                        "Out for Delivery"}
                      {trackingResult.status === "delivered" && "Delivered"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated on {trackingResult.statusDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h3 className="font-heading text-forest text-xl font-semibold mb-4">
                  Tracking History
                </h3>
                <div className="border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trackingResult.trackingEvents.map((event, index) => (
                        <tr
                          key={index}
                          className={index === 0 ? "bg-blue-50" : ""}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.date}
                          </td>
                          <td className="px-6 capitalize py-4 whitespace-nowrap text-sm font-medium text-forest">
                            {event.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.location}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Need Help Box */}
          <div className="bg-primary/10 rounded-lg p-6 md:p-8 text-center">
            <h3 className="font-heading text-forest text-xl font-semibold mb-3">
              Need Help With Your Order?
            </h3>
            <p className="text-olive mb-4">
              Our customer service team is available to assist you with any
              questions about your order.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faqs"
                className="inline-block px-6 py-3 bg-white text-primary border border-primary font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
