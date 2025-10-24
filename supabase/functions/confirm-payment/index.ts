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
        // Robust gift detection using order metadata and Stripe PI metadata
        const rawGiftFlag = (order as any).metadata?.is_gift;
        const stripeGiftFlag = (paymentIntent?.metadata as any)?.is_gift;
        const isGift = rawGiftFlag === true || rawGiftFlag === 'true' || rawGiftFlag === 1 || rawGiftFlag === '1'
          || stripeGiftFlag === 'true' || stripeGiftFlag === true || stripeGiftFlag === '1' || stripeGiftFlag === 1
          || Boolean((order as any).metadata?.recipient_email);
        console.log('Gift detection => order.metadata.is_gift:', rawGiftFlag, 'stripe.metadata.is_gift:', stripeGiftFlag, '=> isGift:', isGift);
        
        if (isGift) {
          // Send gift email to recipient with gift notification (no payment wording)
          const piMeta = (paymentIntent?.metadata || {}) as Record<string, string>;
          const recipientEmail = piMeta.recipient_email || (order as any).metadata?.recipient_email;
          const recipientName = piMeta.recipient_name || (order as any).metadata?.recipient_name;
          const senderEmail = piMeta.sender_email || (order as any).metadata?.sender_email;
          const senderName = piMeta.sender_name || (order as any).metadata?.sender_name;
          const basketName = (order as any).metadata?.basket_name || order.order_items[0]?.basket_name || 'Experiencia Selecta';

          if (recipientEmail && recipientName && senderEmail && senderName) {
            console.log('Sending gift notification email to recipient:', recipientEmail);
            await supabase.functions.invoke('send-gift-email', {
              body: {
                recipientName,
                recipientEmail,
                senderName,
                senderEmail,
                basketName,
                orderId: order.id,
                totalAmount: order.total_amount
              },
              headers: { Authorization: authHeader }
            });
          } else {
            console.warn('Missing gift metadata; skipping recipient email', { recipientEmail, recipientName, senderEmail, senderName });
          }
          
          // Send confirmation email ONLY to the payer (sender). Never to host/admin here.
          if (senderEmail && senderName) {
            console.log('Sending payment confirmation email to sender:', senderEmail);
            await supabase.functions.invoke('send-order-confirmation', {
              body: { 
                order: {
                  ...order,
                  customers: {
                    ...order.customers,
                    email: senderEmail,
                    name: senderName
                  }
                },
                isGift: true
              },
              headers: { Authorization: authHeader }
            });
          } else {
            console.warn('Sender email/name missing; skipping sender confirmation email');
          }
        } else {
          // Non-gift: regular confirmation to customer (and admin handled inside function)
          await supabase.functions.invoke('send-order-confirmation', {
            body: { order },
            headers: { Authorization: authHeader }
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