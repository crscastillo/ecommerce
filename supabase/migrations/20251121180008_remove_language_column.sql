-- Remove the language column from tenants table
-- Language preferences are now stored in the settings JSONB field

ALTER TABLE tenants DROP COLUMN IF EXISTS language;