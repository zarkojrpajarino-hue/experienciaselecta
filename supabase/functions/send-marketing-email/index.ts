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

Bienvenido/a a Experiencia Selecta - el nuevo plan alternativo.

🌟 Descubre quiénes somos y por qué estamos revolucionando el mundo de las experiencias gastronómicas.

¿Quieres probar una experiencia nueva? 

Visita nuestra web y descubre todo lo que tenemos para ofrecerte:
👉 https://experienciaselecta.com

Estamos aquí para hacer que cada momento sea especial.

¡Gracias por confiar en nosotros!

Saludos,
El equipo de Experiencia Selecta
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
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
      background: linear-gradient(135deg, #782C23, #4A7050);
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
      background: #782C23;
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
    <h1>¡Bienvenido/a a Experiencia Selecta!</h1>
  </div>
  <div class="content">
    <h2>El nuevo plan alternativo 🌟</h2>
    <p>Hola ${userName || 'amigo/a'},</p>
    <p>Descubre quiénes somos y por qué estamos revolucionando el mundo de las experiencias gastronómicas.</p>
    <p><strong>¿Quieres probar una experiencia nueva?</strong></p>
    <p style="text-align: center;">
      <a href="https://experienciaselecta.com" class="cta-button">Descubre Experiencia Selecta</a>
    </p>
    <p>Estamos aquí para hacer que cada momento sea especial.</p>
    <p>¡Gracias por confiar en nosotros!</p>
    <p><strong>El equipo de Experiencia Selecta</strong></p>
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
      subject: '🌟 Bienvenido/a a Experiencia Selecta - El nuevo plan alternativo',
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
