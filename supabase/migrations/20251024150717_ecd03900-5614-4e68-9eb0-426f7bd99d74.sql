-- Add personal note column to pending_gifts table
ALTER TABLE public.pending_gifts 
ADD COLUMN IF NOT EXISTS personal_note text;