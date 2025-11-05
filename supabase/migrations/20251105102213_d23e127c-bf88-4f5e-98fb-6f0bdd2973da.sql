-- Revoke anonymous access from database views to follow principle of least privilege
REVOKE SELECT ON public.purchases FROM anon;
REVOKE SELECT ON public.completed_purchases FROM anon;