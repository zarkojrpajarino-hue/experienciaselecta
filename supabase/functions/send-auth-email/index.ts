import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string;
// Supabase provides secrets like "v1,whsec_..." - Standard Webhooks expects the base64 part only
const hookSecret = (rawHookSecret || '').replace(/^v\d+,?whsec_/, '');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature using Standard Webhooks
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };
    console.log('Sending auth email to:', user.email, 'Type:', email_action_type);

    let subject = '';
    let emailContent = '';
    let htmlContent = '';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

    // Magic link URL
    const magicLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    if (email_action_type === 'magiclink') {
      // For login, prioritize CODE-based flow to preserve the user's cart/session
      subject = '🔐 Tu código de acceso a Experiencia Selecta';
      emailContent = `
Hola,

Has solicitado acceder a Experiencia Selecta.

Introduce este código de verificación en la web donde lo estás solicitando:

CÓDIGO: ${token}

Por seguridad, evita usar enlaces y usa el código directamente para mantener tu carrito y continuar el pago.

Este código caduca en 1 hora.

Si no solicitaste este correo, ignóralo.

Un abrazo,
El equipo de Experiencia Selecta
      `;

      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
    .code { background: white; padding: 18px; border-radius: 6px; font-family: monospace; font-size: 22px; letter-spacing: 3px; text-align: center; margin: 24px 0; border: 2px dashed #8B4513; font-weight: 700; }
    .note { font-size: 13px; color: #555; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 Tu código de acceso</h1>
  </div>
  <div class="content">
    <p>Hola,</p>
    <p>Has solicitado acceder a <strong>Experiencia Selecta</strong>.</p>
    <p>Introduce este código en la web donde lo estás solicitando para mantener tu carrito y continuar al pago:</p>
    <div class="code">${token}</div>
    <p class="note">Este código caduca en <strong>1 hora</strong>. No compartas este código con nadie.</p>
    <p class="note">Por seguridad y para mantener tu carrito, <strong>no uses enlaces</strong>; introduce el código directamente en el formulario.</p>
    <p style="margin-top: 30px;"><strong>Un abrazo,<br>El equipo de Experiencia Selecta</strong></p>
  </div>
  <div class="footer">
    <p>© 2025 Experiencia Selecta. Todos los derechos reservados.</p>
  </div>
</body>
</html>
      `;
    } else if (email_action_type === 'signup') {
      subject = '✅ Confirma tu cuenta en Experiencia Selecta';
      emailContent = `
Hola,

¡Bienvenido/a a Experiencia Selecta!

Para completar tu registro, confirma tu cuenta haciendo clic en el siguiente enlace:

${magicLink}

O usa este código de verificación: ${token}

Este enlace es válido por 24 horas.

Si no creaste esta cuenta, puedes ignorar este correo.

Un abrazo,
El equipo de Experiencia Selecta
      `;

      htmlContent = `
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
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
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
    .button {
      display: inline-block;
      background: #8B4513;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .code {
      background: white;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 2px;
      text-align: center;
      margin: 20px 0;
      border: 2px dashed #8B4513;
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
    <h1>✅ ¡Bienvenido/a!</h1>
  </div>
  <div class="content">
    <p>Hola,</p>
    <p>¡Bienvenido/a a <strong>Experiencia Selecta</strong>!</p>
    <p>Para completar tu registro, confirma tu cuenta:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" class="button">
        Confirmar cuenta
      </a>
    </div>
    
    <p style="text-align: center; color: #666; margin: 20px 0;">O usa este código de verificación:</p>
    
    <div class="code">${token}</div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Este enlace es válido por <strong>24 horas</strong>.
    </p>
    
    <p style="font-size: 14px; color: #999; margin-top: 20px;">
      Si no creaste esta cuenta, puedes ignorar este correo.
    </p>
    
    <p style="margin-top: 30px;"><strong>Un abrazo,<br>El equipo de Experiencia Selecta</strong></p>
  </div>
  <div class="footer">
    <p>© 2025 Experiencia Selecta. Todos los derechos reservados.</p>
  </div>
</body>
</html>
      `;
    } else if (email_action_type === 'recovery') {
      subject = '🔑 Recuperación de contraseña - Experiencia Selecta';
      emailContent = `
Hola,

Has solicitado restablecer tu contraseña en Experiencia Selecta.

Haz clic en el siguiente enlace para crear una nueva contraseña:

${magicLink}

O usa este código de verificación: ${token}

Este enlace es válido por 1 hora.

Si no solicitaste restablecer tu contraseña, ignora este correo. Tu contraseña actual seguirá siendo válida.

Un abrazo,
El equipo de Experiencia Selecta
      `;

      htmlContent = `
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
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
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
    .button {
      display: inline-block;
      background: #8B4513;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .code {
      background: white;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 2px;
      text-align: center;
      margin: 20px 0;
      border: 2px dashed #8B4513;
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
    <h1>🔑 Recuperación de contraseña</h1>
  </div>
  <div class="content">
    <p>Hola,</p>
    <p>Has solicitado restablecer tu contraseña en <strong>Experiencia Selecta</strong>.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" class="button">
        Crear nueva contraseña
      </a>
    </div>
    
    <p style="text-align: center; color: #666; margin: 20px 0;">O usa este código de verificación:</p>
    
    <div class="code">${token}</div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Este enlace es válido por <strong>1 hora</strong>.
    </p>
    
    <p style="font-size: 14px; color: #999; margin-top: 20px;">
      Si no solicitaste restablecer tu contraseña, ignora este correo. Tu contraseña actual seguirá siendo válida.
    </p>
    
    <p style="margin-top: 30px;"><strong>Un abrazo,<br>El equipo de Experiencia Selecta</strong></p>
  </div>
  <div class="footer">
    <p>© 2025 Experiencia Selecta. Todos los derechos reservados.</p>
  </div>
</body>
</html>
      `;
    } else {
      // Default case for other email types
      subject = 'Notificación de Experiencia Selecta';
      emailContent = `
Hola,

Haz clic en el siguiente enlace para continuar:

${magicLink}

O usa este código: ${token}

Un abrazo,
El equipo de Experiencia Selecta
      `;

      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .button {
      display: inline-block;
      background: #8B4513;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <p>Hola,</p>
  <p>Haz clic en el siguiente enlace para continuar:</p>
  <div style="text-align: center;">
    <a href="${magicLink}" class="button">Continuar</a>
  </div>
  <p>O usa este código: <strong>${token}</strong></p>
  <p>Un abrazo,<br>El equipo de Experiencia Selecta</p>
</body>
</html>
      `;
    }

    const { error } = await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [user.email],
      subject,
      text: emailContent,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Auth email sent successfully to:', user.email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || 'Unknown error',
        },
      }),
      {
        status: error.code || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
