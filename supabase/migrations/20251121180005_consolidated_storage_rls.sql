-- Consolidated Storage RLS Policies
-- This migration creates the public-assets bucket and comprehensive storage RLS policies
-- Scope: storage.objects for public-assets bucket

-- Create the public-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES FOR PUBLIC-ASSETS BUCKET
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view public assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant can upload own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant can delete own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member can upload own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member can delete own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member or owner can upload own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member or owner can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member or owner can delete own assets" ON storage.objects;

-- Public can read all assets in public-assets bucket
CREATE POLICY "Public can view public assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');

-- Tenant owners and members can upload assets to their tenant folder
CREATE POLICY "Tenant users can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
    AND (
      -- Allow tenant owners
      EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
      OR
      -- Allow tenant members
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
    )
  );

-- Tenant owners and members can update assets in their tenant folder
CREATE POLICY "Tenant users can update assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
    AND (
      -- Allow tenant owners
      EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
      OR
      -- Allow tenant members
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
    )
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
    AND (
      -- Allow tenant owners
      EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
      OR
      -- Allow tenant members
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
    )
  );

-- Tenant owners and members can delete assets in their tenant folder
CREATE POLICY "Tenant users can delete assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
    AND (
      -- Allow tenant owners
      EXISTS (
        SELECT 1 FROM tenants
        WHERE id = split_part(name, '/', 1)::uuid
        AND owner_id = auth.uid()
      )
      OR
      -- Allow tenant members
      EXISTS (
        SELECT 1 FROM tenant_users
        WHERE tenant_id = split_part(name, '/', 1)::uuid
        AND user_id = auth.uid()
        AND is_active = true
      )
    )
  );
