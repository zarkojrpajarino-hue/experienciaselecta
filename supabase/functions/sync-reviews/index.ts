import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enhanced CRON authentication with timestamp validation
    const cronSecret = req.headers.get('authorization')?.replace('Bearer ', '');
    const validCronSecret = Deno.env.get('CRON_SECRET');
    const requestTimestamp = req.headers.get('X-Request-Timestamp');

    if (!cronSecret || cronSecret !== validCronSecret) {
      console.error('Unauthorized sync attempt - invalid secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid authentication' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Validate timestamp to prevent replay attacks (allow 5 minute window)
    if (requestTimestamp) {
      const timestamp = parseInt(requestTimestamp, 10);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (isNaN(timestamp) || Math.abs(now - timestamp) > fiveMinutes) {
        console.error('Unauthorized sync attempt - invalid or expired timestamp');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Request expired or invalid timestamp' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
    }

    console.log('Starting reviews synchronization...');

    // Cliente para este proyecto (experienciaselecta)
    const localSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate environment variables for remote Supabase
    const remoteUrl = Deno.env.get('PARAGENTESELECTA_SUPABASE_URL');
    const remoteKey = Deno.env.get('PARAGENTESELECTA_SERVICE_ROLE_KEY');

    if (!remoteUrl || !remoteKey) {
      console.error('Missing remote Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Configuration error - missing remote credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Cliente para paragenteselecta.com
    const remoteSupabase = createClient(remoteUrl, remoteKey);

    console.log('Fetching reviews from paragenteselecta.com...');

    // Obtener solo columnas necesarias
    const { data: remoteReviews, error: fetchError } = await remoteSupabase
      .from('reviews')
      .select('id,rating,comment,basket_name,user_id,order_id,created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching remote reviews:', fetchError);
      throw new Error(`Failed to fetch reviews: ${fetchError.message}`);
    }

    if (!remoteReviews || remoteReviews.length === 0) {
      console.log('No reviews found in paragenteselecta.com');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No reviews to sync',
          synced: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${remoteReviews.length} reviews from paragenteselecta.com`);

    // Para cada review remota, verificar si ya existe localmente
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const review of remoteReviews) {
      // Verificar si la review ya existe en este proyecto
      const { data: existingReview } = await localSupabase
        .from('reviews')
        .select('id')
        .eq('id', review.id)
        .maybeSingle();

      // Upsert basado en ID; omitimos created_at/updated_at para usar defaults
      const payload = {
        id: review.id,
        user_id: review.user_id,
        order_id: review.order_id,
        basket_name: review.basket_name,
        rating: review.rating,
        comment: review.comment,
        source_site: 'paragenteselecta',
      };

      const { error: upsertError } = await localSupabase
        .from('reviews')
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) {
        console.error(`Error upserting review ${review.id}:`, upsertError);
        errorCount++;
      } else {
        if (existingReview) {
          skippedCount++;
        } else {
          syncedCount++;
        }
      }
    }

    console.log(`Sync completed: ${syncedCount} new, ${skippedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Reviews synchronized successfully',
        synced: syncedCount,
        updated: skippedCount,
        errors: errorCount,
        total: remoteReviews.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in sync-reviews:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred during synchronization',
        message: error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
