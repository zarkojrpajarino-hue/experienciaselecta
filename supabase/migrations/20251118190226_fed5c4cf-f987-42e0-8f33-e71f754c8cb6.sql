-- Permitir compras de invitados: hacer user_id nullable
ALTER TABLE public.customers 
ALTER COLUMN user_id DROP NOT NULL;

-- Actualizar RLS policies para permitir operaciones de invitados
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.customers;

-- Policy para insertar: usuarios autenticados O invitados (cuando user_id es null)
CREATE POLICY "Users and guests can insert customer data"
ON public.customers
FOR INSERT
WITH CHECK (
  user_id IS NULL OR (auth.uid() = user_id)
);

-- Policy para ver: usuarios autenticados ven sus datos, invitados ven por email
CREATE POLICY "Users and guests can view their customer data"
ON public.customers
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
);

-- Policy para actualizar: solo usuarios autenticados
CREATE POLICY "Users can update their own customer data"
ON public.customers
FOR UPDATE
USING (auth.uid() = user_id AND user_id IS NOT NULL);