-- Add some test variants for the Amino Energy product
-- The product ID is: 2a0ebc75-395f-4a3b-b00d-26a08cdd422c
-- The tenant ID is: 0889434f-f0b1-4938-906a-85fc22ae1bd5

INSERT INTO product_variants (
  id,
  tenant_id,
  product_id,
  title,
  option1,
  sku,
  price,
  compare_price,
  inventory_quantity,
  is_active
) VALUES 
(
  gen_random_uuid(),
  '0889434f-f0b1-4938-906a-85fc22ae1bd5',
  '2a0ebc75-395f-4a3b-b00d-26a08cdd422c',
  'Fruit Punch',
  'Fruit Punch',
  'AMINO-FRUIT-200G',
  29.99,
  34.99,
  15,
  true
),
(
  gen_random_uuid(),
  '0889434f-f0b1-4938-906a-85fc22ae1bd5',
  '2a0ebc75-395f-4a3b-b00d-26a08cdd422c',
  'Blue Raspberry',
  'Blue Raspberry',
  'AMINO-BLUE-200G',
  29.99,
  34.99,
  8,
  true
),
(
  gen_random_uuid(),
  '0889434f-f0b1-4938-906a-85fc22ae1bd5',
  '2a0ebc75-395f-4a3b-b00d-26a08cdd422c',
  'Grape',
  'Grape',
  'AMINO-GRAPE-200G',
  29.99,
  34.99,
  3,
  true
),
(
  gen_random_uuid(),
  '0889434f-f0b1-4938-906a-85fc22ae1bd5',
  '2a0ebc75-395f-4a3b-b00d-26a08cdd422c',
  'Watermelon',
  'Watermelon',
  'AMINO-WATER-200G',
  32.99,
  37.99,
  0,
  true
);