-- Remove legacy language column from tenants table
-- The language functionality has been split into admin_language and store_language
ALTER TABLE tenants DROP COLUMN IF EXISTS language;