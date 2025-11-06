-- Test script to create a variable product with variants
-- Replace 'your-tenant-id' with an actual tenant ID from your system

-- First, let's see what tenants exist
-- SELECT id, name FROM tenants LIMIT 5;

-- Create a variable product (replace tenant_id with actual value)
INSERT INTO products (
  id,
  tenant_id,
  name,
  slug,
  description,
  short_description,
  price,
  product_type,
  is_active,
  is_featured,
  inventory_quantity,
  track_inventory,
  images,
  tags
) VALUES (
  gen_random_uuid(),
  'your-tenant-id', -- Replace with actual tenant ID
  'Test Variable T-Shirt',
  'test-variable-t-shirt',
  'A test variable product with multiple size options. Perfect for testing our variable product functionality.',
  'Test variable t-shirt with multiple sizes',
  25.00,
  'variable',
  true,
  true,
  0, -- Variable products don't track main inventory, variants do
  true,
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]',
  '["clothing", "t-shirt", "test"]'
);

-- Now create variants for the product (need to get the product ID first)
-- Get the product ID we just created
-- SELECT id FROM products WHERE slug = 'test-variable-t-shirt' AND tenant_id = 'your-tenant-id';

-- Create variants (replace product_id and tenant_id with actual values)
/*
INSERT INTO product_variants (
  id,
  tenant_id,
  product_id,
  title,
  option1,
  price,
  inventory_quantity,
  is_active
) VALUES 
(gen_random_uuid(), 'your-tenant-id', 'product-id-here', 'Small', 'S', 25.00, 10, true),
(gen_random_uuid(), 'your-tenant-id', 'product-id-here', 'Medium', 'M', 25.00, 15, true),
(gen_random_uuid(), 'your-tenant-id', 'product-id-here', 'Large', 'L', 27.00, 5, true),
(gen_random_uuid(), 'your-tenant-id', 'product-id-here', 'X-Large', 'XL', 29.00, 0, true); -- Out of stock
*/

-- To find your tenant ID, run:
-- SELECT id, name FROM tenants LIMIT 5;

-- To create the complete variable product, follow these steps:
-- 1. Find your tenant ID using the query above
-- 2. Replace 'your-tenant-id' in the product insert
-- 3. Run the product insert
-- 4. Get the product ID that was created
-- 5. Replace 'your-tenant-id' and 'product-id-here' in the variants insert
-- 6. Run the variants insert

-- Example for finding tenant and creating everything:
/*
-- Step 1: Get tenant ID
SELECT id, name FROM tenants LIMIT 1;

-- Step 2: Insert product with real tenant ID
INSERT INTO products (tenant_id, name, slug, description, short_description, price, product_type, is_active, is_featured, inventory_quantity, track_inventory, images, tags) 
VALUES ('real-tenant-id-here', 'Test Variable T-Shirt', 'test-variable-t-shirt', 'A test variable product', 'Test t-shirt', 25.00, 'variable', true, true, 0, true, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]', '["clothing"]')
RETURNING id;

-- Step 3: Insert variants with real product and tenant IDs
INSERT INTO product_variants (tenant_id, product_id, title, option1, price, inventory_quantity, is_active) VALUES 
('real-tenant-id-here', 'real-product-id-here', 'Small', 'S', 25.00, 10, true),
('real-tenant-id-here', 'real-product-id-here', 'Medium', 'M', 25.00, 15, true),
('real-tenant-id-here', 'real-product-id-here', 'Large', 'L', 27.00, 5, true),
('real-tenant-id-here', 'real-product-id-here', 'X-Large', 'XL', 29.00, 0, true);
*/