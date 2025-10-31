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
    // Verify cron secret
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      console.error('Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('Starting scheduled marketing email job...');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get consents from 24+ hours ago that haven't received email yet
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: pendingConsents, error: fetchError } = await supabase
      .from('cookie_consents')
      .select('id, email, user_id')
      .eq('marketing_email_sent', false)
      .lte('consented_at', twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching pending consents:', fetchError);
      throw fetchError;
    }

    if (!pendingConsents || pendingConsents.length === 0) {
      console.log('No pending emails to send');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending emails' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${pendingConsents.length} pending emails to send`);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    let sentCount = 0;
    let errorCount = 0;

    // Send emails
    for (const consent of pendingConsents) {
      try {
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', consent.user_id)
          .single();

        const userName = profile?.name || '';

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
          to: [consent.email],
          subject: '🌟 Bienvenido/a a Experiencia Selecta - El nuevo plan alternativo',
          text: emailContent,
          html: htmlContent,
        });

        // Mark as sent
        await supabase
          .from('cookie_consents')
          .update({
            marketing_email_sent: true,
            marketing_email_sent_at: new Date().toISOString(),
          })
          .eq('id', consent.id);

        console.log(`Email sent successfully to: ${consent.email}`);
        sentCount++;

      } catch (error: any) {
        console.error(`Error sending email to ${consent.email}:`, error);
        errorCount++;
      }
    }

    console.log(`Job completed. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        errors: errorCount 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in scheduled marketing email job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
