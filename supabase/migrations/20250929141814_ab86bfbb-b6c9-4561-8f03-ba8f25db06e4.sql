-- CRITICAL SECURITY FIX: Remove anonymous access to customer personal data
-- This immediately fixes the data exposure vulnerability

-- Step 1: Update RLS policies to remove the vulnerable OR (user_id IS NULL) conditions
-- Drop existing policies for customers table
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.customers;

-- Create secure policies that only allow authenticated users to access their own data
CREATE POLICY "Users can view their own customer data" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer data" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can update their own customer data" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update orders table policies to remove the vulnerable conditions
DROP POLICY IF EXISTS "Users can view orders for their customer records" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders for their customer records" ON public.orders;
DROP POLICY IF EXISTS "Users can update orders for their customer records" ON public.orders;

CREATE POLICY "Users can view orders for their customer records" 
ON public.orders 
FOR SELECT 
USING (customer_id IN (
  SELECT customers.id 
  FROM customers 
  WHERE customers.user_id = auth.uid()
));

CREATE POLICY "Users can insert orders for their customer records" 
ON public.orders 
FOR INSERT 
WITH CHECK (customer_id IN (
  SELECT customers.id 
  FROM customers 
  WHERE customers.user_id = auth.uid()
));

CREATE POLICY "Users can update orders for their customer records" 
ON public.orders 
FOR UPDATE 
USING (customer_id IN (
  SELECT customers.id 
  FROM customers 
  WHERE customers.user_id = auth.uid()
));

-- Update order_items table policies to remove the vulnerable conditions
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;

CREATE POLICY "Users can view order items for their orders" 
ON public.order_items 
FOR SELECT 
USING (order_id IN (
  SELECT o.id 
  FROM orders o 
  JOIN customers c ON o.customer_id = c.id 
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Users can insert order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (order_id IN (
  SELECT o.id 
  FROM orders o 
  JOIN customers c ON o.customer_id = c.id 
  WHERE c.user_id = auth.uid()
));