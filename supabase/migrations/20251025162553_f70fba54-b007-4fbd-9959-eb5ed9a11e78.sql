-- Delete corrupt orders that have no items and no payment intent
-- These are test orders from 2025-10-25 with total_amount of 65 cents instead of 65 euros

DELETE FROM orders 
WHERE id IN (
  'bfcd2b05-a3b9-4857-a47c-6ca7ef018e64',
  'd60460c7-3aa2-4a33-af74-dbf72ae98803'
)
AND stripe_payment_intent_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id
);
