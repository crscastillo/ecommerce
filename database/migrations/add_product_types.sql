-- Add product type to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'single' CHECK (product_type IN ('single', 'variable', 'digital'));