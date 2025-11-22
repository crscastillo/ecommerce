-- Remove custom_css column from tenants table
-- This migration removes the custom CSS functionality

ALTER TABLE tenants DROP COLUMN IF EXISTS custom_css;