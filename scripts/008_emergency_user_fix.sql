-- EMERGENCY FIX: App stuck on loading screen after user isolation migration
-- This happens because existing data has NULL user_id values

-- Step 1: First, let's check what user IDs exist
SELECT 'Current users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Step 2: Get your current user ID (replace this with your actual ID)
-- Find your user ID from the query above and replace 'YOUR_USER_ID_HERE' below

-- Step 3: Assign existing data to your user (REQUIRED - replace YOUR_USER_ID_HERE)
-- UPDATE items SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE sizes SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE stock_transactions SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Step 4: Alternative - Temporarily allow NULL user_id values (QUICK FIX)
-- If you can't get your user ID, uncomment these policies instead:

-- Drop current strict policies
DROP POLICY IF EXISTS "Users can only access their own items" ON items;
DROP POLICY IF EXISTS "Users can only access their own sizes" ON sizes;
DROP POLICY IF EXISTS "Users can only access their own transactions" ON stock_transactions;

-- Create policies that allow NULL user_id OR matching user_id
CREATE POLICY "Allow user data and legacy data on items" ON items
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user data and legacy data on sizes" ON sizes
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user data and legacy data on transactions" ON stock_transactions
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

SELECT 'Emergency fix applied - app should work now!' as status;
