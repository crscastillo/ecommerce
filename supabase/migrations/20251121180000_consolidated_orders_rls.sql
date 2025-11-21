-- Consolidated Orders RLS Policies
-- This migration provides comprehensive RLS policies for orders and order_line_items tables

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Tenant scoped access" ON orders;
DROP POLICY IF EXISTS "Admin users can manage orders for their tenants" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders by ID" ON orders;

DROP POLICY IF EXISTS "Tenant scoped access" ON order_line_items;
DROP POLICY IF EXISTS "Admin users can manage order line items for their tenants" ON order_line_items;
DROP POLICY IF EXISTS "Public can create order line items" ON order_line_items;
DROP POLICY IF EXISTS "Public can view order line items" ON order_line_items;

-- ============================================================================
-- ORDERS TABLE RLS POLICIES
-- ============================================================================

-- Admin users can manage orders for their tenants
CREATE POLICY "Admin users can manage orders for their tenants" ON orders
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

-- Public can create orders (guest checkout)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Public can view orders (for order confirmation pages)
CREATE POLICY "Public can view orders" ON orders
  FOR SELECT 
  USING (true);

-- ============================================================================
-- ORDER LINE ITEMS TABLE RLS POLICIES
-- ============================================================================

-- Admin users can manage order line items for their tenants
CREATE POLICY "Admin users can manage order line items for their tenants" ON order_line_items
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Check through the orders table
      order_id IN (
        SELECT id FROM orders 
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
      -- Check through the orders table
      order_id IN (
        SELECT id FROM orders 
        WHERE tenant_id IN (
          SELECT id FROM tenants WHERE owner_id = auth.uid()
          UNION
          SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

-- Public can create order line items (guest checkout)
CREATE POLICY "Public can create order line items" ON order_line_items
  FOR INSERT 
  WITH CHECK (true);

-- Public can view order line items
CREATE POLICY "Public can view order line items" ON order_line_items
  FOR SELECT 
  USING (true);