-- Remove Cash on Delivery payment method feature flag from platform_feature_flags
-- Migration generated: 2025-11-20

DELETE FROM platform_feature_flags WHERE feature_key = 'payment_method_cash_on_delivery';
