-- Debug script to check feature flags and tenant data
-- Run this in your Supabase SQL editor or via psql

-- 1. Check all security feature flags
SELECT 
  feature_key, 
  feature_name, 
  enabled, 
  target_tiers,
  category
FROM platform_feature_flags 
WHERE category = 'security'
ORDER BY feature_key;

-- 2. Check a sample tenant's subscription tier
-- Replace 'your-tenant-subdomain' with an actual tenant subdomain you're testing
SELECT 
  id,
  subdomain,
  subscription_tier,
  name
FROM tenants 
WHERE subdomain = 'your-tenant-subdomain'
LIMIT 1;

-- 3. Test the feature flag logic for different tiers
-- This simulates what the FeatureFlagsService does
WITH test_tenant AS (
  SELECT 'pro' as tier  -- Change this to 'basic', 'pro', or 'enterprise' to test
),
security_flags AS (
  SELECT 
    feature_key,
    enabled,
    target_tiers,
    CASE 
      WHEN target_tiers ? (SELECT tier FROM test_tenant) AND enabled = true THEN true
      ELSE false
    END as is_available_for_tier
  FROM platform_feature_flags 
  WHERE category = 'security'
)
SELECT 
  feature_key,
  enabled as flag_enabled,
  target_tiers,
  is_available_for_tier,
  (SELECT tier FROM test_tenant) as testing_for_tier
FROM security_flags
ORDER BY feature_key;