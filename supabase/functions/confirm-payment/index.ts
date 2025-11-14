import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

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

    // Validate request body
    const paymentSchema = z.object({
      paymentIntentId: z.string().trim().min(1).max(255)
    });

    const requestData = await req.json();
    const { paymentIntentId } = paymentSchema.parse(requestData);

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

      // Get order details first to check if it's a gift
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from('orders')
        .select('metadata')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (orderDetailsError) {
        console.error('Error fetching order details:', orderDetailsError);
        throw new Error('Failed to fetch order details');
      }

      // Detect if it's a gift order
      const rawGiftFlag = (orderDetails as any)?.metadata?.is_gift;
      const stripeGiftFlag = (paymentIntent?.metadata as any)?.is_gift;
      const isGiftOrder = rawGiftFlag === true || rawGiftFlag === 'true' || rawGiftFlag === 1 || rawGiftFlag === '1'
        || stripeGiftFlag === 'true' || stripeGiftFlag === true || stripeGiftFlag === '1' || stripeGiftFlag === 1
        || Boolean((orderDetails as any)?.metadata?.recipient_email);

      // Update order status
      // For gifts, keep status as 'pending' until recipient completes shipping info
      // For regular orders, mark as 'completed' immediately
      const newStatus = isGiftOrder ? 'pending' : 'completed';
      const updateData: any = { status: newStatus };
      
      // Only set completed_at for non-gift orders
      if (!isGiftOrder) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw new Error('Failed to update order status');
      }

      // Handle discount code usage if applicable
      if (paymentIntent.metadata?.discount_code) {
        console.log('Processing discount code usage:', paymentIntent.metadata.discount_code);
        
        // Get the discount code ID from the order
        const { data: orderWithDiscount } = await supabase
          .from('orders')
          .select('discount_code_id, customers!inner(email)')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (orderWithDiscount?.discount_code_id) {
          const userEmail = (orderWithDiscount.customers as any).email;
          
          // Insert usage record
          const { error: usageError } = await supabase
            .from('discount_code_usage')
            .insert({
              discount_code_id: orderWithDiscount.discount_code_id,
              user_email: userEmail,
              order_id: orderCheck.id
            });

          if (usageError) {
            console.error('Error recording discount usage:', usageError);
          } else {
            console.log('Discount usage recorded successfully');
            
            // Increment the current_uses counter
            const { error: incrementError } = await supabase.rpc('increment_discount_uses', {
              p_discount_code_id: orderWithDiscount.discount_code_id
            });

            if (incrementError) {
              console.error('Error incrementing discount uses:', incrementError);
            }
          }
        }
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
          // Send gift email to recipients with gift notification
          const orderMetadata = (order as any).metadata || {};
          const senderEmail = (paymentIntent?.metadata as any)?.sender_email || orderMetadata.sender_email;
          const senderName = (paymentIntent?.metadata as any)?.sender_name || orderMetadata.sender_name;
          const recipients = orderMetadata.recipients || [];

          if (senderEmail && senderName && recipients.length > 0) {
            console.log('Sending gift notification emails to', recipients.length, 'recipient(s)');
            await supabase.functions.invoke('send-gift-email', {
              body: {
                senderName,
                senderEmail,
                recipients,
                basketItems: order.order_items.map((item: any) => ({
                  id: item.id,
                  name: item.basket_name,
                  category: item.basket_category,
                  price: item.price_per_item / 100,
                  quantity: item.quantity
                })),
                orderId: order.id
              },
              headers: { Authorization: authHeader }
            });
          } else {
            console.warn('Missing gift metadata; skipping recipient emails', { senderEmail, senderName, recipients });
          }
          
          // Send confirmation email ONLY to the payer (sender). Never to host/admin here.
          if (senderEmail && senderName) {
            console.log('Sending payment confirmation email to sender:', senderEmail);
            await supabase.functions.invoke('send-order-confirmation', {
              body: {
                email: senderEmail,
                customerName: senderName,
                orderId: order.id,
                totalAmount: order.total_amount,
                items: order.order_items.map((item: any) => ({
                  basketName: item.basket_name,
                  quantity: item.quantity,
                  price: item.price_per_item
                })),
                isGift: true
              },
              headers: { Authorization: authHeader }
            });
          } else {
            console.warn('Sender email/name missing; skipping sender confirmation email');
          }
        } else {
          // Non-gift: regular confirmation to customer (and admin handled inside function)
          const customer = order.customers as any;
          await supabase.functions.invoke('send-order-confirmation', {
            body: {
              email: customer.email,
              customerName: customer.name,
              orderId: order.id,
              totalAmount: order.total_amount,
              items: order.order_items.map((item: any) => ({
                basketName: item.basket_name,
                quantity: item.quantity,
                price: item.price_per_item
              })),
              shippingAddress: order.shipping_address_line1 + (order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : '') + ', ' + order.shipping_city + ', ' + order.shipping_postal_code + ', ' + order.shipping_country,
              isGift: false
            },
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
          status: newStatus
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