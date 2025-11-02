import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate input
    const welcomeEmailSchema = z.object({
      userEmail: z.string().trim().email().max(255),
      userName: z.string().trim().max(200).optional()
    });

    const requestData = await req.json();
    const validationResult = welcomeEmailSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: validationResult.error.issues }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userEmail, userName } = validationResult.data;
    console.log('Sending welcome email to:', userEmail, 'for user:', user.id);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailContent = `
¡Bienvenido ${userName || 'amigo'}!

Acabas de dar el primer paso hacia experiencias inolvidables.

En Experiencia Selecta no vendemos cestas. Creamos momentos.

✨ ¿Qué hace únicas nuestras experiencias?

Cada cesta incluye:
• Productos ibéricos premium seleccionados
• 24 horas de experiencia personalizada en paragenteselecta.com
• Contenido exclusivo diseñado para crear recuerdos

No es solo lo que comes. Es cómo lo vives.

Explora experiencias: https://experienciaselecta.com

💝 ¿Es un regalo?

Nuestras cestas son perfectas para sorprender. El destinatario no solo recibe productos premium, sino una experiencia completa que recordará siempre.

Estamos aquí para ayudarte a crear momentos especiales.

Un abrazo,
El equipo de Experiencia Selecta

PD: ¿Tienes dudas? Solo responde a este email. Nos encantará ayudarte.
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Experiencia Selecta</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">¡Bienvenido ${userName || 'amigo'}!</h2>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Acabas de dar el primer paso hacia experiencias inolvidables.
              </p>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                En <strong>Experiencia Selecta</strong> no vendemos cestas. Creamos momentos.
              </p>
              
              <h3 style="margin: 30px 0 15px 0; color: #8B4513; font-size: 20px;">✨ ¿Qué hace únicas nuestras experiencias?</h3>
              
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Cada cesta incluye:
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                <li>Productos ibéricos premium seleccionados</li>
                <li>24 horas de experiencia personalizada en paragenteselecta.com</li>
                <li>Contenido exclusivo diseñado para crear recuerdos</li>
              </ul>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6; font-style: italic; text-align: center;">
                No es solo lo que comes. Es cómo lo vives.
              </p>
              
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="https://experienciaselecta.com" style="display: inline-block; padding: 15px 40px; background-color: #8B4513; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Explorar experiencias
                    </a>
                  </td>
                </tr>
              </table>
              
              <h3 style="margin: 30px 0 15px 0; color: #8B4513; font-size: 20px;">💝 ¿Es un regalo?</h3>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Nuestras cestas son perfectas para sorprender. El destinatario no solo recibe productos premium, sino una experiencia completa que recordará siempre.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Estamos aquí para ayudarte a crear momentos especiales.
              </p>
              
              <p style="margin: 10px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Un abrazo,<br>
                El equipo de Experiencia Selecta
              </p>
              
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6; font-style: italic;">
                PD: ¿Tienes dudas? Solo responde a este email. Nos encantará ayudarte.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 14px;">
                © 2024 Experiencia Selecta. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [userEmail],
      subject: '✨ Bienvenido a Experiencia Selecta, ' + (userName || 'amigo'),
      text: emailContent,
      html: htmlContent,
    });

    console.log('Welcome email sent successfully to:', userEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
