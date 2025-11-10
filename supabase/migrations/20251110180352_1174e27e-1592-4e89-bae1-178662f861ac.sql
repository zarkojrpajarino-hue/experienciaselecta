-- Remove security_barrier from views to rely on underlying table RLS policies
-- This ensures views don't bypass Row Level Security

DROP VIEW IF EXISTS public.completed_purchases;
DROP VIEW IF EXISTS public.purchases;

-- Recreate completed_purchases view with security_invoker
-- This makes the view execute with the permissions of the calling user, not the creator
-- The auth.uid() filter provides defense-in-depth
CREATE OR REPLACE VIEW public.completed_purchases
WITH (security_invoker = true)
AS
SELECT 
  o.id AS order_id,
  c.email AS user_email,
  c.name AS user_name,
  oi.basket_name,
  oi.basket_category,
  bc.image_url AS basket_image,
  oi.price_per_item AS price,
  oi.quantity,
  o.total_amount AS total_paid,
  o.completed_at AS purchase_date,
  'direct'::text AS purchase_type
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN basket_catalog bc ON oi.basket_name = bc.name
WHERE o.status = 'completed'
  AND c.user_id = auth.uid();

-- Recreate purchases view with security_invoker
-- This makes the view execute with the permissions of the calling user, not the creator
-- The auth.uid() filter provides defense-in-depth
CREATE OR REPLACE VIEW public.purchases
WITH (security_invoker = true)
AS
SELECT 
  c.user_id,
  c.email,
  c.name AS user_name,
  oi.basket_name,
  oi.basket_category,
  o.completed_at AS purchased_at,
  o.id AS order_id,
  o.status AS order_status
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
  AND c.user_id = auth.uid();