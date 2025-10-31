-- Create a view that shows completed purchases for verification
-- For direct purchases: shows buyer's email
-- For claimed gifts: shows recipient's email
CREATE OR REPLACE VIEW public.completed_purchases AS
-- Direct purchases (non-gifts)
SELECT 
  c.email,
  c.user_id,
  oi.basket_name,
  oi.basket_category,
  oi.price_per_item as price,
  oi.quantity,
  o.id as order_id,
  o.completed_at,
  'direct_purchase' as purchase_type
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
  AND o.id NOT IN (SELECT DISTINCT order_id FROM pending_gifts)

UNION ALL

-- Claimed gifts (recipient has filled shipping info)
SELECT 
  pg.recipient_email as email,
  pg.recipient_user_id as user_id,
  pg.basket_name,
  pg.basket_category,
  pg.price,
  pg.quantity,
  pg.order_id,
  o.completed_at,
  'received_gift' as purchase_type
FROM pending_gifts pg
JOIN orders o ON pg.order_id = o.id
WHERE pg.gift_claimed = true 
  AND pg.shipping_completed = true
  AND o.status = 'completed';

-- Grant access to authenticated users to view their own purchases
GRANT SELECT ON public.completed_purchases TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.completed_purchases SET (security_invoker = true);