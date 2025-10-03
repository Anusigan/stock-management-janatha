-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to stock_transactions table
ALTER TABLE stock_transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'Received',
ADD COLUMN IF NOT EXISTS grn_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_order_number TEXT,
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create index for customer lookups
CREATE INDEX IF NOT EXISTS idx_stock_transactions_customer_id ON stock_transactions(customer_id);

-- Enable RLS for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers table
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
