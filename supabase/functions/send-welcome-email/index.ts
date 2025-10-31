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
¡Hola ${userName || 'amigo/a'}!

Bienvenido/a a Experiencia Selecta 🌟

Nos alegra mucho que estés aquí. Has dado el primer paso hacia experiencias gastronómicas únicas que transformarán tus momentos especiales.

¿Qué te espera en Experiencia Selecta?

✨ Cestas gourmet premium con productos ibéricos de la más alta calidad
🎯 Experiencias personalizadas diseñadas especialmente para ti
💝 La posibilidad de regalar momentos inolvidables
🌐 Acceso exclusivo a paragenteselecta.com con cada compra

Cada una de nuestras cestas viene con 24 horas de experiencia digital personalizada. No es solo una compra, es el inicio de un viaje sensorial.

¿Listo/a para empezar?

👉 Explora nuestras cestas: https://experienciaselecta.com

Si tienes alguna pregunta, estamos aquí para ayudarte.

¡Bienvenido/a a la familia Selecta!

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
    .features {
      background: linear-gradient(135deg, rgba(139,69,19,0.1), rgba(47,79,47,0.1));
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #8B4513;
    }
    .features ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .features li {
      margin-bottom: 10px;
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
    <h1>¡Bienvenido/a a Experiencia Selecta! ✨</h1>
  </div>
  <div class="content">
    <p>¡Hola ${userName || 'amigo/a'}!</p>
    
    <p>Nos alegra mucho que estés aquí. Has dado el primer paso hacia <strong>experiencias gastronómicas únicas</strong> que transformarán tus momentos especiales.</p>
    
    <div class="features">
      <p style="margin: 0 0 10px 0; font-size: 18px; color: #8B4513;"><strong>¿Qué te espera en Experiencia Selecta?</strong></p>
      <ul>
        <li><strong>✨ Cestas gourmet premium</strong> con productos ibéricos de la más alta calidad</li>
        <li><strong>🎯 Experiencias personalizadas</strong> diseñadas especialmente para ti</li>
        <li><strong>💝 La posibilidad de regalar</strong> momentos inolvidables</li>
        <li><strong>🌐 Acceso exclusivo</strong> a paragenteselecta.com con cada compra</li>
      </ul>
    </div>

    <p>Cada una de nuestras cestas viene con <strong>24 horas de experiencia digital personalizada</strong>. No es solo una compra, es el inicio de un viaje sensorial.</p>
    
    <p style="text-align: center; font-size: 18px; margin: 30px 0;">
      <strong>¿Listo/a para empezar?</strong>
    </p>
    
    <p style="text-align: center;">
      <a href="https://experienciaselecta.com" class="cta-button">Explora Nuestras Cestas</a>
    </p>
    
    <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>
    
    <p style="text-align: center; color: #8B4513; font-size: 18px; margin-top: 40px;">
      <strong>¡Bienvenido/a a la familia Selecta!</strong>
    </p>
    
    <p style="margin-top: 30px;"><strong>El equipo de Experiencia Selecta</strong></p>
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
      subject: '✨ ¡Bienvenido/a a Experiencia Selecta! Tu viaje comienza aquí',
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
