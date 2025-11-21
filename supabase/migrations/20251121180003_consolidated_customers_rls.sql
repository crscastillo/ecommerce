-- Consolidated Customers RLS Policies
-- This migration provides comprehensive RLS policies for customers table

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant scoped access" ON customers;
DROP POLICY IF EXISTS "Tenant users can manage customers" ON customers;

-- ============================================================================
-- CUSTOMERS TABLE RLS POLICIES
-- ============================================================================

-- Tenant users can manage customers for their tenant
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