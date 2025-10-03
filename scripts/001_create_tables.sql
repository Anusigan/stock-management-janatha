-- Create items table for master data
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sizes table for master data
CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  issued_quantity INTEGER DEFAULT 0,
  balance INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id ON stock_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_size_id ON stock_transactions(size_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for items table (allow all operations for now - can be restricted later)
CREATE POLICY "Allow all operations on items" ON items FOR ALL USING (true) WITH CHECK (true);

-- Create policies for sizes table
CREATE POLICY "Allow all operations on sizes" ON sizes FOR ALL USING (true) WITH CHECK (true);

-- Create policies for stock_transactions table
CREATE POLICY "Allow all operations on stock_transactions" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);
