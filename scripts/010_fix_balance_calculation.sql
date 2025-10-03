-- Fix Balance Calculation Script
-- This script recalculates all balance values correctly based on transaction history

-- Create a function to recalculate balances
DO $$
DECLARE
    rec RECORD;
    running_balance INTEGER := 0;
BEGIN
    -- For each unique combination of item_id, size_id, and brand
    FOR rec IN 
        SELECT DISTINCT item_id, size_id, brand 
        FROM stock_transactions 
        ORDER BY item_id, size_id, brand
    LOOP
        running_balance := 0;
        
        -- Update each transaction for this combination in chronological order
        UPDATE stock_transactions SET balance = (
            SELECT 
                CASE 
                    WHEN st1.transaction_type = 'Balance Forward' THEN st1.received_quantity
                    ELSE (
                        SELECT COALESCE(SUM(
                            CASE 
                                WHEN st2.received_quantity > 0 THEN st2.received_quantity 
                                ELSE -st2.issued_quantity 
                            END
                        ), 0)
                        FROM stock_transactions st2
                        WHERE st2.item_id = rec.item_id 
                        AND st2.size_id = rec.size_id 
                        AND st2.brand = rec.brand
                        AND (st2.transaction_date < st1.transaction_date 
                             OR (st2.transaction_date = st1.transaction_date AND st2.created_at <= st1.created_at))
                    ) + 
                    CASE 
                        WHEN st1.received_quantity > 0 THEN st1.received_quantity 
                        ELSE -st1.issued_quantity 
                    END
                END
            FROM stock_transactions st1 
            WHERE st1.id = stock_transactions.id
        )
        WHERE item_id = rec.item_id 
        AND size_id = rec.size_id 
        AND brand = rec.brand;
        
        RAISE NOTICE 'Updated balances for item_id: %, size_id: %, brand: %', rec.item_id, rec.size_id, rec.brand;
    END LOOP;
    
    RAISE NOTICE 'Balance recalculation completed successfully!';
END $$;
