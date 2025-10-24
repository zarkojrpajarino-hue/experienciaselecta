-- Create table for pending gifts
CREATE TABLE public.pending_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  basket_name TEXT NOT NULL,
  basket_image TEXT,
  basket_category TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  gift_claimed BOOLEAN NOT NULL DEFAULT false,
  recipient_user_id UUID,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'España',
  shipping_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_gifts ENABLE ROW LEVEL SECURITY;

-- Policy: Recipient can view their gifts by email (before registration)
CREATE POLICY "Anyone can view gifts by email"
ON public.pending_gifts
FOR SELECT
USING (true);

-- Policy: Recipient can view their gifts after registration
CREATE POLICY "Users can view their claimed gifts"
ON public.pending_gifts
FOR SELECT
USING (recipient_user_id = auth.uid());

-- Policy: Recipients can update their gifts to claim them
CREATE POLICY "Recipients can claim and update their gifts"
ON public.pending_gifts
FOR UPDATE
USING (recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR recipient_user_id = auth.uid());

-- Policy: System can insert gifts (will be done via edge function with service role)
CREATE POLICY "Service role can insert gifts"
ON public.pending_gifts
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pending_gifts_updated_at
BEFORE UPDATE ON public.pending_gifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();