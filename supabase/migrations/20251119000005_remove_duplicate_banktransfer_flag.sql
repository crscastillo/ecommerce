-- Remove duplicate payment_method_banktransfer feature flag
-- This feature flag was a duplicate of payment_method_bank_transfer (with underscore)

DELETE FROM platform_feature_flags 
WHERE feature_key = 'payment_method_banktransfer';

-- Add comment about the cleanup
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants. Cleaned up duplicate payment method flags.';