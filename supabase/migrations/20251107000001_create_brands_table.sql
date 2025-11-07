-- Create brands table for product brands management
-- This migration adds a brands table to the existing database schema

-- Brands table
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title VARCHAR,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, slug)
);

-- Add brand_id column to products table
ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands(id);

-- Create index for better query performance
CREATE INDEX idx_brands_tenant_id ON brands(tenant_id);
CREATE INDEX idx_brands_slug ON brands(tenant_id, slug);
CREATE INDEX idx_brands_active ON brands(tenant_id, is_active);
CREATE INDEX idx_products_brand_id ON products(brand_id);

-- Add updated_at trigger for brands table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();