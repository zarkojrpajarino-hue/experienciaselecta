-- Add completed_at field to orders table
ALTER TABLE public.orders 
ADD COLUMN completed_at timestamp with time zone;

-- Create index for efficient querying
CREATE INDEX idx_orders_status_created_at ON public.orders(status, created_at);

-- Update trigger for reviews to notify admin
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This will be handled by edge function
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();