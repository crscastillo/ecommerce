-- Create platform_feature_flags table to control which payment methods are available
CREATE TABLE IF NOT EXISTS platform_feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  feature_description text,
  enabled boolean DEFAULT false,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view feature flags
CREATE POLICY "Authenticated users can view feature flags"
ON platform_feature_flags
FOR SELECT
USING (auth.role() = 'authenticated');

-- Authenticated users can update feature flags
-- You can add more restrictive logic here later (e.g., check user role)
CREATE POLICY "Authenticated users can update feature flags"
ON platform_feature_flags
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert default payment method feature flags
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category)
VALUES
  ('payment_method_cash_on_delivery', 'Cash on Delivery', 'Allow tenants to enable cash on delivery payment method', true, 'payment_methods'),
  ('payment_method_stripe', 'Stripe', 'Allow tenants to enable Stripe payment gateway', true, 'payment_methods'),
  ('payment_method_tilopay', 'TiloPay', 'Allow tenants to enable TiloPay payment gateway', true, 'payment_methods'),
  ('payment_method_bank_transfer', 'Bank Transfer', 'Allow tenants to enable bank transfer payment method', true, 'payment_methods'),
  ('payment_method_mobile_bank_transfer', 'Mobile Bank Transfer', 'Allow tenants to enable mobile bank transfer (SINPE Movil)', true, 'payment_methods')
ON CONFLICT (feature_key) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_platform_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_feature_flags_updated_at
  BEFORE UPDATE ON platform_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_feature_flags_updated_at();

-- Add comment
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants';
