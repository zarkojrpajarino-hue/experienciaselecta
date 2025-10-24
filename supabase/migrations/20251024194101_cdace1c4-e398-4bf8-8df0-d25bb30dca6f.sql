-- Insertar un regalo pendiente para testing
INSERT INTO pending_gifts (
  order_id,
  sender_name,
  recipient_name,
  recipient_email,
  basket_name,
  basket_category,
  price,
  quantity,
  personal_note,
  gift_claimed,
  shipping_completed
) VALUES (
  '17d22ed8-774a-4b4c-b463-b1fe47c2ea50',
  'María García',
  'Destinatario Test',
  'zarkojrnova@gmail.com',
  'Pareja Inicial',
  'Pareja (2 personas)',
  9900,
  1,
  '¡Disfruta de esta experiencia gastronómica única!',
  false,
  false
);