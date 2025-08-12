import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import {
  Product,
  InsertProduct,
  Farmer,
  InsertFarmer,
  Cart,
  InsertCart,
  CartItem,
  InsertCartItem,
  CartWithItems,
  Testimonial,
  InsertTestimonial,
  NewsletterSubscription,
  InsertNewsletterSubscription,
  ProductReview,
  InsertProductReview,
  User,
  InsertUser,
  Payment,
  InsertPayment,
  Subscription,
  InsertSubscription,
  ContactMessage,
  InsertContactMessage,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  TeamMember,
  InsertTeamMember,
  Discount,
  InsertDiscount,
  DiscountUsage,
  InsertDiscountUsage,
  SiteSetting,
  InsertSiteSetting,
  Category,
  InsertCategory,
  products,
  farmers,
  carts,
  cartItems,
  testimonials,
  newsletterSubscriptions,
  productReviews,
  users,
  payments,
  subscriptions,
  subscriptionStatusEnum,
  contactMessages,
  orders,
  orderItems,
  teamMembers,
  discounts,
  discountUsage,
  siteSettings,
  categories,
  insertCategorySchema,
  productVariants,
} from "@shared/schema";
import { productData } from "./productData";
import { farmerData } from "./farmerData";
import { db } from "./db";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { s } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  updateProductStock(productId: number, quantity: number): Promise<Product>;
  validateStockAvailability(
    productId: number,
    variantId: number,
    requestedQuantity: number
  ): Promise<boolean>;

  // Enhanced Products
  getAllEnhancedProducts(): Promise<any[]>;

  // Farmers
  getAllFarmers(): Promise<Farmer[]>;
  getFarmerById(id: number): Promise<Farmer | undefined>;
  getFeaturedFarmers(): Promise<Farmer[]>;

  // Cart
  getCart(sessionId: string): Promise<CartWithItems>;
  addToCart(
    sessionId: string,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<CartWithItems>;
  updateCartItem(
    sessionId: string,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<CartWithItems>;
  removeFromCart(
    sessionId: string,
    productId: number,
    variantId: number
  ): Promise<CartWithItems>;
  clearCart(sessionId: string): Promise<void>;

  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;

  // Newsletter
  addNewsletterSubscription(
    subscription: InsertNewsletterSubscription
  ): Promise<NewsletterSubscription>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getNewsletterSubscriptionById(
    id: number
  ): Promise<NewsletterSubscription | undefined>;
  deleteNewsletterSubscription(id: number): Promise<boolean>;

  // Product Reviews
  getProductReviews(productId: number): Promise<ProductReview[]>;
  addProductReview(review: InsertProductReview): Promise<ProductReview>;
  canUserReviewProduct(userId: number, productId: number): Promise<boolean>;
  getUserProductReviews(userId: number): Promise<ProductReview[]>;

  // Contact Messages
  addContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  updateContactMessageStatus(
    id: number,
    status: string
  ): Promise<ContactMessage>;

  // User Authentication
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  verifyUserEmail(token: string): Promise<boolean>;
  resetPasswordRequest(email: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Password Reset Methods
  updateUserResetToken(
    userId: number,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  createUserToken(
    userId: number,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<void>;
  clearUserResetToken(userId: number): Promise<void>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getPaymentById(id: number): Promise<Payment | undefined>;

  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
  getSubscriptionById(id: number): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: number, status: string): Promise<Subscription>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  getActiveTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberById(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(
    id: number,
    teamMember: Partial<InsertTeamMember>
  ): Promise<TeamMember>;
  deleteTeamMember(id: number): Promise<void>;

  // Discounts
  getAllDiscounts(): Promise<Discount[]>;
  getActiveDiscounts(): Promise<Discount[]>;
  getDiscountByCode(code: string): Promise<Discount | undefined>;
  getDiscountById(id: number): Promise<Discount | undefined>;
  createDiscount(discount: InsertDiscount): Promise<Discount>;
  updateDiscount(
    id: number,
    discount: Partial<InsertDiscount>
  ): Promise<Discount>;
  deleteDiscount(id: number): Promise<void>;
  validateDiscount(
    code: string,
    userId?: number,
    cartTotal?: number
  ): Promise<{ valid: boolean; discount?: Discount; error?: string }>;
  validateDiscountById(
    id: number,
    userId?: number,
    cartTotal?: number
  ): Promise<{ valid: boolean; discount?: Discount; error?: string }>;
  applyDiscount(
    discountId: number,
    userId?: number,
    sessionId?: string,
    orderId?: number
  ): Promise<DiscountUsage>;
  getDiscountUsage(discountId: number, userId?: number): Promise<number>;

  // Categories and Subcategories
  getAllCategories(): Promise<Category[]>;
  getMainCategories(): Promise<Category[]>;
  getSubcategoriesByParent(parentId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: number,
    category: Partial<InsertCategory>
  ): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Site Settings Methods
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private farmers: Map<number, Farmer>;
  private carts: Map<string, Cart>;
  private cartItems: Map<number, CartItem>;
  private testimonials: Map<number, Testimonial>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private productReviews: Map<number, ProductReview>;
  private users: Map<number, User>;
  private payments: Map<number, Payment>;
  private subscriptions: Map<number, Subscription>;
  private contactMessages: Map<number, ContactMessage>;

  private currentCartItemId: number;
  private currentNewsletterSubscriptionId: number;
  private currentProductReviewId: number;
  private currentUserId: number;
  private currentPaymentId: number;
  private currentSubscriptionId: number;
  private currentContactMessageId: number;

  constructor() {
    this.products = new Map();
    this.farmers = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.testimonials = new Map();
    this.newsletterSubscriptions = new Map();
    this.productReviews = new Map();
    this.users = new Map();
    this.payments = new Map();
    this.subscriptions = new Map();
    this.contactMessages = new Map();

    this.currentCartItemId = 1;
    this.currentNewsletterSubscriptionId = 1;
    this.currentProductReviewId = 1;
    this.currentUserId = 1;
    this.currentPaymentId = 1;
    this.currentSubscriptionId = 1;
    this.currentContactMessageId = 1;

    // Initialize with seed data
  }

  private initializeProducts(): void {
    productData.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  private initializeFarmers(): void {
    farmerData.forEach((farmer) => {
      this.farmers.set(farmer.id, farmer);
    });
  }

  private initializeTestimonials(): void {
    const testimonials: Testimonial[] = [
      {
        id: 1,
        name: "Sarah K.",
        title: "Coffee Enthusiast",
        content:
          "I've been ordering the cardamom and coffee beans for over a year now. The difference in flavor compared to store-bought is remarkable. You can taste the care that goes into growing these products.",
        rating: 5,
        imageInitials: "SK",
      },
      {
        id: 2,
        name: "Rahul M.",
        title: "Home Chef",
        content:
          "The rice varieties are exceptional. I've discovered flavors I never knew existed in rice! Knowing my purchase supports traditional farming methods makes it even better.",
        rating: 5,
        imageInitials: "RM",
      },
      {
        id: 3,
        name: "Anita T.",
        title: "Tea Connoisseur",
        content:
          "I love the transparency about where each product comes from. The tea leaves have such a vibrant flavor and aroma that you just can't find in commercial brands. Worth every penny!",
        rating: 4.5,
        imageInitials: "AT",
      },
      {
        id: 4,
        name: "Deepa P.",
        title: "Health Enthusiast",
        content:
          "The moringa leaves have become a staple in my kitchen. Knowing they're grown without chemicals gives me peace of mind, and the flavor is incomparable to anything I've found elsewhere.",
        rating: 5,
        imageInitials: "DP",
      },
    ];

    testimonials.forEach((testimonial) => {
      this.testimonials.set(testimonial.id, testimonial);
    });
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured
    );
  }

  async updateProductStock(
    productId: number,
    quantity: number
  ): Promise<Product> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const updatedProduct: Product = {
      ...product,
      stockQuantity: quantity,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    return updatedProduct;
  }

  async validateStockAvailability(
    productId: number,
    variantId: number,
    requestedQuantity: number
  ): Promise<boolean> {
    const product = this.products.get(productId);
    if (!product) return false;

    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) return false;

    return variant.stockQuantity >= requestedQuantity;
  }

  async getAllEnhancedProducts(): Promise<any[]> {
    return Array.from(this.products.values());
  }

  // Farmer methods
  async getAllFarmers(): Promise<Farmer[]> {
    return Array.from(this.farmers.values());
  }

  async getFarmerById(id: number): Promise<Farmer | undefined> {
    return this.farmers.get(id);
  }

  async getFeaturedFarmers(): Promise<Farmer[]> {
    return Array.from(this.farmers.values()).filter(
      (farmer) => farmer.featured
    );
  }

  // Cart methods
  async getCart(sessionId: string): Promise<CartWithItems> {
    let cart = this.carts.get(sessionId);

    if (!cart) {
      cart = {
        id: 1, // In a real DB this would be auto-incremented
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.set(sessionId, cart);
    }

    return this.buildCartWithItems(cart);
  }

  async addToCart(
    sessionId: string,
    productId: number,
    quantity: number
  ): Promise<CartWithItems> {
    let cart = this.carts.get(sessionId);

    if (!cart) {
      cart = {
        id: 1, // In a real DB this would be auto-incremented
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.set(sessionId, cart);
    }

    // Check if item already exists in cart
    const existingCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cart!.id && item.productId === productId
    );

    if (existingCartItems.length > 0) {
      const existingItem = existingCartItems[0];
      existingItem.quantity += quantity;
      this.cartItems.set(existingItem.id, existingItem);
    } else {
      const newItem: CartItem = {
        id: this.currentCartItemId++,
        cartId: cart.id,
        productId,
        quantity,
      };
      this.cartItems.set(newItem.id, newItem);
    }

    // Update cart's updatedAt timestamp
    cart.updatedAt = new Date();
    this.carts.set(sessionId, cart);

    return this.buildCartWithItems(cart);
  }

  async updateCartItem(
    sessionId: string,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<CartWithItems> {
    const cart = this.carts.get(sessionId);

    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) =>
        item.cartId === cart.id &&
        item.productId === productId &&
        item.variantId === variantId
    );

    if (cartItems.length === 0) {
      throw new Error("Cart item not found");
    }

    const cartItem = cartItems[0];

    if (quantity <= 0) {
      this.cartItems.delete(cartItem.id);
    } else {
      cartItem.quantity = quantity;
      this.cartItems.set(cartItem.id, cartItem);
    }

    cart.updatedAt = new Date();
    this.carts.set(sessionId, cart);

    return this.buildCartWithItems(cart);
  }

  async removeFromCart(
    sessionId: string,
    productId: number
  ): Promise<CartWithItems> {
    const cart = this.carts.get(sessionId);

    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cart.id && item.productId === productId
    );

    if (cartItems.length === 0) {
      throw new Error("Cart item not found");
    }

    const cartItem = cartItems[0];
    this.cartItems.delete(cartItem.id);

    // Update cart's updatedAt timestamp
    cart.updatedAt = new Date();
    this.carts.set(sessionId, cart);

    return this.buildCartWithItems(cart);
  }

  private buildCartWithItems(cart: Cart): CartWithItems {
    const items = Array.from(this.cartItems.values())
      .filter((item) => item.cartId === cart.id)
      .map((item) => {
        const product = this.products.get(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return { ...item, product };
      });

    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shipping = subtotal > 0 ? 4.99 : 0;
    const total = subtotal + shipping;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      items,
      totalItems,
      subtotal,
      shipping,
      total,
    };
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  // Newsletter methods
  async addNewsletterSubscription(
    subscription: InsertNewsletterSubscription
  ): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existingSubscription = Array.from(
      this.newsletterSubscriptions.values()
    ).find((sub) => sub.email === subscription.email);

    if (existingSubscription) {
      throw new Error("Email already subscribed");
    }

    const newSubscription: NewsletterSubscription = {
      id: this.currentNewsletterSubscriptionId++,
      ...subscription,
      createdAt: new Date(),
    };

    this.newsletterSubscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getNewsletterSubscriptionById(
    id: number
  ): Promise<NewsletterSubscription | undefined> {
    return this.newsletterSubscriptions.get(id);
  }

  async deleteNewsletterSubscription(id: number): Promise<boolean> {
    return this.newsletterSubscriptions.delete(id);
  }

  // Product Review methods
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return Array.from(this.productReviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async addProductReview(review: InsertProductReview): Promise<ProductReview> {
    const newReview: ProductReview = {
      id: this.currentProductReviewId++,
      productId: review.productId,
      userId: review.userId,
      orderId: review.orderId,
      customerName: review.customerName,
      rating: review.rating,
      reviewText: review.reviewText,
      verified: review.verified ?? false,
      createdAt: new Date(),
    };

    this.productReviews.set(newReview.id, newReview);
    return newReview;
  }

  async canUserReviewProduct(
    userId: number,
    productId: number
  ): Promise<boolean> {
    // Check if user has already reviewed this product
    const hasReviewed = Array.from(this.productReviews.values()).some(
      (review) => review.userId === userId && review.productId === productId
    );

    if (hasReviewed) {
      return false; // User has already reviewed this product
    }

    // In a real app, we would check if the user has purchased this product
    // and if the order status is "delivered" - here we'll simulate this logic
    const userOrders = Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId && payment.status === "completed"
    );

    // For demo purposes, if the user has any completed payment, they can review any product
    return userOrders.length > 0;
  }

  async getUserProductReviews(userId: number): Promise<ProductReview[]> {
    return Array.from(this.productReviews.values()).filter(
      (review) => review.userId === userId
    );
  }

  async addContactMessage(
    message: InsertContactMessage
  ): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      id: this.currentContactMessageId++,
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      status: "unread",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contactMessages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async updateContactMessageStatus(
    id: number,
    status: string
  ): Promise<ContactMessage> {
    const message = this.contactMessages.get(id);
    if (!message) {
      throw new Error(`Contact message with ID ${id} not found`);
    }

    const updatedMessage: ContactMessage = {
      ...message,
      status,
      updatedAt: new Date(),
    };

    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // User Authentication methods
  async createUser(user: InsertUser): Promise<User> {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.email === user.email
    );

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const newUser: User = {
      id: this.currentUserId++,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role || "user",
      emailVerified: user.emailVerified || false,
      verificationToken: user.verificationToken || null,
      resetToken: user.resetToken || null,
      resetTokenExpiry: user.resetTokenExpiry || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async createUserToken(
    userId: number,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
  async verifyUserEmail(token: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find(
      (u) => u.verificationToken === token
    );

    if (!user) {
      return false;
    }

    const updatedUser: User = {
      ...user,
      emailVerified: true,
      verificationToken: null,
      updatedAt: new Date(),
    };

    this.users.set(user.id, updatedUser);
    return true;
  }

  async resetPasswordRequest(email: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);

    if (!user) {
      return false;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    const updatedUser: User = {
      ...user,
      resetToken,
      resetTokenExpiry,
      updatedAt: new Date(),
    };

    this.users.set(user.id, updatedUser);
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const now = new Date();
    const user = Array.from(this.users.values()).find(
      (u) =>
        u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > now
    );

    if (!user) {
      return false;
    }

    const updatedUser: User = {
      ...user,
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    };

    this.users.set(user.id, updatedUser);
    return true;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment: Payment = {
      id: this.currentPaymentId++,
      userId: payment.userId,
      orderId: payment.orderId ?? null,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      currency: payment.currency || "INR",
      status: payment.status,
      method: payment.method ?? null,
      createdAt: new Date(),
    };

    this.payments.set(newPayment.id, newPayment);
    return newPayment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId
    );
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  // Subscription methods
  async createSubscription(
    subscription: InsertSubscription
  ): Promise<Subscription> {
    const newSubscription: Subscription = {
      id: this.currentSubscriptionId++,
      userId: subscription.userId,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      planName: subscription.planName,
      status: subscription.status || "active",
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }

  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.userId === userId
    );
  }

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async updateSubscriptionStatus(
    id: number,
    status: string
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updatedSubscription: Subscription = {
      ...subscription,
      status: status as any,
      updatedAt: new Date(),
    };

    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Order methods (stub implementation for MemStorage)
  async createOrder(order: InsertOrder): Promise<Order> {
    throw new Error("Order creation not implemented in MemStorage");
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    throw new Error("Order item creation not implemented in MemStorage");
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    throw new Error("Order retrieval not implemented in MemStorage");
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    throw new Error("Order retrieval not implemented in MemStorage");
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    throw new Error("Order items retrieval not implemented in MemStorage");
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    throw new Error("Order status update not implemented in MemStorage");
  }

  async clearCart(sessionId: string): Promise<void> {
    throw new Error("Cart clearing not implemented in MemStorage");
  }
}

export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    const productsList = await db.select().from(products);
    return productsList;
  }
  async getDeliveredOrdersWithItems(userId: number): Promise<Order[]> {
    return db.query.orders.findMany({
      where: and(eq(orders.userId, userId), eq(orders.status, "delivered")),
      with: {
        items: {
          with: {
            product: true,
            variant: true, // ✅ include variant info directly
          },
        },
      },
      orderBy: [desc(orders.deliveredAt)],
    });
  }
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, category));
    return categoryProducts;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const featuredProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.featured, true), eq(products.isDeleted, false)));
    return featuredProducts;
  }
  async updateProductStock(
    variantId: number,
    quantity: number
  ): Promise<ProductVariant> {
    console.log("runinningg.......");
    const [updatedVariant] = await db
      .update(productVariants)
      .set({
        stockQuantity: quantity,
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, variantId))
      .returning();

    if (!updatedVariant) {
      throw new Error(`Variant with id ${variantId} not found`);
    }

    return updatedVariant;
  }

  async validateStockAvailability(
    variantId: number,
    requestedQuantity: number
  ): Promise<boolean> {
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId));
    console.log("debugger", variant, requestedQuantity);
    if (!variant) return false;

    return variant.stockQuantity >= requestedQuantity;
  }

  async getAllEnhancedProducts(): Promise<any[]> {
    const enhancedProducts = await db.select().from(products);
    return enhancedProducts;
  }

  async getAllFarmers(): Promise<Farmer[]> {
    const farmersList = await db.select().from(farmers);
    return farmersList;
  }

  async getFarmerById(id: number): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.id, id));
    return farmer;
  }

  async getFeaturedFarmers(): Promise<Farmer[]> {
    const featuredFarmers = await db
      .select()
      .from(farmers)
      .where(eq(farmers.featured, true));
    return featuredFarmers;
  }

  async getProductReviews(productId: number): Promise<ProductReview[]> {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    return reviews;
  }

  async addProductReview(review: InsertProductReview): Promise<ProductReview> {
    const [newReview] = await db
      .insert(productReviews)
      .values(review)
      .returning();
    return newReview;
  }

  async canUserReviewProduct(
    userId: number,
    productId: number,
    variantId?: number
  ): Promise<boolean> {
    // Check if user has already reviewed this product variant (if variantId provided)
    const existingReviewsQuery = db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.userId, userId),
          eq(productReviews.productId, productId),
          variantId ? eq(productReviews.variantId, variantId) : sql`TRUE`
        )
      );

    const existingReviews = await existingReviewsQuery;

    if (existingReviews.length > 0) return false;

    // Check if user has purchased this product (and variant if provided) in delivered order
    const deliveredOrdersQuery = db
      .select({ orderId: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.status, "delivered"),
          eq(orderItems.productId, productId),
          variantId ? eq(orderItems.variantId, variantId) : sql`TRUE`
        )
      );

    const deliveredOrders = await deliveredOrdersQuery;

    return deliveredOrders.length > 0;
  }

  async getUserProductReviews(userId: number): Promise<ProductReview[]> {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.userId, userId));
    return reviews;
  }

  async addContactMessage(
    message: InsertContactMessage
  ): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
    return messages;
  }

  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id));
    return message;
  }

  async updateContactMessageStatus(
    id: number,
    status: string
  ): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ status, updatedAt: new Date() })
      .where(eq(contactMessages.id, id))
      .returning();

    return updatedMessage;
  }

  async getCart(sessionId: string): Promise<CartWithItems> {
    // Find or create cart
    let [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({ sessionId })
        .returning();
      cart = newCart;
    }

    return this.buildCartWithItems(cart);
  }

  async addToCart(
    sessionId: string,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<CartWithItems> {
    console.log("debugger", sessionId, productId, variantId, quantity);
    // Get or create cart
    let [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));

    if (!cart) {
      [cart] = await db.insert(carts).values({ sessionId }).returning();
    }

    // Check if this variant already exists in the cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          eq(cartItems.variantId, variantId)
        )
      );

    if (existingItem) {
      await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      });
    }

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.buildCartWithItems(cart);
  }

  async updateCartItem(
    sessionId: string,
    productId: number,
    variantId: number,
    quantity: number
  ): Promise<CartWithItems> {
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));

    if (!cart) {
      throw new Error("Cart not found");
    }

    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          eq(cartItems.variantId, variantId)
        )
      );

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItem.id));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, cartItem.id));
    }

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.buildCartWithItems(cart);
  }

  async removeFromCart(
    sessionId: string,
    productId: number,
    variantId: number
  ): Promise<CartWithItems> {
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));

    if (!cart) throw new Error("Cart not found");

    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          eq(cartItems.variantId, variantId)
        )
      );

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.buildCartWithItems(cart);
  }

  async clearCart(sessionId: string): Promise<void> {
    // Get cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));

    if (cart) {
      // Delete all cart items
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      // Update cart's updatedAt timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
    }
  }

  private async buildCartWithItems(cart: Cart): Promise<CartWithItems> {
    // Get cart items with product and variant info
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        product: products,
        variant: productVariants, // variant info
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id));

    // Calculate subtotal using variant price (prefer discountPrice if available)
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant.discountPrice ?? item.variant.price;
      return sum + price * item.quantity;
    }, 0);

    const shipping = subtotal > 0 ? 4.99 : 0;
    const total = subtotal + shipping;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      items,
      totalItems,
      subtotal,
      shipping,
      total,
    };
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    const testimonialsList = await db.select().from(testimonials);
    return testimonialsList;
  }

  async addNewsletterSubscription(
    subscription: InsertNewsletterSubscription
  ): Promise<NewsletterSubscription> {
    // Check if email already exists
    const [existingSubscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, subscription.email));

    if (existingSubscription) {
      throw new Error("Email already subscribed");
    }

    // Add new subscription
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .returning();

    return newSubscription;
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .orderBy(desc(newsletterSubscriptions.createdAt));
  }

  async getNewsletterSubscriptionById(
    id: number
  ): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.id, id));
    return subscription;
  }

  async deleteNewsletterSubscription(id: number): Promise<boolean> {
    const result = await db
      .delete(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // User Authentication methods
  async createUser(user: InsertUser): Promise<User> {
    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const [newUser] = await db.insert(users).values(user).returning();

    return newUser;
  }

  // async getUserByEmailNumber(
  //   email: string,
  //   number: number
  // ): Promise<User | undefined> {
  //   const [user] = await db
  //     .select()
  //     .from(users)
  //     .where(and(eq(users.email, email),eq(users.mobile, number)));

  //   return user;
  // }
  // abhi
  async getUserByEmailNumber(
    email: string,
    number: string
  ): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.mobile, number)));
    console.log("check++", user);
    return user;
  }
  // abhi

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  }
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));

    if (!user) {
      return false;
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
      })
      .where(eq(users.id, user.id));

    return true;
  }

  async resetPasswordRequest(email: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return false;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const now = new Date();

    const [user] = await db
      .select()
      .from(users)
      .where(
        and(eq(users.resetToken, token), isNotNull(users.resetTokenExpiry))
      );

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < now) {
      return false;
    }

    await db
      .update(users)
      .set({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Password Reset Methods
  async updateUserResetToken(
    userId: number,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
    return user;
  }

  async updateUserPassword(
    userId: number,
    hashedPassword: string
  ): Promise<void> {
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async clearUserResetToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();

    return newPayment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId));

    return userPayments;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    return payment;
  }

  // Subscription methods
  async createSubscription(
    subscription: InsertSubscription
  ): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();

    return newSubscription;
  }

  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    return userSubscriptions;
  }

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));

    return subscription;
  }

  async updateSubscriptionStatus(
    id: number,
    status: string
  ): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ status: status as any })
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updatedSubscription) {
      throw new Error("Subscription not found");
    }

    return updatedSubscription;
  }

  // Order management methods with inventory sync
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  private async deductVariantStock(
    variantId: number,
    quantity: number
  ): Promise<void> {
    await db
      .update(productVariants)
      .set({
        stockQuantity: sql`${productVariants.stockQuantity} - ${quantity}`,
      })
      .where(eq(productVariants.id, variantId));
  }
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    // Validate stock availability by variant
    const isStockAvailable = await this.validateStockAvailability(
      orderItem.variantId,
      orderItem.quantity
    );

    if (!isStockAvailable) {
      throw new Error(
        `Insufficient stock for variant ID ${orderItem.variantId}. Requested: ${orderItem.quantity}`
      );
    }

    // Create the order item
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();

    // Deduct stock from the variant inventory
    await this.deductVariantStock(orderItem.variantId, orderItem.quantity);

    return newOrderItem;
  }

  // Helper method to deduct stock from product inventory

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    console.log("Querying orders for user ID:", userId);
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    console.log("Found orders count:", result.length, "for user:", userId);
    return result;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        discountPrice: orderItems.discountPrice,
        productName: products.name,
        productImage: products.imageUrl,
        variantName: productVariants.name,
        unit: productVariants.unit,
        variantSku: productVariants.sku,
        stockQuantity: productVariants.stockQuantity,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .where(eq(orderItems.orderId, orderId));
  }
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  // Team Member methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .orderBy(teamMembers.displayOrder, teamMembers.createdAt);
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.displayOrder, teamMembers.createdAt);
  }

  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(teamMember)
      .returning();
    return newMember;
  }

  async updateTeamMember(
    id: number,
    teamMemberData: Partial<InsertTeamMember>
  ): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({
        ...teamMemberData,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();

    if (!updatedMember) {
      throw new Error("Team member not found");
    }

    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // Discount Management Methods
  async getAllDiscounts(): Promise<Discount[]> {
    const discountsList = await db
      .select()
      .from(discounts)
      .orderBy(desc(discounts.createdAt));
    return discountsList;
  }

  async getActiveDiscounts(): Promise<Discount[]> {
    const now = new Date();
    const activeDiscounts = await db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.status, "active"),
          sql`${discounts.startDate} <= ${now}`,
          sql`${discounts.endDate} >= ${now}`
        )
      )
      .orderBy(desc(discounts.createdAt));
    return activeDiscounts;
  }

  async getDiscountByCode(code: string): Promise<Discount | undefined> {
    const [discount] = await db
      .select()
      .from(discounts)
      .where(eq(discounts.code, code.toUpperCase()));
    return discount;
  }

  async getDiscountById(id: number): Promise<Discount | undefined> {
    const [discount] = await db
      .select()
      .from(discounts)
      .where(eq(discounts.id, id));
    return discount;
  }

  async createDiscount(discount: InsertDiscount): Promise<Discount> {
    const [newDiscount] = await db
      .insert(discounts)
      .values({
        ...discount,
        code: discount.code.toUpperCase(),
      })
      .returning();
    return newDiscount;
  }

  async updateDiscount(
    id: number,
    discountData: Partial<InsertDiscount>
  ): Promise<Discount> {
    const [updatedDiscount] = await db
      .update(discounts)
      .set({
        ...discountData,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, id))
      .returning();

    if (!updatedDiscount) {
      throw new Error("Discount not found");
    }

    return updatedDiscount;
  }

  async deleteDiscount(id: number): Promise<void> {
    await db.delete(discounts).where(eq(discounts.id, id));
  }

  async validateDiscount(
    code: string,
    userId?: number,
    cartTotal?: number
  ): Promise<{ valid: boolean; discount?: Discount; error?: string }> {
    const discount = await this.getDiscountByCode(code);

    if (!discount) {
      return { valid: false, error: "Invalid discount code" };
    }

    const now = new Date();

    // Check if discount is active
    if (discount.status !== "active") {
      return { valid: false, error: "Discount is not active" };
    }

    // Check date validity
    if (now < discount.startDate || now > discount.endDate) {
      return { valid: false, error: "Discount has expired or not yet active" };
    }

    // Check minimum purchase requirement
    if (cartTotal && discount.minPurchase && cartTotal < discount.minPurchase) {
      return {
        valid: false,
        error: `Minimum purchase amount is ₹${discount.minPurchase}`,
      };
    }

    // Check usage limits
    if (
      discount.usageLimit &&
      discount.usageLimit > 0 &&
      discount.used &&
      discount.used >= discount.usageLimit
    ) {
      return { valid: false, error: "Discount usage limit exceeded" };
    }

    // Check per-user usage limits
    if (discount.perUser && userId) {
      const userUsage = await this.getDiscountUsage(discount.id, userId);
      if (userUsage > 0) {
        return { valid: false, error: "You have already used this discount" };
      }
    }

    return { valid: true, discount };
  }

  async validateDiscountById(
    id: number,
    userId?: number,
    cartTotal?: number
  ): Promise<{ valid: boolean; discount?: Discount; error?: string }> {
    const discount = await this.getDiscountById(id);

    if (!discount) {
      return { valid: false, error: "Invalid discount" };
    }

    const now = new Date();

    // Check if discount is active
    if (discount.status !== "active") {
      return { valid: false, error: "Discount is not active" };
    }

    // Check date validity
    if (now < discount.startDate || now > discount.endDate) {
      return { valid: false, error: "Discount has expired or not yet active" };
    }

    // Check minimum purchase requirement
    if (cartTotal && discount.minPurchase && cartTotal < discount.minPurchase) {
      return {
        valid: false,
        error: `Minimum purchase amount is ₹${discount.minPurchase}`,
      };
    }

    // Check usage limits
    if (
      discount.usageLimit &&
      discount.usageLimit > 0 &&
      discount.used &&
      discount.used >= discount.usageLimit
    ) {
      return { valid: false, error: "Discount usage limit exceeded" };
    }

    // Check per-user usage limits
    if (discount.perUser && userId) {
      const userUsage = await this.getDiscountUsage(discount.id, userId);
      if (userUsage > 0) {
        return { valid: false, error: "You have already used this discount" };
      }
    }

    return { valid: true, discount };
  }

  async applyDiscount(
    discountId: number,
    userId?: number,
    sessionId?: string,
    orderId?: number
  ): Promise<DiscountUsage> {
    // Record discount usage
    const [usage] = await db
      .insert(discountUsage)
      .values({
        discountId,
        userId,
        sessionId,
        orderId,
      })
      .returning();

    // Increment discount usage count
    await db
      .update(discounts)
      .set({ used: sql`${discounts.used} + 1` })
      .where(eq(discounts.id, discountId));

    return usage;
  }

  async getDiscountUsage(discountId: number, userId?: number): Promise<number> {
    if (userId) {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(discountUsage)
        .where(
          and(
            eq(discountUsage.discountId, discountId),
            eq(discountUsage.userId, userId)
          )
        );
      return result?.count || 0;
    } else {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(discountUsage)
        .where(eq(discountUsage.discountId, discountId));
      return result?.count || 0;
    }
  }

  // Site Settings Methods
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    return setting;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    const settings = await db.select().from(siteSettings);
    return settings;
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const [upsertedSetting] = await db
      .insert(siteSettings)
      .values({
        ...setting,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: setting.value,
          type: setting.type,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();

    return upsertedSetting;
  }

  async deleteSiteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }

  // Category management methods
  async getAllCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder, categories.name);
  }

  async getMainCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(
        and(sql`${categories.parentId} IS NULL`, eq(categories.isActive, true))
      )
      .orderBy(categories.sortOrder, categories.name);
  }

  async getSubcategoriesByParent(parentId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(
        and(eq(categories.parentId, parentId), eq(categories.isActive, true))
      )
      .orderBy(categories.sortOrder, categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return newCategory;
  }

  async updateCategory(
    id: number,
    categoryData: Partial<InsertCategory>
  ): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...categoryData,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new Error("Category not found");
    }

    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
}

// Use the database storage implementation
// Use the database storage implementation for production
export const storage = new DatabaseStorage();
