-- Migration: Make order_id and variant_id nullable in product_reviews table
-- This allows users to leave reviews without having made a purchase
-- Date: 2025-08-14

BEGIN;

-- Make order_id nullable
ALTER TABLE product_reviews ALTER COLUMN order_id DROP NOT NULL;

-- Make variant_id nullable  
ALTER TABLE product_reviews ALTER COLUMN variant_id DROP NOT NULL;

COMMIT;