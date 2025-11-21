-- Enable RLS for tenants table (if not already enabled)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select active tenants by subdomain (drop if exists first)
DROP POLICY IF EXISTS "Public select active tenants by subdomain" ON tenants;
CREATE POLICY "Public select active tenants by subdomain"
  ON tenants
  FOR SELECT
  USING (
    is_active = true
  );
