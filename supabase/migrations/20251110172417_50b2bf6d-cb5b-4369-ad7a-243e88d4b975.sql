-- Drop existing views that lack proper access control
DROP VIEW IF EXISTS public.completed_purchases;
DROP VIEW IF EXISTS public.purchases;

-- Recreate completed_purchases view with user filtering
-- This view now only shows data for the authenticated user
CREATE OR REPLACE VIEW public.completed_purchases AS
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
  AND c.user_id = auth.uid();  -- Filter by authenticated user

-- Recreate purchases view with user filtering
-- This view now only shows data for the authenticated user
CREATE OR REPLACE VIEW public.purchases AS
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
  AND c.user_id = auth.uid();  -- Filter by authenticated user