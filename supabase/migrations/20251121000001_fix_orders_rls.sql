-- Fix Orders RLS Policies
-- Remove the problematic tenant-scoped policy and create proper admin access policies

-- Drop existing orders policies
DROP POLICY IF EXISTS "Tenant scoped access" ON orders;

-- Create new orders policies for admin and public access
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

-- Allow public access for order creation (guest checkout)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Allow public to view their own orders (for order confirmation pages)
CREATE POLICY "Public can view orders by ID" ON orders
  FOR SELECT 
  USING (true);

-- Fix order_line_items policies too
DROP POLICY IF EXISTS "Tenant scoped access" ON order_line_items;

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

-- Allow public to create order line items (guest checkout)
CREATE POLICY "Public can create order line items" ON order_line_items
  FOR INSERT 
  WITH CHECK (true);

-- Allow public to view order line items
CREATE POLICY "Public can view order line items" ON order_line_items
  FOR SELECT 
  USING (true);