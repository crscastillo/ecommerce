-- Add security feature flags for MFA and session management
INSERT INTO platform_feature_flags (feature_key, feature_name, feature_description, enabled, category, target_tiers)
VALUES
  ('mfa_sms_enabled', 'SMS Authentication', 'Enable SMS-based two-factor authentication for tenant users', false, 'security', '["pro", "enterprise"]'::jsonb),
  ('mfa_authenticator_enabled', 'Authenticator App', 'Enable authenticator app-based two-factor authentication (Google Authenticator, Authy, etc.)', false, 'security', '["basic", "pro", "enterprise"]'::jsonb),
  ('advanced_session_management', 'Advanced Session Management', 'Enable advanced session management features including device tracking and remote logout', true, 'security', '["pro", "enterprise"]'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;

-- Add comment about security features
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants. Includes payment methods, security features, and other platform capabilities';