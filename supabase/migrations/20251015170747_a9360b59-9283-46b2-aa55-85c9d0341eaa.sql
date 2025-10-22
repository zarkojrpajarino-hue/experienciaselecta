-- Fix security issues identified in security scan

-- 1. Make user_id NOT NULL in customers table
-- First check if there are any NULL values
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM customers WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot add NOT NULL constraint: customers table contains NULL user_id values. Please clean up data first.';
  END IF;
END $$;

-- Add NOT NULL constraint to enforce user association
ALTER TABLE customers 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Add CHECK constraint for review ratings (1-5 range)
ALTER TABLE reviews 
ADD CONSTRAINT rating_range 
CHECK (rating >= 1 AND rating <= 5);