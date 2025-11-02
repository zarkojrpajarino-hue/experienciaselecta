import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function to prevent XSS
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

// Gift data validation schema
const recipientSchema = z.object({
  recipientName: z.string().trim().min(1).max(100),
  recipientEmail: z.string().trim().email().max(255).optional(),
  recipientPhone: z.string().trim().max(20).optional(),
  personalNote: z.string().trim().max(500).optional(),
  basketIds: z.array(z.number())
}).refine(
  (data) => data.recipientEmail || data.recipientPhone,
  {
    message: "Debe proporcionar al menos un email o un número de teléfono",
  }
);

const giftDataSchema = z.object({
  senderName: z.string().trim().min(1).max(100),
  senderEmail: z.string().trim().email().max(255),
  recipients: z.array(recipientSchema).min(1)
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const body = await req.json();
    console.log('Received gift email request:', body);

    // Validate the input data
    const validatedData = giftDataSchema.parse(body);

    // Send email or SMS to each recipient
    for (const recipient of validatedData.recipients) {
      // Get basket details for this recipient
      const basketNames = body.basketItems
        ?.filter((item: any) => recipient.basketIds.includes(item.id))
        ?.map((item: any) => `${item.name} x${item.quantity}`)
        ?.join(', ') || 'Cesta Experiencia Selecta';

      const basketImage = body.basketItems?.[0]?.image || '';
      const totalPrice = body.basketItems
        ?.filter((item: any) => recipient.basketIds.includes(item.id))
        ?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;

      // Prioritize email over SMS: if both are provided, only send email
      if (recipient.recipientEmail) {
        const recipientEmailResponse = await resend.emails.send({
          from: 'Experiencias Selecta <onboarding@resend.dev>',
          to: [recipient.recipientEmail],
          subject: '🎁 ¡Te han regalado una experiencia!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #D4AF37; text-align: center;">🎁 ¡Tienes un regalo!</h1>
              
              ${basketImage ? `<img src="${escapeHtml(basketImage)}" alt="Cesta de regalo" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;" />` : ''}
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">¡${escapeHtml(recipient.recipientName)}, ${escapeHtml(validatedData.senderName)} te ha regalado algo especial!</h2>
                
                ${recipient.personalNote ? `
                  <div style="background-color: #fff; padding: 15px; border-left: 4px solid #D4AF37; margin: 15px 0;">
                    <p style="color: #666; font-style: italic; margin: 0;">"${escapeHtml(recipient.personalNote)}"</p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px; margin-bottom: 0;">- ${escapeHtml(validatedData.senderName)}</p>
                  </div>
                ` : ''}
                
                <h3 style="color: #D4AF37;">Tu regalo:</h3>
                <p style="font-size: 18px; color: #333; font-weight: bold;">${escapeHtml(basketNames)}</p>
                
                <p style="color: #666;">Para recibir tu regalo, necesitamos que nos proporciones tu dirección de envío.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://experienciaselecta.com/regalos" style="background-color: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Proporcionar dirección de envío
                  </a>
                </div>
                
                <p style="color: #999; font-size: 12px;">Si no tienes cuenta, puedes crear una con este email para reclamar tu regalo.</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">Experiencias Selecta - Momentos que perduran</p>
              </div>
            </div>
          `,
          text: `
¡${recipient.recipientName}, ${validatedData.senderName} te ha regalado algo especial!

${recipient.personalNote ? `Mensaje: "${recipient.personalNote}"\n- ${validatedData.senderName}\n\n` : ''}

Tu regalo: ${basketNames}

Para recibir tu regalo, visita: https://experienciaselecta.com/regalos

Si no tienes cuenta, puedes crear una con este email para reclamar tu regalo.

Experiencias Selecta - Momentos que perduran
          `
        });

        console.log('Recipient email sent:', recipientEmailResponse);
      } 
      // Only send SMS if email is NOT provided
      else if (recipient.recipientPhone) {
        const personalNoteText = recipient.personalNote ? `\n\nMensaje: "${recipient.personalNote}"` : '';
        const smsMessage = `Hola ${recipient.recipientName}, ${validatedData.senderName} te ha regalado una experiencia única. Reclama tu regalo: https://experienciaselecta.com/regalos${personalNoteText}`;
        
        console.log('Sending SMS to', recipient.recipientPhone);
        
        try {
          // Initialize Supabase client to call our send-sms function
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { data: smsData, error: smsError } = await supabase.functions.invoke('send-sms', {
            body: {
              to: recipient.recipientPhone,
              message: smsMessage
            }
          });

          if (smsError) {
            console.error('Error sending SMS:', smsError);
          } else {
            console.log('SMS sent successfully:', smsData);
          }
        } catch (smsError) {
          console.error('Failed to send SMS:', smsError);
          // Continue execution even if SMS fails
        }
      }

      console.log('Notification sent to recipient:', recipient.recipientName);
    }

    // Send confirmation email to sender
    const senderEmailResponse = await resend.emails.send({
      from: 'Experiencias Selecta <onboarding@resend.dev>',
      to: [validatedData.senderEmail],
      subject: '✅ Tu regalo ha sido enviado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37; text-align: center;">✅ ¡Regalo enviado con éxito!</h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Hola ${escapeHtml(validatedData.senderName)},</h2>
            
            <p style="color: #666;">Tu regalo ha sido enviado correctamente a:</p>
            
            ${validatedData.recipients.map((recipient: z.infer<typeof recipientSchema>) => `
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p style="margin: 5px 0;"><strong>${escapeHtml(recipient.recipientName)}</strong></p>
                <p style="margin: 5px 0; color: #666;">${recipient.recipientEmail ? escapeHtml(recipient.recipientEmail) : ''}</p>
                ${recipient.recipientPhone ? `<p style="margin: 5px 0; color: #666;">${escapeHtml(recipient.recipientPhone)}</p>` : ''}
                ${recipient.personalNote ? `<p style="margin: 5px 0; color: #999; font-style: italic; font-size: 14px;">"${escapeHtml(recipient.personalNote)}"</p>` : ''}
              </div>
            `).join('')}
            
            <p style="color: #666; margin-top: 20px;">Los destinatarios recibirán un correo o mensaje SMS con las instrucciones para reclamar su regalo y proporcionar su dirección de envío.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-weight: bold;">⏰ Recordatorio importante:</p>
              <p style="color: #856404; margin: 10px 0 0 0;">
                Solo queda que ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => escapeHtml(r.recipientName)).join(', ')} 
                ${validatedData.recipients.length === 1 ? 'entre' : 'entren'} en ${validatedData.recipients.length === 1 ? 'su correo, vea su regalo' : 'sus correos, vean sus regalos'} 
                y nos ${validatedData.recipients.length === 1 ? 'diga' : 'digan'} dónde ${validatedData.recipients.length === 1 ? 'quiere' : 'quieren'} que ${validatedData.recipients.length === 1 ? 'entreguemos su pedido' : 'entreguemos sus pedidos'}.
                <br><br>
                <strong>Pasadas 72 horas, si aún no ${validatedData.recipients.length === 1 ? 'ha' : 'han'} entrado en ${validatedData.recipients.length === 1 ? 'el correo' : 'los correos'}, volveremos a enviarlo, pero este será el último que enviemos.</strong>
              </p>
            </div>
            
            <p style="color: #666;">Una vez que proporcionen su dirección, prepararemos las cestas con cariño y las enviaremos.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Gracias por regalar momentos especiales con Experiencias Selecta</p>
          </div>
        </div>
      `,
      text: `
¡Hola ${validatedData.senderName}!

Tu regalo ha sido enviado correctamente a:

${validatedData.recipients.map((recipient: z.infer<typeof recipientSchema>) => 
  `- ${recipient.recipientName} (${recipient.recipientEmail || recipient.recipientPhone})${recipient.personalNote ? `\n  Nota: "${recipient.personalNote}"` : ''}`
).join('\n')}

Los destinatarios recibirán un correo o mensaje SMS con las instrucciones para reclamar su regalo.

⏰ RECORDATORIO IMPORTANTE:
Solo queda que ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ')} 
${validatedData.recipients.length === 1 ? 'entre' : 'entren'} en ${validatedData.recipients.length === 1 ? 'su correo, vea su regalo' : 'sus correos, vean sus regalos'} 
y nos ${validatedData.recipients.length === 1 ? 'diga' : 'digan'} dónde ${validatedData.recipients.length === 1 ? 'quiere' : 'quieren'} que ${validatedData.recipients.length === 1 ? 'entreguemos su pedido' : 'entreguemos sus pedidos'}.

Pasadas 72 horas, si aún no ${validatedData.recipients.length === 1 ? 'ha' : 'han'} entrado en ${validatedData.recipients.length === 1 ? 'el correo' : 'los correos'}, volveremos a enviarlo, pero este será el último que enviemos.

Gracias por regalar momentos especiales con Experiencias Selecta
      `
    });

    console.log('Sender confirmation email sent:', senderEmailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'Gift emails sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in send-gift-email function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: error.errors 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
