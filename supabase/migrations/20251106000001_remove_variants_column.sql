-- Migration: Remove variants column from products table
-- Date: 2025-11-06
-- Description: Remove the variants JSONB column from products table since we now use the product_variants table

-- Remove the variants column from the products table
ALTER TABLE public.products DROP COLUMN IF EXISTS variants;

-- Add a comment to document this change
COMMENT ON TABLE public.products IS 'Product catalog table. Variants are stored in the separate product_variants table.';