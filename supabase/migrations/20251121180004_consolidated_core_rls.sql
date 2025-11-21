-- Consolidated Core RLS Policies
-- This migration enables RLS and creates comprehensive security policies for core tables
-- Tables: tenants, tenant_users, categories, products, product_variants, cart_items, discounts

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Note: orders, order_line_items, tenant_payment_settings, and platform_feature_flags
-- have their own dedicated RLS migrations for better organization

-- ============================================================================
-- TENANTS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view accessible tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can update their tenants" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can delete their tenants" ON tenants;
DROP POLICY IF EXISTS "Anonymous users can lookup active tenants by subdomain" ON tenants;
DROP POLICY IF EXISTS "Public select active tenants by subdomain" ON tenants;

-- Authenticated users can view accessible tenants
CREATE POLICY "Users can view accessible tenants" ON tenants
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND (
      owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM tenant_users tu 
        WHERE tu.tenant_id = tenants.id 
        AND tu.user_id = auth.uid() 
        AND tu.is_active = true
      )
    )
  );

-- Public/anonymous can lookup active tenants by subdomain (required for middleware)
CREATE POLICY "Public can lookup active tenants" ON tenants
  FOR SELECT 
  USING (is_active = true);

-- Owners can manage their tenants
CREATE POLICY "Owners can update their tenants" ON tenants
  FOR UPDATE 
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "Authenticated users can create tenants" ON tenants
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "Owners can delete their tenants" ON tenants
  FOR DELETE 
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid());

-- ============================================================================
-- TENANT PAYMENT SETTINGS RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view payment settings for their tenant" ON tenant_payment_settings
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update payment settings for their tenant" ON tenant_payment_settings
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- CATEGORIES RLS POLICIES
-- ============================================================================

-- Public category access (for storefront)
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tenant users can manage categories" ON categories
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- ============================================================================
-- PRODUCTS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant scoped access" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Tenant users can manage products" ON products;

-- Public can view active products (for storefront)
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Tenant users can manage products for their tenant
CREATE POLICY "Tenant users can manage products" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- ============================================================================
-- PRODUCT VARIANTS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant scoped access" ON product_variants;

-- Public can read product variants through products
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM products WHERE is_active = true
    )
  );

-- Tenant users can manage product variants for their products
CREATE POLICY "Tenant users can manage product variants" ON product_variants
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      product_id IN (
        SELECT id FROM products 
        WHERE tenant_id IN (
          SELECT id FROM tenants WHERE owner_id = auth.uid()
          UNION
          SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      product_id IN (
        SELECT id FROM products 
        WHERE tenant_id IN (
          SELECT id FROM tenants WHERE owner_id = auth.uid()
          UNION
          SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

-- ============================================================================
-- CART ITEMS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant scoped access" ON cart_items;

-- Public can manage cart items (guest checkout support)
CREATE POLICY "Public can manage cart items" ON cart_items
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================================================
-- DISCOUNTS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant scoped access" ON discounts;

-- Public can view active discounts
CREATE POLICY "Public can view active discounts" ON discounts
  FOR SELECT USING (is_active = true);

-- Tenant users can manage discounts for their tenant
CREATE POLICY "Tenant users can manage discounts" ON discounts
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators)
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Note: Orders, order_line_items, customers, and tenant_payment_settings
-- are handled by separate dedicated RLS migrations for better organization

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON tenant_payment_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.tenants TO supabase_auth_admin;
