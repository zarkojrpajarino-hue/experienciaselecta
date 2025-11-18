-- Enable Row Level Security on reviews table
-- This fixes the critical security issue where RLS policies exist but RLS is disabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Verification comment: After this migration, the existing RLS policies will be enforced:
-- - Anyone can view reviews (public read)
-- - Users can create reviews for their orders
-- - Users can update their own reviews
-- - Users can delete their own reviews