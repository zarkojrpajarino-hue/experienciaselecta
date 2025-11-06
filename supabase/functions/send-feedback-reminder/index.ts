import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
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
    // Verify cron secret
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      console.error('Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Verify timestamp to prevent replay attacks
    const requestTimestamp = req.headers.get('X-Request-Timestamp');
    if (!requestTimestamp) {
      console.error('Missing timestamp header');
      return new Response(
        JSON.stringify({ error: 'Missing timestamp' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const timestamp = parseInt(requestTimestamp, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (isNaN(timestamp) || Math.abs(now - timestamp) > fiveMinutes) {
      console.error('Invalid or expired timestamp');
      return new Response(
        JSON.stringify({ error: 'Request expired or invalid timestamp' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('Starting feedback reminder job...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get orders completed 1+ hours ago that don't have reviews yet
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Paso 1: Obtener todas las órdenes completadas hace más de 1 hora
    const { data: completedOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        completed_at,
        customers!inner(
          email,
          name
        )
      `)
      .eq('status', 'completed')
      .lte('completed_at', oneHourAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      throw fetchError;
    }

    if (!completedOrders || completedOrders.length === 0) {
      console.log('No completed orders found');
      return new Response(
        JSON.stringify({ success: true, message: 'No completed orders' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Paso 2: Obtener IDs de órdenes que YA tienen reviews
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('order_id');

    const reviewedOrderIds = new Set(existingReviews?.map(r => r.order_id) || []);

    // Paso 3: Filtrar órdenes sin reviews
    const ordersWithoutReviews = completedOrders.filter(
      order => !reviewedOrderIds.has(order.id)
    );

    if (ordersWithoutReviews.length === 0) {
      console.log('No pending feedback reminders to send');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending reminders' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${ordersWithoutReviews.length} orders without feedback`);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    let sentCount = 0;
    let errorCount = 0;

    for (const order of ordersWithoutReviews) {
      try {
        const customer = (order as any).customers;
        const customerName = customer?.name || 'cliente';
        const customerEmail = customer?.email;

        if (!customerEmail) {
          console.error(`No email for order ${order.id}`);
          errorCount++;
          continue;
        }

        const reviewUrl = `https://experienciaselecta.com/review/${order.id}`;
        
        const emailContent = `
¡Hola ${customerName}!

Esperamos que hayas disfrutado tu experiencia con Experiencia Selecta.

Tu opinión es súper importante para nosotros y nos ayuda a seguir mejorando.

¿Nos dejas tu valoración? Solo te llevará un minuto:
👉 ${reviewUrl}

Muchas gracias por tu tiempo y por confiar en nosotros.

Un abrazo,
El equipo de Experiencia Selecta
        `;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px 20px;
      border-radius: 0 0 10px 10px;
    }
    .cta-button {
      display: inline-block;
      background: #8B4513;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💭 Tu opinión importa</h1>
  </div>
  <div class="content">
    <p>¡Hola ${customerName}!</p>
    <p>Esperamos que hayas disfrutado tu experiencia con <strong>Experiencia Selecta</strong>.</p>
    <p>Tu opinión es súper importante para nosotros y nos ayuda a seguir mejorando.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${reviewUrl}" class="cta-button">
        Dejar mi valoración
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      Solo te llevará un minuto y nos ayudará enormemente.
    </p>
    
    <p style="margin-top: 30px;">Muchas gracias por tu tiempo y por confiar en nosotros.</p>
    <p><strong>Un abrazo,<br>El equipo de Experiencia Selecta</strong></p>
  </div>
  <div class="footer">
    <p>© 2025 Experiencia Selecta. Todos los derechos reservados.</p>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
          to: [customerEmail],
          subject: '💭 No olvides dejar tu valoración - Es súper importante para nosotros',
          text: emailContent,
          html: htmlContent,
        });

        console.log(`Feedback reminder sent to: ${customerEmail}`);
        sentCount++;

      } catch (error: any) {
        console.error(`Error sending reminder for order ${order.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Job completed. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        errors: errorCount 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in feedback reminder job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});