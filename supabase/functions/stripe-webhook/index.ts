import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Validation schemas for Stripe metadata
const emailSchema = z.string().trim().email().max(255)
const nameSchema = z.string().trim().min(1).max(200).regex(/^[\p{L}\s'\-\.]+$/u)

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

    // Get webhook signature and secret
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature) {
      console.error('No stripe signature found');
      throw new Error('No stripe signature');
    }

    if (!webhookSecret) {
      console.error('No webhook secret configured');
      throw new Error('Webhook secret not configured');
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook event received:', event.type);

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('Payment succeeded for payment intent:', paymentIntent.id);

      // Get and validate customer email from payment intent
      const rawEmail = paymentIntent.receipt_email || 
                       (paymentIntent.customer_details as any)?.email ||
                       paymentIntent.metadata?.customer_email;

      if (!rawEmail) {
        console.error('No customer email found in payment intent');
        throw new Error('Customer email not found');
      }

      // Validate email
      const emailValidation = emailSchema.safeParse(rawEmail);
      if (!emailValidation.success) {
        console.error('Invalid email format:', rawEmail);
        throw new Error('Invalid customer email format');
      }
      const customerEmail = emailValidation.data;

      console.log('Customer email:', customerEmail);

      // Get and validate customer name from metadata or payment intent
      const rawName = paymentIntent.metadata?.customer_name || 
                      (paymentIntent.customer_details as any)?.name ||
                      'Usuario';

      // Validate name
      const nameValidation = nameSchema.safeParse(rawName);
      const customerName = nameValidation.success ? nameValidation.data : 'Usuario';

      console.log('Customer name:', customerName);

      // Check if user already exists using secure database function
      const { data: userCheck, error: checkError } = await supabase
        .rpc('check_user_exists_by_email', { user_email: customerEmail });
      
      if (checkError) {
        console.error('Error checking user existence:', checkError);
        throw new Error('Failed to check existing users');
      }

      const existingUser = userCheck && userCheck.length > 0 ? userCheck[0] : null;

      let userId: string;

      if (!existingUser || !existingUser.user_exists) {
        console.log('User does not exist, creating new user...');
        
        // Create new user with random password
        const randomPassword = crypto.randomUUID();
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customerEmail,
          password: randomPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: customerName,
            created_via: 'checkout',
            auto_created: true
          }
        });

        if (createError || !newUser.user) {
          console.error('Error creating user:', createError);
          throw new Error('Failed to create user');
        }

        userId = newUser.user.id;
        console.log('User created successfully:', userId);

        // Optionally send a welcome email with password reset link
        // This can be done via another edge function call
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: customerEmail,
              name: customerName,
              isAutoCreated: true
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw - we don't want to fail the webhook if email fails
        }
      } else {
        userId = existingUser.user_id;
        console.log('User already exists:', userId);
      }

      // Update order status to completed
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (orderError || !order) {
        console.error('Order not found for payment intent:', paymentIntent.id);
        // Don't throw - the payment succeeded, we just couldn't find the order
        return new Response(
          JSON.stringify({ received: true, warning: 'Order not found' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if it's a gift order
      const isGiftOrder = paymentIntent.metadata?.is_gift === 'true' || 
                         paymentIntent.metadata?.is_gift === '1';

      // Update order status (pending for gifts, completed for regular orders)
      const newStatus = isGiftOrder ? 'pending' : 'completed';
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
        // Don't throw - payment succeeded, this is just a status update
      } else {
        console.log('Order updated successfully:', order.id, 'Status:', newStatus);
      }

      // Update customer record with user_id if it was null (guest checkout)
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ user_id: userId })
        .eq('id', order.customer_id)
        .is('user_id', null);

      if (customerUpdateError) {
        console.error('Failed to update customer user_id:', customerUpdateError);
        // Don't throw - payment succeeded
      } else {
        console.log('Customer updated with user_id:', userId);
      }

      // Send admin notification email for all successful payments
      try {
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        
        // Get order details for admin notification
        const { data: orderDetails, error: orderDetailsError } = await supabase
          .from('orders')
          .select(`
            *,
            customers (*),
            order_items (*)
          `)
          .eq('id', order.id)
          .single();

        if (!orderDetailsError && orderDetails) {
          const customer = orderDetails.customers as any;
          const items = orderDetails.order_items as any[];
          const isGift = paymentIntent.metadata?.is_gift === 'true';
          
          const itemsHtml = items.map(item => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.basket_name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price_per_item / 100).toFixed(2)}€</td>
            </tr>
          `).join('');

          await resend.emails.send({
            from: "Experiencia Selecta <noreply@experienciaselecta.com>",
            to: ["selectaexperiencia@gmail.com"],
            subject: `🛒 ${isGift ? '🎁 REGALO - ' : ''}Nuevo pedido de ${customer?.name || customerName} - ${order.id.substring(0, 8)}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #8B4513; }
                    td { padding: 8px; border-bottom: 1px solid #eee; }
                    .total { font-size: 1.2em; font-weight: bold; color: #8B4513; margin-top: 10px; }
                    .highlight { background: #FFF9E6; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FFB800; }
                    .gift-badge { background: #FFB800; color: #333; padding: 5px 10px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>🛒 Nuevo Pedido Recibido ${isGift ? '(REGALO)' : ''}</h2>
                    </div>
                    <div class="content">
                      ${isGift ? '<span class="gift-badge">🎁 PEDIDO DE REGALO</span>' : ''}
                      <p><strong>Cliente:</strong> ${customer?.name || customerName}</p>
                      <p><strong>Email:</strong> ${customer?.email || customerEmail}</p>
                      <p><strong>Teléfono:</strong> ${customer?.phone || 'No proporcionado'}</p>
                      <p><strong>Pedido #:</strong> ${order.id}</p>
                      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}</p>
                      <p><strong>Estado:</strong> ${newStatus === 'completed' ? '✅ Completado' : '⏳ Pendiente'}</p>
                      
                      ${!isGift ? `
                        <p><strong>Dirección de envío:</strong><br>
                          ${orderDetails.shipping_address_line1}<br>
                          ${orderDetails.shipping_address_line2 ? orderDetails.shipping_address_line2 + '<br>' : ''}
                          ${orderDetails.shipping_city}, ${orderDetails.shipping_postal_code}<br>
                          ${orderDetails.shipping_country}
                        </p>
                      ` : `
                        <p><strong>Remitente:</strong> ${paymentIntent.metadata?.sender_name || 'N/A'} (${paymentIntent.metadata?.sender_email || 'N/A'})</p>
                        <p><em>Los destinatarios recibirán email para proporcionar su dirección.</em></p>
                      `}
                      
                      <div class="highlight">
                        <h3 style="margin: 0 0 10px 0;">📦 Artículos del pedido:</h3>
                        <table>
                          <thead>
                            <tr>
                              <th>Cesta</th>
                              <th style="text-align: center;">Cantidad</th>
                              <th style="text-align: right;">Precio</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${itemsHtml}
                          </tbody>
                        </table>
                        <div class="total">Total: ${(orderDetails.total_amount / 100).toFixed(2)}€</div>
                        ${orderDetails.discount_amount ? `<p style="color: #27AE60;">Descuento aplicado: -${(orderDetails.discount_amount / 100).toFixed(2)}€</p>` : ''}
                      </div>
                      
                      <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                        Este es un email automático de notificación de pedido vía Stripe Webhook.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          
          console.log('Admin notification email sent successfully');
        }
      } catch (adminEmailError) {
        console.error('Failed to send admin notification email:', adminEmailError);
        // Don't throw - payment succeeded, this is just a notification
      }

      return new Response(
        JSON.stringify({ 
          received: true,
          user_created: !existingUser,
          user_id: userId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For other event types, just acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
