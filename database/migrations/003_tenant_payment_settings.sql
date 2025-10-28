-- Create tenant_payment_settings table
CREATE TABLE IF NOT EXISTS tenant_payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  payment_methods JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one config per tenant
  UNIQUE(tenant_id)
);

-- Add RLS policies
ALTER TABLE tenant_payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can only access their own payment settings
CREATE POLICY "Tenants can manage their own payment settings" ON tenant_payment_settings
  FOR ALL USING (tenant_id = auth.uid());

-- Add indexes
CREATE INDEX idx_tenant_payment_settings_tenant_id ON tenant_payment_settings(tenant_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_tenant_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_payment_settings_updated_at
  BEFORE UPDATE ON tenant_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_payment_settings_updated_at();