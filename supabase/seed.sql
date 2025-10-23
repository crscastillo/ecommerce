-- Seed data for development
-- This file is automatically run after migrations when using `supabase db reset`

-- Insert demo tenant for testing
-- Note: Replace owner_id with an actual user UUID after creating a user in Supabase Auth
INSERT INTO tenants (
  id, 
  name, 
  subdomain, 
  description, 
  contact_email, 
  theme_config, 
  settings, 
  owner_id
) VALUES (
  'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
  'Demo Store',
  'demo',
  'A comprehensive demo ecommerce store for testing',
  'demo@example.com',
  '{"primaryColor": "#3B82F6", "secondaryColor": "#1F2937", "accentColor": "#EF4444"}',
  '{"currency": "USD", "timezone": "America/New_York", "allowGuestCheckout": true}',
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user UUID
);

-- Insert sample categories
INSERT INTO categories (tenant_id, name, slug, description, sort_order, is_active, seo_title, seo_description) VALUES 
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'Electronics', 'electronics', 'Latest electronic devices and gadgets', 1, true, 'Electronics - Demo Store', 'Discover the latest electronic devices and tech gadgets'),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'Clothing', 'clothing', 'Fashion and apparel for all occasions', 2, true, 'Clothing & Fashion - Demo Store', 'Trendy clothing and fashion items for everyone'),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'Home & Garden', 'home-garden', 'Everything for your home and garden', 3, true, 'Home & Garden - Demo Store', 'Transform your home and garden with our products'),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 4, true, 'Sports & Outdoors - Demo Store', 'Gear up for your favorite sports and outdoor activities');

-- Insert sample products
INSERT INTO products (
  id,
  tenant_id, 
  name, 
  slug, 
  description, 
  short_description,
  sku,
  price, 
  compare_price,
  cost_price,
  track_inventory,
  inventory_quantity,
  category_id, 
  tags,
  images,
  is_active,
  is_featured,
  seo_title,
  seo_description
) VALUES 
  (
    'product-uuid-1',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'Wireless Bluetooth Headphones',
    'wireless-bluetooth-headphones',
    'Premium wireless Bluetooth headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.',
    'Premium wireless headphones with noise cancellation',
    'WBH-001',
    199.99,
    249.99,
    89.99,
    true,
    50,
    (SELECT id FROM categories WHERE slug = 'electronics' AND tenant_id = 'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000'),
    ARRAY['audio', 'wireless', 'bluetooth', 'headphones'],
    '["/images/headphones-1.jpg", "/images/headphones-2.jpg"]',
    true,
    true,
    'Wireless Bluetooth Headphones - Premium Audio',
    'Shop premium wireless Bluetooth headphones with noise cancellation'
  ),
  (
    'product-uuid-2',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'Smartphone Pro Max',
    'smartphone-pro-max',
    'Latest generation smartphone with advanced camera system, lightning-fast processor, and all-day battery life.',
    'Latest generation smartphone with advanced features',
    'SPM-001',
    999.99,
    1199.99,
    549.99,
    true,
    25,
    (SELECT id FROM categories WHERE slug = 'electronics' AND tenant_id = 'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000'),
    ARRAY['smartphone', 'mobile', 'camera', 'technology'],
    '["/images/phone-1.jpg", "/images/phone-2.jpg", "/images/phone-3.jpg"]',
    true,
    true,
    'Smartphone Pro Max - Latest Technology',
    'Experience the latest smartphone technology with Pro Max features'
  ),
  (
    'product-uuid-3',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'Premium Cotton T-Shirt',
    'premium-cotton-t-shirt',
    'Soft, comfortable premium cotton t-shirt available in multiple colors and sizes. Perfect for casual wear.',
    'Soft premium cotton t-shirt in multiple colors',
    'PCT-001',
    29.99,
    39.99,
    12.99,
    true,
    100,
    (SELECT id FROM categories WHERE slug = 'clothing' AND tenant_id = 'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000'),
    ARRAY['t-shirt', 'cotton', 'casual', 'comfortable'],
    '["/images/tshirt-1.jpg", "/images/tshirt-2.jpg"]',
    true,
    false,
    'Premium Cotton T-Shirt - Comfortable Casual Wear',
    'Shop our premium cotton t-shirts for ultimate comfort and style'
  );

-- Insert product variants for the t-shirt
INSERT INTO product_variants (
  tenant_id,
  product_id,
  title,
  option1,
  option2,
  sku,
  price,
  inventory_quantity,
  is_active
) VALUES
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Small / Black', 'Small', 'Black', 'PCT-001-S-BLK', 29.99, 20, true),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Medium / Black', 'Medium', 'Black', 'PCT-001-M-BLK', 29.99, 25, true),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Large / Black', 'Large', 'Black', 'PCT-001-L-BLK', 29.99, 30, true),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Small / White', 'Small', 'White', 'PCT-001-S-WHT', 29.99, 15, true),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Medium / White', 'Medium', 'White', 'PCT-001-M-WHT', 29.99, 20, true),
  ('demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000', 'product-uuid-3', 'Large / White', 'Large', 'White', 'PCT-001-L-WHT', 29.99, 25, true);

-- Insert sample customers
INSERT INTO customers (
  id,
  tenant_id,
  email,
  first_name,
  last_name,
  phone,
  accepts_marketing,
  addresses,
  total_spent,
  orders_count
) VALUES
  (
    'customer-uuid-1',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'john.doe@example.com',
    'John',
    'Doe',
    '+1-555-123-4567',
    true,
    '[{"type": "shipping", "firstName": "John", "lastName": "Doe", "address1": "123 Main St", "city": "New York", "province": "NY", "zip": "10001", "country": "US"}]',
    229.98,
    1
  ),
  (
    'customer-uuid-2',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'jane.smith@example.com',
    'Jane',
    'Smith',
    '+1-555-987-6543',
    false,
    '[{"type": "shipping", "firstName": "Jane", "lastName": "Smith", "address1": "456 Oak Ave", "city": "Los Angeles", "province": "CA", "zip": "90210", "country": "US"}]',
    999.99,
    1
  );

-- Insert sample orders
INSERT INTO orders (
  id,
  tenant_id,
  customer_id,
  order_number,
  email,
  phone,
  currency,
  subtotal_price,
  total_tax,
  shipping_price,
  total_price,
  financial_status,
  fulfillment_status,
  billing_address,
  shipping_address,
  processed_at
) VALUES
  (
    'order-uuid-1',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'customer-uuid-1',
    'ORD-1001',
    'john.doe@example.com',
    '+1-555-123-4567',
    'USD',
    199.99,
    20.00,
    9.99,
    229.98,
    'paid',
    'fulfilled',
    '{"firstName": "John", "lastName": "Doe", "address1": "123 Main St", "city": "New York", "province": "NY", "zip": "10001", "country": "US"}',
    '{"firstName": "John", "lastName": "Doe", "address1": "123 Main St", "city": "New York", "province": "NY", "zip": "10001", "country": "US"}',
    NOW() - INTERVAL '2 days'
  ),
  (
    'order-uuid-2',
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'customer-uuid-2',
    'ORD-1002',
    'jane.smith@example.com',
    '+1-555-987-6543',
    'USD',
    999.99,
    100.00,
    0.00,
    1099.99,
    'paid',
    'unfulfilled',
    '{"firstName": "Jane", "lastName": "Smith", "address1": "456 Oak Ave", "city": "Los Angeles", "province": "CA", "zip": "90210", "country": "US"}',
    '{"firstName": "Jane", "lastName": "Smith", "address1": "456 Oak Ave", "city": "Los Angeles", "province": "CA", "zip": "90210", "country": "US"}',
    NOW() - INTERVAL '1 day'
  );

-- Insert order line items
INSERT INTO order_line_items (
  tenant_id,
  order_id,
  product_id,
  title,
  sku,
  quantity,
  price,
  properties
) VALUES
  (
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'order-uuid-1',
    'product-uuid-1',
    'Wireless Bluetooth Headphones',
    'WBH-001',
    1,
    199.99,
    '{}'
  ),
  (
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'order-uuid-2',
    'product-uuid-2',
    'Smartphone Pro Max',
    'SPM-001',
    1,
    999.99,
    '{"color": "Space Gray", "storage": "256GB"}'
  );

-- Insert sample discounts
INSERT INTO discounts (
  tenant_id,
  code,
  title,
  description,
  type,
  value,
  minimum_amount,
  usage_limit,
  customer_usage_limit,
  starts_at,
  ends_at,
  is_active
) VALUES
  (
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'WELCOME10',
    'Welcome Discount',
    '10% off your first order',
    'percentage',
    10.00,
    50.00,
    1000,
    1,
    NOW() - INTERVAL '1 week',
    NOW() + INTERVAL '1 month',
    true
  ),
  (
    'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
    'FREESHIP',
    'Free Shipping',
    'Free shipping on orders over $100',
    'free_shipping',
    0.00,
    100.00,
    NULL,
    5,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '3 months',
    true
  );

-- Note: To use this seed data:
-- 1. Create a user in Supabase Auth dashboard
-- 2. Replace the owner_id in the tenants insert with the actual user UUID
-- 3. Run: supabase db reset (this will apply migrations and run this seed file)