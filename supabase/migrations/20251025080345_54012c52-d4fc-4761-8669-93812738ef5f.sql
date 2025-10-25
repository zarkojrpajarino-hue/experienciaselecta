-- Add field to track reminder email
ALTER TABLE public.pending_gifts 
ADD COLUMN reminder_sent_at timestamp with time zone;

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to send gift reminders every 6 hours
-- This checks for gifts older than 72 hours that haven't been claimed
SELECT cron.schedule(
  'send-gift-reminders',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://tyorpbzvjnasyaqbggcp.supabase.co/functions/v1/resend-gift-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.cron_secret') || '"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);