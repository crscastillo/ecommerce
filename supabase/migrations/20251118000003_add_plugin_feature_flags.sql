-- Add plugin feature flags for tenant integrations
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers)
VALUES
  ('plugin_google_analytics', 'Google Analytics Plugin', 'Enable Google Analytics integration for tracking website visitor behavior and conversions', true, 'plugins', '["pro", "enterprise"]'::jsonb),
  ('plugin_facebook_pixel', 'Facebook Pixel Plugin', 'Enable Facebook Pixel integration for tracking conversions and creating custom audiences', true, 'plugins', '["pro", "enterprise"]'::jsonb),
  ('plugin_mailchimp', 'Mailchimp Plugin', 'Enable Mailchimp integration for email marketing and newsletter management', true, 'plugins', '["pro", "enterprise"]'::jsonb),
  ('plugin_whatsapp', 'WhatsApp Plugin', 'Enable WhatsApp integration for customer support and direct messaging', true, 'plugins', '["basic", "pro", "enterprise"]'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;

-- Add comment about plugin features
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants. Includes payment methods, security features, plugins, and other platform capabilities';