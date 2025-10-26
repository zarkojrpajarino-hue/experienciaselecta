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
    // Verify cron secret
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
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

        const emailContent = `
¡Hola ${escapeHtml(gift.recipient_name)}!

Este es un recordatorio sobre el regalo que ${escapeHtml(gift.sender_name)} te envió.

🎁 Tu regalo: ${escapeHtml(gift.basket_name)}

Para recibir tu regalo, necesitamos que nos proporciones tu dirección de envío.

⚠️ IMPORTANTE: Este es el último recordatorio que enviaremos. 

👉 Entra aquí para completar tus datos: https://experienciaselecta.com/regalos

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de Experiencia Selecta
        `;

        await resend.emails.send({
          from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
          to: [gift.recipient_email],
          subject: '⏰ Último recordatorio - Completa tus datos para recibir tu regalo',
          text: emailContent,
        });

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
