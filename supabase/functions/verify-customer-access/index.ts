import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the user has at least one completed purchase
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let hasCompletedOrder = false;

    if (customer) {
      // Check for completed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'completed')
        .limit(1);

      if (ordersError) {
        throw ordersError;
      }

      hasCompletedOrder = orders && orders.length > 0;
    }

    // Also check if the user has received gifts
    const { data: gifts, error: giftsError } = await supabase
      .from('pending_gifts')
      .select('id')
      .eq('recipient_email', email)
      .limit(1);

    if (giftsError) {
      throw giftsError;
    }

    const hasReceivedGift = gifts && gifts.length > 0;
    const hasAccess = hasCompletedOrder || hasReceivedGift;

    console.log(`Access check for ${email}: ${hasAccess} (order: ${hasCompletedOrder}, gift: ${hasReceivedGift})`);

    return new Response(
      JSON.stringify({ 
        hasAccess,
        message: hasAccess 
          ? (hasCompletedOrder ? 'Customer has purchased' : 'Customer has received a gift') 
          : 'No purchases or gifts found'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying customer access:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
