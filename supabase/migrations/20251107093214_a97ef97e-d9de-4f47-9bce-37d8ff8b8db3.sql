-- Crear tabla para trackear emails de recordatorio enviados
CREATE TABLE IF NOT EXISTS public.review_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_send_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.review_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reminders for their own orders
CREATE POLICY "Users can view their own reminders"
ON public.review_reminders
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  )
);

-- Policy: Service role can manage all reminders
CREATE POLICY "Service role can manage reminders"
ON public.review_reminders
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_review_reminders_order_id ON public.review_reminders(order_id);
CREATE INDEX idx_review_reminders_next_send_at ON public.review_reminders(next_send_at);

-- Trigger to update updated_at
CREATE TRIGGER update_review_reminders_updated_at
BEFORE UPDATE ON public.review_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.review_reminders IS 'Tracks review reminder emails sent to customers with intelligent spacing (24h, 3d, 7d)';
COMMENT ON COLUMN public.review_reminders.reminder_count IS 'Number of reminders sent (max 3)';
COMMENT ON COLUMN public.review_reminders.next_send_at IS 'When the next reminder should be sent (NULL if max reached)';