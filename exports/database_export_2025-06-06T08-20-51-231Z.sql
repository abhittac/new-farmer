-- PostgreSQL Database Export
-- Generated on: 2025-06-06T08:20:51.231Z
-- HarvestDirect E-commerce Platform Database Dump

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs first
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'shipping');
CREATE TYPE discount_status AS ENUM ('active', 'scheduled', 'expired', 'disabled');

-- Create Tables
-- Create table: farmers
CREATE TABLE IF NOT EXISTS "farmers" (
  "id" SERIAL PRIMARY KEY,
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
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: products
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
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
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: carts
CREATE TABLE IF NOT EXISTS "carts" (
  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: cart_items
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" SERIAL PRIMARY KEY,
  "cart_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1
);

-- Create table: testimonials
CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL,
  "image_initials" TEXT NOT NULL
);

-- Create table: newsletter_subscriptions
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "agreed_to_terms" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" user_role NOT NULL DEFAULT 'user',
  "email_verified" BOOLEAN DEFAULT false,
  "verification_token" TEXT,
  "reset_token" TEXT,
  "reset_token_expiry" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: discounts
CREATE TABLE IF NOT EXISTS "discounts" (
  "id" SERIAL PRIMARY KEY,
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
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
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
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: order_items
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL
);

-- Create table: product_reviews
CREATE TABLE IF NOT EXISTS "product_reviews" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "order_id" INTEGER NOT NULL,
  "customer_name" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL,
  "review_text" TEXT NOT NULL,
  "verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: contact_messages
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'unread',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: payments
CREATE TABLE IF NOT EXISTS "payments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "razorpay_payment_id" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL,
  "method" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "razorpay_subscription_id" TEXT NOT NULL,
  "plan_name" TEXT NOT NULL,
  "status" subscription_status NOT NULL DEFAULT 'active',
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: team_members
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "profile_image_url" TEXT NOT NULL,
  "display_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: discount_usage
CREATE TABLE IF NOT EXISTS "discount_usage" (
  "id" SERIAL PRIMARY KEY,
  "discount_id" INTEGER NOT NULL,
  "user_id" INTEGER,
  "order_id" INTEGER,
  "session_id" TEXT,
  "used_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table: site_settings
CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT,
  "type" TEXT NOT NULL DEFAULT 'text',
  "description" TEXT,
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add Foreign Key Constraints
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

-- Insert Data
-- Insert data for table: farmers
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (2, 'Lakshmi Devi', 'lakshmi.devi@agronet.in', '+91-8765432109', 'Tea Cultivator', 'Our tea gardens thrive at 6000 feet elevation. The morning mist and perfect climate create the distinct character in every leaf we harvest by hand.', 'Nilgiris, Tamil Nadu', 'Devi Tea Gardens', 'certified', NULL, '12 acres', 25, NULL, NULL, NULL, NULL, NULL, 'https://pixabay.com/get/gae3d38b07190d697793fd7d01e876b28496baff2cf281fa756e51eecc418e9dda7cdd247f005e8fc859028007113f663e0723d4857a5b483c852219399a8923a_1280.jpg', true, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (3, 'Venkatesh Reddy', 'venkatesh.reddy@ricefields.co', '+91-7654321098', 'Heritage Rice Farmer', 'I preserve traditional rice varieties that modern agriculture has forgotten. Each grain contains our ancestors'' wisdom and nourishment that commercial farming can''t replicate.', 'Wayanad, Kerala', 'Reddy Heritage Rice Farm', 'organic', NULL, '8 acres', 12, NULL, NULL, NULL, NULL, NULL, 'https://pixabay.com/get/g0ba1640eedee6bdf5ad6b6117bf0b7b84521a685adee8d47660daa2a4504c2a08706d88cebe0d1a34dc974c80dcf0f1ff6c55e25b5671e134fe9678b2ad2f8af_1280.jpg', true, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (4, 'Anand Sharma', 'anand.sharma@spicegardens.in', '+91-6543210987', 'Organic Spice Farmer', 'My grandfather taught me that healthy soil creates healthy spices. We use ancient companion planting techniques that naturally repel pests while enhancing flavor.', 'Munnar, Kerala', 'Sharma Organic Spice Farm', 'certified', NULL, '6 acres', 18, NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1613395053164-e8e39ad5ba14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (5, 'Priya Nair', 'priya.nair@grainworld.com', '+91-5432109876', 'Sustainable Grain Farmer', 'After seeing what industrial farming did to neighboring lands, I committed to preserving traditional methods. Our grains take longer to grow but carry exceptional flavor and nutrition.', 'Palakkad, Kerala', 'Nair Sustainable Grains', 'pending', NULL, '4 acres', 8, NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1531946903299-4fa4c650b2e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (6, 'Ravi Patel', 'ravi.patel@moringafarms.in', '+91-4321098765', 'Moringa Cultivator', 'We''ve grown moringa for generations, long before it became known as a superfood. Our farming practices focus on maximizing nutrition rather than yield or appearance.', 'Mysore, Karnataka', 'Patel Moringa Estate', 'none', NULL, '3 acres', 10, NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1556760544-74068565f05c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', false, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (1, 'Rajesh', 'rajesh.kumar@farmmail.com', '+91-9876543210', 'Coffee & Spice Farmer', 'For three generations, my family has grown coffee and spices in harmony with nature. We believe the best flavors come when we respect the earth''s rhythms.', 'Coorg, Karnataka', 'Kumar Coffee Plantation', 'organic', NULL, '5 acres', 15, NULL, NULL, NULL, NULL, NULL, 'https://pixabay.com/get/g4b89ff49760958c4d2f84e04fe9e73ecb93257571eb75020184483c3482da4a225891842c320392206d47885193937c600f393589664ae26e434a5e878953b13_1280.jpg', true, true, true, '2025-05-26T12:01:47.641Z', '2025-05-26T12:01:47.676Z');
INSERT INTO "farmers" ("id", "name", "email", "phone", "specialty", "story", "location", "farmName", "certificationStatus", "certificationDetails", "farmSize", "experienceYears", "website", "socialMedia", "bankAccount", "panNumber", "aadharNumber", "imageUrl", "featured", "verified", "active", "createdAt", "updatedAt") VALUES (7, 'Deepak Kumar Gupta', 'deepakinfo997@gmail.com', '8758058919', 'Coffee & Spice Farmer', 'new story of a farmer', 'Bihar', '', 'none', '', '', NULL, '', '', '', '', '', 'https://m.media-amazon.com/images/I/51lOObUZi0L._AC_UF1000,1000_QL80_DpWeblab_.jpg', true, false, true, '2025-06-02T19:29:54.190Z', '2025-06-02T19:29:54.190Z');

-- Insert data for table: products
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (1, 'Mountain Coffee Beans', 'Hand-picked arabica beans from 5000ft elevation, sun-dried and small-batch roasted.', 'Hand-picked arabica beans from 5000ft elevation, sun-dried and small-batch roasted.', 15, 10, 'Coffee & Tea', 'SDF-HGH-GF', 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', '{"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}', NULL, NULL, 'https://www.youtube.com/watch?v=2ipr5drgUQA', 1, 150, true, true, false, true, 'zxzcxzc', 'czczcx', 'product', false, false, false, true, '2025-06-02T15:02:00.952Z', '2025-06-05T05:48:15.463Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (5, 'Premium Tea Leaves', 'Tender top leaves hand-plucked from high-altitude tea gardens for exceptional aroma and flavor.', 'Tender top leaves hand-plucked from high-altitude tea gardens for exceptional aroma and flavor.', 14.75, NULL, 'Coffee & Tea', NULL, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', NULL, NULL, NULL, NULL, 2, 90, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (9, 'Organic Dry Corn', 'Sun-dried, non-GMO corn kernels grown using traditional farming methods.', 'Sun-dried, non-GMO corn kernels grown using traditional farming methods.', 5.95, NULL, 'Grains', NULL, 'https://images.unsplash.com/photo-1588260693059-0c352a2f9905?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', NULL, NULL, NULL, NULL, 3, 130, false, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (10, 'Highland White Pepper', 'Subtle, aromatic white peppercorns cultivated at high elevations for a delicate flavor profile.', 'Subtle, aromatic white peppercorns cultivated at high elevations for a delicate flavor profile.', 10.25, NULL, 'Spices', NULL, 'https://images.unsplash.com/photo-1635178802105-86bfb6a2b7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', NULL, NULL, NULL, NULL, 1, 70, false, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (11, 'Dark Forest Coffee', 'Robust, dark-roasted coffee grown in the shade of ancient forest canopies.', 'Robust, dark-roasted coffee grown in the shade of ancient forest canopies.', 13.75, NULL, 'Coffee & Tea', NULL, 'https://images.unsplash.com/photo-1559525839-d9acfd03200f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', NULL, NULL, NULL, NULL, 1, 85, false, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (12, 'Traditional Brown Rice', 'Unpolished, nutrient-rich brown rice grown using ancient farming techniques.', 'Unpolished, nutrient-rich brown rice grown using ancient farming techniques.', 8.95, NULL, 'Grains', NULL, 'https://images.unsplash.com/photo-1622621746668-59fb299bc4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', NULL, NULL, NULL, NULL, 3, 120, false, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (7, 'Pure Moringa Leaves', 'Naturally dried moringa leaves packed with nutrients, grown without chemicals in mineral-rich soil.', 'Naturally dried moringa leaves packed with nutrients, grown without chemicals in mineral-rich soil.', 8.25, NULL, 'Others', NULL, 'https://m.media-amazon.com/images/I/51lOObUZi0L._AC_UF1000,1000_QL80_DpWeblab_.jpg', NULL, NULL, NULL, NULL, 2, 75, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-02T15:02:00.952Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (8, 'Areca Catechu', 'Traditional, naturally grown areca nuts harvested at optimal ripeness for authentic flavor.', 'Traditional, naturally grown areca nuts harvested at optimal ripeness for authentic flavor.', 10.5, NULL, 'Others', NULL, 'https://m.media-amazon.com/images/I/51lOObUZi0L._AC_UF1000,1000_QL80_DpWeblab_.jpg', NULL, NULL, NULL, NULL, 1, 59, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-04T16:26:27.412Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (6, 'Organic Ragi', 'Nutrient-rich finger millet grown using traditional dryland farming techniques for optimal nutrition', 'Nutrient-rich finger millet grown using traditional dryland farming techniques for optimal nutrition.', 6.95, NULL, 'Grains', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSriZVVLdiHf7RT4W3UAIwmxG7R56cevLUIAQ&s', NULL, NULL, NULL, NULL, 3, 109, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-04T16:26:27.258Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (4, 'Heirloom Rice', 'Ancient grain variety cultivated in terraced paddies using traditional methods for exceptional flavo', 'Ancient grain variety cultivated in terraced paddies using traditional methods for exceptional flavor.', 7.5, NULL, 'Grains', NULL, 'https://news.grainpro.com/hs-fs/hubfs/15388486202_1eac022edd_o.jpg?width=2832&name=15388486202_1eac022edd_o.jpg', NULL, NULL, NULL, NULL, 3, 144, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-04T16:33:15.050Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (3, 'Premium Cardamom', 'Large, intensely aromatic green cardamom pods grown in virgin forest shade.', 'Large, intensely aromatic green cardamom pods grown in virgin forest shade.', 9.25, NULL, 'Spices', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw0_V32zsrNkbG3xdFG7EwGVReUIhRJrdcfQ&s', NULL, NULL, NULL, NULL, 1, 84, true, false, false, false, NULL, NULL, NULL, true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-05T05:42:35.131Z');
INSERT INTO "products" ("id", "name", "shortDescription", "description", "price", "discountPrice", "category", "sku", "imageUrl", "imageUrls", "thumbnailUrl", "localImagePaths", "videoUrl", "farmerId", "stockQuantity", "featured", "naturallyGrown", "chemicalFree", "premiumQuality", "metaTitle", "metaDescription", "slug", "enableShareButtons", "enableWhatsappShare", "enableFacebookShare", "enableInstagramShare", "createdAt", "updatedAt") VALUES (2, 'Jeetu', 'Bold, aromatic peppercorns from heritage vines, traditionally sun-dried to preserve natural oils.', 'Bold, aromatic peppercorns from heritage vines, traditionally sun-dried to preserve natural oils.', 100, 50, 'Spices', 'SDF-HGH-GF-TY', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPVnUgGP6ADE_fnololFjuynqQOuCrCdwS1w&s', '{"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPVnUgGP6ADE_fnololFjuynqQOuCrCdwS1w&s
https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}', NULL, NULL, 'https://www.youtube.com/watch?v=bqlmu-hX_XA', 3, 117, true, false, false, false, 'zxzcxzc', 'zxzcxzc', 'product123', true, true, true, true, '2025-06-02T15:02:00.952Z', '2025-06-05T05:42:35.298Z');

-- Insert data for table: carts
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (2, '96eb1a6c-604f-4728-8ca9-5098ebf9e4e9', '2025-05-22T13:36:41.245Z', '2025-05-22T13:36:41.245Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (4, '309a31e7-4a58-4209-b8ed-cd7767eddd7c', '2025-05-22T13:52:20.676Z', '2025-05-22T13:52:20.676Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (5, '6a41568e-0d9d-4ca2-9dba-f5a2c65f6053', '2025-05-22T13:57:02.559Z', '2025-05-22T13:57:02.696Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (6, 'dff344f5-83fb-41e9-8e20-0d676cdc0b91', '2025-05-22T14:06:18.276Z', '2025-05-22T14:06:18.413Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (7, '60eba409-204d-4285-a4e6-d404e27fb85f', '2025-05-22T14:14:56.266Z', '2025-05-22T14:14:56.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (8, '308e0970-3094-4133-88b6-8b208153c353', '2025-05-22T14:52:30.955Z', '2025-05-22T14:52:31.101Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (9, '6105e523-29f2-4c80-bde2-c78cad2e9c41', '2025-05-23T03:49:52.761Z', '2025-05-23T03:49:52.871Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (10, 'ce50f6a8-e9cc-4a24-86cd-4989ed9e5ae0', '2025-05-23T03:53:01.404Z', '2025-05-23T03:53:01.404Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (11, 'a58122ef-8d45-4acb-9dc4-003c478289e6', '2025-05-23T03:55:19.891Z', '2025-05-23T03:55:19.891Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (12, 'df1bb164-1773-4014-b6f6-9d5c8911559a', '2025-05-23T04:00:40.621Z', '2025-05-23T04:00:40.768Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (13, 'db253d84-57d6-444c-9dee-358395044b30', '2025-05-23T04:52:50.679Z', '2025-05-23T04:52:50.679Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (14, 'fcf60777-37e6-4653-b36e-35c1c7ac1629', '2025-05-23T11:20:51.570Z', '2025-05-23T11:20:51.669Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (15, 'b8455ce0-eca0-4f3e-8844-519e3dfee483', '2025-05-24T10:07:44.178Z', '2025-05-24T10:07:44.295Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (16, '75a93155-d221-4243-b2ba-310d66fa01ec', '2025-05-24T10:07:47.128Z', '2025-05-24T10:07:47.216Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (17, 'b16da7a7-4700-4b13-89ac-f02d9a1266f4', '2025-05-24T10:07:49.927Z', '2025-05-24T10:07:50.015Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (18, '52bb1042-d3af-48ee-8b21-5fbdc29db28b', '2025-05-24T10:10:50.077Z', '2025-05-24T10:10:50.077Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (19, '38491e18-fbb6-4a80-a4b3-a514a178252e', '2025-05-24T10:11:44.407Z', '2025-05-24T10:11:44.407Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (20, '811add44-3930-4712-bcf3-4a70370b959e', '2025-05-24T10:11:54.167Z', '2025-05-24T10:11:54.167Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (21, '6f34ec9f-fccc-458b-8523-9b6a837ea591', '2025-05-24T10:17:38.288Z', '2025-05-24T10:17:38.288Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (22, '3021434f-4205-4de7-91d1-d541c8c11691', '2025-05-24T10:21:17.138Z', '2025-05-24T10:21:17.138Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (23, '7e0c541b-f785-4662-9de3-df693c32280b', '2025-05-24T10:25:19.579Z', '2025-05-24T10:25:19.579Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (24, '9278691b-983f-46f5-b754-34299ca454d2', '2025-05-24T10:53:00.434Z', '2025-05-24T10:53:00.434Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (25, '23034ab2-edf8-493a-9971-a84013579458', '2025-05-24T10:53:09.975Z', '2025-05-24T10:53:10.030Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (26, 'f13f1f98-0aac-4975-a0db-5d6b3e53b25b', '2025-05-24T10:53:49.085Z', '2025-05-24T10:53:49.152Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (27, 'd3a89107-e4f1-42ab-8957-919ecf6fad72', '2025-05-24T10:53:51.300Z', '2025-05-24T10:53:51.352Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (28, 'f2367ea2-b73c-4663-9598-75ddeccde6f3', '2025-05-24T11:13:03.486Z', '2025-05-24T11:13:03.486Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (29, '1b9ac10c-d663-459c-97e3-bad40f9819b5', '2025-05-24T15:04:17.562Z', '2025-05-24T15:04:17.562Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (30, 'a9ee2634-ea74-4ddc-93b1-e9fd86e184e0', '2025-05-24T16:15:19.519Z', '2025-05-24T16:15:19.519Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (31, '760da534-2b18-403f-a474-9409304f59c8', '2025-05-24T16:27:47.008Z', '2025-05-24T16:27:47.008Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (32, '27954e6e-3114-434b-aa0f-bce94bf6cc03', '2025-05-24T16:28:01.288Z', '2025-05-24T16:28:01.288Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (33, 'e954c28f-239a-432d-b972-a3722f487219', '2025-05-24T16:28:13.671Z', '2025-05-24T16:28:13.671Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (34, '456affc7-5917-4210-b113-6c917970067f', '2025-05-24T16:28:18.032Z', '2025-05-24T16:28:18.032Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (35, '2c48656b-e851-449a-b8b4-4d453af51a12', '2025-05-24T16:28:27.466Z', '2025-05-24T16:28:27.466Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (36, '9ee1c2c9-0f88-44ea-a871-3bf6538a6812', '2025-05-24T16:28:33.567Z', '2025-05-24T16:28:33.567Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (37, 'e9370dab-5dc6-40ed-97a6-c74f4cd4e07a', '2025-05-24T16:29:41.936Z', '2025-05-24T16:29:41.936Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (38, '4daeb1c6-b836-46af-92f4-44d987acccb6', '2025-05-24T16:29:53.480Z', '2025-05-24T16:29:53.480Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (39, '2c745c7a-4b45-4339-86f6-f35932716bf9', '2025-05-24T16:33:17.887Z', '2025-05-24T16:33:17.887Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (40, '5f2d3fbe-1c09-495f-9a38-73804dbfc305', '2025-05-24T16:33:25.548Z', '2025-05-24T16:33:25.665Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (41, 'f3e04515-80bc-4ded-8724-2d5933a1c4df', '2025-05-24T16:34:27.800Z', '2025-05-24T16:34:27.800Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (42, 'c1d0923b-248f-4855-9b19-10729df454e7', '2025-05-24T16:37:41.041Z', '2025-05-24T16:37:41.041Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (43, '7e869bfb-5c2e-4aca-8022-995d8d3bd8d9', '2025-05-24T16:37:55.506Z', '2025-05-24T16:37:55.506Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (44, '35b8fce7-f5b5-46b5-aaed-794f8566f2f1', '2025-05-24T16:38:06.347Z', '2025-05-24T16:38:06.347Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (45, 'aa3ec0a2-66e4-42c5-921f-5214aabe2ed9', '2025-05-24T16:39:25.666Z', '2025-05-24T16:39:25.994Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (46, 'c5605a3a-f5ca-468f-97b5-0f40c9b2cf43', '2025-05-24T16:39:32.399Z', '2025-05-24T16:39:32.494Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (47, 'ba2f744d-021f-4f36-a991-a94860da378e', '2025-05-24T16:53:17.138Z', '2025-05-24T16:53:17.138Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (48, '206b3e14-85e8-4e1a-baed-4848d1b5b7ca', '2025-05-24T16:53:18.833Z', '2025-05-24T16:53:18.833Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (49, 'cc105b40-9a4f-4259-b0e3-453e65543f8e', '2025-05-24T16:53:37.058Z', '2025-05-24T16:53:37.058Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (50, '64c76538-0424-45e1-9948-ffc277c3b6b9', '2025-05-24T16:53:37.173Z', '2025-05-24T16:53:37.173Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (51, '7c6b39a3-ad7d-4327-8a7c-d85fc2ff2133', '2025-05-24T16:54:08.266Z', '2025-05-24T16:54:08.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (52, '7642436f-4af6-4382-9035-a74bd3b26cd6', '2025-05-24T16:54:29.098Z', '2025-05-24T16:54:29.098Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (53, 'b3112ea7-a4c9-4c53-af37-0a0cdb79dc59', '2025-05-24T16:54:40.561Z', '2025-05-24T16:54:40.561Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (54, '9b66dcdf-682f-4de1-b343-f311ecc55be2', '2025-05-25T04:17:04.153Z', '2025-05-25T04:17:04.153Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (55, 'e3610c05-694b-47b6-acbd-cc8e7a73de54', '2025-05-25T04:17:14.035Z', '2025-05-25T04:17:14.035Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (56, '7afd3713-804f-4533-be01-1aeacdff6842', '2025-05-25T04:17:45.126Z', '2025-05-25T04:17:45.235Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (57, '59ab8f90-c32f-4d33-9d23-fac8f631f71d', '2025-05-25T04:20:44.758Z', '2025-05-25T04:20:44.758Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (58, '5b3e50dd-2f49-422a-b42a-9390273ae497', '2025-05-25T04:20:51.826Z', '2025-05-25T04:20:51.826Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (59, '088dccb3-4864-405e-94c6-b6fa57e44912', '2025-05-25T04:21:07.799Z', '2025-05-25T04:21:07.799Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (60, '8e940286-528e-472c-b75f-132a17ffa718', '2025-05-25T04:26:29.458Z', '2025-05-25T04:26:29.458Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (61, '5219f4cf-159d-4971-a1b1-5dee1069d7a1', '2025-05-25T04:27:52.759Z', '2025-05-25T04:27:52.759Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (62, 'cfe53457-dcd3-4c93-9448-26977bda210a', '2025-05-25T04:27:53.655Z', '2025-05-25T04:27:53.655Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (63, 'e3a69fe8-e972-4165-86f7-c440f087d719', '2025-05-25T04:28:29.382Z', '2025-05-25T04:28:29.382Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (64, '51601eac-87d0-4d18-8552-aa1101d7f82f', '2025-05-25T04:29:12.467Z', '2025-05-25T04:29:12.467Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (65, '0191901e-8644-42cc-ab7a-ad388c76b250', '2025-05-25T04:29:30.770Z', '2025-05-25T04:29:30.770Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (66, '3accfb2e-d247-4e00-becf-ecf21c9fe9fb', '2025-05-25T04:48:10.195Z', '2025-05-25T04:48:10.195Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (67, 'f93bb26d-aab4-4ce6-8baf-c5ae1a7f1939', '2025-05-25T04:48:17.652Z', '2025-05-25T04:48:17.652Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (68, '0735eceb-fd9c-489e-a89b-179a1cd1f4af', '2025-05-25T04:50:22.711Z', '2025-05-25T04:50:22.711Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (69, 'cea03be6-279a-4cf7-aa28-b0ed4fd1e68b', '2025-05-25T04:50:28.091Z', '2025-05-25T04:50:28.091Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (70, '5c8b8d12-dd6b-4c43-8aff-33870dbf2c09', '2025-05-25T04:50:51.506Z', '2025-05-25T04:50:51.614Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (71, '7866e00e-6cb4-4170-b336-da45cf20e885', '2025-05-25T04:51:46.053Z', '2025-05-25T04:51:46.053Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (72, 'a220ff53-f625-46d7-bab7-c0524ecf0b83', '2025-05-25T04:52:10.355Z', '2025-05-25T04:52:10.453Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (73, 'fef0446f-a15b-4c64-8565-91c4a2d5c477', '2025-05-25T04:55:27.191Z', '2025-05-25T04:55:27.191Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (74, '4b22a005-197c-40f1-9ce7-53f4af8b8b5b', '2025-05-25T04:56:16.749Z', '2025-05-25T04:56:16.749Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (75, 'ea3a3b44-5a35-4aa7-b1e8-f8c75b4af03d', '2025-05-25T04:56:16.920Z', '2025-05-25T04:56:16.920Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (76, '69aba619-38a1-4da3-9b8c-f115b077abe1', '2025-05-25T04:56:20.364Z', '2025-05-25T04:56:20.364Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (77, 'ad538f77-c194-44a4-82f7-a6930c72eda2', '2025-05-25T04:56:22.900Z', '2025-05-25T04:56:22.900Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (78, 'e09cd72e-3799-4083-ae0f-94ade98256ee', '2025-05-25T04:56:38.950Z', '2025-05-25T04:56:39.054Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (79, '588a3059-64e1-414a-a4a1-14a341f96333', '2025-05-25T05:14:47.565Z', '2025-05-25T05:14:47.565Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (80, '3da8940f-8d9f-4fdf-8ebe-d4a0c07b8615', '2025-05-25T06:11:07.975Z', '2025-05-25T06:11:07.975Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (81, 'baf02e4f-3d47-472a-9721-235185055b3f', '2025-05-25T06:16:52.230Z', '2025-05-25T06:16:52.230Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (82, '9e273747-ec52-465b-89d8-aa14eaca68e4', '2025-05-25T06:23:47.987Z', '2025-05-25T06:23:47.987Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (83, '6a220417-e888-48b3-85d3-f819a530ad1b', '2025-05-25T06:24:03.782Z', '2025-05-25T06:24:03.782Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (84, 'cadbe6e6-6829-4235-b02c-a264522e7bf1', '2025-05-25T06:24:51.232Z', '2025-05-25T06:24:51.232Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (85, '307cae87-7a41-432d-b873-3618f0cfc089', '2025-05-25T06:24:59.730Z', '2025-05-25T06:24:59.730Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (86, '4d3b79ca-eb9b-4c9e-b29f-882862981de4', '2025-05-25T06:25:24.774Z', '2025-05-25T06:25:24.774Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (87, '87cad22a-1a52-4376-ac3a-9d32e9cbec38', '2025-05-25T06:25:35.489Z', '2025-05-25T06:25:35.489Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (1, '499a99b4-ca14-4ffe-9f29-facd1fad07ba', '2025-05-22T13:35:41.342Z', '2025-06-02T14:50:37.531Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (88, 'd4b6d1ef-2305-4a4c-9a09-eb9169984c19', '2025-05-25T06:25:51.822Z', '2025-05-25T06:25:51.822Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (89, 'c8efb515-97c5-43f6-847f-84669184a6c9', '2025-05-25T06:26:00.973Z', '2025-05-25T06:26:00.973Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (90, 'c87d8f88-5581-4f6e-84e4-ca3ccad36acc', '2025-05-25T06:26:09.897Z', '2025-05-25T06:26:09.897Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (91, '76b62db6-4742-4e44-bc0e-970201c2f00e', '2025-05-25T06:33:05.743Z', '2025-05-25T06:33:05.743Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (92, '1b8f5750-e5b9-46b8-9b4a-7f3e432cdd93', '2025-05-25T06:40:55.399Z', '2025-05-25T06:40:55.399Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (93, '199ee475-c67c-43aa-b144-de1afb6404bd', '2025-05-25T06:41:06.889Z', '2025-05-25T06:41:06.889Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (94, 'df40dbc2-c493-4021-ae21-bc4fde4fcb8c', '2025-05-25T06:42:55.689Z', '2025-05-25T06:42:55.689Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (95, '59b7d3b3-af94-486e-bd82-a57048c6d94e', '2025-05-25T06:43:07.554Z', '2025-05-25T06:43:07.554Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (96, '6a668daf-253e-496b-9619-d004f9642e03', '2025-05-25T06:43:39.363Z', '2025-05-25T06:43:39.363Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (97, 'f25e6f64-0849-4beb-a7ee-4be7bef8006c', '2025-05-25T06:44:05.498Z', '2025-05-25T06:44:05.498Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (98, 'b467edc1-e121-462d-83c2-e40684b7d78b', '2025-05-25T06:44:17.193Z', '2025-05-25T06:44:17.193Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (99, 'c68b3962-f1bf-4d23-aa36-f171e17df92b', '2025-05-25T06:44:57.680Z', '2025-05-25T06:44:57.680Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (100, 'e983ff45-a898-425f-8bb4-9783f9413451', '2025-05-25T06:45:14.489Z', '2025-05-25T06:45:14.489Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (101, '97179625-1d3b-4513-bb30-fb95cd3cc4c8', '2025-05-25T06:47:33.037Z', '2025-05-25T06:47:33.037Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (102, '87c1724a-3d5f-48a1-835a-da0833d38d0f', '2025-05-25T06:47:49.591Z', '2025-05-25T06:47:49.591Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (103, 'f5c43259-f8d9-44c1-9438-e3479aec12d7', '2025-05-25T06:51:31.426Z', '2025-05-25T06:51:31.426Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (104, '8a938359-ea45-4c34-b7fe-833320660eaf', '2025-05-25T06:51:46.914Z', '2025-05-25T06:51:46.914Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (105, '31c51759-009d-4130-8d05-3c491f5bb3c3', '2025-05-25T06:52:05.528Z', '2025-05-25T06:52:05.528Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (106, '9909f52f-a056-4a8c-875e-48bae042078c', '2025-05-25T07:00:10.471Z', '2025-05-25T07:00:10.471Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (107, '36e19149-a919-475b-af5d-f01060db97e9', '2025-05-25T07:00:14.559Z', '2025-05-25T07:00:14.559Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (108, 'd0aed6c4-7a44-4173-b337-8ee0bf80b211', '2025-05-25T07:00:30.174Z', '2025-05-25T07:00:30.174Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (109, '53546357-a698-4ca2-a4d2-8e055fdf320d', '2025-05-25T07:00:51.651Z', '2025-05-25T07:00:51.651Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (110, 'ed2f3274-2fac-4b87-9706-3e63c07dad19', '2025-05-25T07:01:01.382Z', '2025-05-25T07:01:01.382Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (111, '24f48645-f5cb-4719-b67c-3400a1e7c5e2', '2025-05-25T07:01:25.291Z', '2025-05-25T07:01:25.291Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (112, '98066122-e5e3-4e18-99d5-32d26a4badde', '2025-05-25T07:01:46.939Z', '2025-05-25T07:01:46.939Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (113, 'caba97d6-85d7-4a2c-8760-7499b1b7f693', '2025-05-25T07:02:03.626Z', '2025-05-25T07:02:03.626Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (114, '84e39de3-75f6-4385-b5d6-f7c7066d19ea', '2025-05-25T07:02:31.506Z', '2025-05-25T07:02:31.506Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (115, '81fdaeb7-9fa9-4be8-ae51-f3951ac309c4', '2025-05-25T07:02:37.046Z', '2025-05-25T07:02:37.046Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (116, '805c3a4c-f891-4479-9157-f8576909f455', '2025-05-25T07:02:48.122Z', '2025-05-25T07:02:48.122Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (117, 'ddcaf3c0-c5cd-451d-a763-599dc31210c9', '2025-05-25T07:02:55.156Z', '2025-05-25T07:02:55.156Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (118, '9892b3eb-127d-4cf4-9aef-bc9cccbe9111', '2025-05-25T07:03:08.734Z', '2025-05-25T07:03:08.734Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (119, '8b460e53-3d9a-47c6-990c-46b685a05077', '2025-05-25T07:08:49.670Z', '2025-05-25T07:08:49.670Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (120, '41a37457-3880-43c8-84b1-99acf4b0b68a', '2025-05-25T07:09:26.650Z', '2025-05-25T07:09:26.650Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (121, '215ad797-1960-4eb0-890a-10bd8ed0bb37', '2025-05-25T07:09:35.896Z', '2025-05-25T07:09:35.896Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (122, 'dfbdaba2-ba65-4179-a8db-155e0b675d97', '2025-05-25T07:10:25.547Z', '2025-05-25T07:10:25.547Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (123, '7b3d7584-d4a5-40d1-8174-52c76576a1cb', '2025-05-25T08:24:36.466Z', '2025-05-25T08:24:36.466Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (124, '8fff003c-63ab-4dcd-bb5d-a1ba021fa10b', '2025-05-25T08:25:14.702Z', '2025-05-25T08:25:14.702Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (125, '0081e5a8-acbb-42ed-afbf-2173a70fea36', '2025-05-25T08:26:01.384Z', '2025-05-25T08:26:01.384Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (126, 'c0dce8f2-99a7-4c8b-9fa8-285f119e0af2', '2025-05-25T08:26:08.534Z', '2025-05-25T08:26:08.534Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (127, 'b8c0468c-16ed-4ca1-9ce4-223137f966b2', '2025-05-25T08:26:28.219Z', '2025-05-25T08:26:28.219Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (128, '5bebcf50-41c3-4949-8750-1c3ffa7af57b', '2025-05-25T08:26:40.398Z', '2025-05-25T08:26:40.398Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (129, '0acf4f90-afd8-4303-b775-5f56e4383fb1', '2025-05-25T08:27:09.813Z', '2025-05-25T08:27:09.917Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (130, '652fc62a-9c29-4dea-8292-c35588f1b3d7', '2025-05-25T08:27:15.235Z', '2025-05-25T08:27:15.325Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (131, '3a155f31-a060-46c8-8b3a-1cba5cf889f6', '2025-05-25T08:27:27.969Z', '2025-05-25T08:27:27.969Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (132, 'cf2baf0c-a775-410e-b2df-870105763401', '2025-05-25T09:33:04.659Z', '2025-05-25T09:33:04.659Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (133, 'ef2ad00d-a857-4ba5-b238-7836f4a878ad', '2025-05-25T09:33:22.817Z', '2025-05-25T09:33:22.817Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (134, '394b609b-3ad7-4318-b664-26d6dae53a46', '2025-05-25T09:33:51.528Z', '2025-05-25T09:33:51.528Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (135, '3e0380e3-d3d6-4ef3-bffc-3d987ddabfe1', '2025-05-25T09:34:46.144Z', '2025-05-25T09:34:46.144Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (136, '7c9ef496-234f-4857-82a8-ef269535468c', '2025-05-25T09:37:06.124Z', '2025-05-25T09:37:06.124Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (137, '60c3455d-3d9e-41aa-ae34-cb871d27ba8d', '2025-05-25T09:37:40.650Z', '2025-05-25T09:37:40.650Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (138, 'f60803d1-cd49-41e3-880a-dea1ec0a2a08', '2025-05-25T09:37:48.906Z', '2025-05-25T09:37:48.906Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (139, 'b8a3d82e-a939-4691-bf98-228965df27f9', '2025-05-25T09:41:40.171Z', '2025-05-25T09:41:40.171Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (140, '5de8d3a5-8c9a-4efd-a86f-2bcfdd3ae28a', '2025-05-25T09:41:43.845Z', '2025-05-25T09:41:43.845Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (141, '9e935e40-3a67-4b55-9fc2-fb9692e434b1', '2025-05-25T09:45:31.182Z', '2025-05-25T09:45:31.182Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (142, 'f9ba77ed-0cbd-46ba-8afa-53177ffabd3f', '2025-05-25T09:45:36.613Z', '2025-05-25T09:45:36.613Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (143, '1af44f61-f079-4b75-9490-bcca14b99f37', '2025-05-25T09:45:55.720Z', '2025-05-25T09:45:55.720Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (144, '1cf76ac8-bfbb-4ce9-b9d3-ef557b3a26af', '2025-05-25T09:46:12.427Z', '2025-05-25T09:46:12.427Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (145, '0feab592-82af-40f0-9995-bea6129a9606', '2025-05-25T09:47:40.472Z', '2025-05-25T09:47:40.472Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (146, '46334017-06f0-45df-a3ed-000188338c35', '2025-05-25T09:54:35.272Z', '2025-05-25T09:54:35.272Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (147, '66ce1bbb-eede-4e5c-bf44-4d532a6dacdf', '2025-05-25T09:54:41.328Z', '2025-05-25T09:54:41.328Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (148, '7eeeff56-93a4-4c22-9625-4fe7bcc1265d', '2025-05-25T09:56:34.835Z', '2025-05-25T09:56:34.835Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (149, '60ec26ac-eeee-4ff6-ba60-5d6e6da87864', '2025-05-25T09:56:40.341Z', '2025-05-25T09:56:40.341Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (150, 'b9ff4c54-dd04-4b84-ac27-2beac701f202', '2025-05-25T09:56:44.046Z', '2025-05-25T09:56:44.046Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (151, '2631c77d-9ab7-4c9b-97fb-e4374bd8144c', '2025-05-25T09:56:54.091Z', '2025-05-25T09:56:54.091Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (152, '26ab3f2d-1e2a-4f70-af09-9a3a7329db48', '2025-05-25T10:01:46.816Z', '2025-05-25T10:01:46.816Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (153, '62e3ed5a-2ad1-44c1-94ff-bad30ee51ce9', '2025-05-25T10:03:50.284Z', '2025-05-25T10:03:50.284Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (154, '72da1356-14d7-4c51-8013-a16d29247575', '2025-05-25T10:05:30.582Z', '2025-05-25T10:05:30.582Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (155, '67ae02d7-0ebb-4853-a42f-604bb20c0a19', '2025-05-25T10:05:37.813Z', '2025-05-25T10:05:37.813Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (156, '8f5370bf-bf82-47c4-a2c9-691ce3f5e764', '2025-05-25T10:06:14.031Z', '2025-05-25T10:06:14.031Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (157, '406f39d6-1e74-4431-9e86-10ee62031d5d', '2025-05-25T10:06:26.271Z', '2025-05-25T10:06:26.271Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (158, 'e2f3bc43-9a6d-4c90-8569-03c280b69afe', '2025-05-25T10:08:53.832Z', '2025-05-25T10:08:53.832Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (159, 'ea2078a7-1eb6-4d6f-8539-573d5a46a125', '2025-05-25T10:10:41.858Z', '2025-05-25T10:10:41.858Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (160, '2cb9e6e4-b6e6-4f9a-a9c6-1a7ece1446d8', '2025-05-25T10:11:11.351Z', '2025-05-25T10:11:11.351Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (161, '93eed35e-0e6d-409a-aa54-b350747ff7e6', '2025-05-25T10:11:16.350Z', '2025-05-25T10:11:16.350Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (162, 'b3dd583b-2b1b-4de8-9f8f-8bd36a02606d', '2025-05-25T10:12:21.980Z', '2025-05-25T10:12:21.980Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (163, 'e6b0de1b-249a-468c-a2bb-dbe7640f785a', '2025-05-25T10:12:28.266Z', '2025-05-25T10:12:28.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (164, 'cfc1ea55-6d14-41b4-b94e-3d5f2789ec7a', '2025-05-25T14:06:49.144Z', '2025-05-25T14:06:49.144Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (165, '6b798c2c-9bd6-4ce2-abe8-b8900f91754d', '2025-05-25T14:08:34.063Z', '2025-05-25T14:08:34.063Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (166, 'f978ca32-3f7b-4751-8d28-2f9934acd0c2', '2025-05-25T14:10:39.029Z', '2025-05-25T14:10:39.029Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (167, '9118f99e-837f-4ccd-8cf4-63d243729ea5', '2025-05-25T14:11:19.520Z', '2025-05-25T14:11:19.520Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (168, '72efbadf-46ce-4581-94c6-c904db4b189a', '2025-05-25T14:12:13.107Z', '2025-05-25T14:12:13.107Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (169, 'fb08cc00-39bd-439c-a617-e95d828066ee', '2025-05-25T14:16:27.524Z', '2025-05-25T14:16:27.524Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (170, '1e77d71b-bf7e-4ac7-a400-d761c82d75c4', '2025-05-25T14:17:04.236Z', '2025-05-25T14:17:04.236Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (171, '4a325df0-217d-4440-8080-1b614d18d695', '2025-05-25T14:17:10.763Z', '2025-05-25T14:17:10.763Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (172, '4a4ff522-53d2-4f2a-8b4d-cd662a44e60d', '2025-05-25T14:17:34.136Z', '2025-05-25T14:17:34.136Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (173, 'a362c24d-b6b7-4d3c-8fb4-31108bea454a', '2025-05-25T14:18:20.106Z', '2025-05-25T14:18:20.106Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (174, 'f8bc1e76-4eaa-4fba-9b86-b5e30dca678e', '2025-05-25T14:18:57.339Z', '2025-05-25T14:18:57.339Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (175, 'b4422b87-d38f-4988-95e7-92749515511a', '2025-05-25T14:23:35.670Z', '2025-05-25T14:23:35.670Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (176, '2a124c63-131b-4652-8905-eaaa151874b7', '2025-05-25T14:23:46.143Z', '2025-05-25T14:23:46.143Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (177, '7ac36875-a094-47db-853a-d6b97fe83466', '2025-05-25T14:23:53.919Z', '2025-05-25T14:23:53.919Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (178, '05a23357-94d5-40d0-9891-76bc31eeeef5', '2025-05-26T04:11:48.978Z', '2025-05-26T04:11:48.978Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (179, '2b11c1b1-3011-421d-91b9-1bb73232edfe', '2025-05-26T04:13:15.339Z', '2025-05-26T04:13:15.339Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (180, '9d274d7a-0c9b-49f7-9785-d61253fe31ec', '2025-05-26T04:31:28.577Z', '2025-05-26T04:31:28.577Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (181, 'c448c62d-a03b-4577-ae24-43b4ae8719dd', '2025-05-26T06:43:29.650Z', '2025-05-26T06:43:29.650Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (182, 'e1323981-9e20-4457-a4e8-eacebcb1a8b2', '2025-05-26T06:55:26.611Z', '2025-05-26T06:55:26.611Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (183, '0d5534d2-d285-497e-a1cc-ea0f6e5686ba', '2025-05-26T06:56:11.973Z', '2025-05-26T06:56:11.973Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (184, '85693a48-2339-4064-a3d4-09d7d38ff53c', '2025-05-26T06:58:05.141Z', '2025-05-26T06:58:05.141Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (185, '41545f39-d26f-4767-8c09-9d72311a63ce', '2025-05-26T06:59:54.611Z', '2025-05-26T06:59:54.611Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (186, 'f7925e28-57ce-4fee-beb1-80f66e5d8ca2', '2025-05-26T07:04:58.541Z', '2025-05-26T07:04:58.541Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (187, '4089042c-58f6-422a-9a82-5e5ffeffd881', '2025-05-26T07:05:28.950Z', '2025-05-26T07:05:28.950Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (188, '3cf5ec99-42fe-4fab-9594-a3203761ab88', '2025-05-26T07:05:33.962Z', '2025-05-26T07:05:33.962Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (189, '09637777-dfa7-480b-b94d-fb48285183fa', '2025-05-26T07:05:35.904Z', '2025-05-26T07:05:35.904Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (190, '7fd7b19e-5c79-4e72-bf4e-3ec198b902a9', '2025-05-26T07:16:19.856Z', '2025-05-26T07:16:19.856Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (191, '7fe112a6-7a8e-40a7-a521-2423ce853b0f', '2025-05-26T07:18:05.184Z', '2025-05-26T07:18:05.184Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (192, 'd5fcb762-d068-48b4-9e86-55dfc3194a0d', '2025-05-26T07:57:37.000Z', '2025-05-26T07:57:37.000Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (193, 'd5e927f1-53a9-4d28-ae41-872d2c47c5c9', '2025-05-26T08:05:04.266Z', '2025-05-26T08:05:04.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (194, 'b8c5c9de-ec79-4a4e-8f15-2b326c1368d6', '2025-05-26T08:34:46.006Z', '2025-05-26T08:34:46.006Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (195, '2204b3c6-2122-4066-ae6e-e97d9182bfe7', '2025-05-26T08:50:53.401Z', '2025-05-26T08:50:53.401Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (196, '515cd2eb-0964-4b8d-a7c2-b64f53c75d14', '2025-05-26T08:56:26.346Z', '2025-05-26T08:56:26.346Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (197, '22821142-45f8-4834-9bab-eed79771437d', '2025-05-26T08:59:27.876Z', '2025-05-26T08:59:27.876Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (198, 'd4aa4bf7-198e-4fb5-a977-a186af85d24a', '2025-05-26T09:00:45.748Z', '2025-05-26T09:00:45.748Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (199, 'ebe74b8a-3607-48b9-b5dd-dbdcd00e1001', '2025-05-26T09:01:27.660Z', '2025-05-26T09:01:27.660Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (200, '6960c460-06c0-4184-821f-4d6fcfe93ac0', '2025-05-26T09:03:05.811Z', '2025-05-26T09:03:05.811Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (201, '5af7c284-88c6-4415-8cc4-500d3934d4a1', '2025-05-26T09:03:23.835Z', '2025-05-26T09:03:23.835Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (202, '7e25ae2a-54a3-4b8f-bcca-f1bbb265368d', '2025-05-26T09:09:04.940Z', '2025-05-26T09:09:04.940Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (203, 'cc51dac1-d68e-4658-b8f5-69826cda3b48', '2025-05-26T09:41:21.929Z', '2025-05-26T09:41:21.929Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (204, '689f01cb-bd0f-44ff-9c53-5e82ada90cb6', '2025-05-26T11:54:06.021Z', '2025-05-26T11:54:06.021Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (205, '676aaa23-d9af-49f5-aa9b-eb12c0df96f7', '2025-05-26T11:54:22.266Z', '2025-05-26T11:54:22.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (206, 'e3f625e1-dc2b-4ef7-a324-2929748f1cbb', '2025-05-26T12:02:05.980Z', '2025-05-26T12:02:05.980Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (207, '1a8370fe-c283-4eee-9466-bb083e3cfe21', '2025-05-26T12:03:35.169Z', '2025-05-26T12:03:35.169Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (208, 'c9aba606-a413-4b19-9da0-f779299ff398', '2025-05-26T12:03:44.208Z', '2025-05-26T12:03:44.208Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (209, '8a488d58-3cf8-41fd-955f-4b2312679fcb', '2025-05-26T12:03:47.237Z', '2025-05-26T12:03:47.237Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (210, '1da90831-555d-4943-b6bd-e6003e179f30', '2025-05-26T12:06:20.317Z', '2025-05-26T12:06:20.317Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (211, '31b11e4d-8f4c-470b-953c-6ce1c988158b', '2025-05-26T12:09:37.340Z', '2025-05-26T12:09:37.340Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (212, '354c2b9a-849f-4815-bb85-b8208edd13b9', '2025-05-26T12:09:46.356Z', '2025-05-26T12:09:46.356Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (213, '8015bf14-c23c-4a57-97ef-2f20be165376', '2025-05-26T13:33:10.684Z', '2025-05-26T13:33:10.760Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (214, 'c2e6bd0b-fcf0-423a-9efc-011cfc7b3567', '2025-05-26T13:33:12.442Z', '2025-05-26T13:33:12.509Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (215, '0eff1e17-c970-40d8-91cb-0446cc655769', '2025-05-26T13:33:14.578Z', '2025-05-26T13:33:14.632Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (216, '1c4d2115-5d13-4c57-85e5-3262cc60e055', '2025-05-26T17:34:03.513Z', '2025-05-26T17:34:03.513Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (217, '2540660c-1cdf-4930-8f97-8070bad5f579', '2025-05-26T17:46:50.624Z', '2025-05-26T17:46:50.624Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (218, '4fca9272-a17a-415c-8dfe-69793d85a389', '2025-05-26T17:54:00.483Z', '2025-05-26T17:54:00.483Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (219, 'bc15edbb-c21f-4ab3-b66e-b98c43fc2c85', '2025-05-26T18:05:46.999Z', '2025-05-26T18:05:47.084Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (220, '5fde1f59-6c8d-4041-b0b7-597f6b80c471', '2025-05-26T18:08:12.420Z', '2025-05-26T18:08:12.420Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (221, 'b24e0b03-a3e3-445c-a8d5-57dd44d503b4', '2025-05-26T18:11:34.653Z', '2025-05-26T18:11:34.653Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (222, '0e2b8109-3a2a-49c4-8806-3e08b85e5e9c', '2025-05-27T01:44:21.918Z', '2025-05-27T01:44:21.918Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (223, '81bb57d2-fbaa-4879-a1af-1052442cf897', '2025-05-27T01:48:40.504Z', '2025-05-27T01:48:40.504Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (224, 'bd17970d-6d99-4a08-9047-f9c484db6755', '2025-05-27T01:48:53.282Z', '2025-05-27T01:48:53.282Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (225, '0dab04e3-11d3-4c6c-84cd-3d908e61f1f6', '2025-05-27T02:02:57.124Z', '2025-05-27T02:02:57.124Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (226, '1ea805ee-864d-4d40-98e1-f9ab9b7bcac3', '2025-05-27T02:05:03.718Z', '2025-05-27T02:05:03.718Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (227, 'bd7b86d4-5c90-4d81-8d0d-23af6e85ea09', '2025-05-27T03:20:57.650Z', '2025-05-27T03:20:57.650Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (228, 'f4e9dcdc-a73d-4b55-9b56-da2247770b57', '2025-05-27T04:03:45.782Z', '2025-05-27T04:03:45.782Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (229, '1db0da32-ab70-443a-a42f-9d629811996d', '2025-05-27T04:38:52.333Z', '2025-05-27T04:38:52.333Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (230, 'ee1197d0-6ecb-4b2d-a316-3bdc17eabd2b', '2025-05-27T04:39:02.267Z', '2025-05-27T04:39:02.267Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (231, '4297902a-39eb-4dc3-9d07-632c970a9bf0', '2025-05-27T04:39:05.804Z', '2025-05-27T04:39:05.804Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (232, '604107ba-7258-4c91-a22c-d70e9a9d9286', '2025-05-27T04:39:45.499Z', '2025-05-27T04:39:45.570Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (233, '5beb1ea7-12ef-4e43-a4b8-6e4cfe2dd1b9', '2025-05-27T04:54:11.503Z', '2025-05-27T04:54:11.503Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (234, 'c5850adf-1fd7-4663-9298-fa0dba7bbb51', '2025-05-27T04:56:10.288Z', '2025-05-27T04:56:10.288Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (235, '259cd9ff-b177-4039-8a17-24de9b6cf398', '2025-05-27T05:07:28.815Z', '2025-05-27T05:07:28.815Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (236, 'bbabf306-f64a-4833-aff3-aa393bfe6c36', '2025-05-27T05:09:20.074Z', '2025-05-27T05:09:20.074Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (237, '787633de-e5d3-4924-8197-fdd501f6e277', '2025-05-27T05:28:32.105Z', '2025-05-27T05:28:32.105Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (238, 'd81b69a2-f60d-4326-8020-399c6cdbb4cb', '2025-05-27T05:31:37.729Z', '2025-05-27T05:31:37.729Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (239, 'dd22d15b-eafe-454c-a3ae-5981a5d935f8', '2025-05-27T05:34:31.957Z', '2025-05-27T05:34:31.957Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (240, '008bf1c2-2b78-4e2c-b45b-7dc5abd7653e', '2025-05-27T05:48:33.905Z', '2025-05-27T05:48:33.905Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (241, 'ce7faadc-d372-4f2a-ae14-436a41b040e3', '2025-05-27T05:52:17.065Z', '2025-05-27T05:52:17.146Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (242, 'b061695b-53d1-40af-a26f-3cddbc95c7b7', '2025-05-27T05:58:58.418Z', '2025-05-27T05:58:58.486Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (243, '971ebd6b-462d-4406-913a-206ca7e15ae4', '2025-05-27T06:01:09.161Z', '2025-05-27T06:01:09.230Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (244, 'fbabb5cf-7626-44d1-9115-46b7e5b04d56', '2025-05-27T06:23:52.846Z', '2025-05-27T06:23:52.846Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (245, 'c728d6f0-ca99-4fea-ae37-c3bb823cd561', '2025-05-27T07:04:43.691Z', '2025-05-27T07:04:43.691Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (246, 'f3fb22d2-5b64-486b-856e-7b83d3946d9c', '2025-05-27T07:05:35.114Z', '2025-05-27T07:05:35.182Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (247, '0a3dbd45-6e8d-41de-9409-addedeabc9eb', '2025-05-27T07:05:45.554Z', '2025-05-27T07:05:45.554Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (248, 'dd29a5c8-fcb5-4bf6-87e5-ad1fbb3cd8fe', '2025-05-27T09:42:21.099Z', '2025-05-27T09:42:21.099Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (249, 'cec1077e-881b-4b0f-a33e-d75e9bf6ecdf', '2025-05-27T09:44:18.983Z', '2025-05-27T09:44:18.983Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (250, '2d609063-1661-4130-a70b-f960508b7b3d', '2025-05-27T09:56:38.693Z', '2025-05-27T09:56:38.693Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (251, 'a04c445f-3331-4f9e-9152-a1e5c97f977d', '2025-05-27T10:39:28.774Z', '2025-05-27T10:39:28.774Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (252, 'b4684238-16ac-4f50-8922-0fe9b6d9bcf2', '2025-05-27T11:06:30.708Z', '2025-05-27T11:06:30.708Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (253, '9df3915d-34c1-4dca-a3fd-603ea288e64b', '2025-05-27T13:41:20.025Z', '2025-05-27T13:41:20.025Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (254, 'ff652e1e-5b6f-4903-adf3-480366111866', '2025-05-28T03:14:03.832Z', '2025-05-28T03:14:03.832Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (255, '3e5b5b73-3f19-4d01-97e2-4976ce6270b9', '2025-05-28T03:15:06.036Z', '2025-05-28T03:15:06.036Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (256, '404fe4f2-acc8-47c1-b19c-2a60a081038f', '2025-05-28T03:16:24.289Z', '2025-05-28T03:16:24.289Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (257, '29fe5836-f446-4235-b873-d36fc82b15e7', '2025-05-28T03:17:41.618Z', '2025-05-28T03:17:41.618Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (258, 'ddf8ab23-7a68-4e4c-9919-e40d946fbd9b', '2025-05-28T03:19:17.288Z', '2025-05-28T03:19:17.288Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (259, '376d2c12-8dac-4142-840d-41b1c3eb361c', '2025-05-28T03:21:03.492Z', '2025-05-28T03:21:03.492Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (260, '6fa43c98-151f-477a-a268-13241f0dd016', '2025-05-29T11:55:41.266Z', '2025-05-29T11:55:41.266Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (261, '7062f0c7-8a4c-4ed4-879d-4134aad75d1d', '2025-05-29T11:55:52.278Z', '2025-05-29T11:55:52.278Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (262, 'abc91af6-b01f-4a1f-953d-71875d828713', '2025-05-29T11:56:08.019Z', '2025-05-29T11:56:08.019Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (263, '2e25111a-eb62-4525-8d65-bb9934e27813', '2025-05-29T11:56:54.826Z', '2025-05-29T11:56:54.826Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (264, '4750f562-6e23-4ff2-9764-9524feefe37d', '2025-05-29T12:04:26.885Z', '2025-05-29T12:04:26.885Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (265, '9fd0f9a2-f1bf-4ed1-a9a6-44ea145ae962', '2025-05-29T12:04:36.619Z', '2025-05-29T12:04:36.619Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (266, 'a9b3742a-27bd-4d3d-916b-8b27e4781b11', '2025-05-29T12:04:54.067Z', '2025-05-29T12:04:54.067Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (267, '4ea584ce-92ed-423a-8bd8-f1076c6ada5b', '2025-05-29T12:05:05.648Z', '2025-05-29T12:05:05.648Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (268, 'b604e799-aa2e-4ecf-936c-3f504084196e', '2025-05-29T12:06:38.116Z', '2025-05-29T12:06:38.116Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (269, 'c7788442-f40d-45e4-a629-05e8cecc6df5', '2025-05-29T12:06:47.111Z', '2025-05-29T12:06:47.111Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (270, 'e0702192-22f2-4db1-8cff-ca2765d6f944', '2025-05-29T12:07:14.830Z', '2025-05-29T12:07:14.830Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (271, '9573b9bb-8ef3-4330-a8a3-6f90f85a0779', '2025-05-29T12:07:43.544Z', '2025-05-29T12:07:43.544Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (272, '0859eaa7-ad7c-4aaf-9031-fa61b6964d7a', '2025-05-29T12:10:26.271Z', '2025-05-29T12:10:26.271Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (273, 'b2577b28-e2c1-4bb5-952d-2edd1686c9cc', '2025-05-29T12:11:28.406Z', '2025-05-29T12:11:28.406Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (287, 'd73c5a28-2ac8-4daa-97ca-0cf64c95aec4', '2025-06-04T16:52:40.582Z', '2025-06-04T16:52:40.582Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (274, 'a97a3cbb-5299-41c5-9cb0-a6bcd35e314e', '2025-05-29T12:22:38.505Z', '2025-05-29T12:22:38.505Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (275, '2ec974e4-d62b-44e0-9a9d-17474a27320b', '2025-05-29T12:30:41.678Z', '2025-05-29T12:30:41.678Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (3, 'da1c94f1-551c-4957-a3d5-765abe31cca6', '2025-05-22T13:38:05.871Z', '2025-06-05T05:42:35.472Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (288, 'a5ba5521-7a58-4593-9999-51b73ad25fa8', '2025-06-05T06:10:16.526Z', '2025-06-05T06:10:16.526Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (289, '45c2cdd8-ed81-461c-9105-6b6e273951bf', '2025-06-05T07:41:19.906Z', '2025-06-05T07:41:19.906Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (290, '6db5553a-d0dd-4815-87ac-2830bf28893e', '2025-06-05T10:26:51.390Z', '2025-06-05T10:35:18.141Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (291, 'e8db59d0-1fad-4119-a483-eae298bdbe3a', '2025-06-05T11:58:56.078Z', '2025-06-05T11:58:56.078Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (276, '5b50eb32-3b70-488d-994c-6db60a76de0e', '2025-05-29T12:57:02.277Z', '2025-05-29T12:57:02.277Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (277, '5912b93c-7ab4-4f54-a802-4240aef99335', '2025-05-31T04:13:15.899Z', '2025-05-31T04:13:15.899Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (278, '7105cea5-9616-4da3-b3a2-dc1018c58f78', '2025-05-31T04:52:35.736Z', '2025-05-31T04:52:35.736Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (279, '9e2fb9c8-a3fd-4519-b856-dd8e9ac1e875', '2025-05-31T11:07:55.378Z', '2025-05-31T11:07:55.378Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (280, '109c987c-61ad-4488-b95c-cf92eb237c2a', '2025-06-01T09:08:47.865Z', '2025-06-01T09:08:47.865Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (281, '4dfbdeef-31ea-4825-9caf-2ea792cf9fef', '2025-06-02T15:04:54.460Z', '2025-06-02T15:04:54.460Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (282, '4733f7b1-1026-4b82-8202-e9d742fa8288', '2025-06-02T19:05:34.034Z', '2025-06-02T19:05:34.034Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (283, '6bbdc4bb-5018-4249-b566-b9f20026fbbc', '2025-06-03T07:35:41.882Z', '2025-06-03T07:41:29.189Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (284, 'f768a3ce-d034-4c01-90dd-799625bcb701', '2025-06-03T17:34:56.656Z', '2025-06-03T17:34:56.656Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (285, '570a9dc4-d254-47bf-9e9c-9318da470f2c', '2025-06-03T18:26:33.812Z', '2025-06-03T18:26:33.812Z');
INSERT INTO "carts" ("id", "sessionId", "createdAt", "updatedAt") VALUES (286, '8cd3c6a1-cf48-4ac3-ac6c-50bab72a3cba', '2025-06-04T16:31:37.881Z', '2025-06-04T16:31:37.881Z');

-- Insert data for table: cart_items
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (1, 5, 5, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (2, 6, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (3, 8, 5, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (4, 9, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (5, 12, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (6, 14, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (7, 15, 2, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (8, 16, 3, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (9, 17, 4, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (10, 25, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (11, 26, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (12, 27, 2, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (13, 40, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (14, 45, 5, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (15, 46, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (16, 56, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (17, 70, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (18, 72, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (19, 78, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (20, 129, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (21, 130, 3, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (22, 213, 5, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (23, 214, 2, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (24, 215, 3, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (25, 219, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (26, 232, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (27, 241, 8, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (28, 242, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (29, 243, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (30, 246, 4, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (34, 1, 1, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (35, 1, 2, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (40, 1, 3, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (49, 283, 2, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (50, 283, 6, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (47, 283, 3, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (48, 283, 5, 1);
INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity") VALUES (58, 290, 1, 1);

-- Insert data for table: testimonials
INSERT INTO "testimonials" ("id", "name", "title", "content", "rating", "imageInitials") VALUES (1, 'Sarah K.', 'Coffee Enthusiast', 'I''ve been ordering the cardamom and coffee beans for over a year now. The difference in flavor compared to store-bought is remarkable. You can taste the care that goes into growing these products.', 5, 'SK');
INSERT INTO "testimonials" ("id", "name", "title", "content", "rating", "imageInitials") VALUES (2, 'Rahul M.', 'Home Chef', 'The rice varieties are exceptional. I''ve discovered flavors I never knew existed in rice! Knowing my purchase supports traditional farming methods makes it even better.', 5, 'RM');
INSERT INTO "testimonials" ("id", "name", "title", "content", "rating", "imageInitials") VALUES (3, 'Anita T.', 'Tea Connoisseur', 'I love the transparency about where each product comes from. The tea leaves have such a vibrant flavor and aroma that you just can''t find in commercial brands. Worth every penny!', 4.5, 'AT');
INSERT INTO "testimonials" ("id", "name", "title", "content", "rating", "imageInitials") VALUES (4, 'Deepa P.', 'Health Enthusiast', 'The moringa leaves have become a staple in my kitchen. Knowing they''re grown without chemicals gives me peace of mind, and the flavor is incomparable to anything I''ve found elsewhere.', 5, 'DP');

-- Insert data for table: newsletter_subscriptions
INSERT INTO "newsletter_subscriptions" ("id", "name", "email", "agreedToTerms", "createdAt") VALUES (1, 'Test User', 'test@example.com', true, '2025-06-02T19:38:23.497Z');
INSERT INTO "newsletter_subscriptions" ("id", "name", "email", "agreedToTerms", "createdAt") VALUES (2, 'Mountain Coffee Beans', 'deepakinfo997@gmail.com', true, '2025-06-02T19:44:20.521Z');
INSERT INTO "newsletter_subscriptions" ("id", "name", "email", "agreedToTerms", "createdAt") VALUES (3, NULL, 'rohit@gmail.com', true, '2025-06-02T19:50:38.352Z');
INSERT INTO "newsletter_subscriptions" ("id", "name", "email", "agreedToTerms", "createdAt") VALUES (4, 'pankaj', 'pankaj@gmail.com', true, '2025-06-02T19:50:56.415Z');
INSERT INTO "newsletter_subscriptions" ("id", "name", "email", "agreedToTerms", "createdAt") VALUES (5, 'Jeet', 'jeet@gmail.com', true, '2025-06-03T05:44:04.988Z');

-- Insert data for table: users
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (1, 'user@gmail.com', '$2b$10$U3IyyW3COqFukwFOPgwm2ekZzKQxREDbDg7BMoQTF1vb8voyr000K', 'New cat', 'user', true, '4ed68e18e56798d5e031eb1c8a99c00b7d1796cce576bd85344d23fdb9f6c36a', NULL, NULL, '2025-05-24T15:00:29.757Z', '2025-05-24T15:00:29.757Z');
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (2, 'poojanew2000@gmail.com', '$2b$10$rllrKIlRBaiQxUnXO9eeh.WZn.fdojD0gQMhjU3mKihzgpGsBPRdG', 'Test1234', 'user', true, '3aca9d257149393e5a983478d1044ea7787d33059c3484582d5e8e8e16ea20a1', NULL, NULL, '2025-05-24T15:01:34.258Z', '2025-05-24T15:01:34.258Z');
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (3, 'test@gmail.com', '$2b$10$rSOowvkm22ZQDYe9wRxn3epRgbLZmQQmQX8LPJI1YQoRAW0nZEtFW', 'Test User', 'user', true, NULL, NULL, NULL, '2025-05-24T15:05:57.985Z', '2025-05-24T15:05:57.985Z');
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (4, 'testuser@example.com', '$2b$10$4YRnEb7hocJpfDQS4jm2BeKM374D0w4ysHGygabIVMReUPPpiqdpG', 'Test User', 'user', true, NULL, NULL, NULL, '2025-05-24T16:19:31.258Z', '2025-05-24T16:19:31.258Z');
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (5, 'admin@example.com', '$2b$10$hvkzrOAfimB9M5aUNpU/uuji3HZqFp43nmygaYZBpa1o8fir60/OK', 'Admin User', 'admin', true, NULL, NULL, NULL, '2025-05-25T06:41:35.592Z', '2025-05-25T06:41:35.592Z');
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified", "verificationToken", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES (6, 'demo@harvestdirect.com', 'demo_password', 'Demo User', 'user', false, NULL, NULL, NULL, '2025-06-03T19:57:03.533Z', '2025-06-03T19:57:03.533Z');

-- Insert data for table: discounts
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (1, 'WELCOME20', 'percentage', 20, 'Welcome discount for new customers - 20% off first order', 50, 100, true, 0, '2025-05-01T00:00:00.000Z', '2025-12-31T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (2, 'SUMMER15', 'percentage', 15, 'Summer sale - 15% off on all products', 0, 0, false, 0, '2025-06-01T00:00:00.000Z', '2025-08-31T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (3, 'FREESHIP', 'shipping', 100, 'Free shipping on orders above ₹75', 75, 0, false, 0, '2025-05-15T00:00:00.000Z', '2025-12-15T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (4, 'COFFEELOV', 'percentage', 25, 'Coffee lovers special - 25% off on coffee products', 30, 50, false, 0, '2025-06-01T00:00:00.000Z', '2025-07-31T00:00:00.000Z', 'active', 'selected', 'Coffee & Tea', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (5, 'FLAT50', 'fixed', 50, 'Flat ₹50 off on orders above ₹200', 200, 200, true, 0, '2025-06-01T00:00:00.000Z', '2025-09-30T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (6, 'HARVEST10', 'percentage', 10, 'Harvest season special - 10% off all products', 0, 0, false, 0, '2025-07-01T00:00:00.000Z', '2025-09-30T00:00:00.000Z', 'scheduled', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (7, 'SPRING25', 'percentage', 25, 'Spring festival discount - 25% off', 100, 75, true, 0, '2025-03-01T00:00:00.000Z', '2025-04-30T00:00:00.000Z', 'expired', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (8, 'BIGORDER', 'fixed', 100, 'Big order discount - ₹100 off on orders above ₹500', 500, 0, false, 0, '2025-06-01T00:00:00.000Z', '2025-12-31T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T18:55:36.194Z', '2025-06-03T18:55:36.194Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (9, 'TESTCODE20', 'fixed', 20, 'Updated test discount code', 50, 100, false, 0, '2025-06-03T00:00:00.000Z', '2025-11-30T00:00:00.000Z', 'active', 'all', 'all', '2025-06-03T19:08:24.937Z', '2025-06-03T19:09:12.261Z');
INSERT INTO "discounts" ("id", "code", "type", "value", "description", "minPurchase", "usageLimit", "perUser", "used", "startDate", "endDate", "status", "applicableProducts", "applicableCategories", "createdAt", "updatedAt") VALUES (10, 'NEWUSER25', 'fixed', 25, 'efeer r wevr', 30, 2, true, 0, '2025-06-03T19:08:46.144Z', '2025-07-03T19:08:46.144Z', 'active', 'all', 'all', '2025-06-03T19:09:46.270Z', '2025-06-03T19:09:46.270Z');

-- Insert data for table: orders
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (3, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QakTFel6KSjmvN', 24.74, 'confirmed', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-05-29T12:42:42.690Z', '2025-05-29T12:42:42.690Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (1, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QakK9WBiQDemlH', 58.39, 'delivered', 'Default address', NULL, 'razorpay', NULL, NULL, '2025-05-27T12:47:25.485Z', '2025-05-29T12:34:09.204Z', '2025-05-29T12:34:09.204Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (2, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QakLjvjQ2QYD6V', 22.44, 'delivered', 'Default address', NULL, 'razorpay', NULL, NULL, '2025-05-24T12:47:29.061Z', '2025-05-29T12:35:36.252Z', '2025-05-29T12:35:36.252Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (4, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QcMomZrMxYCyyw', 28.69, 'delivered', 'Default address', NULL, 'razorpay', NULL, NULL, '2025-06-02T19:08:35.878Z', '2025-06-02T14:52:26.804Z', '2025-06-02T14:52:26.804Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (5, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_Qcbne0Md7EGfrg', 30.49, 'confirmed', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-06-03T05:31:47.767Z', '2025-06-03T05:31:47.767Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (6, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QcbqS2HSzpNoVh', 19.99, 'processing', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-06-03T05:34:26.366Z', '2025-06-03T05:34:26.366Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (7, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QdBUJyXIjhGpLx', 122.44, 'confirmed', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-06-04T16:26:27.100Z', '2025-06-04T16:26:27.100Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (8, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QdBbVFy3QMJnf8', 112.49, 'confirmed', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-06-04T16:33:14.891Z', '2025-06-04T16:33:14.891Z');
INSERT INTO "orders" ("id", "userId", "sessionId", "paymentId", "total", "status", "shippingAddress", "billingAddress", "paymentMethod", "discountId", "cancellationReason", "deliveredAt", "createdAt", "updatedAt") VALUES (9, 4, 'da1c94f1-551c-4957-a3d5-765abe31cca6', 'pay_QdP3IUf6bmxOOb', 114.24, 'shipped', 'Default address', NULL, 'razorpay', NULL, NULL, NULL, '2025-06-05T05:42:34.966Z', '2025-06-05T05:42:34.966Z');

-- Insert data for table: order_items
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (1, 1, 1, 3, 12.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (2, 1, 2, 1, 8.95);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (3, 1, 6, 1, 6.95);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (4, 2, 6, 1, 6.95);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (5, 2, 8, 1, 10.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (6, 3, 3, 1, 9.25);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (7, 3, 8, 1, 10.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (8, 4, 5, 1, 14.75);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (9, 4, 2, 1, 8.95);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (10, 5, 1, 1, 15);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (11, 5, 8, 1, 10.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (12, 6, 1, 1, 15);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (13, 7, 6, 1, 6.95);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (14, 7, 8, 1, 10.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (15, 7, 2, 1, 100);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (16, 8, 4, 1, 7.5);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (17, 8, 2, 1, 100);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (18, 9, 3, 1, 9.25);
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price") VALUES (19, 9, 2, 1, 100);

-- Insert data for table: product_reviews
INSERT INTO "product_reviews" ("id", "productId", "userId", "orderId", "customerName", "rating", "reviewText", "verified", "createdAt") VALUES (1, 5, 4, 4, 'Test User', 4, 'egf zdrfgsdghd', true, '2025-06-04T16:34:50.758Z');
INSERT INTO "product_reviews" ("id", "productId", "userId", "orderId", "customerName", "rating", "reviewText", "verified", "createdAt") VALUES (2, 2, 4, 4, 'Test User', 4, 'sThis is my rqating', true, '2025-06-04T16:40:52.471Z');
INSERT INTO "product_reviews" ("id", "productId", "userId", "orderId", "customerName", "rating", "reviewText", "verified", "createdAt") VALUES (3, 6, 4, 2, 'Test User', 1, 'Very Nice Product', true, '2025-06-05T05:43:32.509Z');

-- Insert data for table: contact_messages
INSERT INTO "contact_messages" ("id", "name", "email", "phone", "subject", "message", "status", "createdAt", "updatedAt") VALUES (1, 'Customer', 'customer@gmail.com', NULL, 'Products', 'I want to message.', 'resolved', '2025-06-02T19:55:51.930Z', '2025-06-02T20:01:33.897Z');
INSERT INTO "contact_messages" ("id", "name", "email", "phone", "subject", "message", "status", "createdAt", "updatedAt") VALUES (2, 'Jeet', 'jeet@gmail.com', NULL, 'Meeting', 'MeetingMeetingMeetingMeetingMeetingMeeting', 'resolved', '2025-06-03T05:44:47.048Z', '2025-06-03T05:45:06.157Z');

-- Insert data for table: payments
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (1, 4, NULL, 'pay_QZ2PFAmEoTEV0r', 17.49, 'INR', 'completed', NULL, '2025-05-25T04:57:24.327Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (2, 4, NULL, 'pay_QZqQSRdz1qlgIN', 15.49, 'INR', 'completed', NULL, '2025-05-27T05:53:21.034Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (3, 4, 1, 'pay_QakK9WBiQDemlH', 58.39, 'INR', 'completed', NULL, '2025-05-29T12:34:09.391Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (4, 4, 2, 'pay_QakLjvjQ2QYD6V', 22.44, 'INR', 'completed', NULL, '2025-05-29T12:35:36.375Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (5, 4, 3, 'pay_QakTFel6KSjmvN', 24.74, 'INR', 'completed', NULL, '2025-05-29T12:42:42.819Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (6, 4, 4, 'pay_QcMomZrMxYCyyw', 28.69, 'INR', 'completed', NULL, '2025-06-02T14:52:26.944Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (7, 4, 5, 'pay_Qcbne0Md7EGfrg', 30.49, 'INR', 'completed', NULL, '2025-06-03T05:31:47.920Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (8, 4, 6, 'pay_QcbqS2HSzpNoVh', 19.99, 'INR', 'completed', NULL, '2025-06-03T05:34:26.448Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (9, 4, 7, 'pay_QdBUJyXIjhGpLx', 122.44, 'INR', 'completed', NULL, '2025-06-04T16:26:27.630Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (10, 4, 8, 'pay_QdBbVFy3QMJnf8', 112.49, 'INR', 'completed', NULL, '2025-06-04T16:33:15.252Z');
INSERT INTO "payments" ("id", "userId", "orderId", "razorpayPaymentId", "amount", "currency", "status", "method", "createdAt") VALUES (11, 4, 9, 'pay_QdP3IUf6bmxOOb', 114.24, 'INR', 'completed', NULL, '2025-06-05T05:42:35.360Z');

-- Insert data for table: team_members
INSERT INTO "team_members" ("id", "name", "jobTitle", "description", "profileImageUrl", "displayOrder", "isActive", "createdAt", "updatedAt") VALUES (1, 'Deepak Kumar Gupta', 'New Job', 'xcc s sdvfgfgfg', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 1, true, '2025-06-02T20:40:28.928Z', '2025-06-02T20:40:28.928Z');

-- Insert data for table: site_settings
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (1, 'logo_url', NULL, 'text', 'Website logo URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (2, 'facebook_url', 'https://facebook.com/harvestdirect', 'text', 'Facebook page URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (3, 'instagram_url', 'https://instagram.com/harvestdirect', 'text', 'Instagram profile URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (4, 'twitter_url', 'https://twitter.com/harvestdirect', 'text', 'Twitter profile URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (5, 'linkedin_url', 'https://linkedin.com/company/harvestdirect', 'text', 'LinkedIn company page URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (6, 'youtube_url', 'https://youtube.com/@harvestdirect', 'text', 'YouTube channel URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (7, 'website_url', 'https://harvestdirect.com', 'text', 'Official website URL', '2025-06-03T19:20:36.751Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (15, 'site_name', 'HarvestDirect', 'text', 'Website name', '2025-06-03T19:40:07.136Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (16, 'site_tagline', 'scdsfsf', 'text', 'Website tagline', '2025-06-03T19:40:07.140Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (14, 'store_phone', '+918758058916', 'text', 'Store contact phone', '2025-06-03T19:40:07.188Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (18, 'site_logo', '', 'text', 'Website logo URL', '2025-06-03T19:40:07.191Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (17, 'store_address', '123 harvest lane', 'text', 'Store address', '2025-06-03T19:40:07.182Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (19, 'store_email', 'contact@harvestfarmer.com', 'text', 'Store contact email', '2025-06-03T19:40:07.196Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (20, 'store_city', 'farmers', 'text', 'Store city', '2025-06-03T19:40:07.596Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (21, 'store_state', 'Delhi', 'text', 'Store state', '2025-06-03T19:40:07.608Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (22, 'store_country', 'India', 'text', 'Store country', '2025-06-03T19:40:07.612Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (23, 'store_zip', '122001', 'text', 'Store zip code', '2025-06-03T19:40:07.613Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (8, 'social_instagram', 'https://www.instagram.com/', 'text', 'Instagram profile URL', '2025-06-03T19:40:07.660Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (9, 'social_facebook', '', 'text', 'Facebook page URL', '2025-06-03T19:40:07.658Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (11, 'social_twitter', '', 'text', 'Twitter profile URL', '2025-06-03T19:40:07.864Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (12, 'social_linkedin', '', 'text', 'LinkedIn company page URL', '2025-06-03T19:40:07.882Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (13, 'social_youtube', 'https://www.youtube.com/', 'text', 'YouTube channel URL', '2025-06-03T19:40:07.885Z');
INSERT INTO "site_settings" ("id", "key", "value", "type", "description", "updatedAt") VALUES (10, 'social_website', '', 'text', 'Official website URL', '2025-06-03T19:40:07.895Z');

-- Reset sequences to current max values
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
-- Total tables exported: 17
-- Export file: database_export_2025-06-06T08-20-51-231Z.sql
