-- Enable RLS for tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select active tenants by subdomain
CREATE POLICY "Public select active tenants by subdomain"
  ON tenants
  FOR SELECT
  USING (
    is_active = true
  );
