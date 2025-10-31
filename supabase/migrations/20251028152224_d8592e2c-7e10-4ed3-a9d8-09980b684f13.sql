-- Habilitar extensiones necesarias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crear el cron job para sincronizar reviews cada 5 minutos
SELECT cron.schedule(
  'sync-reviews-from-paragenteselecta',
  '*/5 * * * *', -- cada 5 minutos
  $$
  SELECT
    net.http_post(
        url:='https://tyorpbzvjnasyaqbggcp.supabase.co/functions/v1/sync-reviews',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5b3JwYnp2am5hc3lhcWJnZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODI4MjIsImV4cCI6MjA3NDY1ODgyMn0.WTG7UBwYkuSWPruJL_Uz0u5l6wYJolakzI780q13B_U"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
