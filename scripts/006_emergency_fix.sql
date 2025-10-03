-- Emergency Fix: Temporarily allow all users access while we migrate
-- Run this in Supabase SQL Editor to fix the immediate login issues

-- Drop the restrictive policies temporarily
DROP POLICY IF EXISTS "Users can only access their own items" ON items;
DROP POLICY IF EXISTS "Users can only access their own sizes" ON sizes;
DROP POLICY IF EXISTS "Users can only access their own transactions" ON stock_transactions;

-- Create temporary open policies (like the original setup)
CREATE POLICY "Temporary allow all on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Temporary allow all on sizes" ON sizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Temporary allow all on transactions" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);

-- Note: This restores the original shared workspace behavior temporarily
-- Run this first to get the app working, then we can properly migrate later
