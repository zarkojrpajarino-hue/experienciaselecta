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
    const nowTimestamp = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (isNaN(timestamp) || Math.abs(nowTimestamp - timestamp) > fiveMinutes) {
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

    const now = new Date();

    // Paso 1: Obtener órdenes completadas hace más de 24 horas sin review
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: completedOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        completed_at,
        customers!inner(
          user_id,
          email,
          name
        )
      `)
      .eq('status', 'completed')
      .lte('completed_at', twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      throw fetchError;
    }

    if (!completedOrders || completedOrders.length === 0) {
      console.log('No completed orders found older than 24h');
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
      console.log('No orders without reviews found');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending reminders' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${ordersWithoutReviews.length} orders without reviews`);

    // Paso 4: Obtener info de recordatorios ya enviados
    const orderIds = ordersWithoutReviews.map(o => o.id);
    const { data: existingReminders } = await supabase
      .from('review_reminders')
      .select('*')
      .in('order_id', orderIds);

    const reminderMap = new Map(
      existingReminders?.map(r => [r.order_id, r]) || []
    );

    // Paso 5: Determinar qué órdenes deben recibir email AHORA
    const ordersToEmail = [];
    
    for (const order of ordersWithoutReviews) {
      const reminder = reminderMap.get(order.id);
      
      if (!reminder) {
        // Primera vez: enviar recordatorio inmediatamente (24h después de completar)
        ordersToEmail.push({ order, reminderCount: 0 });
      } else if (reminder.reminder_count >= 3) {
        // Ya se enviaron 3 recordatorios, no enviar más
        console.log(`Order ${order.id}: Max reminders (3) reached, skipping`);
        continue;
      } else if (reminder.next_send_at && new Date(reminder.next_send_at) <= now) {
        // Es momento de enviar el siguiente recordatorio
        ordersToEmail.push({ order, reminderCount: reminder.reminder_count });
      } else {
        console.log(`Order ${order.id}: Next reminder scheduled for ${reminder.next_send_at}`);
      }
    }

    if (ordersToEmail.length === 0) {
      console.log('No reminders to send at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No reminders due now' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Sending ${ordersToEmail.length} reminders`);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    let sentCount = 0;
    let errorCount = 0;

    // Espaciado de recordatorios: 24h, 3 días, 7 días
    const getNextSendTime = (count: number): Date | null => {
      const base = new Date();
      switch (count) {
        case 0: return new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 días
        case 1: return new Date(base.getTime() + 4 * 24 * 60 * 60 * 1000); // +4 días (total 7 días)
        case 2: return null; // No más recordatorios
        default: return null;
      }
    };

    for (const { order, reminderCount } of ordersToEmail) {
      try {
        const customer = (order as any).customers;
        const customerName = customer?.name || 'cliente';
        const customerEmail = customer?.email;
        const userId = customer?.user_id;

        if (!customerEmail) {
          console.error(`No email for order ${order.id}`);
          errorCount++;
          continue;
        }

        // Obtener información del pedido (basket_name y basket_category)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('basket_name, basket_category')
          .eq('order_id', order.id)
          .limit(1)
          .single();

        const basketName = orderItems?.basket_name || '';
        const basketCategory = orderItems?.basket_category || '';

        // Generar token de auto-login
        const loginToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        const { error: tokenError } = await supabase
          .from('login_tokens')
          .insert({
            token: loginToken,
            user_id: userId,
            user_email: customerEmail,
            expires_at: expiresAt.toISOString(),
            purpose: 'feedback_reminder'
          });

        if (tokenError) {
          console.error(`Error creating login token for order ${order.id}:`, tokenError);
          errorCount++;
          continue;
        }

        // URL con auto-login y parámetros pre-rellenados
        const redirectPath = `feedback?basket=${encodeURIComponent(basketName)}&category=${encodeURIComponent(basketCategory)}`;
        const reviewUrl = `https://experienciaselecta.com/auto-login?token=${loginToken}&redirect=${encodeURIComponent(redirectPath)}`;
        
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

        console.log(`Reminder ${reminderCount + 1}/3 sent to: ${customerEmail} for order ${order.id}`);

        // Actualizar o crear registro de recordatorio
        const newCount = reminderCount + 1;
        const nextSend = getNextSendTime(newCount);

        const { error: upsertError } = await supabase
          .from('review_reminders')
          .upsert({
            order_id: order.id,
            customer_id: order.customer_id,
            reminder_count: newCount,
            last_sent_at: new Date().toISOString(),
            next_send_at: nextSend ? nextSend.toISOString() : null
          }, {
            onConflict: 'order_id'
          });

        if (upsertError) {
          console.error(`Error updating reminder tracking for order ${order.id}:`, upsertError);
        } else {
          console.log(`Reminder tracking updated: ${newCount}/3, next: ${nextSend?.toISOString() || 'FINAL'}`);
        }

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