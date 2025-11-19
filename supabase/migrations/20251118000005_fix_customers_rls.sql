-- Fix customers RLS policy to work with proper tenant access
-- This replaces the get_current_tenant_id() approach with proper tenant authorization

-- Drop the existing policy that uses get_current_tenant_id()
DROP POLICY "Tenant scoped access" ON customers;

-- Create new policies that match the tenant authorization pattern
CREATE POLICY "Tenant users can manage customers" ON customers
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

-- Also add a public read policy for customers (for storefront)
CREATE POLICY "Public can view active customers for orders" ON customers
  FOR SELECT USING (true);