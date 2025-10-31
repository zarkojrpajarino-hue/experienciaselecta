-- Update the completed_purchases view to include user name and all required fields
DROP VIEW IF EXISTS public.completed_purchases;

CREATE OR REPLACE VIEW public.completed_purchases AS
-- Direct purchases (non-gifts) - shows buyer's information
SELECT 
  c.email as user_email,
  c.name as user_name,
  c.user_id,
  oi.basket_name,
  oi.basket_category,
  oi.price_per_item as price,
  oi.quantity,
  (oi.price_per_item * oi.quantity) as total_paid,
  o.id as order_id,
  o.completed_at as purchase_date,
  'direct_purchase' as purchase_type
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
  AND o.id NOT IN (SELECT DISTINCT order_id FROM pending_gifts)

UNION ALL

-- Claimed gifts - shows RECIPIENT's information (when they fill shipping data)
SELECT 
  pg.recipient_email as user_email,
  pg.recipient_name as user_name,
  pg.recipient_user_id as user_id,
  pg.basket_name,
  pg.basket_category,
  pg.price,
  pg.quantity,
  (pg.price * pg.quantity) as total_paid,
  pg.order_id,
  o.completed_at as purchase_date,
  'received_gift' as purchase_type
FROM pending_gifts pg
JOIN orders o ON pg.order_id = o.id
WHERE pg.gift_claimed = true 
  AND pg.shipping_completed = true
  AND o.status = 'completed';

-- Grant access to authenticated users
GRANT SELECT ON public.completed_purchases TO authenticated;

-- Allow anon access too (for the other website to query)
GRANT SELECT ON public.completed_purchases TO anon;

-- Enable security invoker
ALTER VIEW public.completed_purchases SET (security_invoker = true);

COMMENT ON VIEW public.completed_purchases IS 'Vista compartida entre selectaexperiencia.com y paragenteselecta.com - Muestra compras completadas con email del comprador (compras directas) o del destinatario (regalos reclamados)';