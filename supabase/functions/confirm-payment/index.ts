import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('Authentication error');
      throw new Error('Authentication required');
    }

    console.log('User authenticated:', user.id);

    const { paymentIntentId } = await req.json();

    console.log('Processing payment confirmation');

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Verify user owns the order before updating
      const { data: orderCheck, error: orderCheckError } = await supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          customers!inner (
            user_id
          )
        `)
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (orderCheckError || !orderCheck) {
        console.error('Order not found:', orderCheckError);
        throw new Error('Order not found');
      }

      // Extract user_id from customers (it's returned as an array due to join)
      const customerUserId = (orderCheck.customers as any).user_id || (orderCheck.customers as any)[0]?.user_id;
      
      // Verify the authenticated user owns this order
      if (customerUserId !== user.id) {
        console.error('Unauthorized: User does not own this order');
        throw new Error('Unauthorized access');
      }

      console.log('User authorization verified for order:', orderCheck.id);

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw new Error('Failed to update order status');
      }

      // Get order details for email
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*),
          order_items (*)
        `)
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (orderError || !order) {
        console.error('Error fetching order:', orderError);
        throw new Error('Failed to fetch order');
      }

      // Send confirmation emails
      try {
        // Check if this is a gift order
        const isGift = order.metadata?.is_gift === true;
        
        if (isGift) {
          // Send gift email to recipient
          console.log('Sending gift email...');
          await supabase.functions.invoke('send-gift-email', {
            body: {
              recipientName: order.metadata.recipient_name,
              recipientEmail: order.metadata.recipient_email,
              senderName: order.metadata.sender_name,
              senderEmail: user.email,
              basketName: order.metadata.basket_name || order.order_items[0]?.basket_name || 'Experiencia Selecta',
              basketImage: 'https://images.unsplash.com/photo-1599666166155-52f1a5d4edfe?w=800&h=600&fit=crop',
              orderId: order.id,
              totalAmount: order.total_amount
            }
          });
        } else {
          // Send regular order confirmation
          await supabase.functions.invoke('send-order-confirmation', {
            body: { order }
          });
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the payment confirmation if email fails
      }

      console.log('Payment confirmed successfully for order:', order.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          orderId: order.id,
          status: 'paid'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: paymentIntent.status 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error: any) {
    console.error('Error in confirm-payment:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});