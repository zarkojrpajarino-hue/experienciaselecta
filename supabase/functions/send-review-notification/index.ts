import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify JWT and get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Unauthorized: Invalid or missing authentication token');
    }

    const { orderId, userEmail, userName } = await req.json();

    console.log('Authenticated user:', user.id, 'requesting notification for order:', orderId);

    // Verify the authenticated user owns the order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        customer_id,
        customers (
          user_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      throw new Error('Order not found');
    }

    // Check if the authenticated user is the owner of the order
    const customerUserId = (order.customers as any)?.user_id;
    if (!customerUserId || customerUserId !== user.id) {
      console.error('Authorization failed: User does not own order');
      throw new Error('Unauthorized: You do not have permission to send notifications for this order');
    }

    console.log('Authorization successful. Sending review notification to:', userEmail);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailContent = `
¡Hola ${userName}!

Esperamos que hayas disfrutado de tu experiencia con Experiencia Selecta.

Han pasado 10 días desde tu pedido y nos encantaría conocer tu opinión. 
Tu valoración nos ayuda a seguir mejorando y ofreciendo las mejores experiencias gastronómicas.

🌟 Deja tu valoración aquí:
https://experienciaselecta.com/perfil

Nos tomará solo un minuto de tu tiempo y será de gran ayuda.

¡Muchas gracias por confiar en nosotros!

Saludos,
El equipo de Experiencia Selecta
`;

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [userEmail],
      subject: '⭐ ¡Valora tu experiencia con Experiencia Selecta!',
      text: emailContent,
    });

    console.log('Review notification sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error sending review notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});