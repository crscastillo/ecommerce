-- Migration: Add product_type and digital_files columns to products table
-- This enables support for single, variable, and digital product types

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
    COMMENT ON COLUMN products.product_type IS 'Type of product: single (standard), variable (with variants), or digital (downloadable)';
    
    RAISE NOTICE 'Added product_type column to products table';
  ELSE
    RAISE NOTICE 'product_type column already exists';
  END IF;
END $$;

-- Add the digital_files column if it doesn't exist
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
    COMMENT ON COLUMN products.digital_files IS 'Array of digital file objects for digital products. Format: [{"name": "file.pdf", "url": "storage_url", "size": 1024}]';
    
    RAISE NOTICE 'Added digital_files column to products table';
  ELSE
    RAISE NOTICE 'digital_files column already exists';
  END IF;
END $$;
