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
  "Ibéricos Selectos": { price: 65.00, category: "Grupos (3-4 personas)" },
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

    const { customerData, basketItems, totalAmount, isGiftMode, giftData, discountCode } = await req.json();
    
    // Extract discount code string if it comes as an object
    const discountCodeString = typeof discountCode === 'object' && discountCode?.code 
      ? discountCode.code 
      : typeof discountCode === 'string' 
        ? discountCode 
        : null;
    
    console.log('Processing payment intent creation', isGiftMode ? '(Gift Mode)' : '', discountCodeString ? '(With Discount)' : '');

    // Validate customer data
    try {
      customerDataSchema.parse(customerData);
    } catch (validationError: any) {
      console.error('Customer data validation failed:', validationError.errors);
      throw new Error(`Invalid customer data: ${validationError.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Get user from JWT token (optional for guest checkout)
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: authData, error: userError } = await supabase.auth.getUser(jwt);
      
      if (!userError && authData?.user) {
        user = authData.user;
        console.log('User authenticated:', user.id);
      } else {
        console.log('Invalid token, proceeding as guest');
      }
    } else {
      console.log('No authorization header, proceeding as guest checkout');
    }

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

    // Validate and apply discount code if provided
    let discountAmount = 0;
    let discountCodeId = null;
    let expectedTotal = serverCalculatedTotal;

    if (discountCodeString) {
      console.log('Validating discount code:', discountCodeString);
      
      // Get the first basket item to validate the discount
      const basketName = validatedItems[0]?.name;
      
      // Call the validate_discount_code RPC function
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCodeString,
          p_user_email: customerData.email,
          p_basket_name: basketName,
          p_purchase_amount: serverCalculatedTotal
        });

      if (validationError || !validationResult) {
        console.error('Discount validation error:', validationError);
        throw new Error('Invalid discount code');
      }

      const result = typeof validationResult === 'string' 
        ? JSON.parse(validationResult) 
        : validationResult;

      if (!result.valid) {
        throw new Error(result.message || 'Invalid discount code');
      }

      // Apply the discount
      discountAmount = result.discount_amount;
      discountCodeId = result.discount_code_id;
      expectedTotal = serverCalculatedTotal - discountAmount;
      
      console.log(`Discount applied: ${discountAmount}€, new total: ${expectedTotal.toFixed(2)}€`);
    }

    // Verify price matches (allow 0.01 difference for rounding)
    if (Math.abs(expectedTotal - totalAmount) > 0.01) {
      throw new Error(`Price mismatch: expected ${expectedTotal.toFixed(2)}€, received ${totalAmount.toFixed(2)}€`);
    }

    console.log('Price validation passed');

    // Create or get customer in our database
    // For authenticated users: use user_id
    // For guests: use email as identifier, user_id will be null
    let customerId;
    const customerEmail = isGiftMode && giftData?.recipientEmail ? giftData.recipientEmail : customerData.email;
    const customerName = isGiftMode && giftData?.recipientName ? giftData.recipientName : customerData.name;
    
    let existingCustomer = null;
    
    // Search existing customer by email (for both authenticated users and guests)
    const { data: existingCustomerData, error: existingCustomerError } = await supabase
      .from('customers')
      .select('id, stripe_customer_id, user_id')
      .eq('email', customerEmail)
      .maybeSingle();

    if (existingCustomerError) {
      console.error('Error fetching existing customer:', existingCustomerError);
    }

    existingCustomer = existingCustomerData || null;

    if (existingCustomer) {
      customerId = existingCustomer.id;

      const updatedUserId = user?.id ?? existingCustomer.user_id ?? null;
      
      // Update customer data (and link to user if now authenticated)
      await supabase
        .from('customers')
        .update({
          user_id: updatedUserId,
          email: customerEmail,
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
          user_id: user?.id || null,  // Null for guest checkout
          email: customerEmail,
          name: customerName,
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
        console.error('Error creating customer:', customerError);
        throw new Error('Failed to create customer');
      }
      customerId = newCustomer.id;
    }

    // Create or get Stripe customer
    let stripeCustomerId = existingCustomer?.stripe_customer_id;
    
    // Verify that the Stripe customer exists or create a new one
    if (stripeCustomerId) {
      try {
        // Check if customer exists in Stripe
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error: any) {
        // Customer doesn't exist in Stripe (e.g., switching from test to production)
        console.log('Stripe customer not found, creating new one');
        stripeCustomerId = null;
      }
    }
    
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

    // Create order using server-calculated total (with discount applied if present)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: Math.round(expectedTotal * 100), // Convert to cents (discounted amount)
        currency: 'EUR',
        shipping_address_line1: customerData.address_line1,
        shipping_address_line2: customerData.address_line2,
        shipping_city: customerData.city,
        shipping_postal_code: customerData.postal_code,
        shipping_country: customerData.country || 'España',
        discount_code_id: discountCodeId,
        discount_amount: discountAmount ? Math.round(discountAmount * 100) : null
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

    // Create Stripe payment intent with server-calculated amount (with discount applied)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(expectedTotal * 100), // Amount in cents (discounted amount)
      currency: 'eur',
      customer: stripeCustomerId,
      receipt_email: customerData.email, // Important for webhook to find customer email
      metadata: {
        order_id: order.id,
        customer_id: customerId,
        customer_email: customerData.email, // Required by stripe-webhook
        customer_name: customerData.name, // Required by stripe-webhook
        is_gift: isGiftMode ? 'true' : 'false',
        sender_name: isGiftMode && giftData?.senderName ? giftData.senderName : '',
        sender_email: isGiftMode && giftData?.senderEmail ? giftData.senderEmail : '',
        recipients_count: isGiftMode && giftData?.recipients ? String(giftData.recipients.length) : '0',
        discount_code: discountCodeString || '',
        discount_amount: discountAmount ? String(discountAmount) : '0',
        original_amount: String(serverCalculatedTotal)
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
              sender_email: giftData.senderEmail,
              recipient_name: recipient.recipientName,
              recipient_email: recipient.recipientEmail || null,
              recipient_phone: recipient.recipientPhone || null,
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
