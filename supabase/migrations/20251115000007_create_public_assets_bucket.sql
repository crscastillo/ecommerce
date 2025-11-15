-- Create a public bucket for tenant assets (hero backgrounds, logos, favicons)

-- Create the public-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read all assets
CREATE POLICY "Public can view public assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');

-- Authenticated users can upload assets only to their own tenant folder
CREATE POLICY "Tenant can upload own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'public-assets'
    AND split_part(name, '/', 1) = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update their own assets
CREATE POLICY "Tenant can update own assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'public-assets'
    AND split_part(name, '/', 1) = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND split_part(name, '/', 1) = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete their own assets
CREATE POLICY "Tenant can delete own assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'public-assets'
    AND split_part(name, '/', 1) = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    AND auth.role() = 'authenticated'
  );
