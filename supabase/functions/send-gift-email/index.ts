import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

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

// Validation schema for gift data
const giftSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required").max(100),
  recipientEmail: z.string().email("Invalid recipient email").max(255),
  senderName: z.string().min(1, "Sender name is required").max(100),
  senderEmail: z.string().email("Invalid sender email").max(255),
  basketName: z.string().min(1, "Basket name is required").max(255),
  basketImage: z.string().url("Invalid image URL").optional(),
  orderId: z.string().uuid("Invalid order ID").optional(),
  totalAmount: z.number().positive("Total amount must be positive").optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    // Parse and validate request body
    const rawData = await req.json();
    const validatedData = giftSchema.parse(rawData);
    
    console.log('Sending gift notification email to recipient:', validatedData.recipientEmail);

    // Send email to recipient with gift details
    const recipientEmailResponse = await resend.emails.send({
      from: 'Experiencias Selecta <onboarding@resend.dev>',
      to: [validatedData.recipientEmail],
      subject: '🎁 ¡Te han regalado una experiencia única e inolvidable!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>¡Te han regalado una experiencia!</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #D4AF37 0%, #F4E4C1 100%);">
                        <h1 style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: bold;">
                          🎁 ¡Te han regalado una experiencia única e inolvidable!
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.6; color: #333333;">
                          Hola <strong>${escapeHtml(validatedData.recipientName)}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                          <strong>${escapeHtml(validatedData.senderName)}</strong> (${escapeHtml(validatedData.senderEmail)}) 
                          te ha regalado una experiencia gastronómica única:
                        </p>
                        
                        <!-- Gift Box -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #FFF9E6; border: 2px solid #D4AF37; border-radius: 8px;">
                          <tr>
                            <td style="padding: 25px; text-align: center;">
                              <h2 style="margin: 0 0 15px; color: #D4AF37; font-size: 24px; font-weight: bold;">
                                ${escapeHtml(validatedData.basketName)}
                              </h2>
                              <p style="margin: 0; font-size: 16px; color: #666666;">
                                Una selección cuidadosa de productos ibéricos premium para disfrutar en buena compañía.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                          <strong>¿Qué tienes que hacer ahora?</strong>
                        </p>
                        
                        <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #666666;">
                          <li>Regístrate en nuestra web con este mismo correo electrónico (${escapeHtml(validatedData.recipientEmail)})</li>
                          <li>Ve al icono de regalos 🎁 en la página principal</li>
                          <li>Completa los datos de envío para que podamos enviarte tu cesta</li>
                        </ol>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="https://experienciaselecta.com" 
                                 style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D4AF37 0%, #F4E4C1 100%); color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);">
                                Ir a la web y completar datos
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #999999; text-align: center;">
                          Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">
                          Experiencias Selecta - Regalos gastronómicos únicos
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #cccccc;">
                          <a href="https://experienciaselecta.com" style="color: #D4AF37; text-decoration: none;">experienciaselecta.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
¡Te han regalado una experiencia única e inolvidable!

Hola ${validatedData.recipientName},

${validatedData.senderName} (${validatedData.senderEmail}) te ha regalado una experiencia gastronómica única:

🎁 ${validatedData.basketName}

¿Qué tienes que hacer ahora?

1. Regístrate en nuestra web con este mismo correo electrónico (${validatedData.recipientEmail})
2. Ve al icono de regalos 🎁 en la página principal
3. Completa los datos de envío para que podamos enviarte tu cesta

Visita: https://experienciaselecta.com

Si tienes alguna pregunta, no dudes en contactarnos.

Experiencias Selecta - Regalos gastronómicos únicos
https://experienciaselecta.com
      `
    });

    console.log('Recipient gift email sent successfully:', recipientEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        recipientEmailId: recipientEmailResponse.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-gift-email:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid gift data', details: error.errors }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
