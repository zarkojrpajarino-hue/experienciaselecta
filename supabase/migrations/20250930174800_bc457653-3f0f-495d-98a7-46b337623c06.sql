-- Add missing UPDATE policy for order_items table
-- This allows users to update order items that belong to their orders
CREATE POLICY "Users can update order items for their orders"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  order_id IN (
    SELECT o.id
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.user_id = auth.uid()
  )
);