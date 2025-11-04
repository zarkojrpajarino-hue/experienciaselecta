-- Fix purchases view security issue
-- Add security_barrier to properly enforce RLS from underlying tables

-- Drop the view and recreate with proper security settings
DROP VIEW IF EXISTS public.purchases;

CREATE VIEW public.purchases 
WITH (security_barrier = true)
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
WHERE o.status = 'completed';

-- Only grant access to authenticated users
GRANT SELECT ON public.purchases TO authenticated;

-- Revoke access from anon role to prevent unauthorized access
REVOKE SELECT ON public.purchases FROM anon;

COMMENT ON VIEW public.purchases IS 'Secure view of completed purchases. Uses security_barrier to enforce RLS policies from underlying tables (customers, orders, order_items). Only accessible to authenticated users.';