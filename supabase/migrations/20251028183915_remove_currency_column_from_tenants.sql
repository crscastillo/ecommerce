-- Remove the redundant currency column from tenants table
-- Currency is now stored only in settings.currency for consistency
ALTER TABLE tenants DROP COLUMN IF EXISTS currency;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_tenants_currency;
