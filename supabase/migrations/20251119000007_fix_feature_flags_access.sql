-- Fix RLS policies to allow proper access to platform feature flags
-- The current policies may be too restrictive and preventing normal access

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can update feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can insert feature flags" ON platform_feature_flags;
DROP POLICY IF EXISTS "Authenticated users can delete feature flags" ON platform_feature_flags;

-- Create more permissive policies for platform feature flags
-- Allow all authenticated users to read feature flags (they control platform capabilities)
CREATE POLICY "Anyone can view platform feature flags"
ON platform_feature_flags
FOR SELECT
USING (true);

-- Allow authenticated users to manage feature flags (for platform admin)
CREATE POLICY "Authenticated users can manage feature flags"
ON platform_feature_flags
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Also allow service role full access for migrations and system operations
CREATE POLICY "Service role has full access"
ON platform_feature_flags
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Verify we can now read the feature flags
DO $$
DECLARE
    flag_count INTEGER;
BEGIN
    -- Count payment method flags
    SELECT COUNT(*) INTO flag_count 
    FROM platform_feature_flags 
    WHERE category = 'payment_methods';
    
    RAISE NOTICE 'Payment method feature flags accessible: % records', flag_count;
    
    IF flag_count = 0 THEN
        RAISE WARNING 'No payment method feature flags found - this may indicate a data insertion issue';
    END IF;
END $$;