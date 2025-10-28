-- Allow public read access to categories for store browsing
-- This enables customers to view categories on the public store homepage
-- without requiring authentication

-- Add public read policy for categories
CREATE POLICY "Public read access to active categories" ON categories
  FOR SELECT 
  USING (is_active = true);

-- Add public read policy for products (for store browsing)
CREATE POLICY "Public read access to active products" ON products
  FOR SELECT 
  USING (is_active = true);

-- Add public read policy for product variants (for product details)
CREATE POLICY "Public read access to active product variants" ON product_variants
  FOR SELECT 
  USING (is_active = true);