-- Function to safely decrement product inventory
-- This ensures inventory doesn't go below 0 and handles both products and variants

CREATE OR REPLACE FUNCTION decrement_product_inventory(
  product_id UUID,
  variant_id UUID DEFAULT NULL,
  quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Handle variant inventory
  IF variant_id IS NOT NULL THEN
    UPDATE product_variants 
    SET inventory_quantity = GREATEST(0, inventory_quantity - quantity)
    WHERE id = variant_id AND product_id = product_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant not found: %', variant_id;
    END IF;
  ELSE
    -- Handle main product inventory
    UPDATE products 
    SET inventory_quantity = GREATEST(0, inventory_quantity - quantity)
    WHERE id = product_id AND track_inventory = true;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found or inventory tracking disabled: %', product_id;
    END IF;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update inventory: %', SQLERRM;
END;
$$;