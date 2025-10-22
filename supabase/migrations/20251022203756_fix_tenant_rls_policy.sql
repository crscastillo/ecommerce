-- Fix RLS policy for tenant creation during signup

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert new tenants" ON tenants;

-- Create a more permissive insert policy that allows authenticated users to create tenants
-- The owner_id will be set to the authenticated user's ID automatically
CREATE POLICY "Authenticated users can create tenants" ON tenants
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    owner_id = auth.uid()
  );

-- Also allow users to view tenants they have access to (including during creation)
DROP POLICY IF EXISTS "Users can view their own tenants" ON tenants;
CREATE POLICY "Users can view accessible tenants" ON tenants
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      owner_id = auth.uid() OR 
      id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true)
    )
  );

-- Ensure update policy is correct
DROP POLICY IF EXISTS "Users can update their owned tenants" ON tenants;
CREATE POLICY "Users can update owned tenants" ON tenants
  FOR UPDATE 
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

-- Add a delete policy for completeness
CREATE POLICY "Users can delete owned tenants" ON tenants
  FOR DELETE 
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid());
