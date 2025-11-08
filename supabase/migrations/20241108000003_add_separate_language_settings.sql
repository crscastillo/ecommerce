-- Add separate language settings for admin and store
-- This allows admins to work in one language while the store displays in another

-- Add new columns for separate language settings
ALTER TABLE tenants 
ADD COLUMN admin_language VARCHAR(10) DEFAULT 'en' CHECK (admin_language IN ('en', 'es')),
ADD COLUMN store_language VARCHAR(10) DEFAULT 'en' CHECK (store_language IN ('en', 'es'));

-- Migrate existing language data
UPDATE tenants 
SET 
  admin_language = COALESCE(language, 'en'),
  store_language = COALESCE(language, 'en')
WHERE admin_language IS NULL OR store_language IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN tenants.admin_language IS 'Language for admin interface (en=English, es=Spanish)';
COMMENT ON COLUMN tenants.store_language IS 'Language for public store interface (en=English, es=Spanish)';

-- Create index for language-based queries
CREATE INDEX IF NOT EXISTS idx_tenants_admin_language ON tenants(admin_language);
CREATE INDEX IF NOT EXISTS idx_tenants_store_language ON tenants(store_language);