import { db } from './db';
import { 
  products, farmers, carts, cartItems, testimonials, 
  newsletterSubscriptions, orders, orderItems, productReviews, 
  contactMessages, users, payments, subscriptions, teamMembers, 
  discounts, discountUsage, siteSettings 
} from '@shared/schema';
import fs from 'fs';
import path from 'path';

interface TableInfo {
  tableName: string;
  schema: any;
  data: any[];
}

/**
 * Generate PostgreSQL CREATE TABLE statements from Drizzle schema
 */
function generateCreateTableSQL(tableName: string, schema: any): string {
  const columns: string[] = [];
  
  // This is a simplified version - in a real implementation you'd need to
  // introspect the actual PostgreSQL schema or use Drizzle's schema inspection
  const columnMappings: Record<string, string> = {
    'serial': 'SERIAL PRIMARY KEY',
    'text': 'TEXT',
    'integer': 'INTEGER',
    'boolean': 'BOOLEAN',
    'doublePrecision': 'DOUBLE PRECISION',
    'timestamp': 'TIMESTAMP',
  };

  let createSQL = `-- Create table: ${tableName}\n`;
  createSQL += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
  
  // Add basic columns based on common patterns
  switch (tableName) {
    case 'products':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "short_description" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "discount_price" DOUBLE PRECISION,
  "category" TEXT NOT NULL,
  "sku" TEXT,
  "image_url" TEXT NOT NULL,
  "image_urls" TEXT[],
  "thumbnail_url" TEXT,
  "local_image_paths" TEXT[],
  "video_url" TEXT,
  "farmer_id" INTEGER NOT NULL,
  "stock_quantity" INTEGER NOT NULL DEFAULT 100,
  "featured" BOOLEAN DEFAULT false,
  "naturally_grown" BOOLEAN DEFAULT false,
  "chemical_free" BOOLEAN DEFAULT false,
  "premium_quality" BOOLEAN DEFAULT false,
  "meta_title" TEXT,
  "meta_description" TEXT,
  "slug" TEXT,
  "enable_share_buttons" BOOLEAN DEFAULT true,
  "enable_whatsapp_share" BOOLEAN DEFAULT true,
  "enable_facebook_share" BOOLEAN DEFAULT true,
  "enable_instagram_share" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'farmers':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "story" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "farm_name" TEXT,
  "certification_status" TEXT DEFAULT 'none',
  "certification_details" TEXT,
  "farm_size" TEXT,
  "experience_years" INTEGER,
  "website" TEXT,
  "social_media" TEXT,
  "bank_account" TEXT,
  "pan_number" TEXT,
  "aadhar_number" TEXT,
  "image_url" TEXT NOT NULL,
  "featured" BOOLEAN DEFAULT false,
  "verified" BOOLEAN DEFAULT false,
  "active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'carts':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'cart_items':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "cart_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1`;
      break;
      
    case 'testimonials':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL,
  "image_initials" TEXT NOT NULL`;
      break;
      
    case 'newsletter_subscriptions':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "agreed_to_terms" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'orders':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "session_id" TEXT NOT NULL,
  "payment_id" TEXT,
  "total" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "shipping_address" TEXT NOT NULL,
  "billing_address" TEXT,
  "payment_method" TEXT NOT NULL DEFAULT 'razorpay',
  "discount_id" INTEGER,
  "cancellation_reason" TEXT,
  "delivered_at" TIMESTAMP,
  "trackingId" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'order_items':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL`;
      break;
      
    case 'product_reviews':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "order_id" INTEGER NOT NULL,
  "customer_name" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL,
  "review_text" TEXT NOT NULL,
  "verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'contact_messages':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'unread',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'users':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" user_role NOT NULL DEFAULT 'user',
  "email_verified" BOOLEAN DEFAULT false,
  "verification_token" TEXT,
  "reset_token" TEXT,
  "reset_token_expiry" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'payments':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "razorpay_payment_id" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL,
  "method" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'subscriptions':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "razorpay_subscription_id" TEXT NOT NULL,
  "plan_name" TEXT NOT NULL,
  "status" subscription_status NOT NULL DEFAULT 'active',
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'team_members':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "profile_image_url" TEXT NOT NULL,
  "display_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'discounts':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "type" discount_type NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "min_purchase" DOUBLE PRECISION DEFAULT 0,
  "usage_limit" INTEGER DEFAULT 0,
  "per_user" BOOLEAN DEFAULT false,
  "used" INTEGER DEFAULT 0,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "status" discount_status NOT NULL DEFAULT 'active',
  "applicable_products" TEXT DEFAULT 'all',
  "applicable_categories" TEXT DEFAULT 'all',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'discount_usage':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "discount_id" INTEGER NOT NULL,
  "user_id" INTEGER,
  "order_id" INTEGER,
  "session_id" TEXT,
  "used_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    case 'site_settings':
      createSQL += `  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT,
  "type" TEXT NOT NULL DEFAULT 'text',
  "description" TEXT,
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()`;
      break;
      
    default:
      createSQL += `  "id" SERIAL PRIMARY KEY`;
  }
  
  createSQL += `\n);\n\n`;
  return createSQL;
}

/**
 * Generate INSERT statements for table data
 */
function generateInsertSQL(tableName: string, data: any[]): string {
  if (!data || data.length === 0) {
    return `-- No data for table: ${tableName}\n\n`;
  }

  let insertSQL = `-- Insert data for table: ${tableName}\n`;
  
  for (const row of data) {
    const columns = Object.keys(row);
    const values = columns.map(col => {
      const value = row[col];
      
      if (value === null || value === undefined) {
        return 'NULL';
      }
      
      if (typeof value === 'string') {
        // Escape single quotes and wrap in quotes
        return `'${value.replace(/'/g, "''")}'`;
      }
      
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      
      if (value instanceof Date) {
        return `'${value.toISOString()}'`;
      }
      
      if (Array.isArray(value)) {
        // Handle PostgreSQL arrays
        const arrayValues = value.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : v);
        return `'{${arrayValues.join(',')}}'`;
      }
      
      return value;
    });
    
    const columnList = columns.map(col => `"${col}"`).join(', ');
    const valueList = values.join(', ');
    
    insertSQL += `INSERT INTO "${tableName}" (${columnList}) VALUES (${valueList});\n`;
  }
  
  insertSQL += '\n';
  return insertSQL;
}

/**
 * Export entire database to SQL file
 */
export async function exportDatabase(): Promise<string> {
  try {
    console.log('Starting database export...');
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_export_${timestamp}.sql`;
    const filepath = path.join(exportsDir, filename);
    
    let sqlContent = `-- PostgreSQL Database Export
-- Generated on: ${new Date().toISOString()}
-- HarvestDirect E-commerce Platform Database Dump

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs first
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'shipping');
CREATE TYPE discount_status AS ENUM ('active', 'scheduled', 'expired', 'disabled');

`;

    // Define tables in dependency order
    const tablesInfo: TableInfo[] = [
      { tableName: 'farmers', schema: farmers, data: [] },
      { tableName: 'products', schema: products, data: [] },
      { tableName: 'carts', schema: carts, data: [] },
      { tableName: 'cart_items', schema: cartItems, data: [] },
      { tableName: 'testimonials', schema: testimonials, data: [] },
      { tableName: 'newsletter_subscriptions', schema: newsletterSubscriptions, data: [] },
      { tableName: 'users', schema: users, data: [] },
      { tableName: 'discounts', schema: discounts, data: [] },
      { tableName: 'orders', schema: orders, data: [] },
      { tableName: 'order_items', schema: orderItems, data: [] },
      { tableName: 'product_reviews', schema: productReviews, data: [] },
      { tableName: 'contact_messages', schema: contactMessages, data: [] },
      { tableName: 'payments', schema: payments, data: [] },
      { tableName: 'subscriptions', schema: subscriptions, data: [] },
      { tableName: 'team_members', schema: teamMembers, data: [] },
      { tableName: 'discount_usage', schema: discountUsage, data: [] },
      { tableName: 'site_settings', schema: siteSettings, data: [] },
    ];

    // Fetch data for each table
    console.log('Fetching data from tables...');
    
    for (const tableInfo of tablesInfo) {
      try {
        const data = await db.select().from(tableInfo.schema);
        tableInfo.data = data;
        console.log(`Fetched ${data.length} records from ${tableInfo.tableName}`);
      } catch (error) {
        console.error(`Error fetching data from ${tableInfo.tableName}:`, error);
        tableInfo.data = [];
      }
    }

    // Generate CREATE TABLE statements
    sqlContent += '-- Create Tables\n';
    for (const tableInfo of tablesInfo) {
      sqlContent += generateCreateTableSQL(tableInfo.tableName, tableInfo.schema);
    }

    // Add foreign key constraints
    sqlContent += `-- Add Foreign Key Constraints
ALTER TABLE "products" ADD CONSTRAINT "fk_products_farmer" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id");
ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "carts"("id");
ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_discount" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id");
ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "product_reviews" ADD CONSTRAINT "fk_reviews_product" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "product_reviews" ADD CONSTRAINT "fk_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "product_reviews" ADD CONSTRAINT "fk_reviews_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "discount_usage" ADD CONSTRAINT "fk_discount_usage_discount" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id");
ALTER TABLE "discount_usage" ADD CONSTRAINT "fk_discount_usage_user" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "discount_usage" ADD CONSTRAINT "fk_discount_usage_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id");

`;

    // Generate INSERT statements
    sqlContent += '-- Insert Data\n';
    for (const tableInfo of tablesInfo) {
      if (tableInfo.data.length > 0) {
        sqlContent += generateInsertSQL(tableInfo.tableName, tableInfo.data);
      }
    }

    // Add sequences reset
    sqlContent += `-- Reset sequences to current max values
SELECT setval('farmers_id_seq', COALESCE((SELECT MAX(id) FROM farmers), 1));
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval('carts_id_seq', COALESCE((SELECT MAX(id) FROM carts), 1));
SELECT setval('cart_items_id_seq', COALESCE((SELECT MAX(id) FROM cart_items), 1));
SELECT setval('testimonials_id_seq', COALESCE((SELECT MAX(id) FROM testimonials), 1));
SELECT setval('newsletter_subscriptions_id_seq', COALESCE((SELECT MAX(id) FROM newsletter_subscriptions), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('discounts_id_seq', COALESCE((SELECT MAX(id) FROM discounts), 1));
SELECT setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 1));
SELECT setval('order_items_id_seq', COALESCE((SELECT MAX(id) FROM order_items), 1));
SELECT setval('product_reviews_id_seq', COALESCE((SELECT MAX(id) FROM product_reviews), 1));
SELECT setval('contact_messages_id_seq', COALESCE((SELECT MAX(id) FROM contact_messages), 1));
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));
SELECT setval('subscriptions_id_seq', COALESCE((SELECT MAX(id) FROM subscriptions), 1));
SELECT setval('team_members_id_seq', COALESCE((SELECT MAX(id) FROM team_members), 1));
SELECT setval('discount_usage_id_seq', COALESCE((SELECT MAX(id) FROM discount_usage), 1));
SELECT setval('site_settings_id_seq', COALESCE((SELECT MAX(id) FROM site_settings), 1));

-- Database export completed successfully
-- Total tables exported: ${tablesInfo.length}
-- Export file: ${filename}
`;

    // Write to file
    fs.writeFileSync(filepath, sqlContent, 'utf8');
    
    console.log(`Database export completed successfully!`);
    console.log(`Export file: ${filepath}`);
    console.log(`File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
    
    return filepath;
    
  } catch (error) {
    console.error('Database export failed:', error);
    throw error;
  }
}

/**
 * Export specific table to SQL
 */
export async function exportTable(tableName: string): Promise<string> {
  try {
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${tableName}_export_${timestamp}.sql`;
    const filepath = path.join(exportsDir, filename);
    
    // Get table schema mapping
    const schemaMap: Record<string, any> = {
      'farmers': farmers,
      'products': products,
      'carts': carts,
      'cart_items': cartItems,
      'testimonials': testimonials,
      'newsletter_subscriptions': newsletterSubscriptions,
      'users': users,
      'discounts': discounts,
      'orders': orders,
      'order_items': orderItems,
      'product_reviews': productReviews,
      'contact_messages': contactMessages,
      'payments': payments,
      'subscriptions': subscriptions,
      'team_members': teamMembers,
      'discount_usage': discountUsage,
      'site_settings': siteSettings,
    };
    
    const schema = schemaMap[tableName];
    if (!schema) {
      throw new Error(`Table ${tableName} not found in schema`);
    }
    
    const data = await db.select().from(schema);
    
    let sqlContent = `-- PostgreSQL Table Export: ${tableName}
-- Generated on: ${new Date().toISOString()}

`;
    
    sqlContent += generateCreateTableSQL(tableName, schema);
    sqlContent += generateInsertSQL(tableName, data);
    
    fs.writeFileSync(filepath, sqlContent, 'utf8');
    
    console.log(`Table ${tableName} exported successfully to ${filepath}`);
    return filepath;
    
  } catch (error) {
    console.error(`Export failed for table ${tableName}:`, error);
    throw error;
  }
}