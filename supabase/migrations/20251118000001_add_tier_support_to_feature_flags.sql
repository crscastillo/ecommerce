-- Add tier support to platform_feature_flags table
ALTER TABLE platform_feature_flags ADD COLUMN IF NOT EXISTS target_tiers jsonb DEFAULT '["basic", "pro", "enterprise"]'::jsonb;

-- Update existing Stripe and TiloPay to be pro/enterprise only
UPDATE platform_feature_flags 
SET target_tiers = '["pro", "enterprise"]'::jsonb
WHERE feature_key IN ('payment_method_stripe', 'payment_method_tilopay');

-- Add comment explaining the tier system
COMMENT ON COLUMN platform_feature_flags.target_tiers IS 'JSON array of tier names that have access to this feature. Options: basic, pro, enterprise';