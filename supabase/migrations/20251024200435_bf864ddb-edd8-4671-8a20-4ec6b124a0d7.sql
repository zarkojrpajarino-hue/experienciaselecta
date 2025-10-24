-- Fix RLS: avoid referencing auth.users for pending_gifts updates
DROP POLICY IF EXISTS "Recipients can claim and update their gifts" ON public.pending_gifts;

CREATE POLICY "Recipients can claim and update their gifts"
ON public.pending_gifts
FOR UPDATE
TO authenticated
USING ((recipient_email = (auth.jwt() ->> 'email')::text) OR (recipient_user_id = auth.uid()))
WITH CHECK ((recipient_email = (auth.jwt() ->> 'email')::text) OR (recipient_user_id = auth.uid()));