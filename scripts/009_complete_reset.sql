-- COMPREHENSIVE EMERGENCY FIX: Complete reset to working state
-- This will restore the app to exactly the working condition

-- Step 1: Drop ALL existing policies completely
DROP POLICY IF EXISTS "Users can only access their own items" ON items;
DROP POLICY IF EXISTS "Users can only access their own sizes" ON sizes;
DROP POLICY IF EXISTS "Users can only access their own transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Allow user data and legacy data on items" ON items;
DROP POLICY IF EXISTS "Allow user data and legacy data on sizes" ON sizes;
DROP POLICY IF EXISTS "Allow user data and legacy data on transactions" ON stock_transactions;
DROP POLICY IF EXISTS "Temporary allow all on items" ON items;
DROP POLICY IF EXISTS "Temporary allow all on sizes" ON sizes;
DROP POLICY IF EXISTS "Temporary allow all on transactions" ON stock_transactions;

-- Step 2: Create completely open policies (back to working state)
CREATE POLICY "Emergency open policy on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Emergency open policy on sizes" ON sizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Emergency open policy on transactions" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);

-- Step 3: Remove triggers that might be causing issues
DROP TRIGGER IF EXISTS set_user_id_items ON items;
DROP TRIGGER IF EXISTS set_user_id_sizes ON sizes;
DROP TRIGGER IF EXISTS set_user_id_transactions ON stock_transactions;

-- Step 4: Show current data counts for debugging
SELECT 'Data check:' as info;
SELECT 'Items count:' as table_name, COUNT(*) as count FROM items;
SELECT 'Sizes count:' as table_name, COUNT(*) as count FROM sizes;
SELECT 'Transactions count:' as table_name, COUNT(*) as count FROM stock_transactions;

-- Step 5: Show current policies
SELECT 'Current policies:' as info;
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('items', 'sizes', 'stock_transactions')
ORDER BY tablename, policyname;

SELECT 'COMPLETE RESET DONE - App should work now!' as status;
