-- Update existing "Pareja Inicial" order to completed status
UPDATE public.orders
SET 
  status = 'completed',
  completed_at = now()
WHERE id = 'c0dc1662-6237-4ae0-8ce6-f62e0452f128'
  AND customer_id = 'fc620c30-cb3b-4451-8ece-33a9d6b069df';