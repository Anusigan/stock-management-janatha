-- Run this migration manually in Supabase SQL Editor
-- This creates user isolation for individual businesses

-- First, let's check if columns already exist before adding them
DO $$ 
BEGIN
    -- Add user_id to items table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='items' AND column_name='user_id') THEN
        ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add user_id to sizes table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='sizes' AND column_name='user_id') THEN
        ALTER TABLE sizes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add user_id to stock_transactions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='stock_transactions' AND column_name='user_id') THEN
        ALTER TABLE stock_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop existing policies safely
DROP POLICY IF EXISTS "Allow all operations on items" ON items;
DROP POLICY IF EXISTS "Allow all operations on sizes" ON sizes;
DROP POLICY IF EXISTS "Allow all operations on stock_transactions" ON stock_transactions;

-- Create user-isolated policies for items
CREATE POLICY "Users can only access their own items" ON items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create user-isolated policies for sizes
CREATE POLICY "Users can only access their own sizes" ON sizes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create user-isolated policies for transactions
CREATE POLICY "Users can only access their own transactions" ON stock_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_sizes_user_id ON sizes(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON stock_transactions(user_id);

-- Create a function to automatically set user_id for new rows
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set user_id
DROP TRIGGER IF EXISTS set_user_id_items ON items;
CREATE TRIGGER set_user_id_items
    BEFORE INSERT ON items
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_sizes ON sizes;
CREATE TRIGGER set_user_id_sizes
    BEFORE INSERT ON sizes
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_transactions ON stock_transactions;
CREATE TRIGGER set_user_id_transactions
    BEFORE INSERT ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
