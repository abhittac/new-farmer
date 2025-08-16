-- Make discountPrice nullable in product_variants table
ALTER TABLE product_variants 
ALTER COLUMN discount_price DROP NOT NULL,
ALTER COLUMN discount_price DROP DEFAULT;