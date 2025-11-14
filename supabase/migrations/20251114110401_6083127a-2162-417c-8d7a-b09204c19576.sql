-- Función para incrementar el contador de usos de un código de descuento
CREATE OR REPLACE FUNCTION public.increment_discount_uses(p_discount_code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE id = p_discount_code_id;
END;
$$;