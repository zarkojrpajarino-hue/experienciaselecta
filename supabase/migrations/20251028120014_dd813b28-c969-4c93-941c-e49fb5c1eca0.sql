-- Add source_site column to reviews table to differentiate between sites
ALTER TABLE public.reviews 
ADD COLUMN source_site text NOT NULL DEFAULT 'experienciaselecta';

-- Add a check constraint to ensure valid source sites
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_source_site_check 
CHECK (source_site IN ('experienciaselecta', 'paragenteselecta'));

-- Create an index for faster filtering by source_site
CREATE INDEX idx_reviews_source_site ON public.reviews(source_site);

-- Create an index for faster filtering by user_id and source_site combined
CREATE INDEX idx_reviews_user_source ON public.reviews(user_id, source_site);