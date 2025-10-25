-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'send-scheduled-marketing-emails',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tyorpbzvjnasyaqbggcp.supabase.co/functions/v1/send-scheduled-marketing-emails',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
        ),
        body:=jsonb_build_object('time', now())
    ) as request_id;
  $$
);