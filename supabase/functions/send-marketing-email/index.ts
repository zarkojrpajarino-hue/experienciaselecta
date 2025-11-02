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
    const marketingEmailSchema = z.object({
      userEmail: z.string().trim().email().max(255),
      userName: z.string().trim().max(200).optional()
    });

    const requestData = await req.json();
    const validationResult = marketingEmailSchema.safeParse(requestData);

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
    console.log('Sending marketing email to:', userEmail, 'for user:', user.id);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailContent = `
Hola ${userName || 'amigo'},

¿Estás listo para vivir una experiencia inolvidable?

¿Quieres romper con la monotonía? ¿Tener un plan diferente, lleno de valor? ¿Conocer mejor a las personas que más quieres y conocerte a ti mismo?

En Experiencia Selecta transformamos momentos ordinarios en recuerdos extraordinarios.

Descubre nuestras experiencias: https://experienciaselecta.com

Cada cesta es única. Cada experiencia, personalizada. Cada momento, inolvidable.

Un abrazo,
El equipo de Experiencia Selecta
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
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hola ${userName || 'amigo'},</h2>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ¿Estás listo para vivir una experiencia inolvidable?
              </p>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ¿Quieres romper con la monotonía? ¿Tener un plan diferente, lleno de valor? ¿Conocer mejor a las personas que más quieres y conocerte a ti mismo?
              </p>
              
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                En <strong>Experiencia Selecta</strong> transformamos momentos ordinarios en recuerdos extraordinarios.
              </p>
              
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="https://experienciaselecta.com" style="display: inline-block; padding: 15px 40px; background-color: #8B4513; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Descubre nuestras experiencias
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 5px 0; color: #666666; font-size: 16px; line-height: 1.6; font-style: italic;">
                Cada cesta es única. Cada experiencia, personalizada. Cada momento, inolvidable.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Un abrazo,<br>
                El equipo de Experiencia Selecta
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
      subject: '¿Listo para romper con la rutina? Tu experiencia te espera 🎁',
      text: emailContent,
      html: htmlContent,
    });

    console.log('Marketing email sent successfully to:', userEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error sending marketing email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
