-- Update handle_new_user_profile function to add input validation and sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Validate and sanitize name from user metadata
  user_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'name', ''));
  
  -- Limit length to prevent DoS attacks (max 200 characters)
  IF LENGTH(user_name) > 200 THEN
    user_name := SUBSTRING(user_name, 1, 200);
  END IF;
  
  -- Insert profile with validated name
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, user_name);
  
  RETURN NEW;
END;
$$;