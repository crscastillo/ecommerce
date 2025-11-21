-- Add analytics dashboard feature flag
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers, created_at, updated_at)
VALUES 
('analytics_dashboard', 'Analytics Dashboard', 'Basic analytics dashboard with essential metrics and charts', true, 'core', '["basic", "pro", "enterprise"]'::jsonb, NOW(), NOW())
ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  feature_description = EXCLUDED.feature_description,
  enabled = EXCLUDED.enabled,
  category = EXCLUDED.category,
  target_tiers = EXCLUDED.target_tiers,
  updated_at = NOW();