-- Multi-tenant ecommerce platform database schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension (using gen_random_uuid() which is built-in to modern PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table (stores information about each tenant/store)
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  subdomain VARCHAR UNIQUE NOT NULL,
  domain VARCHAR, -- For custom domains
  description TEXT,
  logo_url TEXT,
  theme_config JSONB DEFAULT '{}', -- Store theme customization
  contact_email VARCHAR,
  contact_phone VARCHAR,
  address JSONB, -- Store address as JSON
  settings JSONB DEFAULT '{}', -- Store-specific settings
  subscription_tier VARCHAR DEFAULT 'basic',
  plan VARCHAR DEFAULT 'starter',
  stripe_customer_id VARCHAR,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX idx_tenants_active ON tenants(is_active);

-- Tenant users table (for multi-user access to tenant stores)
CREATE TABLE tenant_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'staff', -- 'owner', 'admin', 'staff', 'viewer'
  permissions JSONB DEFAULT '{}', -- Specific permissions
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, user_id)
);

-- Categories table (tenant-specific)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title VARCHAR,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, slug)
);

-- Products table (tenant-specific)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  description TEXT,
  short_description TEXT,
  sku VARCHAR,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2), -- For showing discounts
  cost_price DECIMAL(10,2), -- For profit calculations
  product_type VARCHAR(20) DEFAULT 'single' CHECK (product_type IN ('single', 'variable', 'digital')),
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height}
  category_id UUID REFERENCES categories(id),
  tags TEXT[], -- Array of tags
  images JSONB DEFAULT '[]', -- Array of image URLs
  variants JSONB DEFAULT '[]', -- Product variants
  seo_title VARCHAR,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, slug)
);

-- Product variants table (for products with different options like size, color)
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL, -- e.g., "Large / Red"
  option1 VARCHAR, -- e.g., "Large"
  option2 VARCHAR, -- e.g., "Red"  
  option3 VARCHAR, -- e.g., "Cotton"
  sku VARCHAR,
  price DECIMAL(10,2),
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  weight DECIMAL(8,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customers table (tenant-specific customers)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to auth.users if they register
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  accepts_marketing BOOLEAN DEFAULT false,
  addresses JSONB DEFAULT '[]', -- Array of addresses
  tags TEXT[],
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, email)
);

-- Cart items table (tenant-specific)
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR, -- For guest users
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  properties JSONB DEFAULT '{}', -- Custom properties/personalization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table (tenant-specific)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  order_number VARCHAR NOT NULL, -- Human-readable order number
  email VARCHAR NOT NULL,
  phone VARCHAR,
  currency VARCHAR DEFAULT 'USD',
  subtotal_price DECIMAL(10,2) NOT NULL,
  total_tax DECIMAL(10,2) DEFAULT 0,
  total_discounts DECIMAL(10,2) DEFAULT 0,
  shipping_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  financial_status VARCHAR DEFAULT 'pending', -- pending, paid, refunded, etc.
  fulfillment_status VARCHAR DEFAULT 'unfulfilled', -- fulfilled, partial, unfulfilled
  billing_address JSONB,
  shipping_address JSONB,
  notes TEXT,
  tags TEXT[],
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason VARCHAR,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, order_number)
);

-- Order line items table
CREATE TABLE order_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  title VARCHAR NOT NULL, -- Product title at time of order
  variant_title VARCHAR, -- Variant title at time of order
  sku VARCHAR,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL, -- Price at time of order
  total_discount DECIMAL(10,2) DEFAULT 0,
  properties JSONB DEFAULT '{}', -- Custom properties
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Discounts/Coupons table (tenant-specific)
CREATE TABLE discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL, -- 'percentage', 'fixed_amount', 'free_shipping'
  value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  customer_usage_limit INTEGER DEFAULT 1,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, code)
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
CREATE POLICY "Users can view their own tenants" ON tenants
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their owned tenants" ON tenants
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can insert new tenants" ON tenants
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Helper function to get current tenant_id from a custom claim or context
-- This would be set by your application logic
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function should return the current tenant_id
  -- You'll need to implement this based on your subdomain detection logic
  -- For now, this is a placeholder
  RETURN current_setting('app.current_tenant_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- RLS Policies for tenant-scoped tables
CREATE POLICY "Tenant scoped access" ON categories
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON products
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON product_variants
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON customers
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON cart_items
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON orders
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON order_line_items
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant scoped access" ON discounts
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Create indexes for better performance
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_tenant_id ON product_variants(tenant_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(tenant_id, email);
CREATE INDEX idx_cart_items_tenant_id ON cart_items(tenant_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_line_items_tenant_id ON order_line_items(tenant_id);
CREATE INDEX idx_order_line_items_order_id ON order_line_items(order_id);
CREATE INDEX idx_discounts_tenant_id ON discounts(tenant_id);

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Subscriptions table (for billing and plan management)
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();