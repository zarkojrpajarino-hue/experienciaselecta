import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting test purchase flow...');

    // 1. Obtener usuario existente
    const { data: existingUsersData } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsersData?.users.find(u => u.email === 'zarkojr.nova@gmail.com');
    
    if (!existingUser) {
      throw new Error('Usuario zarkojr.nova@gmail.com no encontrado en auth.users');
    }
    
    const userId = existingUser.id;
    console.log('Using existing user:', userId);

    // 2. Crear/actualizar cliente para zarkojr.nova@gmail.com
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        user_id: userId,
        name: 'Test User Nova',
        email: 'zarkojr.nova@gmail.com',
        phone: '600123456',
        address_line1: 'Calle Test 123',
        address_line2: 'Piso 1',
        city: 'Madrid',
        postal_code: '28001',
        country: 'España'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (customerError) throw customerError;
    console.log('Customer created/updated:', customer.id);

    // 3. Crear orden de compra
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        total_amount: 39,
        status: 'completed',
        shipping_address_line1: 'Calle Test 123',
        shipping_address_line2: 'Piso 1',
        shipping_city: 'Madrid',
        shipping_postal_code: '28001',
        shipping_country: 'España',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;
    console.log('Order created:', order.id);

    // 4. Crear order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        basket_name: 'Cesta Pareja Inicial',
        basket_category: 'pareja',
        quantity: 1,
        price_per_item: 39
      });

    if (itemError) throw itemError;
    console.log('Order item created');

    // 5. Crear pending gift
    const { data: gift, error: giftError } = await supabase
      .from('pending_gifts')
      .insert({
        order_id: order.id,
        sender_name: 'Test User Nova',
        recipient_name: 'Usuario Pajarino',
        recipient_email: 'zarkojrpajarino@gmail.com',
        basket_name: 'Cesta Trío Ibérico',
        basket_category: 'amigos',
        basket_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
        price: 79,
        quantity: 1,
        personal_note: 'para que lo disfrutes con tus colegas',
        gift_claimed: false,
        shipping_completed: false
      })
      .select()
      .single();

    if (giftError) throw giftError;
    console.log('Gift created:', gift.id);

    // 6. Enviar email de confirmación de compra
    console.log('Sending order confirmation email...');
    const { error: confirmError } = await supabase.functions.invoke('send-order-confirmation', {
      body: {
        order: {
          customerName: customer.name,
          customerEmail: customer.email,
          orderId: order.id,
          totalAmount: 39,
          orderItems: [
            {
              name: 'Cesta Pareja Inicial',
              quantity: 1,
              price: 39,
              category: 'pareja'
            }
          ],
          shippingAddress: {
            line1: customer.address_line1,
            line2: customer.address_line2,
            city: customer.city,
            postalCode: customer.postal_code,
            country: customer.country
          }
        },
        isGift: false
      }
    });

    if (confirmError) {
      console.error('Error sending confirmation email:', confirmError);
    } else {
      console.log('Order confirmation email sent successfully');
    }

    // 7. Enviar email de regalo
    console.log('Sending gift email...');
    const { error: giftEmailError } = await supabase.functions.invoke('send-gift-email', {
      body: {
        sender: {
          name: 'Test User Nova',
          email: 'zarkojr.nova@gmail.com'
        },
        recipients: [
          {
            name: 'Usuario Pajarino',
            email: 'zarkojrpajarino@gmail.com',
            note: 'para que lo disfrutes con tus colegas',
            basketIds: [gift.id]
          }
        ],
        basketDetails: {
          names: ['Cesta Trío Ibérico'],
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
          totalPrice: 79
        }
      }
    });

    if (giftEmailError) {
      console.error('Error sending gift email:', giftEmailError);
    } else {
      console.log('Gift email sent successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test purchase flow completed successfully',
        data: {
          customerId: customer.id,
          orderId: order.id,
          giftId: gift.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in test-purchase-flow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
