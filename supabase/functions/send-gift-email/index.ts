import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function to prevent XSS in emails
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
  recipientName: z.string().max(100),
  recipientEmail: z.string().email().max(255),
  senderName: z.string().max(100),
  basketName: z.string().max(200),
  basketImage: z.string().url().optional(),
  orderId: z.string().uuid(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const giftData = await req.json();

    // Validate and sanitize gift data
    const validatedData = giftSchema.parse(giftData);
    
    console.log('Sending gift email for order:', validatedData.orderId);

    // Create HTML email content with image
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              background: linear-gradient(135deg, #1a0033 0%, #4a0080 100%);
              color: white;
              border-radius: 10px 10px 0 0;
            }
            .gift-icon {
              font-size: 60px;
              margin-bottom: 10px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 2px solid #daa520;
            }
            .basket-image {
              width: 100%;
              max-width: 400px;
              height: auto;
              margin: 20px auto;
              display: block;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .basket-name {
              font-size: 24px;
              font-weight: bold;
              color: #1a0033;
              text-align: center;
              margin: 20px 0;
            }
            .message {
              background: #f9f9f9;
              padding: 20px;
              border-left: 4px solid #daa520;
              margin: 20px 0;
              font-style: italic;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="gift-icon">🎁</div>
            <h1>¡Has recibido un regalo especial!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${escapeHtml(validatedData.recipientName)}</strong>,</p>
            
            <div class="message">
              <p><strong>${escapeHtml(validatedData.senderName)}</strong> te ha regalado una experiencia única, personalizada e inolvidable.</p>
              <p style="margin-top: 20px;">
                <strong>Para recibir tu regalo:</strong><br/>
                Entra en <a href="https://tyorpbzvjnasyaqbggcp.supabase.co" style="color: #daa520; text-decoration: underline;">nuestra web</a> y regístrate con este mismo correo (${escapeHtml(validatedData.recipientEmail)}) para que puedas recibir tu regalo.
              </p>
            </div>

            <div class="basket-name">
              ${escapeHtml(validatedData.basketName)}
            </div>

            ${validatedData.basketImage ? `
              <img src="${escapeHtml(validatedData.basketImage)}" alt="${escapeHtml(validatedData.basketName)}" class="basket-image" />
            ` : ''}

            <p>Esta cesta ha sido cuidadosamente seleccionada para ti y será preparada con todo nuestro cariño.</p>
            
            <p>Pronto recibirás tu regalo en la dirección indicada por ${escapeHtml(validatedData.senderName)}.</p>

            <p style="margin-top: 30px;">¡Disfruta de esta experiencia gastronómica única!</p>
          </div>
          <div class="footer">
            <p>Experiencia Selecta<br/>
            La mejor selección de productos ibéricos</p>
            <p style="font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
¡Hola ${escapeHtml(validatedData.recipientName)}!

${escapeHtml(validatedData.senderName)} te ha regalado una experiencia única, personalizada e inolvidable.

🎁 ${escapeHtml(validatedData.basketName)}

Esta cesta ha sido cuidadosamente seleccionada para ti y será preparada con todo nuestro cariño.

Pronto recibirás tu regalo en la dirección indicada.

¡Disfruta de esta experiencia gastronómica única!

Saludos,
El equipo de Experiencia Selecta
    `;

    // Send email to recipient
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [validatedData.recipientEmail],
      subject: `🎁 ${validatedData.senderName} te ha regalado una Experiencia Selecta`,
      html: htmlContent,
      text: textContent,
    });

    console.log('Gift email sent successfully to:', validatedData.recipientEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending gift email:', error);
    
    // Handle validation errors specifically
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
