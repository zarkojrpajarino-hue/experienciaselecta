import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema for gift records
const giftRecordSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  recipient_email: z.string().trim().email().max(255),
  recipient_name: z.string().trim().max(200),
  sender_name: z.string().trim().max(200),
  basket_name: z.string().trim().max(200),
  basket_category: z.string().trim().max(100),
  personal_note: z.string().max(1000).nullable(),
  created_at: z.string(),
  shipping_completed: z.boolean(),
});

// HTML escape function
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enhanced CRON authentication with timestamp validation
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    const requestTimestamp = req.headers.get('X-Request-Timestamp');
    
    if (!authHeader || !cronSecret || !authHeader.includes(cronSecret)) {
      console.error('Unauthorized: Invalid cron secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate timestamp to prevent replay attacks (allow 5 minute window)
    if (requestTimestamp) {
      const timestamp = parseInt(requestTimestamp, 10);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (isNaN(timestamp) || Math.abs(now - timestamp) > fiveMinutes) {
        console.error('Unauthorized: Invalid or expired timestamp');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Request expired or invalid timestamp' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Calculate timestamp for 72 hours ago
    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

    console.log('Checking for gifts older than:', seventyTwoHoursAgo.toISOString());

    // Find pending gifts that need reminders
    const { data: pendingGifts, error: fetchError } = await supabase
      .from('pending_gifts')
      .select('*')
      .eq('shipping_completed', false)
      .is('reminder_sent_at', null)
      .lt('created_at', seventyTwoHoursAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching pending gifts:', fetchError);
      throw new Error('Failed to fetch pending gifts');
    }

    console.log(`Found ${pendingGifts?.length || 0} gifts needing reminders`);

    if (!pendingGifts || pendingGifts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No reminders to send',
          count: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Send reminder email to each recipient
    let sentCount = 0;
    let errorCount = 0;

    for (const gift of pendingGifts) {
      try {
        // Validate gift record
        const giftValidation = giftRecordSchema.safeParse(gift);
        if (!giftValidation.success) {
          console.error(`Invalid gift record for ${gift.id}:`, giftValidation.error.issues);
          errorCount++;
          continue;
        }

        const recipientEmailContent = `
Hola ${escapeHtml(gift.recipient_name)},

Tienes un regalo esperándote 🎁

${escapeHtml(gift.sender_name)} te envió ${escapeHtml(gift.basket_name)} hace unos días, pero aún no has dejado tu dirección de envío.

Solo te llevará un minuto y tu regalo estará en camino: https://experienciaselecta.com

No dejes pasar esta experiencia única que ${escapeHtml(gift.sender_name)} ha preparado para ti.

Un abrazo,
El equipo de Experiencia Selecta

PD: Si tienes alguna duda, solo responde a este email.
        `;

        const recipientHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B4513, #2F4F2F);
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
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ No olvides reclamar tu regalo de ${escapeHtml(gift.sender_name)}</h1>
  </div>
  <div class="content">
    <p>Hola ${escapeHtml(gift.recipient_name)},</p>
    <p>Tienes un regalo esperándote 🎁</p>
    <p>${escapeHtml(gift.sender_name)} te envió <strong>${escapeHtml(gift.basket_name)}</strong> hace unos días, pero aún no has dejado tu dirección de envío.</p>
    <p style="text-align: center;">
      <a href="https://experienciaselecta.com/regalos" class="cta-button">Reclamar ahora</a>
    </p>
    <p>Solo te llevará un minuto y tu regalo estará en camino.</p>
    <p>No dejes pasar esta experiencia única que ${escapeHtml(gift.sender_name)} ha preparado para ti.</p>
    <p><strong>Un abrazo,<br>El equipo de Experiencia Selecta</strong></p>
    <p style="font-size: 12px; color: #999;">PD: Si tienes alguna duda, solo responde a este email.</p>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
          to: [gift.recipient_email],
          subject: '⏰ No olvides reclamar tu regalo de ' + gift.sender_name,
          text: recipientEmailContent,
          html: recipientHtmlContent,
        });

        // Send reminder to sender/buyer as well
        // First get the order to find the sender's email
        const { data: orderData } = await supabase
          .from('orders')
          .select('customer_id')
          .eq('id', gift.order_id)
          .single();

        if (orderData) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('email, name')
            .eq('id', orderData.customer_id)
            .single();

          if (customerData) {
            const senderEmailContent = `
Hola ${escapeHtml(customerData.name)},

${escapeHtml(gift.recipient_name)} aún no ha reclamado su regalo.

¿Puedes ayudarnos a recordárselo?

A veces los emails se pierden entre la bandeja de entrada. Un mensaje tuyo puede hacer la diferencia para que disfrute de tu regalo.

Gracias por tu ayuda 💝

El equipo de Experiencia Selecta
            `;

            const senderHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B4513, #2F4F2F);
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
  </style>
</head>
<body>
  <div class="header">
    <h1>💭 Ayúdanos a recordarle a ${escapeHtml(gift.recipient_name)}</h1>
  </div>
  <div class="content">
    <p>Hola ${escapeHtml(customerData.name)},</p>
    <p><strong>${escapeHtml(gift.recipient_name)}</strong> aún no ha reclamado su regalo.</p>
    <p>¿Puedes ayudarnos a recordárselo?</p>
    <p>A veces los emails se pierden entre la bandeja de entrada. Un mensaje tuyo puede hacer la diferencia para que disfrute de tu regalo.</p>
    <p>Gracias por tu ayuda 💝</p>
    <p><strong>El equipo de Experiencia Selecta</strong></p>
  </div>
</body>
</html>
            `;

            await resend.emails.send({
              from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
              to: [customerData.email],
              subject: '💭 Ayúdanos a recordar a ' + gift.recipient_name,
              text: senderEmailContent,
              html: senderHtmlContent,
            });

            console.log(`Reminder also sent to sender: ${customerData.email}`);
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('pending_gifts')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', gift.id);

        if (updateError) {
          console.error(`Error updating gift ${gift.id}:`, updateError);
        } else {
          sentCount++;
          console.log(`Reminder sent to ${gift.recipient_email} for gift ${gift.id}`);
        }

      } catch (emailError) {
        console.error(`Error sending reminder for gift ${gift.id}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Successfully sent ${sentCount} reminders out of ${pendingGifts.length} (${errorCount} errors)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${sentCount} reminders (${errorCount} validation errors)`,
        count: sentCount,
        errors: errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in resend-gift-reminders function:', error);
    
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
