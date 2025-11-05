-- Row Level Security (RLS) Policies for Multi-tenant E-commerce Platform
-- This migration enables RLS and creates security policies for all tables

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANTS RLS POLICIES
-- ============================================================================

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
-- TENANT_USERS RLS POLICIES
-- ============================================================================

-- Allow users to view tenant_users relationships they're part of
CREATE POLICY "Users can view their tenant relationships" ON tenant_users
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Allow tenant owners to create tenant_users relationships
CREATE POLICY "Owners can create tenant user relationships" ON tenant_users
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE owner_id = auth.uid()
    )
  );

-- Allow tenant owners and admins to update tenant_users relationships  
CREATE POLICY "Owners and admins can update tenant user relationships" ON tenant_users
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE owner_id = auth.uid()
    )
  );

-- Allow tenant owners to delete tenant_users relationships
CREATE POLICY "Owners can delete tenant user relationships" ON tenant_users
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE owner_id = auth.uid()
    )
  );

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
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- PRODUCTS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON products
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- PRODUCT VARIANTS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON product_variants
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CUSTOMERS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON customers
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CART ITEMS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON cart_items
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- ORDERS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON orders
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- ORDER LINE ITEMS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON order_line_items
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- DISCOUNTS RLS POLICIES
-- ============================================================================

CREATE POLICY "Tenant scoped access" ON discounts
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON tenant_payment_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.tenants TO supabase_auth_admin;
