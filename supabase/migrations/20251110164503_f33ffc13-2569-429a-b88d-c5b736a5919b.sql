-- Fix 1: Enable RLS on basket_experiences table and add policies
ALTER TABLE public.basket_experiences ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own basket experiences
CREATE POLICY "Users can view their own experiences"
ON public.basket_experiences
FOR SELECT
TO authenticated
USING (user_email = (auth.jwt() ->> 'email')::text);

-- Allow users to insert their own basket experiences
CREATE POLICY "Users can insert their own experiences"
ON public.basket_experiences
FOR INSERT
TO authenticated
WITH CHECK (user_email = (auth.jwt() ->> 'email')::text);

-- Allow users to update their own basket experiences
CREATE POLICY "Users can update their own experiences"
ON public.basket_experiences
FOR UPDATE
TO authenticated
USING (user_email = (auth.jwt() ->> 'email')::text)
WITH CHECK (user_email = (auth.jwt() ->> 'email')::text);

-- Fix 2: Revoke anonymous access from completed_purchases view
REVOKE SELECT ON public.completed_purchases FROM anon;

-- Also revoke anonymous access from purchases view for consistency
REVOKE SELECT ON public.purchases FROM anon;