-- Create a view that simplifies access to purchase data for the experience web
CREATE OR REPLACE VIEW public.purchases AS
SELECT 
  c.user_id,
  c.email,
  c.name as user_name,
  oi.basket_name,
  oi.basket_category,
  o.completed_at as purchased_at,
  o.id as order_id,
  o.status as order_status
FROM public.customers c
INNER JOIN public.orders o ON o.customer_id = c.id
INNER JOIN public.order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed';

-- Enable RLS on the view
ALTER VIEW public.purchases SET (security_invoker = true);

-- Create RLS policy for the purchases view
-- Users can only see their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.customers
FOR SELECT
USING (auth.uid() = user_id);

-- Grant select permission on the view to authenticated users
GRANT SELECT ON public.purchases TO authenticated;