-- Fix pending_gifts RLS policy to restrict access to only recipients and senders
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view gifts by email" ON public.pending_gifts;

-- Create restrictive policy for recipients and senders only
CREATE POLICY "Recipients and senders can view gifts" 
ON public.pending_gifts 
FOR SELECT 
USING (
  (recipient_email = (auth.jwt() ->> 'email'::text)) OR 
  (recipient_user_id = auth.uid()) OR
  (order_id IN (
    SELECT o.id 
    FROM orders o 
    JOIN customers c ON o.customer_id = c.id 
    WHERE c.user_id = auth.uid()
  ))
);