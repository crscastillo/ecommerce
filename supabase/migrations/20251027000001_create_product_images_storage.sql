-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- Public bucket for product images
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']  -- Allowed image types
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for product images bucket
-- Allow authenticated users to upload images for their tenant
CREATE POLICY "Users can upload product images for their tenant" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text 
    FROM tenant_users 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
    LIMIT 1
  )
);

-- Allow public read access to product images
CREATE POLICY "Public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow users to update product images for their tenant
CREATE POLICY "Users can update product images for their tenant" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text 
    FROM tenant_users 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
    LIMIT 1
  )
);

-- Allow users to delete product images for their tenant
CREATE POLICY "Users can delete product images for their tenant" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text 
    FROM tenant_users 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
    LIMIT 1
  )
);