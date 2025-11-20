-- Ensure payment method feature flags exist
-- Run this manually if the migration didn't apply correctly

INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers, created_at, updated_at) VALUES
-- Traditional Card Form
('payment_method_traditional', 'Traditional Card Form', 'Basic card form for manual payment processing. Requires manual payment handling.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Stripe (update existing entry if present)
('payment_method_stripe', 'Stripe', 'Accept credit cards, debit cards, and digital wallets with Stripe''s secure payment processing.', true, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- TiloPay (update existing entry if present) 
('payment_method_tilopay', 'TiloPay', 'Accept payments via TiloPay gateway (Costa Rica). Supports CRC and USD currencies.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- PayPal
('payment_method_paypal', 'PayPal', 'Accept PayPal payments and credit cards through PayPal''s platform.', false, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Apple Pay
('payment_method_applepay', 'Apple Pay', 'Accept Apple Pay payments on Safari and iOS devices.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Google Pay
('payment_method_googlepay', 'Google Pay', 'Accept Google Pay payments on supported browsers and Android devices.', false, 'payment_methods', '["pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Cash on Delivery (update existing entry if present)
('payment_method_cash_on_delivery', 'Cash on Delivery', 'Allow customers to pay with cash when the order is delivered.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Bank Transfer (update existing entry if present)
('payment_method_bank_transfer', 'Bank Transfer', 'Allow customers to pay via direct bank transfer. Provide bank account details and instructions.', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW()),

-- Mobile Bank Transfer (update existing entry if present)
('payment_method_mobile_bank_transfer', 'Mobile Bank Transfer', 'Allow customers to pay via mobile bank transfer (SINPE Móvil in Costa Rica).', true, 'payment_methods', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW())

ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  feature_description = EXCLUDED.feature_description,
  enabled = EXCLUDED.enabled,
  category = EXCLUDED.category,
  target_tiers = EXCLUDED.target_tiers,
  updated_at = NOW();