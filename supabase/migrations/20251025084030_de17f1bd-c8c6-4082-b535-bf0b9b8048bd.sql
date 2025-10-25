-- Add sender_email column to pending_gifts table
ALTER TABLE public.pending_gifts 
ADD COLUMN IF NOT EXISTS sender_email TEXT;