import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for security
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    
    if (!cronSecret || cronSecret !== expectedSecret) {
      console.error('Unauthorized: Invalid or missing cron secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for orders to mark as completed...');

    // Get orders that are pending and created more than 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        customers!inner(
          email,
          name,
          user_id
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', tenDaysAgo.toISOString())
      .is('completed_at', null);

    if (error) throw error;

    console.log(`Found ${orders?.length || 0} orders to mark as completed`);

    // Mark orders as completed and send notification emails
    for (const order of orders || []) {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        continue;
      }

      console.log(`Marked order ${order.id} as completed`);

      // Send notification email to user
      try {
        const customer = order.customers as any;
        await supabase.functions.invoke('send-review-notification', {
          body: {
            orderId: order.id,
            userEmail: customer.email,
            userName: customer.name,
          },
        });
        console.log(`Sent review notification for order ${order.id}`);
      } catch (emailError) {
        console.error(`Error sending notification for order ${order.id}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedOrders: orders?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in check-completed-orders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});