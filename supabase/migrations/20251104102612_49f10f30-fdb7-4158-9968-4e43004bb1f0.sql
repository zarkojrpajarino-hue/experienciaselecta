-- Fix 1: Add RLS policies to basket_catalog for UPDATE and DELETE operations
-- Only service role should be able to modify the catalog

CREATE POLICY "Only service role can update catalog"
ON basket_catalog FOR UPDATE
USING (false);

CREATE POLICY "Only service role can delete catalog"
ON basket_catalog FOR DELETE
USING (false);

CREATE POLICY "Only service role can insert catalog items"
ON basket_catalog FOR INSERT
WITH CHECK (false);

-- Fix 2: Improve name validation in handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_name TEXT;
BEGIN
  -- Validate and sanitize name from user metadata
  user_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'name', ''));
  
  -- Remove control characters and potentially dangerous patterns
  user_name := REGEXP_REPLACE(user_name, '[\x00-\x1F\x7F<>"'']', '', 'g');
  
  -- Validate name doesn't contain only whitespace after sanitization
  IF LENGTH(TRIM(user_name)) = 0 THEN
    user_name := 'Usuario';
  END IF;
  
  -- Limit length to prevent DoS attacks (max 200 characters)
  IF LENGTH(user_name) > 200 THEN
    user_name := SUBSTRING(user_name, 1, 200);
  END IF;
  
  -- Insert profile with validated name
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, user_name)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;