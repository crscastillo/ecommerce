-- Fix RLS policies for proper tenant access
-- The previous policies relied on get_current_tenant_id() which doesn't work properly
-- Instead, we'll create policies that allow authenticated users to access data
-- when they provide the correct tenant_id through the application

-- First, drop all existing tenant-scoped policies
DROP POLICY IF EXISTS "Tenant scoped access" ON categories;
DROP POLICY IF EXISTS "Tenant scoped access" ON products;
DROP POLICY IF EXISTS "Tenant scoped access" ON product_variants;
DROP POLICY IF EXISTS "Tenant scoped access" ON customers;
DROP POLICY IF EXISTS "Tenant scoped access" ON cart_items;
DROP POLICY IF EXISTS "Tenant scoped access" ON orders;
DROP POLICY IF EXISTS "Tenant scoped access" ON order_line_items;
DROP POLICY IF EXISTS "Tenant scoped access" ON discounts;

-- Create new policies that work with authenticated users and tenant ownership
-- Products policies
CREATE POLICY "Users can access products from accessible tenants" ON products
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Categories policies
CREATE POLICY "Users can access categories from accessible tenants" ON categories
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Product variants policies
CREATE POLICY "Users can access product_variants from accessible tenants" ON product_variants
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Customers policies
CREATE POLICY "Users can access customers from accessible tenants" ON customers
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Cart items policies
CREATE POLICY "Users can access cart_items from accessible tenants" ON cart_items
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Orders policies
CREATE POLICY "Users can access orders from accessible tenants" ON orders
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Order line items policies
CREATE POLICY "Users can access order_line_items from accessible tenants" ON order_line_items
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Discounts policies
CREATE POLICY "Users can access discounts from accessible tenants" ON discounts
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t 
      WHERE t.owner_id = auth.uid() 
      OR t.id IN (
        SELECT tu.tenant_id FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.is_active = true
      )
    )
  );

-- Also add a policy for tenant_users table access
CREATE POLICY "Users can access tenant_users for accessible tenants" ON tenant_users
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR 
      tenant_id IN (
        SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );