-- Create tenant_users_invitations table for user invitations
CREATE TABLE IF NOT EXISTS tenant_users_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'staff',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, email)
);

-- Enable RLS
ALTER TABLE tenant_users_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant_users_invitations
CREATE POLICY "Users can view invitations for their tenant" ON tenant_users_invitations
  FOR SELECT USING (
    tenant_id IN (
      -- Allow tenant owners
      SELECT id FROM tenants WHERE owner_id = auth.uid()
      UNION
      -- Allow tenant users with appropriate role
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can manage invitations for their tenant" ON tenant_users_invitations
  FOR ALL USING (
    tenant_id IN (
      -- Allow tenant owners
      SELECT id FROM tenants WHERE owner_id = auth.uid()
      UNION
      -- Allow tenant users with appropriate role  
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
      AND role IN ('owner', 'admin')
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tenant_users_invitations_tenant_id ON tenant_users_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_invitations_email ON tenant_users_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_users_invitations_active ON tenant_users_invitations(is_active) WHERE is_active = true;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
CREATE TRIGGER update_tenant_users_invitations_updated_at 
  BEFORE UPDATE ON tenant_users_invitations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();