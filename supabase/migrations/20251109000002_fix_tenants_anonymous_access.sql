-- Allow anonymous access to lookup tenants by subdomain
-- This is required for middleware to work properly
CREATE POLICY "Anonymous users can lookup active tenants by subdomain" ON tenants
  FOR SELECT 
  USING (is_active = true);