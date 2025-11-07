import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Sending welcome email to:', user.email);

    const { userEmail, userName } = await req.json();

    const displayName = userName || userEmail?.split('@')[0] || 'Usuario';

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const plainTextContent = `
¡Hola ${displayName}!

¡Bienvenido/a a Experiencia Selecta!

Nos alegra mucho que formes parte de nuestra comunidad. Aquí encontrarás las mejores cestas gourmet con productos ibéricos de la más alta calidad.

🎁 ¿Qué puedes hacer ahora?

- Explorar nuestras cestas exclusivas
- Personalizar tu regalo perfecto
- Acceder a ofertas especiales para miembros
- Gestionar tus pedidos fácilmente

👉 Descubre nuestras cestas: https://experienciaselecta.com/cestas

Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.

Un abrazo,
El equipo de Experiencia Selecta

---
Experiencia selecta, personas auténticas.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .welcome-icon {
      font-size: 64px;
      text-align: center;
      margin: 20px 0;
    }
    .features {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      border-left: 4px solid #8B4513;
    }
    .features h3 {
      margin-top: 0;
      color: #8B4513;
    }
    .features ul {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    .features li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    .features li:before {
      content: "✓";
      color: #8B4513;
      font-weight: bold;
      font-size: 18px;
      position: absolute;
      left: 10px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 30px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #8B4513;
      text-decoration: none;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #8B4513;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido/a a Experiencia Selecta!</h1>
    </div>
    
    <div class="content">
      <div class="welcome-icon">🎉</div>
      
      <p>¡Hola <strong>${displayName}</strong>!</p>
      
      <p>Nos alegra mucho que formes parte de nuestra comunidad. Aquí encontrarás las mejores <strong>cestas gourmet</strong> con productos ibéricos de la más alta calidad.</p>
      
      <div class="features">
        <h3>🎁 ¿Qué puedes hacer ahora?</h3>
        <ul>
          <li>Explorar nuestras cestas exclusivas</li>
          <li>Personalizar tu regalo perfecto</li>
          <li>Acceder a ofertas especiales para miembros</li>
          <li>Gestionar tus pedidos fácilmente</li>
        </ul>
      </div>
      
      <div class="cta-section">
        <h3 style="color: #8B4513; margin-bottom: 10px;">👉 Empieza a explorar</h3>
        <a href="https://experienciaselecta.com/cestas" class="cta-button">
          Ver Nuestras Cestas
        </a>
      </div>
      
      <p style="text-align: center; color: #666; margin-top: 30px;">
        Si tienes alguna pregunta, no dudes en<br>
        <a href="https://experienciaselecta.com/contacto" style="color: #8B4513; text-decoration: none; font-weight: bold;">contactarnos</a>. Estamos aquí para ayudarte.
      </p>
      
      <p style="margin-top: 40px;">Un abrazo,<br><strong>El equipo de Experiencia Selecta</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>Experiencia selecta, personas auténticas.</strong></p>
      
      <div class="social-links">
        <a href="https://instagram.com/experienciaselecta">Instagram</a> •
        <a href="https://facebook.com/experienciaselecta">Facebook</a>
      </div>
      
      <p style="margin-top: 15px; color: #999;">
        © 2025 Experiencia Selecta. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [userEmail],
      subject: '🎉 ¡Bienvenido/a a Experiencia Selecta!',
      text: plainTextContent,
      html: htmlContent,
    });

    if (emailError) {
      console.error('Error sending welcome email:', emailError);
      throw emailError;
    }

    console.log('Welcome email sent successfully to:', userEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});