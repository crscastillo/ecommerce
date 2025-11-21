-- Consolidated Platform Feature Flags RLS Policies
-- This migration provides comprehensive RLS policies for platform_feature_flags table

-- Enable RLS on platform_feature_flags table
ALTER TABLE platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can update feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can insert feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can delete feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Anyone can view platform feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can manage feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Service role has full access" ON platform_feature_flags;

-- ============================================================================
-- PLATFORM FEATURE FLAGS RLS POLICIES
-- ============================================================================

-- Public can view platform feature flags (they control platform capabilities)
CREATE POLICY "Anyone can view platform feature flags"
ON platform_feature_flags
FOR SELECT
USING (true);

-- Authenticated users can manage feature flags (for platform administration)
CREATE POLICY "Authenticated users can manage feature flags"
ON platform_feature_flags
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Service role has full access for migrations and system operations
CREATE POLICY "Service role has full access"
ON platform_feature_flags
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions to service role for migrations
GRANT INSERT, UPDATE, DELETE ON platform_feature_flags TO service_role;

-- Add table comment
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants. Public read access allows UI to query available features, authenticated users can manage for platform administration.';