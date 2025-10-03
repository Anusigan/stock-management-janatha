-- Update tables to include user_id for data isolation
-- Add user_id column to all tables

-- Add user_id to items table
ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to sizes table  
ALTER TABLE sizes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to stock_transactions table
ALTER TABLE stock_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing data to assign to current admin (optional)
-- UPDATE items SET user_id = 'your-admin-user-id' WHERE user_id IS NULL;
-- UPDATE sizes SET user_id = 'your-admin-user-id' WHERE user_id IS NULL; 
-- UPDATE stock_transactions SET user_id = 'your-admin-user-id' WHERE user_id IS NULL;

-- Drop old policies
DROP POLICY "Allow all operations on items" ON items;
DROP POLICY "Allow all operations on sizes" ON sizes;
DROP POLICY "Allow all operations on stock_transactions" ON stock_transactions;

-- Create new user-isolated policies for items
CREATE POLICY "Users can only access their own items" ON items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create new user-isolated policies for sizes
CREATE POLICY "Users can only access their own sizes" ON sizes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create new user-isolated policies for transactions
CREATE POLICY "Users can only access their own transactions" ON stock_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_sizes_user_id ON sizes(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON stock_transactions(user_id);
