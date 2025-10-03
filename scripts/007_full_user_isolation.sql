-- Full User Isolation Migration - Run this after emergency fix is working
-- This will implement individual user workspaces properly

-- Step 1: Add user_id columns if they don't exist
DO $$ 
BEGIN
    -- Add user_id to items table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='items' AND column_name='user_id') THEN
        ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    END IF;

    -- Add user_id to sizes table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='sizes' AND column_name='user_id') THEN
        ALTER TABLE sizes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_sizes_user_id ON sizes(user_id);
    END IF;

    -- Add user_id to stock_transactions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='stock_transactions' AND column_name='user_id') THEN
        ALTER TABLE stock_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON stock_transactions(user_id);
    END IF;
END $$;

-- Step 2: Create a function to automatically set user_id for new rows
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create triggers to automatically set user_id for new records
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

-- Step 4: Replace temporary policies with user-isolated ones
-- Drop temporary open policies
DROP POLICY IF EXISTS "Temporary allow all on items" ON items;
DROP POLICY IF EXISTS "Temporary allow all on sizes" ON sizes; 
DROP POLICY IF EXISTS "Temporary allow all on transactions" ON stock_transactions;

-- Create user-isolated policies
CREATE POLICY "Users can only access their own items" ON items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only access their own sizes" ON sizes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only access their own transactions" ON stock_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 5: Optional - Assign existing data to first admin user
-- Uncomment and replace 'YOUR_USER_ID' with actual user ID if you want to keep existing data
-- UPDATE items SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE sizes SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE stock_transactions SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- Success message
SELECT 'User isolation migration completed successfully!' as status;
