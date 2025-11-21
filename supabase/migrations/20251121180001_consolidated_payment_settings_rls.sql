-- Consolidated Payment Settings RLS Policies
-- This migration provides comprehensive RLS policies for tenant_payment_settings table

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view payment settings for their tenant" ON tenant_payment_settings;
DROP POLICY IF EXISTS "Users can update payment settings for their tenant" ON tenant_payment_settings;
DROP POLICY IF EXISTS "Tenant users can view payment settings" ON tenant_payment_settings;
DROP POLICY IF EXISTS "Tenant users can manage payment settings" ON tenant_payment_settings;

-- ============================================================================
-- TENANT PAYMENT SETTINGS RLS POLICIES
-- ============================================================================

-- Tenant users can view payment settings
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

-- Tenant users can manage payment settings (with role restrictions for modifications)
CREATE POLICY "Tenant users can manage payment settings" ON tenant_payment_settings
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Allow tenant owners (who don't have tenant_users records)
      tenant_id IN (
        SELECT id FROM tenants 
        WHERE owner_id = auth.uid()
      ) OR
      -- Allow tenant users (staff/collaborators) with admin/owner role for modifications
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
      -- Allow tenant users (staff/collaborators) with admin/owner role for modifications
      tenant_id IN (
        SELECT tenant_id FROM tenant_users 
        WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
      )
    )
  );