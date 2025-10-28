-- Add country field to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS country VARCHAR(3) DEFAULT 'US';

-- Add index for country
CREATE INDEX IF NOT EXISTS idx_tenants_country ON tenants(country);

-- Update existing tenants to have a default country if null
UPDATE tenants SET country = 'US' WHERE country IS NULL;
