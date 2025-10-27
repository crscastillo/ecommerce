-- Fix infinite recursion in tenants table RLS policies (comprehensive fix)
-- Drop ALL existing tenants policies first to ensure clean state

DO $$
BEGIN
    -- Drop any existing policies on tenants table
    DROP POLICY IF EXISTS "Users can view their own tenants" ON tenants;
    DROP POLICY IF EXISTS "Users can update their owned tenants" ON tenants;
    DROP POLICY IF EXISTS "Users can insert new tenants" ON tenants;
    DROP POLICY IF EXISTS "Users can view accessible tenants" ON tenants;
    DROP POLICY IF EXISTS "Owners can update their tenants" ON tenants;
    DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;
    DROP POLICY IF EXISTS "Owners can delete their tenants" ON tenants;
    
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END;
$$;

-- Create simple tenants policies that avoid circular dependencies
-- The key is to NOT reference tenant_users in the main SELECT policy since
-- other tables reference tenants and this creates infinite recursion

-- Policy for selecting tenants - SIMPLIFIED to avoid recursion
-- Users can see tenants they own (no tenant_users reference here to prevent recursion)
CREATE POLICY "tenants_select_policy" ON tenants
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND owner_id = auth.uid()
  );

-- Policy for updating tenants - only owners can update
CREATE POLICY "tenants_update_policy" ON tenants
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND owner_id = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND owner_id = auth.uid()
  );

-- Policy for inserting tenants - authenticated users can create new tenants
CREATE POLICY "tenants_insert_policy" ON tenants
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND owner_id = auth.uid()
  );

-- Policy for deleting tenants - only owners can delete
CREATE POLICY "tenants_delete_policy" ON tenants
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND owner_id = auth.uid()
  );

-- Create a separate policy for tenant_users access to tenants
-- This will be handled at the application level for now to avoid recursion
-- The application can query tenants directly for the user and then check tenant_users separately