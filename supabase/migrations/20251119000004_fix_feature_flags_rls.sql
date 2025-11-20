-- Ensure platform feature flags can be inserted during migrations
-- This addresses RLS policy issues that may prevent feature flag insertion

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can insert feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can delete feature flags" ON platform_feature_flags;

-- Add INSERT policy for authenticated users (for API-based administration)
CREATE POLICY "Authenticated users can insert feature flags"
ON platform_feature_flags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add DELETE policy for platform administration  
CREATE POLICY "Authenticated users can delete feature flags"
ON platform_feature_flags
FOR DELETE
USING (auth.role() = 'authenticated');

-- Grant necessary permissions to service role for migrations
GRANT INSERT, UPDATE, DELETE ON platform_feature_flags TO service_role;

-- Add comment about RLS policies
COMMENT ON TABLE platform_feature_flags IS 'Platform-level feature flags to control which features are available to tenants. RLS policies allow authenticated users full access for platform administration.';