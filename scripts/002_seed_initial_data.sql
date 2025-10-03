-- Seed some initial items
INSERT INTO items (name) VALUES 
  ('T-Shirt'),
  ('Jeans'),
  ('Shoes'),
  ('Jacket')
ON CONFLICT (name) DO NOTHING;

-- Seed some initial sizes
INSERT INTO sizes (name) VALUES 
  ('XS'),
  ('S'),
  ('M'),
  ('L'),
  ('XL'),
  ('XXL')
ON CONFLICT (name) DO NOTHING;
