-- Primero, agregar 'completed' a los valores permitidos de status
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'completed'::text, 'cancelled'::text, 'refunded'::text]));

-- Insertar pedidos de prueba para demostración

-- Pedido 1: Pendiente (aparecerá en "Mis Pedidos")
DO $$
DECLARE
  pending_order_id UUID;
BEGIN
  INSERT INTO orders (
    customer_id, 
    total_amount, 
    status, 
    shipping_address_line1, 
    shipping_city, 
    shipping_postal_code, 
    shipping_country,
    created_at
  ) VALUES (
    'fc620c30-cb3b-4451-8ece-33a9d6b069df',
    8500,
    'pending',
    'Calle Principal 123',
    'Madrid',
    '28001',
    'España',
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO pending_order_id;

  -- Items del pedido pendiente
  INSERT INTO order_items (order_id, basket_name, basket_category, quantity, price_per_item) VALUES
  (pending_order_id, 'Pareja Gourmet', '2 personas', 1, 8500);
END $$;

-- Pedido 2: Completado (aparecerá en "Valoraciones")
DO $$
DECLARE
  completed_order_id UUID;
BEGIN
  INSERT INTO orders (
    customer_id, 
    total_amount, 
    status, 
    shipping_address_line1, 
    shipping_city, 
    shipping_postal_code, 
    shipping_country,
    created_at,
    completed_at
  ) VALUES (
    'fc620c30-cb3b-4451-8ece-33a9d6b069df',
    12000,
    'completed',
    'Calle Principal 123',
    'Madrid',
    '28001',
    'España',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '5 days'
  ) RETURNING id INTO completed_order_id;

  -- Items del pedido completado
  INSERT INTO order_items (order_id, basket_name, basket_category, quantity, price_per_item) VALUES
  (completed_order_id, 'Trio Ibérico', '3 personas', 1, 12000);
END $$;