-- Add Row Level Security (RLS) policies to brands table
-- This migration enables RLS on the brands table and creates appropriate security policies

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Public access for viewing active brands (for storefront)
CREATE POLICY "Public can view active brands" ON brands
  FOR SELECT 
  USING (is_active = true);

-- Tenant users can manage brands
CREATE POLICY "Tenant users can manage brands" ON brands
  FOR ALL 
  USING (
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

-- Alternative tenant-scoped policy (if get_current_tenant_id function exists)
-- This can be used instead of the above policy if you prefer tenant context function
-- Uncomment this if you have the get_current_tenant_id() function implemented:
-- 
-- DROP POLICY IF EXISTS "Tenant users can manage brands" ON brands;
-- CREATE POLICY "Tenant scoped access" ON brands
--   FOR ALL 
--   USING (tenant_id = get_current_tenant_id());

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON brands TO authenticated;

-- Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'brands';

-- List all policies on brands table for verification
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'brands';