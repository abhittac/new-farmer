import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import Razorpay from "razorpay";
import { emailService } from "./emailService";
import { indiaPostService } from "./indiaPostApi";

import { smsService } from "./smsService";
import {
  insertNewsletterSubscriptionSchema,
  insertUserSchema,
  insertPaymentSchema,
  insertSubscriptionSchema,
  insertProductReviewSchema,
  insertContactMessageSchema,
  insertTeamMemberSchema,
  insertDiscountSchema,
  products,
  discountUsage,
  productReviews,
  orderItems,
  orders,
  payments,
  subscriptions,
  carts,
  cartItems,
  contactMessages,
  newsletterSubscriptions,
  smsVerifications,
  users,
  Order,
  insertOrderSchema,
  User,
  productVariants,
  discounts,
} from "@shared/schema";
import { db } from "./db";
import {
  eq,
  sql,
  desc,
  asc,
  inArray,
  and,
  isNotNull,
  like,
  lte,
  ilike,
} from "drizzle-orm";
import adminRouter from "./admin";
import imageRouter from "./imageRoutes";
import { exportDatabase, exportTable } from "./databaseExport";
import path from "path";
import express from "express";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "24h";

// Initialize Razorpay
let razorpay: Razorpay;

// Email configuration
let transporter: nodemailer.Transporter;

// Auth middleware - Proper JWT verification
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Your email verification is pending. Please contact admin.",
        forceLogout: true, // 👈 frontend isko check kare abhi
      });
    }

    console.log("Authenticated user:", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiPrefix = "/api";

  // Get session ID middleware
  const getSessionId = (req: Request, res: Response, next: Function) => {
    let sessionId = req.headers["x-session-id"] as string;

    if (!sessionId) {
      sessionId = uuidv4();
      res.setHeader("X-Session-Id", sessionId);
    }

    (req as any).sessionId = sessionId;
    next();
  };

  app.use(getSessionId);

  // Serve uploaded images statically
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public/uploads"))
  );

  // Register admin routes
  app.use(`${apiPrefix}/admin`, adminRouter);

  // Register image upload routes
  app.use(`${apiPrefix}/images`, imageRouter);

  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });

      // Query params
      const {
        page = "1",
        limit = "10",
        sortBy = "id", // "price" or product field
        sortOrder = "asc",
        search = "",
        category = "",
        minPrice = "",
        maxPrice = "",
      } = req.query as Record<string, string>;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;
      const minPriceNum = minPrice ? parseFloat(minPrice) : null;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : null;
      const sortField = ["id", "name", "price"].includes(sortBy)
        ? sortBy
        : "id";
      const orderDirection = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";
      let orderExpr;
      if (sortField === "price") {
        orderExpr =
          orderDirection === "asc"
            ? sql`(SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = products.id) ASC`
            : sql`(SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = products.id) DESC`;
      } else if (sortField === "name") {
        orderExpr =
          orderDirection === "asc" ? asc(products.name) : desc(products.name);
      } else {
        orderExpr =
          orderDirection === "asc" ? asc(products.id) : desc(products.id);
      }
      // Product filters
      const productFilters = [];
      if (search) productFilters.push(ilike(products.name, `%${search}%`));
      if (category) productFilters.push(eq(products.category, category));

      // Step 1: Get IDs of products that match filters & variant constraints
      const productIdsWithVariants = await db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            ...productFilters,
            sql`EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = products.id
              ${
                minPriceNum !== null
                  ? sql`AND pv.price >= ${minPriceNum}`
                  : sql``
              }
              ${
                maxPriceNum !== null
                  ? sql`AND pv.price <= ${maxPriceNum}`
                  : sql``
              }
          )`
          )
        )
        .orderBy(orderExpr)
        .limit(limitNumber)
        .offset(offset);

      const productIds = productIdsWithVariants.map((p) => p.id);

      if (productIds.length === 0) {
        return res.json({
          products: [],
          pagination: {
            total: 0,
            page: pageNumber,
            limit: limitNumber,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }

      // Step 2: Count total products matching filters
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(DISTINCT products.id)` })
        .from(products)
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .where(
          and(
            ...productFilters,
            minPriceNum !== null
              ? sql`${productVariants.price} >= ${minPriceNum}`
              : sql`TRUE`,
            maxPriceNum !== null
              ? sql`${productVariants.price} <= ${maxPriceNum}`
              : sql`TRUE`
          )
        );

      // Step 3: Fetch product details
      const productsList = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .orderBy(orderExpr);

      // Step 4: Fetch variants
      const variants = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds));

      // Step 5: Map variants to products
      const variantsMap = variants.reduce((acc, variant) => {
        if (!acc[variant.productId]) acc[variant.productId] = [];
        acc[variant.productId].push(variant);
        return acc;
      }, {} as Record<number, any[]>);

      const enrichedProducts = productsList.map((product) => ({
        ...product,
        variants: variantsMap[product.id] || [],
      }));

      // Step 6: Respond
      res.json({
        success: true,
        products: enrichedProducts,
        pagination: {
          total: Number(count),
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(Number(count) / limitNumber),
          hasNextPage: pageNumber * limitNumber < Number(count),
          hasPrevPage: pageNumber > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get(`${apiPrefix}/products/featured`, async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get products by category
  app.get(`${apiPrefix}/products/category/:category`, async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Get product by ID
  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get all farmers
  app.get(`${apiPrefix}/farmers`, async (req, res) => {
    try {
      const farmers = await storage.getAllFarmers();
      res.json(farmers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farmers" });
    }
  });

  // Get featured farmers
  app.get(`${apiPrefix}/farmers/featured`, async (req, res) => {
    try {
      const farmers = await storage.getFeaturedFarmers();
      res.json(farmers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured farmers" });
    }
  });

  // Get farmer by ID
  app.get(`${apiPrefix}/farmers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid farmer ID" });
      }

      const farmer = await storage.getFarmerById(id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }

      res.json(farmer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farmer" });
    }
  });

  // Categories and Subcategories API
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get(`${apiPrefix}/categories/main`, async (req, res) => {
    try {
      const mainCategories = await storage.getMainCategories();
      res.json(mainCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch main categories" });
    }
  });

  app.get(
    `${apiPrefix}/categories/:parentId/subcategories`,
    async (req, res) => {
      try {
        const parentId = parseInt(req.params.parentId);
        if (isNaN(parentId)) {
          return res
            .status(400)
            .json({ message: "Invalid parent category ID" });
        }

        const subcategories = await storage.getSubcategoriesByParent(parentId);
        res.json(subcategories);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch subcategories" });
      }
    }
  );

  app.get(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product reviews endpoints
  app.get(`${apiPrefix}/products/:id/reviews`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  app.post(`${apiPrefix}/products/:id/reviews`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const reviewData = {
        ...req.body,
        productId,
      };

      console.log('Review submission request:', reviewData);
      const newReview = await storage.addProductReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      console.error('Error adding product review:', error);
      res.status(500).json({ message: "Failed to add product review", error: error.message });
    }
  });

  // Get cart
  app.get(`${apiPrefix}/cart`, async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;
      const cart = await storage.getCart(sessionId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  // Add item to cart
  app.post(`${apiPrefix}/cart/items`, async (req, res) => {
    try {
      const { productId, variantId, quantity } = req.body;
      const sessionId = (req as any).sessionId;

      if (
        typeof productId !== "number" ||
        typeof variantId !== "number" ||
        typeof quantity !== "number" ||
        quantity <= 0
      ) {
        return res
          .status(400)
          .json({ message: "Invalid product ID, variant ID or quantity" });
      }

      const cart = await storage.addToCart(
        sessionId,
        productId,
        variantId,
        quantity
      );
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item
  app.put(`${apiPrefix}/cart/items/:productId/:variantId`, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const variantId = parseInt(req.params.variantId);
      const { quantity } = req.body;
      const sessionId = (req as any).sessionId;

      if (
        isNaN(productId) ||
        isNaN(variantId) ||
        typeof quantity !== "number"
      ) {
        return res
          .status(400)
          .json({ message: "Invalid product/variant ID or quantity" });
      }

      const cart = await storage.updateCartItem(
        sessionId,
        productId,
        variantId,
        quantity
      );
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete(
    `${apiPrefix}/cart/items/:productId/:variantId`,
    async (req, res) => {
      try {
        const productId = parseInt(req.params.productId);
        const variantId = parseInt(req.params.variantId);
        const sessionId = (req as any).sessionId;

        if (isNaN(productId) || isNaN(variantId)) {
          return res
            .status(400)
            .json({ message: "Invalid product or variant ID" });
        }

        const cart = await storage.removeFromCart(
          sessionId,
          productId,
          variantId
        );
        res.json(cart);
      } catch (error) {
        res.status(500).json({ message: "Failed to remove item from cart" });
      }
    }
  );

  // Clear entire cart
  app.delete(`${apiPrefix}/cart`, async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;

      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Get testimonials
  app.get(`${apiPrefix}/testimonials`, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Subscribe to newsletter
  app.post(`${apiPrefix}/newsletter/subscribe`, async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(
        req.body
      );
      const subscription = await storage.addNewsletterSubscription(
        subscriptionData
      );
      res.json({ message: "Subscription successful", subscription });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // SMS Verification Routes

  // Send OTP for registration
  app.post(`${apiPrefix}/auth/send-otp`, async (req, res) => {
    try {
      const { mobile, purpose } = req.body;
      console.log("nisdhi", mobile, purpose);
      if (!mobile || !purpose) {
        return res
          .status(400)
          .json({ message: "Mobile number and purpose are required" });
      }

      if (
        ![
          "registration",
          "password_reset",
          "account_deletion",
          "change_email",
          "change_number",
        ].includes(purpose)
      ) {
        return res.status(400).json({ message: "Invalid purpose" });
      }

      const result = await smsService.sendOTP(mobile, purpose);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify OTP
  app.post(`${apiPrefix}/auth/verify-otp`, async (req, res) => {
    try {
      const { mobile, otp, purpose } = req.body;

      if (!mobile || !otp || !purpose) {
        return res
          .status(400)
          .json({ message: "Mobile number, OTP, and purpose are required" });
      }

      if (purpose !== "registration" && purpose !== "password_reset") {
        return res.status(400).json({ message: "Invalid purpose" });
      }

      const result = await smsService.verifyOTP(mobile, otp, purpose);

      if (result.success) {
        res.json({ message: result.message, verified: true });
      } else {
        res.status(400).json({ message: result.message, verified: false });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // User Authentication Routes

  // Register a new user (with mobile verification)
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        return res
          .status(400)
          .json({ message: "Mobile number and OTP are required" });
      }

      // Verify OTP first
      const otpResult = await smsService.verifyOTP(mobile, otp, "registration");
      if (!otpResult.success) {
        return res.status(400).json({ message: otpResult.message });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user with hashed password and mark mobile as verified
      const user = await storage.createUser({
        ...userData,
        mobile,
        password: hashedPassword,
        emailVerified: true,
        mobileVerified: true,
      });

      // Return success message without exposing password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        message: "Registration successful. You can now log in.",
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  // Verify email
  app.get(`${apiPrefix}/auth/verify/:token`, async (req, res) => {
    try {
      const { token } = req.params;
      const success = await storage.verifyUserEmail(token);

      if (success) {
        res.json({ message: "Email verified successfully" });
      } else {
        res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Login
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found in database");
        return res.status(400).json({ message: "Invalid email or password" });
      }

      console.log("User found, verifying password");

      try {
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          console.log("Password verification failed");
          return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log("Password verified, generating token");

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: JWT_EXPIRY,
        });

        // Return token and user data without password
        const { password: _, ...userWithoutPassword } = user;
        console.log("Login successful");

        return res.json({
          message: "Login successful",
          token,
          user: userWithoutPassword,
        });
      } catch (pwError) {
        console.error("Error during password verification:", pwError);
        return res
          .status(400)
          .json({ message: "Password verification failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Request password reset
  app.post(`${apiPrefix}/auth/reset-request`, async (req, res) => {
    try {
      const { email } = req.body;
      const success = await storage.resetPasswordRequest(email);

      if (success && transporter) {
        const user = await storage.getUserByEmail(email);
        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${
          user?.resetToken
        }`;

        await transporter.sendMail({
          from: "noreply@yourstore.com",
          to: email,
          subject: "Reset Your Password",
          html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });
      }

      // Always return success to prevent email enumeration
      res.json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password
  app.post(`${apiPrefix}/auth/reset-password/:token`, async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const success = await storage.resetPassword(token, hashedPassword);

      if (success) {
        res.json({ message: "Password reset successful" });
      } else {
        res.status(400).json({ message: "Invalid or expired reset token" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  // tracking order
  app.post(`${apiPrefix}/orders/tracking`, async (req, res) => {
    try {
      // Input validation
      const { orderNumber, email } = req.body;
      if (!orderNumber?.trim() || !email?.trim()) {
        return res.status(400).json({
          message: "Order number and email are required",
        });
      }

      const order = await db.query.orders.findFirst({
        where: and(
          eq(orders.trackingId, orderNumber.trim()),
          isNotNull(orders.userId)
        ),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            columns: {
              quantity: true,
            },
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (
        !order ||
        !order.user ||
        order.user.email.toLowerCase() !== email.trim().toLowerCase()
      ) {
        return res.status(404).json({
          message:
            "No order found with this order number and email combination.",
        });
      }

      // Prepare response
      const response = {
        orderNumber: order.tracking_id || order.trackingId,
        status: order.status,
        statusDate: order.updated_at || order.updatedAt,
        estimatedDelivery: order.delivered_at || order.deliveredAt || null,
        shippingAddress: order.shipping_address || order.shippingAddress,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        trackingEvents: order.status_timeline || order.statusTimeline || [],
      };

      return res.json(response);
    } catch (error) {
      console.error("Order tracking error:", error);
      return res.status(500).json({
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
          stack:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.stack
                : undefined
              : undefined,
        }),
      });
    }
  });
  // User Profile Routes (protected)

  // Get user profile
  app.get(`${apiPrefix}/user/profile`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.put(`${apiPrefix}/user/profile`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { name } = req.body;

      const updatedUser = await storage.updateUser(user.id, { name });
      const { password, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        message: "Profile updated successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password with OTP verification
  app.post(
    `${apiPrefix}/auth/change-password`,
    authenticate,
    async (req, res) => {
      try {
        const user = (req as any).user;
        const { currentPassword, newPassword, otp } = req.body;

        if (!currentPassword || !newPassword || !otp) {
          return res.status(400).json({
            message: "Current password, new password, and OTP are required",
          });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        // Verify OTP
        const otpResult = await smsService.verifyOTP(
          user.mobile,
          otp,
          "password_reset"
        );
        if (!otpResult.success) {
          return res.status(400).json({ message: otpResult.message });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        await storage.updateUser(user.id, { password: hashedPassword });

        res.json({ message: "Password changed successfully" });
      } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Failed to change password" });
      }
    }
  );

  // change email  with otp verification
  // abhi

  app.post(`${apiPrefix}/auth/change-email`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { value, otp } = req.body;

      if (!value || !otp) {
        return res
          .status(400)
          .json({ message: "New email and OTP are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // ✅ Verify OTP sent to user's mobile, not email
      const otpResult = await smsService.verifyOTP(
        user.mobile,
        otp,
        "change_email"
      );

      if (!otpResult.success) {
        return res.status(400).json({ message: otpResult.message });
      }

      // Check if email already in use
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, value));

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // ✅ Correct variable usage
      await db.update(users).set({ email: value }).where(eq(users.id, user.id));

      res.json({ message: "Email updated successfully" });
    } catch (error) {
      console.error("Change email error:", error);
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  // change number with otp  verification
  // abhi
  app.post(
    `${apiPrefix}/auth/change-number`,
    authenticate,
    async (req, res) => {
      try {
        const user = (req as any).user;
        const { value, otp } = req.body;

        if (!value || !otp) {
          return res
            .status(400)
            .json({ message: "New mobile number and OTP are required" });
        }

        // Validate mobile format (must be 10-digit number)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value)) {
          return res
            .status(400)
            .json({ message: "Invalid mobile number format" });
        }

        // ✅ Verify OTP sent to new mobile number
        const otpResult = await smsService.verifyOTP(
          value,
          otp,
          "change_number"
        );

        if (!otpResult.success) {
          return res.status(400).json({ message: otpResult.message });
        }

        // Check if mobile already in use
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.mobile, value));

        if (existingUser.length > 0) {
          return res
            .status(400)
            .json({ message: "Mobile number already in use" });
        }

        // ✅ Update mobile in users table
        await db
          .update(users)
          .set({ mobile: value })
          .where(eq(users.id, user.id));

        res.json({ message: "Mobile number updated successfully" });
      } catch (error) {
        console.error("Change number error:", error);
        res.status(500).json({ message: "Failed to update mobile number" });
      }
    }
  );

  // delete user with OTP verification

  // abhi
  app.delete(
    `${apiPrefix}/user/delete-account`,
    authenticate,
    async (req, res) => {
      try {
        const user = (req as any).user;

        // Optional: verify OTP for safety
        const { otp } = req.body;
        if (otp) {
          const result = await smsService.verifyOTP(
            user.mobile,
            otp,
            "account_deletion"
          );
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
        }

        // 1. Delete discount usage
        await db.delete(discountUsage).where(eq(discountUsage.userId, user.id));

        // 2. Delete product reviews
        await db
          .delete(productReviews)
          .where(eq(productReviews.userId, user.id));

        // 3. Delete orders (optional)
        await db
          .delete(orderItems)
          .where(
            inArray(
              orderItems.orderId,
              db
                .select({ id: orders.id })
                .from(orders)
                .where(eq(orders.userId, user.id))
            )
          );
        await db.delete(orders).where(eq(orders.userId, user.id));

        // 4. Delete payments
        await db.delete(payments).where(eq(payments.userId, user.id));

        // 5. Delete subscriptions
        await db.delete(subscriptions).where(eq(subscriptions.userId, user.id));

        // 6. Delete carts and items
        const userCarts = await db
          .select()
          .from(carts)
          .where(eq(carts.sessionId, user.mobile));
        for (const cart of userCarts) {
          await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
          await db.delete(carts).where(eq(carts.id, cart.id));
        }

        // 7. Delete contact messages (if matched by email)
        await db
          .delete(contactMessages)
          .where(eq(contactMessages.email, user.email));

        // 8. Delete newsletter subscriptions
        await db
          .delete(newsletterSubscriptions)
          .where(eq(newsletterSubscriptions.email, user.email));

        // 9. Delete SMS verifications
        await db
          .delete(smsVerifications)
          .where(eq(smsVerifications.mobile, user.mobile));

        // 10. Finally, delete the user
        await db.delete(users).where(eq(users.id, user.id));

        res.json({ message: "Account and related data deleted successfully" });
      } catch (error) {
        console.error("Delete account error:", error);
        res
          .status(500)
          .json({ message: "Failed to delete account", error: String(error) });
      }
    }
  );
  // Check user's COD access status
  app.get(`${apiPrefix}/user/cod-access`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;

      // Check if user has COD access enabled (default to true if not set)
      const codEnabled = user.codEnabled !== false;

      res.json({
        codEnabled,
        message: codEnabled
          ? "COD access is enabled"
          : "COD access is disabled",
      });
    } catch (error) {
      console.error("COD access check error:", error);
      res.status(500).json({ message: "Failed to check COD access" });
    }
  });

  // Payment Routes

  // Initialize Razorpay
  app.post(
    `${apiPrefix}/payments/initialize`,
    authenticate,
    async (req, res) => {
      try {
        // Check if Razorpay is initialized
        if (!razorpay) {
          // Initialize Razorpay with API keys
          const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
          const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

          if (!razorpayKeyId || !razorpayKeySecret) {
            return res
              .status(500)
              .json({ message: "Razorpay API keys not configured" });
          }

          try {
            razorpay = new Razorpay({
              key_id: razorpayKeyId,
              key_secret: razorpayKeySecret,
            });
            console.log("Razorpay initialized successfully for payment");
          } catch (initError) {
            console.error("Failed to initialize Razorpay instance:", initError);
            return res.status(500).json({
              message: "Failed to initialize payment gateway",
              error: String(initError),
            });
          }
        }

        const user = (req as any).user;

        const { amount, currency = "INR" } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
          return res.status(400).json({
            message: "Invalid amount specified",
            error: "Amount must be a positive number",
          });
        }

        // Create Razorpay order
        const options = {
          amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit (paise)
          currency,
          receipt: `receipt_order_${Date.now()}`,
          payment_capture: 1,
        };

        console.log("Creating Razorpay order with options:", options);

        try {
          const order = await razorpay.orders.create(options);
          console.log("Razorpay order created:", order);

          res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
          });
        } catch (orderError) {
          console.error("Failed to create Razorpay order:", orderError);
          return res.status(500).json({
            message: "Failed to create payment order",
            error: String(orderError),
          });
        }
      } catch (error) {
        console.error("Payment initialization error:", error);
        res.status(500).json({
          message: "Failed to initialize payment",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  app.post(
    `${apiPrefix}/payments/verify`,
    authenticate,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        const sessionId = (req as any).sessionId || req.body.sessionId;

        const {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
          amount,
          currency = "INR",
          customerInfo,
          paymentMethod = "razorpay", // Default to COD
          appliedDiscount, // Include applied discount
        } = req.body;

        if (!sessionId) {
          return res.status(400).json({ message: "Missing session ID" });
        }

        // Razorpay-specific verification
        if (paymentMethod === "razorpay") {
          if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
            return res
              .status(400)
              .json({ message: "Missing required payment fields" });
          }

          const body = razorpayOrderId + "|" + razorpayPaymentId;
          const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body)
            .digest("hex");

          if (expectedSignature !== razorpaySignature) {
            return res
              .status(400)
              .json({ message: "Invalid payment signature" });
          }
        }

        // Get cart
        const cart = await storage.getCart(sessionId);

        if (!cart.items || cart.items.length === 0) {
          return res
            .status(400)
            .json({ message: "No items in cart to create order" });
        }

        // Validate stock
        await Promise.all(
          cart.items.map(async (item) => {
            const isAvailable = await storage.validateStockAvailability(
              item.variant.id,
              item.quantity
            );
            if (!isAvailable) {
              throw new Error(`Insufficient stock for ${item.product.name}`);
            }
          })
        );

        // Generate tracking ID
        const generateTrackingId = () => {
          const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const numbers = "0123456789";
          return (
            [...Array(3)]
              .map(() => letters[Math.floor(Math.random() * letters.length)])
              .join("") +
            [...Array(3)]
              .map(() => numbers[Math.floor(Math.random() * numbers.length)])
              .join("")
          );
        };
        const trackingId = generateTrackingId();

        // Create order
        const order = await storage.createOrder({
          userId: user.id,
          sessionId,
          paymentId: paymentMethod === "razorpay" ? razorpayPaymentId : null,
          total: amount / 100,
          status: "confirmed",
          customerInfo,
          paymentMethod,
          trackingId,
          statusTimeline: [
            {
              status: "confirmed",
              message: "Your order has been placed successfully",
              date: new Date().toISOString(),
            },
          ],
        });

        // Create order items
        for (const item of cart.items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.product.id,
            variantId: item.variant.id, // ✅ pass variant ID
            quantity: item.quantity,
            price: item.variant.discountPrice ?? item.variant.price, // ✅ final price
          });
        }

        // Record payment (only for Razorpay)
        let payment = null;
        if (paymentMethod === "razorpay") {
          payment = await storage.createPayment({
            userId: user.id,
            orderId: order.id,
            razorpayPaymentId,
            amount: amount / 100,
            currency,
            status: "completed",
          });
        }

        // Send order notification
        try {
          const orderItems = await storage.getOrderItemsByOrderId(order.id);
          const orderItemsWithProducts = await Promise.all(
            orderItems.map(async (item) => ({
              ...item,
              product: await storage.getProductById(item.productId),
            }))
          );

          await emailService.sendOrderNotificationToAdmin({
            order,
            orderItems: orderItemsWithProducts,
            customerEmail: user.email,
            customerName: user.name,
            totalAmount: amount / 100,
          });
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
        }

        // Apply discount if present (increment usage count)
        if (appliedDiscount && appliedDiscount.id) {
          try {
            await storage.applyDiscount(
              appliedDiscount.id,
              user.id,
              sessionId,
              order.id
            );
            console.log(`Discount ${appliedDiscount.code} applied to order ${order.id}`);
          } catch (discountErr) {
            console.error("Failed to apply discount:", discountErr);
            // Continue without failing the order
          }
        }

        // Clear cart
        await storage.clearCart(sessionId);

        res.json({
          message:
            paymentMethod === "cod"
              ? "Order placed successfully"
              : "Payment successful and order created",
          order,
          payment,
        });
      } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({
          message: "Failed to process order",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
  // Password Reset Routes

  // Forgot password - Send reset email
  app.post(`${apiPrefix}/auth/forgot-password`, async (req, res) => {
    try {
      const { email, number } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!number || typeof number !== "string" || number.length < 10) {
        return res.status(400).json({ message: "Valid number is required" });
      }

      // Find user by email

      const user = await storage.getUserByEmailNumber(email, number);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          message:
            "If your email is registered, you will receive a password reset link shortly.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to user
      await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);

      // Send reset email
      await emailService.sendPasswordResetEmail(user, resetToken);

      res.json({
        message:
          "If your email is registered, you will receive a password reset link shortly.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password with token
  app.post(`${apiPrefix}/auth/reset-password`, async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      // Find user with valid reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearUserResetToken(user.id);

      // Send confirmation email
      try {
        await emailService.sendPasswordResetConfirmation(user);
      } catch (emailError) {
        console.error(
          "Failed to send password reset confirmation email:",
          emailError
        );
        // Don't fail the password reset if email fails
      }

      res.json({ message: "Password successfully reset" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get payment history
  app.get(`${apiPrefix}/payments/history`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const payments = await storage.getPaymentsByUserId(user.id);

      res.json({ payments });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Subscription Routes

  // Create subscription
  app.post(
    `${apiPrefix}/subscriptions/create`,
    authenticate,
    async (req, res) => {
      try {
        // Check if Razorpay is initialized
        if (!razorpay) {
          // Initialize Razorpay with API keys
          const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
          const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

          if (!razorpayKeyId || !razorpayKeySecret) {
            return res
              .status(500)
              .json({ message: "Razorpay API keys not configured" });
          }

          razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
          });
        }

        const user = (req as any).user;
        const { planId, planName, intervalInMonths = 1 } = req.body;

        // Create Razorpay subscription
        const subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 12, // 12 billing cycles
          quantity: 1,
        });

        // Calculate end date based on interval
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + intervalInMonths * 12); // 12 billing cycles

        // Record subscription in our database
        const createdSubscription = await storage.createSubscription({
          userId: user.id,
          razorpaySubscriptionId: subscription.id,
          planName,
          status: "active",
          startDate,
          endDate,
        });

        res.json({
          message: "Subscription created successfully",
          subscription: createdSubscription,
          razorpaySubscription: subscription,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to create subscription" });
      }
    }
  );

  // Get user subscriptions
  app.get(`${apiPrefix}/subscriptions`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const subscriptions = await storage.getSubscriptionsByUserId(user.id);

      res.json({ subscriptions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Get all user orders with complete details
  app.get(`${apiPrefix}/orders/history`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;

      // Step 1: Fetch all orders for the user
      const ordersList = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));

      if (!ordersList.length) {
        return res.json({ orders: [] });
      }

      const orderIds = ordersList.map((o) => o.id);

      // Step 2: Fetch all order items + products in ONE query
      const items = await db
        .select({
          orderId: orderItems.orderId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          product: {
            id: products.id,
            name: products.name,
            imageUrl: products.imageUrl,
            category: products.category,
          },
          variant: {
            id: productVariants.id,
            quantity: productVariants.quantity,
            unit: productVariants.unit,
            sku: productVariants.sku,
          },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productVariants,
          eq(orderItems.variantId, productVariants.id)
        )
        .where(inArray(orderItems.orderId, orderIds));
      console.log("debugger2", items);
      // Step 3: Fetch all payments for these orders in one query
      const paymentsList = await db
        .select()
        .from(payments)
        .where(inArray(payments.orderId, orderIds));
      console.log("debugger3", paymentsList);
      // Step 4: Fetch all discounts for these orders in one query
      const discountIds = ordersList
        .map((o) => o.discountId)
        .filter(Boolean) as number[];

      const discountsList = discountIds.length
        ? await db
            .select()
            .from(discounts)
            .where(inArray(discounts.id, discountIds))
        : [];
      console.log("debugger4", discountsList);
      // Step 5: Combine into final result
      const ordersWithDetails = ordersList.map((order) => {
        const orderItemsData = items.filter((i) => i.orderId === order.id);
        const payment = paymentsList.find((p) => p.orderId === order.id);
        const discount = discountsList.find((d) => d.id === order.discountId);

        return {
          ...order,
          items: orderItemsData,
          payment: payment
            ? {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                method: payment.razorpayPaymentId ? "Razorpay" : "Unknown",
                razorpayPaymentId: payment.razorpayPaymentId,
              }
            : null,
          appliedDiscounts: discount
            ? [
                {
                  id: discount.id,
                  code: discount.code,
                  type: discount.type,
                  value: discount.value,
                  description: discount.description,
                },
              ]
            : [],
          shippingAddress: order.shippingAddress || "Default address",
          billingAddress:
            order.billingAddress || order.shippingAddress || "Default address",
        };
      });

      res.json({ orders: ordersWithDetails });
    } catch (error) {
      console.error("Order history fetch error:", error);
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  // Customer requests order cancellation
  app.post(
    `${apiPrefix}/orders/:id/request-cancellation`,
    authenticate,
    async (req, res) => {
      try {
        const { requestOrderCancellation } = await import("./admin/orders");
        await requestOrderCancellation(req, res);
      } catch (error) {
        console.error("Order cancellation request error:", error);
        res
          .status(500)
          .json({ message: "Failed to request order cancellation" });
      }
    }
  );

  // Get cancelled orders
  app.get(`${apiPrefix}/orders/cancelled`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      // Sample data for demonstration purposes
      const cancelledOrders = [
        {
          id: 1003,
          userId: user.id,
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
          total: 45.95,
          status: "cancelled",
          cancellationReason: "Changed my mind",
          items: [
            { productName: "Handcrafted Cheese", quantity: 1, price: 45.95 },
          ],
        },
        {
          id: 1005,
          userId: user.id,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          total: 95.8,
          status: "cancelled",
          cancellationReason: "Found a better deal elsewhere",
          items: [
            { productName: "Organic Spice Mix", quantity: 2, price: 30.01 },
            { productName: "Fresh Valley Honey", quantity: 1, price: 35.78 },
          ],
        },
      ];

      res.json({ orders: cancelledOrders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cancelled orders" });
    }
  });

  // Get delivered orders
  app.get(`${apiPrefix}/orders/delivered`, authenticate, async (req, res) => {
    try {
      const user = (req as any).user;

      // ✅ Single query fetch
      const deliveredOrders = await storage.getDeliveredOrdersWithItems(
        user.id
      );

      // ✅ Map rating status without extra product fetch
      const ordersWithRatings = await Promise.all(
        deliveredOrders.map(async (order) => {
          const itemsWithRatingStatus = await Promise.all(
            order.items.map(async (item) => {
              const canRate = await storage.canUserReviewProduct(
                user.id,
                item.productId,
                item.variantId // pass variant if needed
              );
              return {
                ...item,
                canRate,
                hasRated: !canRate,
              };
            })
          );
          return { ...order, items: itemsWithRatingStatus };
        })
      );

      res.json({ orders: ordersWithRatings });
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      res.status(500).json({ message: "Failed to fetch delivered orders" });
    }
  });

  // Submit product rating for delivered order
  app.post(
    `${apiPrefix}/orders/:orderId/rate-product`,
    authenticate,
    async (req, res) => {
      try {
        const user = (req as any).user;
        const { orderId } = req.params;
        const { productId, rating, reviewText } = req.body;

        // Validate input
        if (!productId || !rating || rating < 1 || rating > 5) {
          return res
            .status(400)
            .json({ message: "Invalid product ID or rating" });
        }

        // Check if order exists and belongs to user
        const order = await storage.getOrderById(parseInt(orderId));
        if (!order || order.userId !== user.id) {
          return res.status(404).json({ message: "Order not found" });
        }

        // Check if order is delivered
        if (order.status !== "delivered") {
          return res
            .status(400)
            .json({ message: "Can only rate products from delivered orders" });
        }

        // Check if user can rate this product (hasn't rated it before)
        const canRate = await storage.canUserReviewProduct(user.id, productId);
        if (!canRate) {
          return res
            .status(400)
            .json({ message: "You have already rated this product" });
        }

        // Create the review
        const review = await storage.addProductReview({
          productId,
          userId: user.id,
          orderId: parseInt(orderId),
          customerName: user.name,
          rating,
          reviewText: reviewText || "",
          verified: true, // Mark as verified since it's from a delivered order
        });

        res.json({ message: "Rating submitted successfully", review });
      } catch (error) {
        console.error("Rating submission error:", error);
        res.status(500).json({ message: "Failed to submit rating" });
      }
    }
  );

  // Cancel subscription
  app.post(
    `${apiPrefix}/subscriptions/:id/cancel`,
    authenticate,
    async (req, res) => {
      try {
        const user = (req as any).user;
        const subscriptionId = parseInt(req.params.id);

        // Verify ownership
        const subscription = await storage.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.userId !== user.id) {
          return res
            .status(403)
            .json({ message: "Unauthorized access to subscription" });
        }

        // Cancel in Razorpay
        if (razorpay) {
          await razorpay.subscriptions.cancel(
            subscription.razorpaySubscriptionId
          );
        }

        // Update status in our database
        const updatedSubscription = await storage.updateSubscriptionStatus(
          subscriptionId,
          "canceled"
        );

        res.json({
          message: "Subscription canceled successfully",
          subscription: updatedSubscription,
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to cancel subscription" });
      }
    }
  );

  // Product Review System for Delivered Orders
  // Get product reviews
  app.get(`${apiPrefix}/products/:id/reviews`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  // Check if user can review a product (has purchased and received it)
  app.get(
    `${apiPrefix}/products/:id/can-review`,
    authenticate,
    async (req, res) => {
      try {
        const productId = parseInt(req.params.id);
        const userId = (req as any).user.id;

        const canReview = await storage.canUserReviewProduct(userId, productId);
        res.json(canReview);
      } catch (error) {
        res.status(500).json({ message: "Failed to check review eligibility" });
      }
    }
  );

  // Add product review
  app.post(`${apiPrefix}/products/:id/reviews`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviewData = req.body;

      // Validate the review data
      const validatedData = insertProductReviewSchema.parse({
        ...reviewData,
        productId,
      });

      const newReview = await storage.addProductReview(validatedData);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to add product review" });
    }
  });

  // Contact Form Handling
  // Submit contact form
  app.post(`${apiPrefix}/contact`, async (req, res) => {
    try {
      const contactData = req.body;

      // Validate the contact form data
      const validatedData = insertContactMessageSchema.parse(contactData);

      const newContactMessage = await storage.addContactMessage(validatedData);
      res.status(201).json({
        message: "Contact message submitted successfully",
        id: newContactMessage.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit contact message" });
    }
  });

  // Team Members API Routes
  // Get all team members (public endpoint)
  app.get(`${apiPrefix}/team-members`, async (req, res) => {
    try {
      const teamMembers = await storage.getActiveTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Admin routes for team member management
  app.get(`${apiPrefix}/admin/team-members`, async (req, res) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get(`${apiPrefix}/admin/team-members/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = await storage.getTeamMemberById(id);

      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }

      res.json(teamMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.post(`${apiPrefix}/admin/team-members`, async (req, res) => {
    try {
      const teamMemberData = req.body;

      // Validate the team member data
      const validatedData = insertTeamMemberSchema.parse(teamMemberData);

      const newTeamMember = await storage.createTeamMember(validatedData);
      res.status(201).json(newTeamMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put(`${apiPrefix}/admin/team-members/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teamMemberData = req.body;

      // Validate the team member data
      const validatedData = insertTeamMemberSchema
        .partial()
        .parse(teamMemberData);

      const updatedTeamMember = await storage.updateTeamMember(
        id,
        validatedData
      );
      res.json(updatedTeamMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete(`${apiPrefix}/admin/team-members/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeamMember(id);
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Inventory Management API Endpoints

  // Update product stock quantity (Enhanced Products & Inventory sync)
  app.put(`${apiPrefix}/admin/products/:id/stock`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { stockQuantity } = req.body;

      if (typeof stockQuantity !== "number" || stockQuantity < 0) {
        return res.status(400).json({ message: "Invalid stock quantity" });
      }

      const updatedProduct = await storage.updateProductStock(
        productId,
        stockQuantity
      );
      res.json({
        message: "Stock updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Stock update error:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  // Validate stock availability before order placement
  app.post(`${apiPrefix}/admin/validate-stock`, async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid product ID or quantity" });
      }

      const isAvailable = await storage.validateStockAvailability(
        productId,
        quantity
      );
      const product = await storage.getProductById(productId);

      res.json({
        available: isAvailable,
        currentStock: product?.stockQuantity || 0,
        requestedQuantity: quantity,
      });
    } catch (error) {
      console.error("Stock validation error:", error);
      res.status(500).json({ message: "Failed to validate stock" });
    }
  });

  // Get low stock products alert
  app.get(`${apiPrefix}/admin/low-stock`, async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;

      // Fetch all variants with their parent product info
      const lowStockVariants = await db
        .select({
          variantId: productVariants.id,
          variantSku: productVariants.sku,
          quantity: productVariants.quantity,
          unit: productVariants.unit,
          stockQuantity: productVariants.stockQuantity,
          productId: products.id,
          productName: products.name,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(lte(productVariants.stockQuantity, threshold));

      // Construct a friendly variant name like "Apples - 1kg"
      const formattedVariants = lowStockVariants.map((v) => ({
        variantId: v.variantId,
        variantName: `${v.productName} - ${v.quantity}${v.unit}`,
        stockQuantity: v.stockQuantity,
        productId: v.productId,
        sku: v.variantSku,
      }));

      res.json({
        lowStockVariants: formattedVariants,
        threshold,
        count: formattedVariants.length,
      });
    } catch (error) {
      console.error("Low stock check error:", error);
      res.status(500).json({ message: "Failed to check low stock products" });
    }
  });

  // Get detailed order information for admin
  app.get(`${apiPrefix}/admin/orders/:id/details`, async (req, res) => {
    try {
      const orderId = Number(req.params.id);

      if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      if (!orderId) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const orderItems = await storage.getOrderItemsByOrderId(orderId);
      console.log(">>debugger", orderItems);
      // Optional: show who placed the order (admin/staff)
      let user = null;
      if (order.userId) {
        user = await storage.getUserById(order.userId);
      }

      // Payment details
      let payment = null;
      try {
        const payments = await storage.getPaymentsByUserId(order.userId || 0);
        payment = payments.find((p) => p.orderId === orderId);
      } catch (error) {
        console.log("Payment details not found for order:", orderId);
      }

      // Final comprehensive order response
      const orderDetails = {
        id: order.id,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        trackingId: order.trackingId,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        customer: order.customerInfo
          ? {
              name: `${order.customerInfo.firstName} ${
                order.customerInfo.lastName || ""
              }`.trim(),
              email: order.customerInfo.email,
              phone: order.customerInfo.phone,
              address: order.customerInfo.address,
              city: order.customerInfo.city,
              state: order.customerInfo.state,
              zip: order.customerInfo.zip,
              notes: order.customerInfo.notes || "",
            }
          : null,
        placedBy: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              razorpayPaymentId: payment.razorpayPaymentId,
            }
          : null,
        items: await Promise.all(
          (orderItems || []).map(async (item) => {
            try {
              // Get the product
              const product = await storage.getProductById(item.productId);

              // Get the variant (sku, price, etc.)
              const variant = item.variantId
                ? await storage.getProductVariantById(item.variantId)
                : null;

              return {
                ...item,
                product: product
                  ? {
                      id: product.id,
                      name: product.name,
                      variant: variant,
                      imageUrl: product.imageUrl,
                    }
                  : null,
              };
            } catch (e) {
              console.error("Error loading product for item:", item.id, e);
              return {
                ...item,
                product: null,
              };
            }
          })
        ),
      };

      res.json(orderDetails);
    } catch (error) {
      console.error("Order details fetch error:", error);
      res.status(500).json({
        message: "Failed to fetch order",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Discount API Routes
  app.get("/api/admin/discounts", async (req, res) => {
    try {
      const discounts = await storage.getAllDiscounts();
      res.json(discounts);
    } catch (error) {
      console.error("Discounts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch discounts" });
    }
  });

  app.post("/api/admin/discounts", async (req, res) => {
    try {
      // Convert date strings to Date objects
      const requestData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      const validationResult = insertDiscountSchema.safeParse(requestData);
      if (!validationResult.success) {
        console.error(
          "Discount validation error:",
          validationResult.error.issues
        );
        return res.status(400).json({
          message: "Invalid discount data",
          errors: validationResult.error.issues,
        });
      }

      const discount = await storage.createDiscount(validationResult.data);
      res.json(discount);
    } catch (error) {
      console.error("Discount creation error:", error);
      res.status(500).json({ message: "Failed to create discount" });
    }
  });

  app.put("/api/admin/discounts/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Convert date strings to Date objects
      const requestData = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
      };

      const validationResult = insertDiscountSchema
        .partial()
        .safeParse(requestData);
      if (!validationResult.success) {
        console.error(
          "Discount update validation error:",
          validationResult.error.issues
        );
        return res.status(400).json({
          message: "Invalid discount data",
          errors: validationResult.error.issues,
        });
      }

      const discount = await storage.updateDiscount(
        parseInt(id),
        validationResult.data
      );
      res.json(discount);
    } catch (error) {
      console.error("Discount update error:", error);
      res.status(500).json({ message: "Failed to update discount" });
    }
  });

  app.delete("/api/admin/discounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDiscount(parseInt(id));
      res.json({ message: "Discount deleted successfully" });
    } catch (error) {
      console.error("Discount deletion error:", error);
      res.status(500).json({ message: "Failed to delete discount" });
    }
  });

  // Site Settings Routes for Store Information & Social Media
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Site settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.get("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Admin site settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // route
  app.post("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = req.body;

      if (!Array.isArray(settings)) {
        return res.status(400).json({
          success: false,
          message: "Request body must be an array of settings",
        });
      }

      const now = new Date();
      const results = [];

      for (const s of settings) {
        if (!s.key) {
          return res.status(400).json({
            success: false,
            message: "Setting key is required for all items",
          });
        }

        const updated = await storage.upsertSiteSetting({
          key: s.key,
          value: s.value,
          type: s.type,
          description: s.description,
        });

        results.push(updated);
      }

      res.json({ success: true, data: results });
    } catch (error) {
      console.error("Site settings update error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update site settings",
      });
    }
  });

  app.delete("/api/admin/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      await storage.deleteSiteSetting(key);
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Site setting deletion error:", error);
      res.status(500).json({ message: "Failed to delete site setting" });
    }
  });

  // Get active discounts for checkout
  app.get("/api/discounts/active", async (req, res) => {
    try {
      const discounts = await storage.getActiveDiscounts();
      res.json(discounts);
    } catch (error) {
      console.error("Active discounts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch active discounts" });
    }
  });

  // Discount validation and application for checkout
  app.post("/api/discounts/validate", async (req, res) => {
    try {
      const { code, id, cartTotal, userId } = req.body;
      let validation;

      if (id) {
        // Validate by discount ID
        validation = await storage.validateDiscountById(id, userId, cartTotal);
      } else {
        // Validate by discount code (fallback)
        validation = await storage.validateDiscount(code, userId, cartTotal);
      }

      res.json(validation);
    } catch (error) {
      console.error("Discount validation error:", error);
      res.status(500).json({ message: "Failed to validate discount" });
    }
  });

  app.post("/api/discounts/apply", async (req, res) => {
    try {
      const { discountId, userId, sessionId, orderId } = req.body;
      const usage = await storage.applyDiscount(
        discountId,
        userId,
        sessionId,
        orderId
      );
      res.json(usage);
    } catch (error) {
      console.error("Discount application error:", error);
      res.status(500).json({ message: "Failed to apply discount" });
    }
  });

  // Public route to get active discounts for customer view (with user-specific filtering)
  app.get("/api/discounts/active", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const activeDiscounts = await storage.getActiveDiscounts();
      
      // Filter out discounts that user has already used (if perUser is true)
      const availableDiscounts = await Promise.all(
        activeDiscounts.map(async (discount) => {
          if (discount.perUser && user?.id) {
            const userUsage = await storage.getDiscountUsage(discount.id, user.id);
            if (userUsage > 0) {
              return null; // User has already used this discount
            }
          }
          
          // Check if discount has reached its usage limit
          if (discount.usageLimit && discount.usageLimit > 0 && 
              discount.used && discount.used >= discount.usageLimit) {
            return null; // Discount has reached its usage limit
          }
          
          return {
            id: discount.id,
            code: discount.code,
            type: discount.type,
            value: discount.value,
            description: discount.description,
            minPurchase: discount.minPurchase,
            endDate: discount.endDate,
          };
        })
      );
      
      // Filter out null values
      const filteredDiscounts = availableDiscounts.filter(discount => discount !== null);
      res.json(filteredDiscounts);
    } catch (error) {
      console.error("Active discounts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch active discounts" });
    }
  });

  // ===== CATEGORY MANAGEMENT ROUTES =====

  // Helper function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  // Get all categories (main categories only)
  app.get("/api/admin/categories", authenticate, async (req, res) => {
    try {
      const categories = await storage.getMainCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all categories with subcategories
  app.get("/api/admin/categories/all", authenticate, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get all categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create a new category
  app.post("/api/admin/categories", authenticate, async (req, res) => {
    try {
      const categoryData = req.body;

      // Validate required fields
      if (!categoryData.name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Validate name length and format
      if (categoryData.name.trim().length < 2) {
        return res.status(400).json({ message: "Category name must be at least 2 characters long" });
      }

      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = generateSlug(categoryData.name);
      }

      // Check for duplicate category name (categories must be globally unique)
      const existingCategories = await storage.getAllCategories();
      const mainCategories = existingCategories.filter(cat => !cat.parentId);
      const duplicateName = mainCategories.find(cat => 
        cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      
      if (duplicateName) {
        return res.status(400).json({ 
          message: `A category named "${duplicateName.name}" already exists. Please choose a different name.`,
          field: "name",
          existingCategory: duplicateName.name
        });
      }

      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Create category error:", error);
      
      // Handle database constraint errors
      if (error.code === '23505' && error.constraint === 'categories_slug_unique') {
        return res.status(400).json({ 
          message: "A category with this name already exists. Please choose a different name.",
          field: "name"
        });
      }
      
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update a category
  app.put("/api/admin/categories/:id", authenticate, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      // Validate name if provided
      if (updateData.name && updateData.name.trim().length < 2) {
        return res.status(400).json({ message: "Category name must be at least 2 characters long" });
      }

      // Generate slug if name is being updated and slug is not provided
      if (updateData.name && !updateData.slug) {
        updateData.slug = generateSlug(updateData.name);
      }

      // Check for duplicate category name if name is being updated
      if (updateData.name) {
        const existingCategories = await storage.getAllCategories();
        const mainCategories = existingCategories.filter(cat => !cat.parentId);
        const duplicateName = mainCategories.find(cat => 
          cat.name.toLowerCase() === updateData.name.toLowerCase() && cat.id !== categoryId
        );
        
        if (duplicateName) {
          return res.status(400).json({ 
            message: `A category named "${duplicateName.name}" already exists. Please choose a different name.`,
            field: "name",
            existingCategory: duplicateName.name
          });
        }
      }

      const updatedCategory = await storage.updateCategory(
        categoryId,
        updateData
      );
      res.json(updatedCategory);
    } catch (error) {
      console.error("Update category error:", error);
      
      // Handle database constraint errors
      if (error.code === '23505' && error.constraint === 'categories_slug_unique') {
        return res.status(400).json({ 
          message: "A category with this name already exists. Please choose a different name.",
          field: "name"
        });
      }
      
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete a category
  app.delete("/api/admin/categories/:id", authenticate, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);

      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      // Check if category has products
      const allProducts = await storage.getAllEnhancedProducts();
      const category = await storage.getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const productsUsingCategory = allProducts.filter(
        (product) => product.category === category.name
      );

      if (productsUsingCategory.length > 0) {
        return res.status(400).json({
          message: `Cannot delete category. ${productsUsingCategory.length} products are using this category.`,
          productsCount: productsUsingCategory.length,
        });
      }

      await storage.deleteCategory(categoryId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get subcategories for a specific category
  app.get(
    "/api/admin/categories/:id/subcategories",
    authenticate,
    async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }

        const subcategories = await storage.getSubcategoriesByParent(
          categoryId
        );
        res.json(subcategories);
      } catch (error) {
        console.error("Get subcategories error:", error);
        res.status(500).json({ message: "Failed to fetch subcategories" });
      }
    }
  );

  // Create a new subcategory
  app.post(
    "/api/admin/categories/:id/subcategories",
    authenticate,
    async (req, res) => {
      try {
        const parentId = parseInt(req.params.id);
        const subcategoryData = req.body;

        if (isNaN(parentId)) {
          return res
            .status(400)
            .json({ message: "Invalid parent category ID" });
        }

        if (!subcategoryData.name) {
          return res
            .status(400)
            .json({ message: "Subcategory name is required" });
        }

        // Validate name length and format
        if (subcategoryData.name.trim().length < 2) {
          return res.status(400).json({ message: "Subcategory name must be at least 2 characters long" });
        }

        // Verify parent category exists
        const parentCategory = await storage.getCategoryById(parentId);
        if (!parentCategory) {
          return res.status(404).json({ message: "Parent category not found" });
        }

        // Generate slug if not provided
        if (!subcategoryData.slug) {
          subcategoryData.slug = generateSlug(subcategoryData.name);
        }

        // Check for duplicate subcategory name within the same parent category
        const existingSubcategories = await storage.getSubcategoriesByParent(parentId);
        const duplicateName = existingSubcategories.find(sub => 
          sub.name.toLowerCase() === subcategoryData.name.toLowerCase()
        );
        
        if (duplicateName) {
          return res.status(400).json({ 
            message: `A subcategory named "${duplicateName.name}" already exists in this category. Please choose a different name.`,
            field: "name",
            existingCategory: duplicateName.name
          });
        }

        const newSubcategory = await storage.createCategory({
          ...subcategoryData,
          parentId: parentId,
        });

        res.status(201).json(newSubcategory);
      } catch (error) {
        console.error("Create subcategory error:", error);
        
        // Handle database constraint errors
        if (error.code === '23505' && error.constraint === 'categories_slug_unique') {
          return res.status(400).json({ 
            message: "A category or subcategory with this name already exists. Please choose a different name.",
            field: "name"
          });
        }
        
        res.status(500).json({ message: "Failed to create subcategory" });
      }
    }
  );

  // Update a subcategory
  app.put("/api/admin/subcategories/:id", authenticate, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(subcategoryId)) {
        return res.status(400).json({ message: "Invalid subcategory ID" });
      }

      // Validate name if provided
      if (updateData.name && updateData.name.trim().length < 2) {
        return res.status(400).json({ message: "Subcategory name must be at least 2 characters long" });
      }

      // Generate slug if name is being updated and slug is not provided
      if (updateData.name && !updateData.slug) {
        updateData.slug = generateSlug(updateData.name);
      }

      // Check for duplicate subcategory name within the same parent if name is being updated
      if (updateData.name) {
        const subcategory = await storage.getCategoryById(subcategoryId);
        if (!subcategory || !subcategory.parentId) {
          return res.status(404).json({ message: "Subcategory not found" });
        }
        
        const existingSubcategories = await storage.getSubcategoriesByParent(subcategory.parentId);
        const duplicateName = existingSubcategories.find(sub => 
          sub.name.toLowerCase() === updateData.name.toLowerCase() && sub.id !== subcategoryId
        );
        
        if (duplicateName) {
          return res.status(400).json({ 
            message: `A subcategory named "${duplicateName.name}" already exists in this category. Please choose a different name.`,
            field: "name",
            existingCategory: duplicateName.name
          });
        }
      }

      const updatedSubcategory = await storage.updateCategory(
        subcategoryId,
        updateData
      );
      res.json(updatedSubcategory);
    } catch (error) {
      console.error("Update subcategory error:", error);
      
      // Handle database constraint errors
      if (error.code === '23505' && error.constraint === 'categories_slug_unique') {
        return res.status(400).json({ 
          message: "A category or subcategory with this name already exists. Please choose a different name.",
          field: "name"
        });
      }
      
      res.status(500).json({ message: "Failed to update subcategory" });
    }
  });

  // Delete a subcategory
  app.delete("/api/admin/subcategories/:id", authenticate, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);

      if (isNaN(subcategoryId)) {
        return res.status(400).json({ message: "Invalid subcategory ID" });
      }

      // Check if subcategory has products
      const allProducts = await storage.getAllEnhancedProducts();
      const subcategory = await storage.getCategoryById(subcategoryId);

      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      const productsUsingSubcategory = allProducts.filter(
        (product) => product.subcategory === subcategory.name
      );

      if (productsUsingSubcategory.length > 0) {
        return res.status(400).json({
          message: `Cannot delete subcategory. ${productsUsingSubcategory.length} products are using this subcategory.`,
          productsCount: productsUsingSubcategory.length,
        });
      }

      await storage.deleteCategory(subcategoryId);
      res.json({ message: "Subcategory deleted successfully" });
    } catch (error) {
      console.error("Delete subcategory error:", error);
      res.status(500).json({ message: "Failed to delete subcategory" });
    }
  });

  // Database Export API Routes
  app.get("/api/admin/database/export", async (req, res) => {
    try {
      console.log("Starting database export...");
      const exportPath = await exportDatabase();

      res.json({
        message: "Database exported successfully",
        filePath: exportPath,
        downloadUrl: `/api/admin/database/download/${path.basename(
          exportPath
        )}`,
      });
    } catch (error) {
      console.error("Database export error:", error);
      res.status(500).json({ message: "Failed to export database" });
    }
  });

  // Download exported database file
  app.get("/api/admin/database/download/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), "exports", filename);

      // Security check - ensure file is in exports directory
      if (!filePath.startsWith(path.join(process.cwd(), "exports"))) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if file exists
      if (!require("fs").existsSync(filePath)) {
        return res.status(404).json({ message: "Export file not found" });
      }

      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("File download error:", err);
          res.status(500).json({ message: "Failed to download file" });
        }
      });
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download export file" });
    }
  });

  // Export specific table
  app.get("/api/admin/database/export/:tableName", async (req, res) => {
    try {
      const tableName = req.params.tableName;
      const exportPath = await exportTable(tableName);

      res.json({
        message: `Table ${tableName} exported successfully`,
        filePath: exportPath,
        downloadUrl: `/api/admin/database/download/${path.basename(
          exportPath
        )}`,
      });
    } catch (error) {
      console.error(`Table export error for ${req.params.tableName}:`, error);
      res
        .status(500)
        .json({ message: `Failed to export table ${req.params.tableName}` });
    }
  });

  // Admin routes for order cancellation management
  app.get(
    `${apiPrefix}/admin/orders/pending/cancellation`,
    authenticate,
    async (req, res) => {
      try {
        const { getPendingCancellationRequests } = await import(
          "./admin/orders"
        );
        await getPendingCancellationRequests(req, res);
      } catch (error) {
        console.error("Error fetching pending cancellation requests:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch pending cancellation requests" });
      }
    }
  );

  app.post(
    `${apiPrefix}/admin/orders/:id/process-cancellation`,
    authenticate,
    async (req, res) => {
      try {
        const { processCancellationRequest } = await import("./admin/orders");
        await processCancellationRequest(req, res);
      } catch (error) {
        console.error("Error processing cancellation request:", error);
        res
          .status(500)
          .json({ message: "Failed to process cancellation request" });
      }
    }
  );

  // Initialize Razorpay and Email service when environment variables are available
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("Razorpay payment gateway initialized");
  }

  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("Email service initialized");
  }

  // India Post API Routes
  
  // Validate pincode
  app.get(`${apiPrefix}/shipping/validate-pincode/:pincode`, async (req, res) => {
    try {
      const { pincode } = req.params;
      
      if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({ 
          message: "Invalid pincode format. Must be 6 digits." 
        });
      }

      const pincodeInfo = await indiaPostService.validatePincode(pincode);
      
      if (pincodeInfo) {
        res.json({
          success: true,
          data: pincodeInfo
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Pincode not found"
        });
      }
    } catch (error) {
      console.error('Pincode validation error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to validate pincode"
      });
    }
  });

  // Calculate shipping rates
  app.post(`${apiPrefix}/shipping/calculate-rates`, async (req, res) => {
    try {
      const { fromPincode, toPincode, weight, codAmount } = req.body;
      
      if (!fromPincode || !toPincode || !weight) {
        return res.status(400).json({
          message: "Missing required fields: fromPincode, toPincode, weight"
        });
      }

      if (!/^\d{6}$/.test(fromPincode) || !/^\d{6}$/.test(toPincode)) {
        return res.status(400).json({
          message: "Invalid pincode format. Must be 6 digits."
        });
      }

      if (weight <= 0) {
        return res.status(400).json({
          message: "Weight must be greater than 0"
        });
      }

      const rates = await indiaPostService.calculateShippingRates(
        fromPincode, 
        toPincode, 
        weight, 
        codAmount
      );
      
      res.json({
        success: true,
        rates
      });
    } catch (error) {
      console.error('Shipping rate calculation error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to calculate shipping rates"
      });
    }
  });

  // Generate shipping label
  app.post(`${apiPrefix}/shipping/generate-label`, authenticate, async (req, res) => {
    try {
      const { fromAddress, toAddress, weight, service, codAmount } = req.body;
      
      if (!fromAddress || !toAddress || !weight || !service) {
        return res.status(400).json({
          message: "Missing required fields: fromAddress, toAddress, weight, service"
        });
      }

      const trackingNumber = await indiaPostService.generateShippingLabel({
        fromAddress,
        toAddress,
        weight,
        service,
        codAmount
      });
      
      res.json({
        success: true,
        trackingNumber,
        message: "Shipping label generated successfully"
      });
    } catch (error) {
      console.error('Label generation error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to generate shipping label"
      });
    }
  });

  // Track shipment
  app.get(`${apiPrefix}/shipping/track/:trackingNumber`, async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      if (!trackingNumber) {
        return res.status(400).json({
          message: "Tracking number is required"
        });
      }

      const trackingInfo = await indiaPostService.trackShipment(trackingNumber);
      
      if (trackingInfo) {
        res.json({
          success: true,
          data: trackingInfo
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Tracking information not found"
        });
      }
    } catch (error) {
      console.error('Shipment tracking error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to track shipment"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
