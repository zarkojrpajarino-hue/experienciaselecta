-- Insert two completed orders with "pareja inicial" baskets for zarkojrpajarino@gmail.com

-- First, get or create the customer record
DO $$
DECLARE
  v_customer_id uuid;
  v_user_id uuid;
  v_order_id_1 uuid;
  v_order_id_2 uuid;
BEGIN
  -- Get user_id from customers table for this email
  SELECT id, user_id INTO v_customer_id, v_user_id
  FROM customers 
  WHERE email = 'zarkojrpajarino@gmail.com' 
  LIMIT 1;

  -- Create first order
  INSERT INTO orders (
    customer_id,
    total_amount,
    status,
    completed_at,
    shipping_address_line1,
    shipping_city,
    shipping_postal_code,
    shipping_country,
    currency
  ) VALUES (
    v_customer_id,
    6500, -- 65 euros in cents
    'completed',
    now() - interval '10 days',
    'Calle Test 1',
    'Madrid',
    '28001',
    'España',
    'EUR'
  ) RETURNING id INTO v_order_id_1;

  -- Create order items for first order
  INSERT INTO order_items (
    order_id,
    basket_name,
    basket_category,
    quantity,
    price_per_item
  ) VALUES (
    v_order_id_1,
    'Cesta Romántica',
    'pareja inicial',
    1,
    6500
  );

  -- Create second order
  INSERT INTO orders (
    customer_id,
    total_amount,
    status,
    completed_at,
    shipping_address_line1,
    shipping_city,
    shipping_postal_code,
    shipping_country,
    currency
  ) VALUES (
    v_customer_id,
    6500, -- 65 euros in cents
    'completed',
    now() - interval '5 days',
    'Calle Test 1',
    'Madrid',
    '28001',
    'España',
    'EUR'
  ) RETURNING id INTO v_order_id_2;

  -- Create order items for second order
  INSERT INTO order_items (
    order_id,
    basket_name,
    basket_category,
    quantity,
    price_per_item
  ) VALUES (
    v_order_id_2,
    'Cesta Para Dos',
    'pareja inicial',
    1,
    6500
  );

END $$;