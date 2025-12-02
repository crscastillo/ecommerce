-- Add tenant shipping settings table
-- This migration creates a table to store shipping method configurations for tenants

-- Create tenant shipping settings table
CREATE TABLE IF NOT EXISTS tenant_shipping_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  shipping_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_shipping_settings_tenant_id ON tenant_shipping_settings(tenant_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_tenant_shipping_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenant_shipping_settings_updated_at 
  BEFORE UPDATE ON tenant_shipping_settings
  FOR EACH ROW EXECUTE FUNCTION update_tenant_shipping_settings_updated_at();

-- Add table comment
COMMENT ON TABLE tenant_shipping_settings IS 'Stores shipping method configurations for each tenant';