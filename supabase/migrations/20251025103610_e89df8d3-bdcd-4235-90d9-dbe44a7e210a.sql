-- Create table to track cookie consent timestamps
CREATE TABLE public.cookie_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  marketing_email_sent BOOLEAN NOT NULL DEFAULT false,
  marketing_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Users can insert their own consent
CREATE POLICY "Users can insert their own consent"
ON public.cookie_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own consent
CREATE POLICY "Users can view their own consent"
ON public.cookie_consents
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can update to mark email as sent
CREATE POLICY "Service role can update email status"
ON public.cookie_consents
FOR UPDATE
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_cookie_consents_pending ON public.cookie_consents(consented_at, marketing_email_sent) 
WHERE marketing_email_sent = false;