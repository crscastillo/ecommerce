-- Consolidated Seeds Migration
-- Inserts default data and feature flags
-- Timestamp: 2025-11-21 17:00:01 (executes after structure, before RLS)

-- ============================================================================
-- PLATFORM FEATURE FLAGS SEEDING
-- ============================================================================

-- Temporarily disable RLS for seeding (will be re-enabled by RLS migration)
ALTER TABLE platform_feature_flags DISABLE ROW LEVEL SECURITY;

-- Insert/update payment method feature flags
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers, created_at, updated_at) VALUES
-- Traditional Card Form
('payment_method_traditional', 'Traditional Card Form', 'Basic card form for manual payment processing. Requires manual payment handling.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Stripe
('payment_method_stripe', 'Stripe', 'Accept credit cards, debit cards, and digital wallets with Stripe''s secure payment processing.', true, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- TiloPay
('payment_method_tilopay', 'TiloPay', 'Accept payments via TiloPay gateway (Costa Rica). Supports CRC and USD currencies.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- PayPal
('payment_method_paypal', 'PayPal', 'Accept PayPal payments and credit cards through PayPal''s platform.', false, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Apple Pay
('payment_method_applepay', 'Apple Pay', 'Accept Apple Pay payments on Safari and iOS devices.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Google Pay
('payment_method_googlepay', 'Google Pay', 'Accept Google Pay payments on supported browsers and Android devices.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Cash on Delivery
('payment_method_cash_on_delivery', 'Cash on Delivery', 'Allow customers to pay with cash when the order is delivered.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Bank Transfer
('payment_method_bank_transfer', 'Bank Transfer', 'Allow customers to pay via direct bank transfer. Provide bank account details and instructions.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Mobile Bank Transfer
('payment_method_mobile_bank_transfer', 'Mobile Bank Transfer', 'Allow customers to pay via mobile bank transfer (SINPE Móvil in Costa Rica).', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Security feature flags
('two_factor_auth', '2FA Authentication', 'Enable two-factor authentication for enhanced security', false, 'security', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('login_rate_limiting', 'Login Rate Limiting', 'Limit login attempts to prevent brute force attacks', true, 'security', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),
('session_timeout', 'Session Timeout', 'Automatically log out users after period of inactivity', true, 'security', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),
('audit_logging', 'Audit Logging', 'Log all administrative actions for security auditing', false, 'security', '["enterprise"]'::jsonb, NOW(), NOW()),
('ip_whitelisting', 'IP Whitelisting', 'Restrict admin access to specific IP addresses', false, 'security', '["enterprise"]'::jsonb, NOW(), NOW()),

-- Plugin feature flags
('custom_themes', 'Custom Themes', 'Allow tenants to upload and use custom themes', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('advanced_analytics', 'Advanced Analytics', 'Enable detailed analytics and reporting features', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('api_access', 'API Access', 'Allow tenants to access REST and GraphQL APIs', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('webhook_support', 'Webhook Support', 'Enable webhook notifications for events', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('bulk_operations', 'Bulk Operations', 'Enable bulk import/export and batch operations', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('multi_language', 'Multi-language Support', 'Enable multiple language support for storefronts', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('seo_tools', 'SEO Tools', 'Advanced SEO optimization tools and features', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('abandoned_cart_recovery', 'Abandoned Cart Recovery', 'Automatically send emails for abandoned carts', false, 'plugins', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),
('loyalty_program', 'Loyalty Program', 'Customer loyalty points and rewards system', false, 'plugins', '["enterprise"]'::jsonb, NOW(), NOW()),
('inventory_alerts', 'Inventory Alerts', 'Get notified when inventory levels are low', false, 'plugins', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW())

ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  feature_description = EXCLUDED.feature_description,
  enabled = EXCLUDED.enabled,
  category = EXCLUDED.category,
  target_tiers = EXCLUDED.target_tiers,
  updated_at = NOW();

-- Re-enable RLS (will be properly configured by RLS migrations)
ALTER TABLE platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify feature flags were inserted
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM platform_feature_flags WHERE category = 'payment_methods') < 5 THEN
    RAISE EXCEPTION 'Payment method feature flags insertion failed - insufficient records found';
  END IF;
  
  RAISE NOTICE 'Feature flags successfully inserted: % payment methods, % security flags, % plugin flags', 
    (SELECT COUNT(*) FROM platform_feature_flags WHERE category = 'payment_methods'),
    (SELECT COUNT(*) FROM platform_feature_flags WHERE category = 'security'),
    (SELECT COUNT(*) FROM platform_feature_flags WHERE category = 'plugins');
END $$;