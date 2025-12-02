-- Add RLS policies for tenant_shipping_settings table
-- This migration adds Row Level Security policies for the shipping settings table

-- Enable RLS on tenant_shipping_settings table
ALTER TABLE tenant_shipping_settings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tenant users can view their shipping settings" ON tenant_shipping_settings;
DROP POLICY IF EXISTS "Tenant users can manage their shipping settings" ON tenant_shipping_settings;
DROP POLICY IF EXISTS "Service role has full access to shipping settings" ON tenant_shipping_settings;

-- ============================================================================
-- TENANT SHIPPING SETTINGS RLS POLICIES
-- ============================================================================

-- Tenant users can view their own shipping settings
CREATE POLICY "Tenant users can view their shipping settings"
ON tenant_shipping_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_shipping_settings.tenant_id
    AND tu.user_id = auth.uid()
    AND tu.is_active = true
  )
);

-- Tenant users can manage their own shipping settings (insert, update, delete)
CREATE POLICY "Tenant users can manage their shipping settings"
ON tenant_shipping_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_shipping_settings.tenant_id
    AND tu.user_id = auth.uid()
    AND tu.is_active = true
    AND tu.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_shipping_settings.tenant_id
    AND tu.user_id = auth.uid()
    AND tu.is_active = true
    AND tu.role IN ('owner', 'admin')
  )
);

-- Service role has full access for API operations
CREATE POLICY "Service role has full access to shipping settings"
ON tenant_shipping_settings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions to service role
GRANT ALL ON tenant_shipping_settings TO service_role;

-- Add table comment
COMMENT ON TABLE tenant_shipping_settings IS 'Tenant shipping method configurations with RLS policies to ensure data isolation between tenants';