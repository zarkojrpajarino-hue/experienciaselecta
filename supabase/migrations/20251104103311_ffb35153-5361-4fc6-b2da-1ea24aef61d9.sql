-- Fix completed_purchases view security issue
-- Remove anon access and add security_barrier to properly enforce RLS from underlying tables

-- Drop the view and recreate with proper security settings
DROP VIEW IF EXISTS public.completed_purchases;

CREATE VIEW public.completed_purchases 
WITH (security_barrier = true)
AS
-- Direct purchases (non-gifts) - shows buyer's information
SELECT 
  oi.id as basket_id,
  c.email as user_email,
  c.name as user_name,
  c.user_id,
  oi.basket_name,
  oi.basket_category,
  oi.price_per_item as price,
  oi.quantity,
  o.id as order_id,
  o.total_amount as total_paid,
  o.completed_at as purchase_date,
  'direct_purchase' as purchase_type
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM pending_gifts pg 
    WHERE pg.order_id = o.id
  )

UNION ALL

-- Claimed gifts - shows recipient's information
SELECT 
  pg.id as basket_id,
  pg.recipient_email as user_email,
  pg.recipient_name as user_name,
  pg.recipient_user_id as user_id,
  pg.basket_name,
  pg.basket_category,
  pg.price,
  pg.quantity,
  o.id as order_id,
  o.total_amount as total_paid,
  o.completed_at as purchase_date,
  'received_gift' as purchase_type
FROM pending_gifts pg
JOIN orders o ON pg.order_id = o.id
WHERE pg.gift_claimed = true 
  AND pg.shipping_completed = true
  AND o.status = 'completed';

-- Only grant access to authenticated users
GRANT SELECT ON public.completed_purchases TO authenticated;

-- Revoke access from anon role to prevent unauthorized access
REVOKE SELECT ON public.completed_purchases FROM anon;

COMMENT ON VIEW public.completed_purchases IS 'Secure view of completed purchases. Uses security_barrier to enforce RLS policies from underlying tables (customers, orders, order_items, pending_gifts). Only accessible to authenticated users.';