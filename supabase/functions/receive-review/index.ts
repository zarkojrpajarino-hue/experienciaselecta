import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

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

    // Validate required fields
    if (!review.id || !review.rating || !review.basket_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, rating, basket_name' }),
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
        error: error?.message || 'Unknown error occurred',
        details: error?.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
