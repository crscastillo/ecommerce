-- Add shipping method feature flags
-- This migration adds the weight-based shipping feature flag to enable
-- shipping method configuration in tenant admin settings

-- Temporarily disable RLS for data insertion
ALTER TABLE platform_feature_flags DISABLE ROW LEVEL SECURITY;

-- Insert shipping method feature flags
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers, created_at, updated_at) VALUES
-- Weight Based Shipping
('weight_based_shipping', 'Weight Based Shipping', 'Enable weight-based shipping calculation method for tenants. Allows configuring base rate, per-kg rate, free shipping threshold, and maximum weight limits.', true, 'shipping', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW())

ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  feature_description = EXCLUDED.feature_description,
  enabled = EXCLUDED.enabled,
  category = EXCLUDED.category,
  target_tiers = EXCLUDED.target_tiers,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags including payment methods, security, plugins, and shipping features';