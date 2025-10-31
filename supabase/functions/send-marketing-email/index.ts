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
¡Hola ${userName || 'amigo/a'}!

¿Estás listo/a para vivir una experiencia inolvidable?

¿Quieres romper con la monotonía? ¿Tener un plan diferente, lleno de valor? ¿Conectar con las personas que más quieres y conocerte a ti mismo?

🌟 Entra en experienciaselecta.com y descubre una nueva forma de disfrutar.

Cada momento cuenta. Hazlo especial.

Saludos,
El equipo de Experiencia Selecta
`;

    const htmlContent = `
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
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #8B4513, #2F4F2F);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    .highlight {
      background: linear-gradient(135deg, rgba(139,69,19,0.1), rgba(47,79,47,0.1));
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #8B4513;
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
    <h1>¿Estás listo/a para vivir una experiencia inolvidable? ✨</h1>
  </div>
  <div class="content">
    <p>Hola ${userName || 'amigo/a'},</p>
    
    <div class="highlight">
      <p style="margin: 0; font-size: 18px; color: #8B4513;"><strong>¿Quieres romper con la monotonía?</strong></p>
      <p style="margin: 10px 0 0 0;">¿Tener un plan diferente, lleno de valor?</p>
      <p style="margin: 5px 0 0 0;">¿Conectar con las personas que más quieres y conocerte a ti mismo?</p>
    </div>

    <p style="text-align: center; font-size: 18px; margin: 30px 0;">
      <strong>Descubre una nueva forma de disfrutar.</strong>
    </p>
    
    <p style="text-align: center;">
      <a href="https://experienciaselecta.com" class="cta-button">Entra en experienciaselecta.com</a>
    </p>
    
    <p style="text-align: center; color: #8B4513; font-size: 16px; margin-top: 30px;">
      <em>Cada momento cuenta. Hazlo especial.</em>
    </p>
    
    <p style="margin-top: 40px;"><strong>El equipo de Experiencia Selecta</strong></p>
  </div>
  <div class="footer">
    <p>Experiencia Selecta - Experiencias gastronómicas únicas</p>
    <p>© 2025 Experiencia Selecta. Todos los derechos reservados.</p>
  </div>
</body>
</html>
`;

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [userEmail],
      subject: '✨ ¿Estás listo/a para vivir una experiencia inolvidable?',
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
