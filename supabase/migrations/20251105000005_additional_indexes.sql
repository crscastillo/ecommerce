-- Additional indexes and optimizations
-- Date: 2025-11-05
-- Description: Add performance indexes and constraints

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_products_tenant_slug ON products(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_tenant_featured ON products(tenant_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_categories_tenant_slug ON categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_active ON categories(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_tenant ON product_variants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

-- Add any missing constraints or optimizations
-- This migration serves as a placeholder for any missing migration 20251105000005
-- and includes commonly needed performance improvements