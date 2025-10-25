-- Update existing pending_gifts records that don't have sender_email
-- Set sender_email to a default value or extract from order metadata if available
UPDATE public.pending_gifts
SET sender_email = 'zarkojr.nova@gmail.com'
WHERE sender_email IS NULL AND sender_name = 'Usuario Nova';

UPDATE public.pending_gifts
SET sender_email = 'info@lapajareria.com'
WHERE sender_email IS NULL AND sender_name != 'Usuario Nova';