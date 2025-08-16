-- Add unique constraint to SKU field and set discountPrice default to 0
ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_sku_unique UNIQUE (sku);

-- Update null discountPrice values to 0
UPDATE product_variants 
SET discount_price = 0 
WHERE discount_price IS NULL;

-- Set default value for discountPrice to 0 for future records
ALTER TABLE product_variants 
ALTER COLUMN discount_price SET DEFAULT 0;