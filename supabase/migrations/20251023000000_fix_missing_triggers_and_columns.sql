-- Fix missing triggers and column inconsistencies
-- This migration adds missing updated_at trigger for cart_items
-- and removes updated_at from order_line_items types since they shouldn't have it

-- Add missing trigger for cart_items updated_at
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: order_line_items intentionally does not have updated_at column
-- Order line items are immutable after creation for audit purposes
-- The database types will be corrected to remove updated_at from order_line_items