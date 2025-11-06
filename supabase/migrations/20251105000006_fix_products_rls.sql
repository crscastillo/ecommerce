-- Fix products RLS policy to handle tenant owners
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Tenant scoped access" ON products;

-- Create new policy that allows both tenant owners and tenant users
CREATE POLICY "Tenant users can manage products" ON products
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

-- Fix product_variants policy as well
DROP POLICY IF EXISTS "Tenant scoped access" ON product_variants;

CREATE POLICY "Tenant users can manage product variants" ON product_variants
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