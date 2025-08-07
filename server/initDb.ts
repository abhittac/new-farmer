import { db } from "./db";
import {
  products,
  farmers,
  testimonials,
  discounts,
  siteSettings,
  users,
  orders,
  orderItems,
  payments,
  categories,
} from "@shared/schema";
import { productData } from "./productData";
import { farmerData } from "./farmerData";
import { discountData } from "./discountData";
import { storeSettingsData } from "./storeSettingsData";
import { categoryData, subcategoryData } from "./categoryData";
import { sql } from "drizzle-orm";

/**
 * Initialize the database with seed data
 */
export async function initializeDatabase() {
  console.log("Initializing database with seed data...");

  try {
    // Check if products already exist
    const existingProducts = await db
      .select({ count: sql`count(*)` })
      .from(products);

    if (Number(existingProducts[0].count) === 0) {
      console.log("Adding products...");
      await db.insert(products).values(productData);
    } else {
      console.log(
        `Found ${existingProducts[0].count} existing products, skipping product seeding.`
      );
    }

    // Check if farmers already exist
    const existingFarmers = await db
      .select({ count: sql`count(*)` })
      .from(farmers);

    if (Number(existingFarmers[0].count) === 0) {
      console.log("Adding farmers...");
      await db.insert(farmers).values(farmerData);
    } else {
      console.log(
        `Found ${existingFarmers[0].count} existing farmers, skipping farmer seeding.`
      );
    }

    // Add testimonials if they don't exist
    const existingTestimonials = await db
      .select({ count: sql`count(*)` })
      .from(testimonials);

    if (Number(existingTestimonials[0].count) === 0) {
      console.log("Adding testimonials...");
      const testimonialsData = [
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

      await db.insert(testimonials).values(testimonialsData);
    } else {
      console.log(
        `Found ${existingTestimonials[0].count} existing testimonials, skipping testimonial seeding.`
      );
    }

    // Add discounts if they don't exist
    const existingDiscounts = await db
      .select({ count: sql`count(*)` })
      .from(discounts);

    if (Number(existingDiscounts[0].count) === 0) {
      console.log("Adding discount codes...");
      await db.insert(discounts).values(discountData);
    } else {
      console.log(
        `Found ${existingDiscounts[0].count} existing discounts, skipping discount seeding.`
      );
    }

    // Add site settings if they don't exist
    const existingSiteSettings = await db
      .select({ count: sql`count(*)` })
      .from(siteSettings);

    if (Number(existingSiteSettings[0].count) === 0) {
      console.log("Adding store settings...");
      await db.insert(siteSettings).values(storeSettingsData);
    } else {
      console.log(
        `Found ${existingSiteSettings[0].count} existing site settings, skipping settings seeding.`
      );
    }

    // Add sample orders for demonstration
    const existingOrders = await db
      .select({ count: sql`count(*)` })
      .from(orders);

    if (Number(existingOrders[0].count) === 0) {
      console.log("Adding sample orders...");

      // Create demo user first
      const [demoUser] = await db
        .insert(users)
        .values({
          name: "Demo User",
          email: "demo@harvestdirect.com",
          password: "demo_password",
          role: "user",
          mobile: "9999999999",
          mobileVerified: false,
          codEnabled: true,
          emailVerified: true,
          verificationToken: null,
          resetToken: null,
          resetTokenExpiry: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create sample orders
      const [order1] = await db
        .insert(orders)
        .values({
          userId: demoUser.id,
          sessionId: "demo-session-123",
          paymentId: "pay_demo123",
          total: 45.95,
          status: "delivered",
          shippingAddress: "123 Farm Lane, Green Valley, CA 95014",
          billingAddress: "123 Farm Lane, Green Valley, CA 95014",
          paymentMethod: "razorpay",
          discountId: 1,
          deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        })
        .returning();

      const [order2] = await db
        .insert(orders)
        .values({
          userId: demoUser.id,
          sessionId: "demo-session-456",
          paymentId: "pay_demo456",
          total: 78.5,
          status: "confirmed",
          shippingAddress: "456 Organic Street, Eco City, CA 94102",
          billingAddress: "456 Organic Street, Eco City, CA 94102",
          paymentMethod: "razorpay",
        })
        .returning();

      // Add order items
      await db.insert(orderItems).values([
        { orderId: order1.id, productId: 1, quantity: 2, price: 15.0 },
        { orderId: order1.id, productId: 2, quantity: 1, price: 15.95 },
        { orderId: order2.id, productId: 3, quantity: 3, price: 22.5 },
        { orderId: order2.id, productId: 4, quantity: 1, price: 11.5 },
      ]);

      // Add payment records
      await db.insert(payments).values([
        {
          userId: demoUser.id,
          orderId: order1.id,
          razorpayPaymentId: "pay_demo123",
          amount: 45.95,
          status: "captured",
          method: "card",
        },
        {
          userId: demoUser.id,
          orderId: order2.id,
          razorpayPaymentId: "pay_demo456",
          amount: 78.5,
          status: "captured",
          method: "upi",
        },
      ]);
    } else {
      console.log(
        `Found ${existingOrders[0].count} existing orders, skipping order seeding.`
      );
    }

    // Add categories if they don't exist
    const existingCategories = await db
      .select({ count: sql`count(*)` })
      .from(categories);

    if (Number(existingCategories[0].count) === 0) {
      console.log("Adding categories...");

      // First, add main categories
      const insertedCategories = await db
        .insert(categories)
        .values(categoryData)
        .returning();

      // Then add subcategories with proper parent references
      const categoryMap = new Map();
      insertedCategories.forEach((cat) => {
        categoryMap.set(cat.slug, cat.id);
      });

      // Map subcategories to their parent categories
      const subcategoriesWithParents = subcategoryData.map((subcat) => {
        let parentId = null;

        // Determine parent category based on subcategory type
        if (
          [
            "arabica-coffee",
            "robusta-coffee",
            "green-tea",
            "black-tea",
            "herbal-tea",
          ].includes(subcat.slug)
        ) {
          parentId = categoryMap.get("coffee-tea");
        } else if (
          [
            "whole-spices",
            "ground-spices",
            "spice-blends",
            "medicinal-spices",
          ].includes(subcat.slug)
        ) {
          parentId = categoryMap.get("spices");
        } else if (
          [
            "rice-varieties",
            "wheat-products",
            "millets",
            "pulses-lentils",
          ].includes(subcat.slug)
        ) {
          parentId = categoryMap.get("grains");
        } else if (
          [
            "honey-sweeteners",
            "oils-ghee",
            "dry-fruits-nuts",
            "pickles-preserves",
          ].includes(subcat.slug)
        ) {
          parentId = categoryMap.get("others");
        }

        return {
          ...subcat,
          parentId,
        };
      });

      await db.insert(categories).values(subcategoriesWithParents);
    } else {
      console.log(
        `Found ${existingCategories[0].count} existing categories, skipping category seeding.`
      );
    }

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
