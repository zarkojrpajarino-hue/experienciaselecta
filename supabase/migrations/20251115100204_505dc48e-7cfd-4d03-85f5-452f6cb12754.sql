-- Add discount tracking columns to orders table
ALTER TABLE orders
ADD COLUMN discount_code_id uuid REFERENCES discount_codes(id),
ADD COLUMN discount_amount integer;

COMMENT ON COLUMN orders.discount_code_id IS 'Reference to the discount code used in this order';
COMMENT ON COLUMN orders.discount_amount IS 'Discount amount applied in cents';