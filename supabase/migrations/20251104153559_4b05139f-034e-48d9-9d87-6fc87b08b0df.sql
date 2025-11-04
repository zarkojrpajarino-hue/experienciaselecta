-- Recrear la vista purchases sin SECURITY DEFINER
CREATE OR REPLACE VIEW public.purchases
WITH (security_invoker = on)
AS
SELECT c.user_id,
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
WHERE o.status = 'completed';

-- Recrear la vista completed_purchases sin SECURITY DEFINER
CREATE OR REPLACE VIEW public.completed_purchases
WITH (security_invoker = on)
AS
SELECT oi.id AS basket_id,
    c.email AS user_email,
    c.name AS user_name,
    c.user_id,
    oi.basket_name,
    oi.basket_category,
    oi.price_per_item AS price,
    oi.quantity,
    o.id AS order_id,
    o.total_amount AS total_paid,
    o.completed_at AS purchase_date,
    'direct_purchase'::text AS purchase_type
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'completed' 
  AND NOT EXISTS (
    SELECT 1 FROM pending_gifts pg WHERE pg.order_id = o.id
  )
UNION ALL
SELECT pg.id AS basket_id,
    pg.recipient_email AS user_email,
    pg.recipient_name AS user_name,
    pg.recipient_user_id AS user_id,
    pg.basket_name,
    pg.basket_category,
    pg.price,
    pg.quantity,
    o.id AS order_id,
    o.total_amount AS total_paid,
    o.completed_at AS purchase_date,
    'received_gift'::text AS purchase_type
FROM pending_gifts pg
JOIN orders o ON pg.order_id = o.id
WHERE pg.gift_claimed = true 
  AND pg.shipping_completed = true 
  AND o.status = 'completed';