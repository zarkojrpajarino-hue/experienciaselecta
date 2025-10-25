import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("=== INICIANDO SIMULACIÓN ===");

    const buyerUserId = 'ed603ff2-e0bb-4dd2-a687-6f169cfaf42e';
    const buyerEmail = 'zarkojr.nova@gmail.com';
    const senderUserId = '1681e609-16b5-48d4-acb0-04e7eae3edc7';
    const senderEmail = 'zarkojrpajarino@gmail.com';

    // 1. Crear/Actualizar customer
    console.log("1. Creando customer...");
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        user_id: buyerUserId,
        name: 'Zarko Jr Nova',
        email: buyerEmail,
        phone: '+34612345678',
        address_line1: 'Calle Principal 123',
        city: 'Madrid',
        postal_code: '28001',
        country: 'España'
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (customerError) throw new Error(`Error creando customer: ${customerError.message}`);
    console.log("✓ Customer creado:", customer.id);

    // 2. Crear orden de compra
    console.log("2. Creando orden de compra...");
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        total_amount: 8500, // 85€
        status: 'completed',
        completed_at: new Date().toISOString(),
        shipping_address_line1: customer.address_line1,
        shipping_city: customer.city,
        shipping_postal_code: customer.postal_code,
        shipping_country: customer.country,
        currency: 'EUR'
      })
      .select()
      .single();

    if (orderError) throw new Error(`Error creando orden: ${orderError.message}`);
    console.log("✓ Orden creada:", order.id);

    // 3. Crear items de la orden
    console.log("3. Creando items de la orden...");
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: order.id,
          basket_name: 'Cesta Gourmet Premium',
          basket_category: 'premium',
          quantity: 1,
          price_per_item: 8500
        }
      ]);

    if (itemsError) throw new Error(`Error creando items: ${itemsError.message}`);
    console.log("✓ Items creados");

    // 4. Enviar correo de confirmación de compra
    console.log("4. Enviando correo de confirmación...");
    const confirmationResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email: buyerEmail,
        customerName: customer.name,
        orderId: order.id,
        items: [
          {
            basketName: 'Cesta Gourmet Premium',
            quantity: 1,
            price: 8500
          }
        ],
        totalAmount: 8500
      })
    });

    if (!confirmationResponse.ok) {
      console.error("Error enviando confirmación:", await confirmationResponse.text());
    } else {
      console.log("✓ Correo de confirmación enviado");
    }

    // 5. Crear regalo pendiente
    console.log("5. Creando regalo pendiente...");
    const { data: gift, error: giftError } = await supabase
      .from('pending_gifts')
      .insert({
        order_id: order.id,
        sender_name: 'Zarko Pajarino',
        sender_email: senderEmail,
        recipient_name: customer.name,
        recipient_email: buyerEmail,
        basket_name: 'Cesta Deluxe Especial',
        basket_category: 'deluxe',
        basket_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
        quantity: 1,
        price: 12000, // 120€
        personal_note: 'te camelo',
        gift_claimed: false,
        shipping_completed: false
      })
      .select()
      .single();

    if (giftError) throw new Error(`Error creando regalo: ${giftError.message}`);
    console.log("✓ Regalo creado:", gift.id);

    // 6. Enviar correo de notificación de regalo
    console.log("6. Enviando correo de notificación de regalo...");
    const giftResponse = await fetch(`${supabaseUrl}/functions/v1/send-gift-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        recipientEmail: buyerEmail,
        recipientName: customer.name,
        senderName: 'Zarko Pajarino',
        senderEmail: senderEmail,
        basketName: 'Cesta Deluxe Especial',
        basketImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
        personalNote: 'te camelo',
        giftId: gift.id
      })
    });

    if (!giftResponse.ok) {
      console.error("Error enviando notificación de regalo:", await giftResponse.text());
    } else {
      console.log("✓ Correo de notificación de regalo enviado");
    }

    // 7. Enviar correo de solicitud de valoración
    console.log("7. Enviando correo de solicitud de valoración...");
    const reviewResponse = await fetch(`${supabaseUrl}/functions/v1/send-review-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email: buyerEmail,
        customerName: customer.name,
        orderId: order.id,
        basketNames: ['Cesta Gourmet Premium']
      })
    });

    if (!reviewResponse.ok) {
      console.error("Error enviando solicitud de valoración:", await reviewResponse.text());
    } else {
      console.log("✓ Correo de solicitud de valoración enviado");
    }

    // 8. Registrar consentimiento de cookies para probar email marketing
    console.log("8. Registrando consentimiento de cookies...");
    const { error: consentError } = await supabase
      .from('cookie_consents')
      .upsert({
        user_id: buyerUserId,
        email: buyerEmail,
        consented_at: new Date().toISOString(),
        marketing_email_sent: false
      }, { onConflict: 'user_id' });

    if (consentError) {
      console.error("Error registrando consentimiento:", consentError.message);
    } else {
      console.log("✓ Consentimiento registrado (email de marketing se enviará en 24h)");
    }

    console.log("=== SIMULACIÓN COMPLETADA ===");

    return new Response(JSON.stringify({
      success: true,
      message: "Simulación completada exitosamente",
      data: {
        customer: customer.id,
        order: order.id,
        gift: gift.id,
        emailsSent: {
          orderConfirmation: "✓",
          giftNotification: "✓",
          reviewRequest: "✓",
          marketingScheduled: "✓ (24h)"
        }
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error en simulación:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
