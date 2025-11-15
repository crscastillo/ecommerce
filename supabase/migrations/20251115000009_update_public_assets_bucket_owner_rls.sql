-- Update RLS policies for public-assets bucket to allow tenant owners and members to manage assets

-- Remove old policies if needed
DROP POLICY IF EXISTS "Tenant member can upload own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member can delete own assets" ON storage.objects;

-- Allow authenticated users to upload assets to their tenant folder if they are a member or owner
CREATE POLICY "Tenant member or owner can upload own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'public-assets'
    AND (
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
    )
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own assets if they are a member or owner
CREATE POLICY "Tenant member or owner can update own assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'public-assets'
    AND (
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
    )
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND (
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
    )
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own assets if they are a member or owner
CREATE POLICY "Tenant member or owner can delete own assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'public-assets'
    AND (
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
    )
    AND auth.role() = 'authenticated'
  );
