import { Request, Response } from "express";
import { db } from "../db";
import {
  products,
  insertProductSchema,
  Product,
  ProductCategory,
  orders,
  orderItems,
  insertProductVariantSchema,
  productVariants,
} from "@shared/schema";
import { eq, like, desc, asc, sql, and, inArray } from "drizzle-orm";
import { z } from "zod";

// GET all products with pagination, sorting and filtering

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Disable caching
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Parse query parameters
    const {
      page = "1",
      limit = "10",
      sort = "id",
      order = "asc",
      search = "",
      category = "",
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Build filters
    const filters = [eq(products.isDeleted, false)];
    if (search) filters.push(like(products.name, `%${search}%`));
    if (category) filters.push(eq(products.category, category));

    // Total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...filters));

    // Sorting
    const sortColumn = products[sort as keyof typeof products] || products.id;
    const sortOrder =
      order.toLowerCase() === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Fetch products
    const productsList = await db
      .select()
      .from(products)
      .where(and(...filters))
      .orderBy(sortOrder)
      .limit(limitNumber)
      .offset(offset);

    const productIds = productsList.map((p) => p.id);

    let variantsMap: Record<number, any[]> = {};

    if (productIds.length > 0) {
      const variants = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds));

      variantsMap = variants.reduce((acc, variant) => {
        const pid = variant.productId;
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(variant);
        return acc;
      }, {} as Record<number, any[]>);

      // Debugging: log if no variants found for a product
      productsList.forEach((p) => {
        if (!variantsMap[p.id]) {
          console.warn(`No variants found for product ID ${p.id}`);
        }
      });
    }

    // Final mapping
    const enrichedProducts = productsList.map((product) => ({
      ...product,
      variants: variantsMap[product.id] || [],
    }));

    // Response
    res.json({
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
    res.status(500).json({
      message: "Failed to fetch products",
      error: String(error),
    });
  }
};

// GET product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: String(error) });
  }
};

// ----------------------------------------------------------------------------------
// 1. HELPER FUNCTION (Your version is perfect, kept for context)
// This function efficiently fetches a product and its related variants in a single DB call.
// ----------------------------------------------------------------------------------

export const getProductWithVariants = async (productId: number) => {
  const productWithVariants = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      variants: true, // This uses the Drizzle relation to automatically fetch variants
    },
  });

  return productWithVariants || null;
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // ✅ 1. Parse and validate request body
    const parsedData = insertProductSchema.parse(req.body);
    const { variants, ...productBaseData } = parsedData;

    // ✅ 2. Start transaction to insert product and variants
    const newProductId = await db.transaction(async (tx) => {
      // 2a. Insert product
      const [newProduct] = await tx
        .insert(products)
        .values({
          ...productBaseData,
          localImagePaths: productBaseData.imageUrls || null,
        })
        .returning({ id: products.id });

      // 2b. Defensive check (optional, tx.insert should always return)
      if (!newProduct?.id) {
        throw new Error("Failed to create product.");
      }

      // 2c. Insert variants
      const variantsToInsert = variants.map((variant) => ({
        ...variant,
        productId: newProduct.id,
      }));

      await tx.insert(productVariants).values(variantsToInsert);

      return newProduct.id;
    });

    // ✅ 3. Fetch and return the full product with variants
    const finalProduct = await getProductWithVariants(newProductId);

    return res.status(201).json(finalProduct);
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.flatten().fieldErrors,
      });
    }

    return res.status(500).json({
      message: "Failed to create product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// UPDATE product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Add cache-busting headers
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const { id } = req.params;
    const productId = parseInt(id);

    // Validate request body
    const productData = insertProductSchema.parse(req.body);

    // Process image URLs to ensure local image paths are stored properly
    const processedData = {
      ...productData,
      localImagePaths: productData.imageUrls || null,
      updatedAt: new Date(),
    };

    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set(processedData)
      .where(eq(products.id, productId))
      .returning();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      "Product updated successfully:",
      updatedProduct.id,
      updatedProduct.name
    );
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res
      .status(500)
      .json({ message: "Failed to update product", error: String(error) });
  }
};

// TOGGLE featured status
export const toggleProductFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // Get current product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Toggle featured status
    const [updatedProduct] = await db
      .update(products)
      .set({ featured: !product.featured })
      .where(eq(products.id, productId))
      .returning();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error toggling product featured status:", error);
    res.status(500).json({
      message: "Failed to toggle product featured status",
      error: String(error),
    });
  }
};

// DELETE product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // Get product before deletion
    const [productToDelete] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product is associated with any orders
    const ordersWithProduct = await db
      .select({
        orders: orders,
        order_items: orderItems,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orderItems.productId, productId));

    if (ordersWithProduct.length > 0) {
      const undeliveredOrders = ordersWithProduct.filter(
        ({ orders }) =>
          orders.status !== "delivered" && orders.status !== "shipped"
      );

      if (undeliveredOrders.length > 0) {
        return res.status(400).json({
          message: "Cannot delete product associated with undelivered orders",
        });
      }
    }

    // Soft delete the product
    const [updatedProduct] = await db
      .update(products)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();

    res.json({
      message: "Product soft-deleted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: String(error),
    });
  }
};

// GET product categories
export const getProductCategories = async (req: Request, res: Response) => {
  try {
    // Get unique categories from products table
    const categoriesResult = await db
      .select({ category: products.category })
      .from(products)
      .groupBy(products.category);

    const categories = categoriesResult.map((c) => c.category);

    // Include default categories from schema
    const allCategories = [
      ...Object.values(ProductCategory),
      ...categories.filter((c) => !Object.values(ProductCategory).includes(c)),
    ];

    // Remove duplicates
    const uniqueCategories = [...new Set(allCategories)];

    res.json({ categories: uniqueCategories });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    res.status(500).json({
      message: "Failed to fetch product categories",
      error: String(error),
    });
  }
};

// GET product stock data for dashboard
export const getProductStockData = async (): Promise<any> => {
  try {
    // Get total products count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(eq(products.isDeleted, false));
    const totalProducts = Number(totalResult?.count || "0");

    // Get out of stock products count
    const [outOfStockResult] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(eq(products.stockQuantity, 0));
    const outOfStock = Number(outOfStockResult?.count || "0");

    // Get low stock products count (less than 10)
    const [lowStockResult] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(
        sql`${products.stockQuantity} > 0 AND ${products.stockQuantity} < 10`
      );
    const lowStock = Number(lowStockResult?.count || "0");

    // Get in stock products count
    const inStock = totalProducts - outOfStock;

    // Get average stock level
    const [avgStockResult] = await db
      .select({ avg: sql`AVG(${products.stockQuantity})` })
      .from(products);
    const avgStock = Number(avgStockResult?.avg || "0").toFixed(2);

    // Get top 5 categories by product count
    const topCategories = await db
      .select({
        category: products.category,
        count: sql`count(*)`,
      })
      .from(products)
      .groupBy(products.category)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Return stock data
    return {
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      avgStock,
      stockStatus: {
        inStock: Math.round((inStock / totalProducts) * 100),
        outOfStock: Math.round((outOfStock / totalProducts) * 100),
        lowStock: Math.round((lowStock / totalProducts) * 100),
      },
      topCategories: topCategories.map((c) => ({
        category: c.category,
        count: Number(c.count),
      })),
    };
  } catch (error) {
    console.error("Error getting product stock data:", error);
    return {
      totalProducts: 0,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
      avgStock: 0,
      stockStatus: {
        inStock: 0,
        outOfStock: 0,
        lowStock: 0,
      },
      topCategories: [],
    };
  }
};

// GET product stock data for dashboard (API endpoint)
export const getProductStock = async (req: Request, res: Response) => {
  try {
    const stockData = await getProductStockData();
    res.json(stockData);
  } catch (error) {
    console.error("Error getting product stock data:", error);
    res.status(500).json({
      message: "Failed to get product stock data",
      error: String(error),
    });
  }
};

// UPDATE product stock
export const updateProductStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    const { stockQuantity } = req.body;

    if (typeof stockQuantity !== "number" || stockQuantity < 0) {
      return res.status(400).json({
        message: "Stock quantity must be a non-negative number",
      });
    }

    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({ stockQuantity })
      .where(eq(products.id, productId))
      .returning();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({
      message: "Failed to update product stock",
      error: String(error),
    });
  }
};
