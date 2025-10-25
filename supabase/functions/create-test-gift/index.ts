import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Creating test gift...');

    // First, create a dummy order (needed for foreign key)
    // Get or create a customer record
    console.log('Looking for existing customer...');
    const { data: customerData, error: customerError } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('email', 'zarkojrpajarino@gmail.com')
      .single();

    let customerId: string;
    
    if (customerError || !customerData) {
      console.log('Creating new customer...', customerError);
      // Create customer if doesn't exist
      const { data: newCustomer, error: newCustomerError } = await supabaseClient
        .from('customers')
        .insert({
          email: 'zarkojrpajarino@gmail.com',
          name: 'Zarko Jr Pajarino',
          address_line1: 'Test Address',
          city: 'Madrid',
          postal_code: '28001',
          country: 'España',
          user_id: crypto.randomUUID(), // Dummy user_id
        })
        .select('id')
        .single();
      
      if (newCustomerError) {
        console.error('Error creating customer:', newCustomerError);
        throw newCustomerError;
      }
      console.log('Customer created:', newCustomer);
      customerId = newCustomer.id;
    } else {
      console.log('Using existing customer:', customerData);
      customerId = customerData.id;
    }

    // Create order
    console.log('Creating order for customer:', customerId);
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: 65,
        currency: 'EUR',
        status: 'completed',
        shipping_address_line1: 'Test Address',
        shipping_city: 'Madrid',
        shipping_postal_code: '28001',
        shipping_country: 'España',
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    console.log('Order created successfully:', orderData);

    // Create the pending gift
    const { data: giftData, error: giftError } = await supabaseClient
      .from('pending_gifts')
      .insert({
        sender_name: 'Zarko Jr Pajarino',
        sender_email: 'zarkojrpajarino@gmail.com',
        recipient_name: 'Zarko Jr Nova',
        recipient_email: 'zarkojr.nova@gmail.com',
        basket_name: 'Trio Ibérico',
        basket_category: 'Familias',
        basket_image: '',
        price: 65,
        quantity: 1,
        personal_note: 'para que lo goces',
        order_id: orderData.id,
      })
      .select()
      .single();

    if (giftError) {
      console.error('Error creating gift:', giftError);
      throw giftError;
    }

    console.log('Gift created:', giftData);

    // Send emails using the send-gift-email function
    const emailPayload = {
      senderName: 'Zarko Jr Pajarino',
      senderEmail: 'zarkojrpajarino@gmail.com',
      recipients: [
        {
          recipientName: 'Zarko Jr Nova',
          recipientEmail: 'zarkojr.nova@gmail.com',
          personalNote: 'para que lo goces',
          basketIds: [0],
        },
      ],
      baskets: [
        {
          name: 'Trio Ibérico',
          category: 'Familias',
          price: 65,
          image: '',
        },
      ],
    };

    console.log('Sending gift emails...');

    const { error: emailError } = await supabaseClient.functions.invoke('send-gift-email', {
      body: emailPayload,
    });

    if (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't throw, gift is already created
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        gift: giftData,
        emailSent: !emailError 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in create-test-gift:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
