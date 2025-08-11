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
export const getAllInventoryProducts = async (req: Request, res: Response) => {
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

    // Total count of products (before flattening variants)
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
    }

    // Flatten into one object per variant
    const flattened = productsList.flatMap((product) => {
      const productVariantsList = variantsMap[product.id] || [];
      if (productVariantsList.length === 0) {
        // If no variants, still return a single object for the product
        return [
          {
            productId: product.id,
            productName: product.name,
            category: product.category,
            ...product,
            variant: null,
          },
        ];
      }
      return productVariantsList.map((variant) => ({
        productId: product.id,
        productName: product.name,
        category: product.category,
        variant,
      }));
    });

    // Response
    res.json({
      debuger: true,
      products: flattened,
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

    // Build product filters (no isDeleted here)
    const productFilters = [];
    if (search) productFilters.push(like(products.name, `%${search}%`));
    if (category) productFilters.push(eq(products.category, category));

    // First, find product IDs that have at least one non-deleted variant
    const variantSubQuery = db
      .select({ productId: productVariants.productId })
      .from(productVariants)
      .where(eq(productVariants.isDeleted, false));

    // Apply variant filtering with product filters + join condition
    // We'll get unique product IDs that match product filters and have variants not deleted

    const productIdsWithVariantsQuery = db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          ...productFilters,
          // Only products where exists a non-deleted variant
          sql`EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = products.id AND pv.is_deleted = false)`
        )
      )
      .orderBy(
        order.toLowerCase() === "asc"
          ? asc(products[sort as keyof typeof products] || products.id)
          : desc(products[sort as keyof typeof products] || products.id)
      )
      .limit(limitNumber)
      .offset(offset);

    const productIdsWithVariants = await productIdsWithVariantsQuery;

    const productIds = productIdsWithVariants.map((p) => p.id);

    if (productIds.length === 0) {
      return res.json({
        debuger: true,
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

    // Fetch full product info for those IDs
    const productsList = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    // Count total products with variants not deleted (for pagination)
    // We use COUNT DISTINCT products.id from products joined with variants where variant not deleted and product filters

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT products.id)` })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...productFilters, eq(productVariants.isDeleted, false)));

    // Fetch variants for the fetched products (only non-deleted variants)
    const variants = await db
      .select()
      .from(productVariants)
      .where(
        and(
          inArray(productVariants.productId, productIds),
          eq(productVariants.isDeleted, false)
        )
      );

    // Map variants by productId
    const variantsMap = variants.reduce((acc, variant) => {
      if (!acc[variant.productId]) acc[variant.productId] = [];
      acc[variant.productId].push(variant);
      return acc;
    }, {} as Record<number, any[]>);

    // Enrich products with variants
    const enrichedProducts = productsList.map((product) => ({
      ...product,
      variants: variantsMap[product.id] || [],
    }));

    // Response
    res.json({
      debuger: true,
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
    // Disable caching
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const { id } = req.params;
    const productId = parseInt(id);

    // Validate request body (product + variants)
    const parsedData = insertProductSchema.parse(req.body);
    const { variants, ...productBaseData } = parsedData;

    // Process product data
    const processedProductData = {
      ...productBaseData,
      localImagePaths: productBaseData.imageUrls || null,
      updatedAt: new Date(),
    };

    // Start transaction
    const updatedProduct = await db.transaction(async (tx) => {
      // 1️⃣ Update product
      const [productUpdate] = await tx
        .update(products)
        .set(processedProductData)
        .where(eq(products.id, productId))
        .returning();

      if (!productUpdate) {
        throw new Error("Product not found");
      }

      // 2️⃣ Get existing variants
      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      const existingVariantIds = existingVariants.map((v) => v.id);
      const incomingVariantIds = variants
        .filter((v) => v.id) // variants with id means "update"
        .map((v) => v.id);

      // 3️⃣ Delete removed variants
      const variantsToDelete = existingVariantIds.filter(
        (id) => !incomingVariantIds.includes(id)
      );
      if (variantsToDelete.length) {
        await tx
          .delete(productVariants)
          .where(inArray(productVariants.id, variantsToDelete));
      }

      // 4️⃣ Update existing variants
      for (const variant of variants.filter((v) => v.id)) {
        await tx
          .update(productVariants)
          .set({
            price: variant.price,
            discountPrice: variant.discountPrice,
            quantity: variant.quantity,
            unit: variant.unit,
            stockQuantity: variant.stockQuantity,
            sku: variant.sku,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, variant.id));
      }

      // 5️⃣ Insert new variants
      const newVariants = variants.filter((v) => !v.id);
      if (newVariants.length) {
        await tx.insert(productVariants).values(
          newVariants.map((variant) => ({
            ...variant,
            productId,
          }))
        );
      }

      return productUpdate;
    });

    // 6️⃣ Return updated product with variants
    const finalProduct = await getProductWithVariants(productId);

    res.json(finalProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.flatten().fieldErrors,
      });
    }

    res.status(500).json({
      message: "Failed to update product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
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

    // Get all variants of the product
    const productVariantsList = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    if (productVariantsList.length === 0) {
      // No variants? Consider what you want to do here.
      // Since variants define stock and deletion, you might want to
      // simply respond or optionally soft delete product's updatedAt timestamp.

      return res.status(400).json({
        message: "No variants found for this product, cannot delete",
      });
    }

    const variantIds = productVariantsList.map((v) => v.id);

    // Find order items for these variants that belong to undelivered or unshipped orders
    const ordersWithVariant = await db
      .select({
        order: orders,
        orderItem: orderItems,
        variantSku: productVariants.sku,
        variantId: productVariants.id,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .where(
        and(
          inArray(orderItems.variantId, variantIds),
          sql`${orders.status} NOT IN ('delivered', 'shipped')`
        )
      );

    if (ordersWithVariant.length > 0) {
      // Collect unique SKUs of variants with pending orders
      const pendingVariantSkus = Array.from(
        new Set(ordersWithVariant.map((v) => v.variantSku))
      );

      return res.status(400).json({
        message:
          "Cannot delete product because some variants have pending orders",
        pendingVariantSkus,
      });
    }

    // Soft delete all variants of this product
    await db
      .update(productVariants)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(productVariants.productId, productId));

    // Optional: Update product's updatedAt timestamp for record keeping
    await db
      .update(products)
      .set({ updatedAt: new Date() })
      .where(eq(products.id, productId));

    res.json({
      message: "Product variants soft-deleted successfully",
      productId,
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
    // Total variants count
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(productVariants)
      .where(eq(productVariants.isDeleted, false)); // if applicable

    const totalVariants = Number(totalResult?.count || "0");

    // Out of stock variants count
    const [outOfStockResult] = await db
      .select({ count: sql`count(*)` })
      .from(productVariants)
      .where(eq(productVariants.stockQuantity, 0));
    const outOfStock = Number(outOfStockResult?.count || "0");

    // Low stock variants count (e.g., stockQuantity > 0 and < 10)
    const [lowStockResult] = await db
      .select({ count: sql`count(*)` })
      .from(productVariants)
      .where(
        sql`${productVariants.stockQuantity} > 0 AND ${productVariants.stockQuantity} < 10`
      );
    const lowStock = Number(lowStockResult?.count || "0");

    // Average stock quantity across variants
    const [avgStockResult] = await db
      .select({ avg: sql`AVG(${productVariants.stockQuantity})` })
      .from(productVariants);
    const avgStock = Number(avgStockResult?.avg || "0").toFixed(2);

    // Total distinct products (count distinct productId in variants)
    const [distinctProductsResult] = await db
      .select({ count: sql`count(DISTINCT ${productVariants.productId})` })
      .from(productVariants);
    const totalProducts = Number(distinctProductsResult?.count || "0");

    // Join variants → products for category grouping and top categories by variant count
    const topCategories = await db
      .select({
        category: products.category,
        count: sql`count(*)`,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .groupBy(products.category)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    return {
      totalProducts,
      totalVariants,
      inStock: totalVariants - outOfStock,
      outOfStock,
      lowStock,
      avgStock,
      stockStatus: {
        inStock: Math.round(
          ((totalVariants - outOfStock) / totalVariants) * 100
        ),
        outOfStock: Math.round((outOfStock / totalVariants) * 100),
        lowStock: Math.round((lowStock / totalVariants) * 100),
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
      totalVariants: 0,
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
// export const updateProductStock = async (req: Request, res: Response) => {
//   try {
//     const variantId = parseInt(req.params.id);
//     const { stockQuantity } = req.body;

//     if (typeof stockQuantity !== "number" || stockQuantity < 0) {
//       return res.status(400).json({
//         message: "Stock quantity must be a non-negative number",
//       });
//     }

//     const [updatedVariant] = await db
//       .update(productVariants)
//       .set({ stockQuantity })
//       .where(eq(productVariants.id, variantId))
//       .returning();

//     if (!updatedVariant) {
//       return res.status(404).json({ message: "Variant not found" });
//     }

//     res.json(updatedVariant);
//   } catch (error) {
//     console.error("Error updating variant stock:", error);
//     res.status(500).json({
//       message: "Failed to update variant stock",
//       error: String(error),
//     });
//   }
// };
