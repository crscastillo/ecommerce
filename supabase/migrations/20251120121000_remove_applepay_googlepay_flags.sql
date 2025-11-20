-- Remove Apple Pay and Google Pay payment method feature flags from platform_feature_flags
-- Migration generated: 2025-11-20

DELETE FROM platform_feature_flags WHERE feature_key IN ('payment_method_applepay', 'payment_method_googlepay');
