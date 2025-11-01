-- Migration: Add product_type column to products table
-- Run this in your Supabase SQL Editor

-- Add the product_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'product_type'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN product_type VARCHAR(20) DEFAULT 'single' 
    CHECK (product_type IN ('single', 'variable', 'digital'));
    
    -- Add a comment to document the column
    COMMENT ON COLUMN products.product_type IS 'Type of product: single, variable (with variants), or digital (downloadable)';
  END IF;
END $$;

-- Also add digital_files column if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'digital_files'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN digital_files JSONB DEFAULT '[]';
    
    -- Add a comment to document the column
    COMMENT ON COLUMN products.digital_files IS 'Array of digital file objects for digital products';
  END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('product_type', 'digital_files')
ORDER BY column_name;
