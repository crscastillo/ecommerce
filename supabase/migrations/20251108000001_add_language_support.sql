-- Add language support to tenant settings
-- Migration to add language field to tenant settings

-- Add language column to tenants table
ALTER TABLE tenants ADD COLUMN language VARCHAR(5) DEFAULT 'en';

-- Add comment to explain the language field
COMMENT ON COLUMN tenants.language IS 'Language preference for the tenant (ISO 639-1 code with optional country code)';