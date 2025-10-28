-- Add currency field to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add index for currency
CREATE INDEX IF NOT EXISTS idx_tenants_currency ON tenants(currency);

-- Update existing tenants to have a default currency if null
UPDATE tenants SET currency = 'USD' WHERE currency IS NULL;
