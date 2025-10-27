-- Actualizar la vista completed_purchases para incluir basket_id único por cesta
DROP VIEW IF EXISTS public.completed_purchases;

CREATE OR REPLACE VIEW public.completed_purchases AS
-- Compras directas (no regalos) - muestra información del comprador
SELECT 
  oi.id as basket_id,
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

-- Regalos reclamados - muestra información del DESTINATARIO (cuando rellena datos de envío)
SELECT 
  pg.id as basket_id,
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

-- Permisos de acceso
GRANT SELECT ON public.completed_purchases TO authenticated;
GRANT SELECT ON public.completed_purchases TO anon;

-- Habilitar security invoker
ALTER VIEW public.completed_purchases SET (security_invoker = true);

COMMENT ON VIEW public.completed_purchases IS 'Vista compartida entre experienciaselecta-96945-03937.lovable.app y paragenteselecta.com - Cada cesta tiene su propio basket_id único. Muestra compras completadas con email del comprador (compras directas al pagar) o del destinatario (regalos cuando se completan datos de envío)';