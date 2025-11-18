-- Create validation_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.validation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  code_attempted text NOT NULL,
  user_email text,
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add index for efficient rate limit queries
CREATE INDEX idx_validation_attempts_ip_time ON public.validation_attempts(ip_address, created_at DESC);

-- Enable RLS
ALTER TABLE public.validation_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage validation attempts
CREATE POLICY "Service role can manage validation attempts"
ON public.validation_attempts
FOR ALL
USING (false);

-- Create function to clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_validation_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.validation_attempts
  WHERE created_at < now() - interval '24 hours';
END;
$$;