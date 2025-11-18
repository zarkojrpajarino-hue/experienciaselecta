-- Create a security definer function to check if a user exists by email
-- This avoids loading all users into memory
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(user_email TEXT)
RETURNS TABLE(user_id UUID, user_exists BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    true as user_exists
  FROM auth.users au
  WHERE au.email = user_email
  LIMIT 1;
  
  -- If no rows returned, user doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, false;
  END IF;
END;
$$;

-- Add RLS policies for discount_codes table
CREATE POLICY "Public can view active discount codes"
ON discount_codes FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until >= now()));

CREATE POLICY "Service role can manage discount codes"
ON discount_codes FOR ALL
USING (false);

-- Add RLS policies for discount_code_usage table
CREATE POLICY "Users can view their own discount usage"
ON discount_code_usage FOR SELECT
USING (auth.uid() = user_id OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their discount usage"
ON discount_code_usage FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage discount usage"
ON discount_code_usage FOR UPDATE
USING (false);

CREATE POLICY "Service role can delete discount usage"
ON discount_code_usage FOR DELETE
USING (false);