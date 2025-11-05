-- Fix infinite recursion in tenants table RLS policies (replacement)
-- Skip creation if policy already exists

-- Drop the existing problematic tenants policies
DROP POLICY IF EXISTS "Users can view their own tenants" ON tenants;
DROP POLICY IF EXISTS "Users can update their owned tenants" ON tenants;
DROP POLICY IF EXISTS "Users can insert new tenants" ON tenants;

-- Create simplified tenants policies that don't create circular dependencies
-- These policies are much simpler and don't reference other tables that depend on tenants

-- Policy for selecting tenants - users can see tenants they own or are members of
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'Users can view accessible tenants'
  ) THEN
    CREATE POLICY "Users can view accessible tenants" ON tenants
      FOR SELECT 
      USING (
        auth.role() = 'authenticated' AND (
          owner_id = auth.uid() OR 
          EXISTS (
            SELECT 1 FROM tenant_users tu 
            WHERE tu.tenant_id = tenants.id 
            AND tu.user_id = auth.uid() 
            AND tu.is_active = true
          )
        )
      );
  END IF;
END $$;

-- Policy for updating tenants - only owners can update
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'Owners can update their tenants'
  ) THEN
    CREATE POLICY "Owners can update their tenants" ON tenants
      FOR UPDATE 
      USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
      );
  END IF;
END $$;

-- Policy for inserting tenants - authenticated users can create new tenants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'Authenticated users can create tenants'
  ) THEN
    CREATE POLICY "Authenticated users can create tenants" ON tenants
      FOR INSERT 
      WITH CHECK (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
      );
  END IF;
END $$;

-- Policy for deleting tenants - only owners can delete
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'Owners can delete their tenants'
  ) THEN
    CREATE POLICY "Owners can delete their tenants" ON tenants
      FOR DELETE 
      USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
      );
  END IF;
END $$;