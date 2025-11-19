-- Add status field to customers table
-- This migration adds a status field to track customer account status

ALTER TABLE customers 
ADD COLUMN status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update existing customers to have active status
UPDATE customers SET status = 'active' WHERE status IS NULL;