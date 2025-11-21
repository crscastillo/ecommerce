-- Add pages management feature flag
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers, created_at, updated_at)
VALUES (
  'pages_management',
  'Pages Management',
  'Enable creation and management of static pages like About Us, Privacy Policy, and custom content',
  true,
  'features',
  '["basic", "pro", "enterprise"]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  feature_description = EXCLUDED.feature_description,
  enabled = EXCLUDED.enabled,
  category = EXCLUDED.category,
  target_tiers = EXCLUDED.target_tiers,
  updated_at = NOW();