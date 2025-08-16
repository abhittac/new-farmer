import { Router, Request, Response, NextFunction } from "express";
import * as productController from "./products";
import * as orderController from "./orders";
import * as userController from "./users";
import * as farmerController from "./farmers";
import { users } from "@shared/schema";
import { db } from "../db";
import { storage } from "../storage";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Create admin router
const adminRouter = Router();

// Admin authentication middleware
const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret-key"
    ) as { userId: number };

    // Check if user exists and is an admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedToken.userId));

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Add user to request object
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin login route
adminRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    console.log(user, "nidhi");

    // Check if user exists and is an admin
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("user2");
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret-key",
      { expiresIn: "24h" }
    );

    // Return user info and token
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed", error: String(error) });
  }
});

// Admin dashboard statistics
adminRouter.get(
  "/dashboard",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      // Create a modified request object to pass to the controllers
      const dashboardReq = { ...req, isDashboard: true };

      // Get user statistics without sending response
      const userStats = await userController.getUserStatisticsData();

      // Get order statistics without sending response
      const orderStats = await orderController.getOrderStatisticsData();

      // Get product stock statistics without sending response
      const productStats = await productController.getProductStockData();
      // Get year chart data of sales without sending response
      // abhi
      const monthlySalesStats = await orderController.getMonthlySalesData();
      // Combine all stats into a single response
      res.json({
        users: userStats,
        orders: orderStats,
        products: productStats,
        monthlySalesStats,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        message: "Failed to fetch dashboard data",
        error: String(error),
      });
    }
  }
);

// Product routes
adminRouter.get(
  "/products",
  authenticateAdmin,
  productController.getAllProducts
);
adminRouter.get(
  "/inventory-products",
  authenticateAdmin,
  productController.getAllInventoryProducts
);
adminRouter.get(
  "/products/:id",
  authenticateAdmin,
  productController.getProductById
);
adminRouter.post(
  "/products",
  authenticateAdmin,
  productController.createProduct
);
adminRouter.put(
  "/products/:id",
  authenticateAdmin,
  productController.updateProduct
);
adminRouter.patch(
  "/products/:id/featured",
  authenticateAdmin,
  productController.toggleProductFeatured
);
adminRouter.delete(
  "/products/:id",
  authenticateAdmin,
  productController.deleteProduct
);
adminRouter.get(
  "/product-categories",
  authenticateAdmin,
  productController.getProductCategories
);
adminRouter.get(
  "/product-stock",
  authenticateAdmin,
  productController.getProductStock
);
// adminRouter.patch(
//   "/products/:id/stock",
//   authenticateAdmin,
//   productController.updateProductStock
// );

// Order routes
adminRouter.get("/orders", authenticateAdmin, orderController.getAllOrders);
adminRouter.get(
  "/orders/export",
  authenticateAdmin,
  orderController.exportOrders
);
adminRouter.get("/orders/:id", authenticateAdmin, orderController.getOrderById);
adminRouter.patch(
  "/orders/:id/status",
  authenticateAdmin,
  orderController.updateOrderStatus
);
adminRouter.delete(
  "/orders/:id",
  authenticateAdmin,
  orderController.deleteOrder
);
adminRouter.get(
  "/order-statistics",
  authenticateAdmin,
  orderController.getOrderStatistics
);
adminRouter.put(
  `/orders/:orderId/update-tracking`,
  authenticateAdmin,
  orderController.updateOrderTracking
);
// User routes
adminRouter.get("/users", authenticateAdmin, userController.getAllUsers);
adminRouter.get("/users/:id", authenticateAdmin, userController.getUserById);
adminRouter.post("/users", authenticateAdmin, userController.createUser);
adminRouter.put("/users/:id", authenticateAdmin, userController.updateUser);
adminRouter.patch(
  "/users/:id/password",
  authenticateAdmin,
  userController.changeUserPassword
);
adminRouter.patch(
  "/users/:id/cod-access",
  authenticateAdmin,
  userController.toggleCodAccess
);
adminRouter.delete("/users/:id", authenticateAdmin, userController.deleteUser);
adminRouter.get(
  "/user-statistics",
  authenticateAdmin,
  userController.getUserStatistics
);
adminRouter.put(
  `/orders/:orderId/update-tracking`,
  authenticateAdmin,
  orderController.updateOrderTracking
);
// Farmer routes
adminRouter.get("/farmers", authenticateAdmin, farmerController.getAllFarmers);
adminRouter.get(
  "/farmers/:id",
  authenticateAdmin,
  farmerController.getFarmerById
);
adminRouter.post("/farmers", authenticateAdmin, farmerController.createFarmer);
adminRouter.put(
  "/farmers/:id",
  authenticateAdmin,
  farmerController.updateFarmer
);
adminRouter.patch(
  "/farmers/:id/featured",
  authenticateAdmin,
  farmerController.toggleFarmerFeatured
);
adminRouter.delete(
  "/farmers/:id",
  authenticateAdmin,
  farmerController.deleteFarmer
);
adminRouter.get(
  "/featured-farmers",
  authenticateAdmin,
  farmerController.getFeaturedFarmers
);

// Newsletter routes
adminRouter.get(
  "/newsletter-subscriptions",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json({ subscriptions });
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch newsletter subscriptions" });
    }
  }
);

adminRouter.delete(
  "/newsletter-subscriptions/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteNewsletterSubscription(parseInt(id));

      if (success) {
        res.json({ message: "Newsletter subscription deleted successfully" });
      } else {
        res.status(404).json({ message: "Newsletter subscription not found" });
      }
    } catch (error) {
      console.error("Error deleting newsletter subscription:", error);
      res
        .status(500)
        .json({ message: "Failed to delete newsletter subscription" });
    }
  }
);

// Contact Messages routes
adminRouter.get(
  "/contact-messages",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  }
);

adminRouter.patch(
  "/contact-messages/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedMessage = await storage.updateContactMessageStatus(
        parseInt(id),
        status
      );
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error updating contact message status:", error);
      res
        .status(500)
        .json({ message: "Failed to update contact message status" });
    }
  }
);

export default adminRouter;
