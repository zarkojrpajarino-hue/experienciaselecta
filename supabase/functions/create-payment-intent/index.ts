import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Customer data validation schema
const customerDataSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional().nullable(),
  address_line1: z.string().trim().min(1, "Address is required").max(255, "Address must be less than 255 characters"),
  address_line2: z.string().trim().max(255, "Address line 2 must be less than 255 characters").optional().nullable(),
  city: z.string().trim().min(1, "City is required").max(100, "City must be less than 100 characters"),
  postal_code: z.string().trim().min(1, "Postal code is required").max(20, "Postal code must be less than 20 characters"),
  country: z.string().trim().max(100, "Country must be less than 100 characters").optional().nullable()
});

// Product catalog - server-side source of truth for prices
const PRODUCT_CATALOG: Record<string, { price: number; category: string }> = {
  "Pareja Inicial": { price: 30.00, category: "Pareja (2 personas)" },
  "Pareja Natural": { price: 40.00, category: "Pareja (2 personas)" },
  "Pareja Natural (sin alcohol)": { price: 40.00, category: "Pareja (2 personas)" },
  "Pareja Gourmet": { price: 50.00, category: "Pareja (2 personas)" },
  "Trío Ibérico": { price: 45.00, category: "Grupos (3-4 personas)" },
  "Trio Ibérico": { price: 45.00, category: "Grupos (3-4 personas)" },
  "Trio ibérico": { price: 45.00, category: "Grupos (3-4 personas)" },
  "Mesa Abierta (sin alcohol)": { price: 55.00, category: "Grupos (3-4 personas)" },
  "Mesa Abierta": { price: 55.00, category: "Grupos (3-4 personas)" },
  "Ibéricos Selectos": { price: 60.00, category: "Grupos (3-4 personas)" },
  "Familiar Clásica": { price: 65.00, category: "Grupos (5-6 personas)" },
  "Familiar clásica": { price: 65.00, category: "Grupos (5-6 personas)" },
  "Experiencia Gastronómica (sin alcohol)": { price: 70.00, category: "Grupos (5-6 personas)" },
  "Gran Tertulia": { price: 80.00, category: "Grupos (5-6 personas)" },
  "Gran tertulia": { price: 80.00, category: "Grupos (5-6 personas)" },
  "Celebración Ibérica": { price: 85.00, category: "Grupos (7-8 personas)" },
  "Festín Selecto (sin alcohol)": { price: 90.00, category: "Grupos (7-8 personas)" },
  "Festín Selecto": { price: 90.00, category: "Grupos (7-8 personas)" },
  "Experiencia Selecta": { price: 100.00, category: "Grupos (7-8 personas)" },
  "Conversación Pura": { price: 45.00, category: "Desconocidos (2 personas)" },
  "Triángulo Dorado": { price: 65.00, category: "Desconocidos (3 personas)" },
  "Círculo Dorado": { price: 85.00, category: "Desconocidos (4 personas)" },
  "Noche Premium": { price: 145.00, category: "Desconocidos (7-8 personas)" },
  "Vínculo Gourmet": { price: 55.00, category: "Desconocidos (2 personas)" },
  "Primer Encuentro": { price: 75.00, category: "Desconocidos (5-6 personas)" },
  "Conexión Natural": { price: 95.00, category: "Desconocidos (5-6 personas)" },
  "Edición Anfitrión": { price: 95.00, category: "Especiales" },
  "Anfitrión Selecto": { price: 125.00, category: "Especiales" },
};

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

    const { customerData, basketItems, totalAmount, isGiftMode, giftData } = await req.json();
    
    console.log('Processing payment intent creation', isGiftMode ? '(Gift Mode)' : '');

    // Validate customer data
    try {
      customerDataSchema.parse(customerData);
    } catch (validationError: any) {
      console.error('Customer data validation failed:', validationError.errors);
      throw new Error(`Invalid customer data: ${validationError.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Get user from JWT token
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

    console.log('User authenticated');

    // Server-side price validation
    let serverCalculatedTotal = 0;
    const validatedItems = [];

    for (const item of basketItems) {
      const product = PRODUCT_CATALOG[item.name];
      
      if (!product) {
        throw new Error(`Invalid product: ${item.name}`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        throw new Error(`Invalid quantity for ${item.name}: must be between 1 and 10`);
      }

      const itemTotal = product.price * item.quantity;
      serverCalculatedTotal += itemTotal;
      
      validatedItems.push({
        name: item.name,
        price: product.price,
        quantity: item.quantity,
        category: product.category
      });
    }

    // Verify price matches (allow 0.01 difference for rounding)
    if (Math.abs(serverCalculatedTotal - totalAmount) > 0.01) {
      throw new Error(`Price mismatch: expected ${serverCalculatedTotal.toFixed(2)}€, received ${totalAmount.toFixed(2)}€`);
    }

    console.log('Price validation passed');

    // Create or get customer in our database
    // For gifts, use the sender's (payer's) user_id but recipient's email for communication
    let customerId;
    const customerEmail = isGiftMode && giftData?.recipientEmail ? giftData.recipientEmail : customerData.email;
    const customerName = isGiftMode && giftData?.recipientName ? giftData.recipientName : customerData.name;
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .eq('email', customerEmail)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      
      // Update customer data
      await supabase
        .from('customers')
        .update({
          name: customerName,
          phone: customerData.phone,
          address_line1: customerData.address_line1,
          address_line2: customerData.address_line2,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country || 'España'
        })
        .eq('id', customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,  // Payer's user_id
          email: customerEmail,  // Recipient's email for gifts
          name: customerName,  // Recipient's name for gifts
          phone: customerData.phone,
          address_line1: customerData.address_line1,
          address_line2: customerData.address_line2,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country || 'España'
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        console.error('Error creating customer');
        throw new Error('Failed to create customer');
      }
      customerId = newCustomer.id;
    }

    // Create or get Stripe customer
    let stripeCustomerId = existingCustomer?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        phone: customerData.phone,
        address: {
          line1: customerData.address_line1,
          line2: customerData.address_line2,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country || 'ES'
        }
      });
      
      stripeCustomerId = stripeCustomer.id;
      
      // Update customer with Stripe ID
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customerId);
    }

    // Create order using server-calculated total
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: Math.round(serverCalculatedTotal * 100), // Convert to cents
        currency: 'EUR',
        shipping_address_line1: customerData.address_line1,
        shipping_address_line2: customerData.address_line2,
        shipping_city: customerData.city,
        shipping_postal_code: customerData.postal_code,
        shipping_country: customerData.country || 'España'
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creating order');
      throw new Error('Failed to create order');
    }

    // Create order items using validated data
    const orderItems = validatedItems.map((item: any) => ({
      order_id: order.id,
      basket_name: item.name,
      basket_category: item.category,
      price_per_item: Math.round(item.price * 100), // Convert to cents
      quantity: item.quantity || 1
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items');
      throw new Error('Failed to create order items');
    }

    // Create Stripe payment intent with server-calculated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverCalculatedTotal * 100), // Amount in cents
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        order_id: order.id,
        customer_id: customerId,
        is_gift: isGiftMode ? 'true' : 'false',
        sender_name: isGiftMode && giftData?.senderName ? giftData.senderName : '',
        sender_email: isGiftMode && giftData?.senderEmail ? giftData.senderEmail : '',
        recipients_count: isGiftMode && giftData?.recipients ? String(giftData.recipients.length) : '0'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    console.log('Payment intent created successfully');

    // If it's a gift, create pending_gifts records for each recipient and store metadata
    if (isGiftMode && giftData) {
      // Create pending gifts for each recipient
      for (const recipient of giftData.recipients) {
        // Get basket items for this recipient
        const recipientBaskets = basketItems.filter((item: any) => recipient.basketIds.includes(item.id));
        
        for (const basket of recipientBaskets) {
          await supabase
            .from('pending_gifts')
            .insert({
              order_id: order.id,
              sender_name: giftData.senderName,
              recipient_name: recipient.recipientName,
              recipient_email: recipient.recipientEmail,
              basket_name: basket.name,
              basket_image: basket.image || null,
              basket_category: basket.category,
              price: Math.round(basket.price * 100),
              quantity: basket.quantity,
              personal_note: recipient.personalNote || null,
              gift_claimed: false,
              shipping_completed: false
            });
        }
      }

      // Store gift metadata with order
      await supabase
        .from('orders')
        .update({ 
          metadata: {
            is_gift: true,
            sender_name: giftData.senderName,
            sender_email: giftData.senderEmail,
            recipients: giftData.recipients
          }
        })
        .eq('id', order.id);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-payment-intent:', error?.message || 'Unknown error');
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
