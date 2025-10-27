-- Fix storage RLS policies to handle tenant owners properly
-- Tenant owners are not in tenant_users table, they're linked via tenants.owner_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload product images for their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can update product images for their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete product images for their tenant" ON storage.objects;

-- Create improved RLS policies for product images bucket
-- Allow authenticated users to upload images for their tenant (owners or team members)
CREATE POLICY "Users can upload product images for their tenant" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user is tenant owner
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM tenants 
      WHERE owner_id = auth.uid() 
      AND is_active = true
    )
    OR
    -- Check if user is tenant team member with owner/admin role
    (storage.foldername(name))[1] IN (
      SELECT tenant_id::text 
      FROM tenant_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
);

-- Allow users to update product images for their tenant
CREATE POLICY "Users can update product images for their tenant" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user is tenant owner
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM tenants 
      WHERE owner_id = auth.uid() 
      AND is_active = true
    )
    OR
    -- Check if user is tenant team member with owner/admin role
    (storage.foldername(name))[1] IN (
      SELECT tenant_id::text 
      FROM tenant_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
);

-- Allow users to delete product images for their tenant
CREATE POLICY "Users can delete product images for their tenant" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user is tenant owner
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM tenants 
      WHERE owner_id = auth.uid() 
      AND is_active = true
    )
    OR
    -- Check if user is tenant team member with owner/admin role
    (storage.foldername(name))[1] IN (
      SELECT tenant_id::text 
      FROM tenant_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
);