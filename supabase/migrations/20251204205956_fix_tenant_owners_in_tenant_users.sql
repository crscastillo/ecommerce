-- Migration to add missing tenant owners to tenant_users table
-- This migration adds tenant owners who are missing from the tenant_users table

INSERT INTO tenant_users (
  tenant_id,
  user_id, 
  role,
  is_active,
  invited_at,
  accepted_at,
  created_at
)
SELECT 
  t.id as tenant_id,
  t.owner_id as user_id,
  'owner' as role,
  true as is_active,
  t.created_at as invited_at,
  t.created_at as accepted_at,
  NOW() as created_at
FROM tenants t
LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND t.owner_id = tu.user_id
WHERE tu.id IS NULL -- Only insert if the owner is not already in tenant_users
  AND t.is_active = true
  AND t.owner_id IS NOT NULL;
