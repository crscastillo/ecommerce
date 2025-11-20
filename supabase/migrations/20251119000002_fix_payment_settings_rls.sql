-- Fix tenant_payment_settings RLS policy to work with proper tenant authorization
-- This replaces the tenant_users-only approach with proper tenant owner authorization

-- Drop the existing policies
DROP POLICY "Users can view payment settings for their tenant" ON tenant_payment_settings;
DROP POLICY "Users can update payment settings for their tenant" ON tenant_payment_settings;

-- Create new policies that match the tenant authorization pattern
CREATE POLICY "Tenant users can view payment settings" ON tenant_payment_settings
  FOR SELECT USING (
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

CREATE POLICY "Tenant users can manage payment settings" ON tenant_payment_settings
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators) with admin/owner role
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
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
      -- Allow tenant users (staff/collaborators) with admin/owner role
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
      )
    )
  );