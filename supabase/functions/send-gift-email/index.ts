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
          subject: '🎁 ¡' + validatedData.senderName + ' te ha enviado una experiencia única!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B4513; text-align: center;">🎁 ¡Hola ${escapeHtml(recipient.recipientName)}!</h1>
              
              ${basketImage ? `<img src="${escapeHtml(basketImage)}" alt="Cesta de regalo" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;" />` : ''}
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">${escapeHtml(validatedData.senderName)} te ha enviado algo especial: una experiencia única y personalizada.</h2>
                
                <h3 style="color: #8B4513;">🎁 Tu regalo: ${escapeHtml(basketNames)}</h3>
                
                <p style="color: #666;">Un recuerdo inolvidable para que lo disfrutes con tus seres queridos.</p>
                
                ${recipient.personalNote ? `
                  <div style="background-color: #fff; padding: 15px; border-left: 4px solid #8B4513; margin: 15px 0;">
                    <p style="color: #666; font-weight: bold; margin: 0 0 5px 0;">💌 ${escapeHtml(validatedData.senderName)} te dice:</p>
                    <p style="color: #666; font-style: italic; margin: 0;">"${escapeHtml(recipient.personalNote)}"</p>
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://experienciaselecta.com/regalos" style="background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Reclamar mi regalo
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">Solo necesitamos saber dónde enviártelo.</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #856404; margin: 0; font-weight: bold;">✨ Pero espera, hay más...</p>
                  <p style="color: #856404; margin: 10px 0 0 0;">
                    Con este regalo no solo recibirás productos ibéricos premium. También tendrás acceso exclusivo a <strong>paragenteselecta.com</strong>, donde tu cesta se convierte en una experiencia personalizada de 24 horas.
                  </p>
                </div>
                
                <p style="color: #666; text-align: center; font-style: italic;">Reclama tu regalo ahora y prepárate para vivir algo único.</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">Con cariño,<br>El equipo de Experiencia Selecta</p>
              </div>
            </div>
          `,
          text: `
¡Hola ${recipient.recipientName}!

${validatedData.senderName} te ha enviado algo especial: una experiencia única y personalizada.

🎁 Tu regalo: ${basketNames}

Un recuerdo inolvidable para que lo disfrutes con tus seres queridos.

${recipient.personalNote ? `💌 ${validatedData.senderName} te dice:\n"${recipient.personalNote}"\n\n` : ''}

Reclama tu regalo aquí: https://experienciaselecta.com/regalos

Solo necesitamos saber dónde enviártelo.

✨ Pero espera, hay más...

Con este regalo no solo recibirás productos ibéricos premium. También tendrás acceso exclusivo a paragenteselecta.com, donde tu cesta se convierte en una experiencia personalizada de 24 horas.

Reclama tu regalo ahora y prepárate para vivir algo único.

Con cariño,
El equipo de Experiencia Selecta
          `
        });

        console.log('Recipient email sent:', recipientEmailResponse);
      } 
      // Only send SMS if email is NOT provided
      else if (recipient.recipientPhone) {
        const personalNoteText = recipient.personalNote ? `\n\nNota personal del comprador` : '';
        const smsMessage = `🎁 ¡${validatedData.senderName} te ha enviado un regalo de Experiencia Selecta!${personalNoteText}\nReclámalo aquí: https://experienciaselecta.com/regalos`;
        
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
      subject: '💝 ¡Regalo enviado! ' + validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ') + ' recibirá tu sorpresa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513; text-align: center;">💝 ¡Enhorabuena ${escapeHtml(validatedData.senderName)}!</h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666;">Has regalado <strong>${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ')}</strong>.</p>
            
            <h3 style="color: #8B4513;">🎁 Tu regalo está listo para ser reclamado</h3>
            
            <p style="color: #666;">Hemos enviado una notificación a ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientEmail || r.recipientPhone).join(', ')} para que complete${validatedData.recipients.length === 1 ? '' : 'n'} su${validatedData.recipients.length === 1 ? '' : 's'} dirección${validatedData.recipients.length === 1 ? '' : 'es'} de envío.</p>
            
            <p style="color: #666;">Una vez que ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => escapeHtml(r.recipientName)).join(', ')} nos ${validatedData.recipients.length === 1 ? 'indique' : 'indiquen'} dónde enviar su regalo, prepararemos el pedido y te avisaremos.</p>
            
            ${validatedData.recipients.some((r: z.infer<typeof recipientSchema>) => r.personalNote) ? `
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #8B4513; margin: 15px 0;">
                <p style="color: #666; font-weight: bold; margin: 0 0 10px 0;">💌 Tus mensajes personales:</p>
                ${validatedData.recipients.filter((r: z.infer<typeof recipientSchema>) => r.personalNote).map((r: z.infer<typeof recipientSchema>) => 
                  `<p style="color: #666; margin: 5px 0;"><strong>${escapeHtml(r.recipientName)}:</strong> "${escapeHtml(r.personalNote!)}"</p>`
                ).join('')}
              </div>
            ` : ''}
            
            <h3 style="color: #8B4513;">¿Qué pasa ahora?</h3>
            <ol style="color: #666; margin: 15px 0; padding-left: 20px; line-height: 1.8;">
              <li>${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => escapeHtml(r.recipientName)).join(', ')} recibirá${validatedData.recipients.length === 1 ? '' : 'n'} un email/SMS con la notificación</li>
              <li>Completará${validatedData.recipients.length === 1 ? '' : 'n'} su${validatedData.recipients.length === 1 ? '' : 's'} dirección${validatedData.recipients.length === 1 ? '' : 'es'} de envío en nuestra web</li>
              <li>Prepararemos y enviaremos el pedido</li>
              <li>Te avisaremos cuando esté en camino</li>
            </ol>
            
            <p style="color: #666;">Gracias por elegir Experiencia Selecta para crear momentos inolvidables.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Un abrazo,<br>El equipo de Experiencia Selecta</p>
          </div>
        </div>
      `,
      text: `
¡Enhorabuena ${validatedData.senderName}!

Has regalado ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ')}.

🎁 Tu regalo está listo para ser reclamado

Hemos enviado una notificación a ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientEmail || r.recipientPhone).join(', ')} para que complete${validatedData.recipients.length === 1 ? '' : 'n'} su${validatedData.recipients.length === 1 ? '' : 's'} dirección${validatedData.recipients.length === 1 ? '' : 'es'} de envío.

Una vez que ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ')} nos ${validatedData.recipients.length === 1 ? 'indique' : 'indiquen'} dónde enviar su regalo, prepararemos el pedido y te avisaremos.

${validatedData.recipients.some((r: z.infer<typeof recipientSchema>) => r.personalNote) ? `
💌 Tus mensajes personales:
${validatedData.recipients.filter((r: z.infer<typeof recipientSchema>) => r.personalNote).map((r: z.infer<typeof recipientSchema>) => 
  `${r.recipientName}: "${r.personalNote}"`
).join('\n')}
` : ''}

¿Qué pasa ahora?
1. ${validatedData.recipients.map((r: z.infer<typeof recipientSchema>) => r.recipientName).join(', ')} recibirá${validatedData.recipients.length === 1 ? '' : 'n'} un email/SMS con la notificación
2. Completará${validatedData.recipients.length === 1 ? '' : 'n'} su${validatedData.recipients.length === 1 ? '' : 's'} dirección${validatedData.recipients.length === 1 ? '' : 'es'} de envío en nuestra web
3. Prepararemos y enviaremos el pedido
4. Te avisaremos cuando esté en camino

Gracias por elegir Experiencia Selecta para crear momentos inolvidables.

Un abrazo,
El equipo de Experiencia Selecta
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
