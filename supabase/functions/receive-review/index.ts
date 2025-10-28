import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

const reviewSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  basket_name: z.string().trim().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable()
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('SHOP_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid API key' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const review = await req.json();
    console.log('Received review:', review);

    // Validate input with Zod schema
    const validationResult = reviewSchema.safeParse(review);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.issues
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upsert the review
    const payload = {
      id: review.id,
      user_id: review.user_id,
      order_id: review.order_id,
      basket_name: review.basket_name,
      rating: review.rating,
      comment: review.comment || null,
      source_site: 'paragenteselecta',
    };

    const { data, error } = await supabase
      .from('reviews')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error inserting review:', error);
      throw error;
    }

    console.log('Review saved successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Review received and saved successfully',
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in receive-review:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request',
        message: error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
