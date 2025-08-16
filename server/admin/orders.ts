import { Request, Response } from "express";

// Extend Request interface for authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
import { db } from "../db";
import {
  orders,
  orderItems,
  products,
  users,
  farmers,
  Order,
  OrderItem,
} from "@shared/schema";
import {
  eq,
  like,
  desc,
  asc,
  and,
  gte,
  lte,
  sql,
  ne,
  isNotNull,
  isNull,
  or,
  ilike,
} from "drizzle-orm";
import { storage } from "server/storage";

// abhi
// Get monthly sales for current year
const getMonth = (date: Date) => date.getMonth() + 1;

export const getMonthlySalesData = async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = getMonth(new Date());

  // 1. Get all non-cancelled orders from this year
  const validOrders = await db
    .select({
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, new Date(`${currentYear}-01-01`)),
        ne(orders.status, "cancelled")
      )
    );

  // 2. Aggregate revenue per month
  const revenueByMonth: Record<number, number> = {};

  validOrders.forEach((order) => {
    const month = getMonth(new Date(order.createdAt));
    const total = Number(order.total);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + total;
  });

  // 3. Format result for frontend
  return Array.from({ length: currentMonth }, (_, i) => {
    const month = i + 1;
    return {
      name: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      sales: revenueByMonth[month] || 0,
    };
  });
};

// // GET all orders with pagination, sorting and filtering
// export const getAllOrders = async (req: Request, res: Response) => {
//   try {
//     const {
//       page = "1",
//       limit = "10",
//       sort = "id",
//       order = "asc",
//       search = "",
//       status = "",
//       startDate = "",
//       endDate = "",
//     } = req.query as Record<string, string>;

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const offset = (pageNumber - 1) * limitNumber;

//     let query = db
//       .select({
//         id: orders.id,
//         userId: orders.userId,
//         sessionId: orders.sessionId,
//         total: orders.total,
//         status: orders.status,
//         shippingAddress: orders.shippingAddress,
//         paymentMethod: orders.paymentMethod,
//         cancellationReason: orders.cancellationReason,
//         deliveredAt: orders.deliveredAt,
//         createdAt: orders.createdAt,
//         trackingId: orders.trackingId,
//         updatedAt: orders.updatedAt,
//         userName: users.name,
//         userEmail: users.email,
//       })
//       .from(orders)
//       .leftJoin(users, eq(orders.userId, users.id));

//     // Apply search filter if provided
//     if (search) {
//       query = query.where(like(users.name, `%${search}%`));
//     }

//     // Apply status filter if provided
//     if (status) {
//       query = query.where(eq(orders.status, status));
//     }

//     // Apply date range filters if provided
//     if (startDate && endDate) {
//       query = query.where(
//         and(
//           gte(orders.createdAt, new Date(startDate)),
//           lte(orders.createdAt, new Date(endDate))
//         )
//       );
//     } else if (startDate) {
//       query = query.where(gte(orders.createdAt, new Date(startDate)));
//     } else if (endDate) {
//       query = query.where(lte(orders.createdAt, new Date(endDate)));
//     }

//     // Count total records for pagination
//     const totalQuery = db.select({ count: sql<number>`count(*)` }).from(orders);

//     // Apply the same filters to the count query
//     if (search) {
//       totalQuery
//         .leftJoin(users, eq(orders.userId, users.id))
//         .where(like(users.name, `%${search}%`));
//     }
//     if (status) {
//       totalQuery.where(eq(orders.status, status));
//     }
//     if (startDate && endDate) {
//       totalQuery.where(
//         and(
//           gte(orders.createdAt, new Date(startDate)),
//           lte(orders.createdAt, new Date(endDate))
//         )
//       );
//     } else if (startDate) {
//       totalQuery.where(gte(orders.createdAt, new Date(startDate)));
//     } else if (endDate) {
//       totalQuery.where(lte(orders.createdAt, new Date(endDate)));
//     }

//     const [countResult] = await totalQuery;
//     const count = countResult?.count || 0;

//     // Apply sorting
//     if (sort === "userName") {
//       if (order === "asc") {
//         query = query.orderBy(asc(users.name));
//       } else {
//         query = query.orderBy(desc(users.name));
//       }
//     } else {
//       if (order === "asc") {
//         query = query.orderBy(asc(orders[sort as keyof typeof orders]));
//       } else {
//         query = query.orderBy(desc(orders[sort as keyof typeof orders]));
//       }
//     }

//     // Apply pagination
//     query = query.limit(limitNumber).offset(offset);

//     // Execute query
//     const ordersList = await query;

//     // Return orders with pagination metadata
//     res.json({
//       orders: ordersList,
//       pagination: {
//         total: Number(count),
//         page: pageNumber,
//         limit: limitNumber,
//         totalPages: Math.ceil(Number(count) / limitNumber),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch orders", error: String(error) });
//   }
// };
// GET all orders with pagination, sorting and filtering
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      sort = "id",
      order = "asc",
      search = "",
      status = "",
      startDate = "",
      endDate = "",
    } = req.query as Record<string, string>;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // 🧠 Build conditions array for where clause
    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(users.name, searchTerm),
          ilike(orders.trackingId, searchTerm),
          sql`CAST(${orders.id} AS TEXT) ILIKE ${searchTerm}`
        )
      );
    }
    if (status) {
      conditions.push(eq(orders.status, status));
    }
    if (startDate) {
      conditions.push(gte(orders.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(orders.createdAt, new Date(endDate)));
    }

    // ✅ Main query with joins
    let query = db
      .select({
        id: orders.id,
        userId: orders.userId,
        sessionId: orders.sessionId,
        total: orders.total,
        status: orders.status,
        customerInfo: orders.customerInfo, // ✅ Make sure schema allows JSON
        paymentMethod: orders.paymentMethod,
        cancellationReason: orders.cancellationReason,
        deliveredAt: orders.deliveredAt,
        createdAt: orders.createdAt,
        trackingId: orders.trackingId,
        updatedAt: orders.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    // Apply filters
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // ✅ Count query with same filters
    let totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    if (conditions.length > 0) {
      totalQuery = totalQuery.where(and(...conditions));
    }

    const [countResult] = await totalQuery;
    const count = Number(countResult?.count ?? 0);

    // ✅ Safe sort field whitelist
    const validSortFields = [
      "id",
      "userId",
      "sessionId",
      "total",
      "status",
      "paymentMethod",
      "deliveredAt",
      "createdAt",
      "updatedAt",
      "trackingId",
    ];

    if (sort === "userName") {
      query = query.orderBy(
        order === "asc" ? asc(users.name) : desc(users.name)
      );
    } else if (validSortFields.includes(sort)) {
      const sortColumn = (orders as any)[sort];
      query = query.orderBy(
        order === "asc" ? asc(sortColumn) : desc(sortColumn)
      );
    } else {
      // Default fallback
      query = query.orderBy(desc(orders.createdAt));
    }

    // ✅ Pagination
    query = query.limit(limitNumber).offset(offset);

    const ordersList = await query;

    // ✅ Send response
    res.json({
      orders: ordersList,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: String(error),
    });
  }
};

// GET a single order by ID with its items
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orderData] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        sessionId: orders.sessionId,
        total: orders.total,
        status: orders.status,
        customerInfo: orders.customerInfo,
        paymentMethod: orders.paymentMethod,
        cancellationReason: orders.cancellationReason,
        deliveredAt: orders.deliveredAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, parseInt(id)));

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items with product details
    const orderItemsWithProducts = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, parseInt(id)));

    // Return order with its items
    res.json({
      ...orderData,
      items: orderItemsWithProducts,
    });
  } catch (error) {
    console.error("Error fetching order:x", error);
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: String(error) });
  }
};

// // Update order status
// export const updateOrderStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { status, cancellationReason } = req.body;

//     // Validate status
//     const validStatuses = [
//       "pending",
//       "processing",
//       "shipped",
//       "delivered",
//       "cancelled",
//     ];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid order status" });
//     }

//     // Prepare update data
//     const updateData: Partial<Order> = { status };

//     // Add additional fields based on status
//     if (status === "cancelled" && cancellationReason) {
//       updateData.cancellationReason = cancellationReason;
//     }

//     if (status === "delivered") {
//       updateData.deliveredAt = new Date();
//     }

//     // Update order in database
//     const [updatedOrder] = await db
//       .update(orders)
//       .set(updateData)
//       .where(eq(orders.id, parseInt(id)))
//       .returning();

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.json({
//       message: "Order status updated successfully",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to update order status", error: String(error) });
//   }
// };
export const updateOrderStatus = async (req: Request, res: Response) => {
  interface OrderEvent {
    status: string;
    message: string;
    date: string;
    location?: string;
  }
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const orderId = parseInt(id);
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const now = new Date().toISOString();
    const message = `Order status updated to ${status}`;
    const newEvent: OrderEvent = {
      status,
      message,
      date: now,
      ...(status === "shipped" && { location: "Warehouse, Delhi" }),
      ...(status === "delivered" && {
        location: existingOrder.customerInfo?.address || "Customer Address",
      }),
    };

    const updatedTimeline = Array.isArray(existingOrder.statusTimeline)
      ? [...existingOrder.statusTimeline, newEvent]
      : [newEvent];

    const updateData: Partial<typeof orders.$inferInsert> = {
      status,
      statusTimeline: updatedTimeline,
      updatedAt: new Date(),
    };

    if (status === "cancelled" && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: String(error),
    });
  }
};

// Customer requests order cancellation
export const requestOrderCancellation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: "Cancellation reason must be at least 10 characters long",
      });
    }

    const orderId = parseInt(id);
    const existingOrder = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled - per requirements: "Confirmed", "Pending", or "Processing"
    const cancellableStatuses = ["pending", "confirmed", "processing"];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Check if cancellation already requested
    if (existingOrder.cancellationRequestedAt) {
      return res.status(400).json({
        message: "Cancellation request already submitted",
      });
    }

    const now = new Date();
    const newEvent = {
      status: "cancellation_requested",
      message: `Customer requested order cancellation: ${reason}`,
      date: now.toISOString(),
    };

    const updatedTimeline = Array.isArray(existingOrder.statusTimeline)
      ? [...existingOrder.statusTimeline, newEvent]
      : [newEvent];

    const [updatedOrder] = await db
      .update(orders)
      .set({
        cancellationRequestedAt: now,
        cancellationRequestReason: reason.trim(),
        statusTimeline: updatedTimeline,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .returning();

    res.json({
      message: "Cancellation request submitted successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error requesting order cancellation:", error);
    res.status(500).json({
      message: "Failed to submit cancellation request",
      error: String(error),
    });
  }
};

// Admin approves/rejects cancellation request
export const processCancellationRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    if (
      action === "reject" &&
      (!rejectionReason || rejectionReason.trim().length < 5)
    ) {
      return res.status(400).json({
        message: "Rejection reason must be at least 5 characters long",
      });
    }

    const orderId = parseInt(id);
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!existingOrder.cancellationRequestedAt) {
      return res.status(400).json({
        message: "No cancellation request found for this order",
      });
    }

    if (
      existingOrder.cancellationApprovedAt ||
      existingOrder.cancellationRejectedAt
    ) {
      return res.status(400).json({
        message: "Cancellation request already processed",
      });
    }

    const now = new Date();
    let updateData: Partial<typeof orders.$inferInsert>;
    let newEvent;

    if (action === "approve") {
      updateData = {
        status: "cancelled",
        cancellationReason: existingOrder.cancellationRequestReason,
        cancellationApprovedBy: adminId,
        cancellationApprovedAt: now,
        updatedAt: now,
      };

      newEvent = {
        status: "cancelled",
        message: "Order cancelled - Cancellation request approved by admin",
        date: now.toISOString(),
      };
    } else {
      updateData = {
        cancellationRejectedAt: now,
        cancellationRejectionReason: rejectionReason.trim(),
        updatedAt: now,
      };

      newEvent = {
        status: "cancellation_rejected",
        message: `Cancellation request rejected: ${rejectionReason}`,
        date: now.toISOString(),
      };
    }

    const updatedTimeline = Array.isArray(existingOrder.statusTimeline)
      ? [...existingOrder.statusTimeline, newEvent]
      : [newEvent];

    updateData.statusTimeline = updatedTimeline;

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    res.json({
      message: `Cancellation request ${action}d successfully`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error processing cancellation request:", error);
    res.status(500).json({
      message: "Failed to process cancellation request",
      error: String(error),
    });
  }
};

// Get orders with pending cancellation requests (for admin)
export const getPendingCancellationRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const pendingRequests = await db.query.orders.findMany({
      where: and(
        isNotNull(orders.cancellationRequestedAt),
        isNull(orders.cancellationApprovedAt),
        isNull(orders.cancellationRejectedAt)
      ),
      with: {
        items: {
          with: {
            product: true,
            variant: true, // ✅ Add variant info
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(orders.cancellationRequestedAt)],
    });

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending cancellation requests:", error);
    res.status(500).json({
      message: "Failed to fetch pending cancellation requests",
      error: String(error),
    });
  }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Start a transaction to delete order items first, then the order
    const deletedOrder = await db.transaction(async (tx) => {
      // Delete order items
      await tx.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));

      // Delete the order and return it
      const [deletedOrder] = await tx
        .delete(orders)
        .where(eq(orders.id, parseInt(id)))
        .returning();

      return deletedOrder;
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ message: "Failed to delete order", error: String(error) });
  }
};

// Get order statistics data without sending response
export const getOrderStatisticsData = async (): Promise<any> => {
  try {
    // Get counts by status
    const allOrders = await db.select().from(orders);

    // Calculate statistics
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending"
    ).length;
    const processingOrders = allOrders.filter(
      (o) => o.status === "processing"
    ).length;
    const shippedOrders = allOrders.filter(
      (o) => o.status === "shipped"
    ).length;
    const deliveredOrders = allOrders.filter(
      (o) => o.status === "delivered"
    ).length;
    const cancelledOrders = allOrders.filter(
      (o) => o.status === "cancelled"
    ).length;

    // Calculate total revenue
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0);

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      recentOrders,
    };
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    throw error;
  }
};

// Get order statistics with response
export const getOrderStatistics = async (req: Request, res: Response) => {
  try {
    const statistics = await getOrderStatisticsData();
    res.json(statistics);
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      message: "Failed to fetch order statistics",
      error: String(error),
    });
  }
};

// Export all orders with complete details for CSV/Excel
export const exportOrders = async (req: Request, res: Response) => {
  try {
    // Get all orders with user information
    const ordersData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        sessionId: orders.sessionId,
        total: orders.total,
        status: orders.status,
        customerInfo: orders.customerInfo,
        paymentMethod: orders.paymentMethod,
        cancellationReason: orders.cancellationReason,
        deliveredAt: orders.deliveredAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    // Fetch all order items (raw)
    const allOrderItems = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        // discountPrice: orderItems.discountPrice,
        // variantName: orderItems.variantName,
        // unit: orderItems.unit,
      })
      .from(orderItems);

    // Group order items by order ID and attach product info
    const itemsByOrderId: Record<number, any[]> = {};
    for (const item of allOrderItems) {
      try {
        const product = await storage.getProductById(item.productId); // uses your storage layer
        const variant =
          product?.variants?.find((v) => v.id === item.variantId) || null;

        const productInfo = product
          ? {
              id: product.id,
              name: product.name,
              sku: variant?.sku || "",
              imageUrl: product.imageUrl,
            }
          : null;

        if (!itemsByOrderId[item.orderId]) {
          itemsByOrderId[item.orderId] = [];
        }
        itemsByOrderId[item.orderId].push({
          ...item,
          product: productInfo,
        });
      } catch (err) {
        console.error("Error loading product for item:", item.id, err);
        if (!itemsByOrderId[item.orderId]) {
          itemsByOrderId[item.orderId] = [];
        }
        itemsByOrderId[item.orderId].push({
          ...item,
          product: null,
        });
      }
    }

    // Combine orders with items
    const ordersWithItems = ordersData.map((order) => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    res.json({
      orders: ordersWithItems,
      exportedAt: new Date().toISOString(),
      totalOrders: ordersWithItems.length,
    });
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({
      message: "Failed to export orders",
      error: String(error),
    });
  }
};

export const updateOrderTracking = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { trackingId } = req.body;
    console.log("raaj", orderId, trackingId);
    // Validate input
    if (!trackingId || typeof trackingId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid tracking ID is required",
      });
    }

    // Update the order with Drizzle ORM
    const [updatedOrder] = await db
      .update(orders)
      .set({
        trackingId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)))
      .returning();

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: "Tracking ID updated successfully",
    });
  } catch (error) {
    console.error("Error updating tracking ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tracking ID",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
