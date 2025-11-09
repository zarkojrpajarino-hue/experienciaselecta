import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, basketName, basketCategory, rating, userId } = await req.json();

    console.log('Sending review notification to:', userEmail);

    // Crear cliente Supabase con service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generar token temporal de 24h para auto-login
    const loginToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Guardar token en la base de datos
    const { error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .insert({
        token: loginToken,
        user_id: userId,
        user_email: userEmail,
        expires_at: expiresAt.toISOString(),
        used: false,
        purpose: 'review_notification'
      });

    if (tokenError) {
      console.error('Error creating login token:', tokenError);
      throw tokenError;
    }

    // Generar URL de auto-login
    const autoLoginUrl = `https://experienciaselecta.com/auto-login?token=${loginToken}&redirect=perfil%3Ftab%3Dreviews`;

    // Determinar el artículo según la categoría
    let articlePrefix = 'tu';
    if (basketCategory === 'pareja') articlePrefix = 'tu';
    else if (basketCategory === 'familia') articlePrefix = 'tu';
    else if (basketCategory === 'amigos') articlePrefix = 'tu';

    // Generar estrellas visuales según el rating
    const stars = '⭐'.repeat(rating);

    // HTML del email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Tu Valoración está Lista!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                  ¡Tu Valoración está Lista! ${stars}
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  Hola <strong>${userName}</strong>,
                </p>
                
                <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                  ¡Tenemos buenas noticias! 🎉 Tu valoración de <strong>${basketName}</strong> para <strong>${articlePrefix} ${basketCategory}</strong> ha sido publicada y ya está visible en nuestra página.
                </p>

                <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                  Gracias por compartir tu experiencia. Tu opinión ayuda a otros clientes a descubrir momentos únicos.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${autoLoginUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                    Ver Mi Valoración
                  </a>
                </div>

                <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  Este enlace te llevará directamente a tu perfil donde podrás ver tu valoración publicada.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  <strong>Experiencias Selecta</strong>
                </p>
                <p style="margin: 0; color: #999999; font-size: 12px;">
                  Momentos únicos para personas especiales
                </p>
              </td>
            </tr>
          </table>

          <!-- Security Notice -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto 40px;">
            <tr>
              <td style="padding: 20px; text-align: center;">
                <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                  🔒 Este enlace es seguro y expira en 24 horas.<br>
                  Si no solicitaste este email, puedes ignorarlo.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: 'Experiencias Selecta <onboarding@resend.dev>',
      to: [userEmail],
      subject: `¡Tu valoración de ${basketName} está publicada! ${stars}`,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Review notification sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Review notification sent',
        emailId: data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-review-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send review notification',
        message: error?.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
