-- Migration: Restructure public-assets bucket for global public uploads
-- All tenants upload to a single bucket, filenames are GUIDs, and all assets are public to read

-- Remove old policies
DROP POLICY IF EXISTS "Tenant member or owner can upload own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member or owner can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant member or owner can delete own assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public assets" ON storage.objects;

-- Public can read all assets
CREATE POLICY "Public can view public assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');

-- Authenticated users can upload, update, and delete any asset in the bucket
CREATE POLICY "Authenticated can upload public assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can update public assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can delete public assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'public-assets'
    AND auth.role() = 'authenticated'
  );
