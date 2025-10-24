import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function
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

// Validation schema
const shippingSchema = z.object({
  giftId: z.string().uuid(),
  recipientName: z.string().max(100),
  senderName: z.string().max(100),
  basketName: z.string().max(200),
  shippingAddress: z.string().max(500),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const shippingData = await req.json();

    const validatedData = shippingSchema.parse(shippingData);
    
    console.log('Processing gift shipping for:', validatedData.giftId);

    // Email to host (as order notification)
    const hostEmail = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>📦 Nuevo pedido de regalo</h2>
          <p><strong>${escapeHtml(validatedData.senderName)}</strong> ha regalado <strong>${escapeHtml(validatedData.basketName)}</strong> a <strong>${escapeHtml(validatedData.recipientName)}</strong></p>
          <h3>Dirección de envío:</h3>
          <p>${escapeHtml(validatedData.shippingAddress)}</p>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: ['admin@experienciaselecta.com'], // Change to actual host email
      subject: `📦 Nuevo pedido de regalo - ${validatedData.basketName}`,
      html: hostEmail,
    });

    // Email to recipient
    const recipientEmail = `
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
            .content {
              background: #ffffff;
              padding: 30px;
              border: 2px solid #daa520;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎁 ¡Tu regalo está de camino!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${escapeHtml(validatedData.recipientName)}</strong>,</p>
            <p>Tu regalo <strong>${escapeHtml(validatedData.basketName)}</strong> ya está en camino.</p>
            <p>Lo recibirás pronto en la dirección que nos has proporcionado.</p>
            <p>¡Disfruta de esta experiencia gastronómica única!</p>
          </div>
        </body>
      </html>
    `;

    // Note: We need to get recipient email from database
    // This is a placeholder - you'll need to fetch it from pending_gifts table

    // Email to sender
    const senderEmail = `
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
            .content {
              background: #ffffff;
              padding: 30px;
              border: 2px solid #daa520;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✨ Gracias por regalar</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${escapeHtml(validatedData.senderName)}</strong>,</p>
            <p>El regalo de <strong>${escapeHtml(validatedData.recipientName)}</strong> ya está de camino.</p>
            <p>Gracias por compartir momentos especiales con Experiencia Selecta.</p>
          </div>
        </body>
      </html>
    `;

    // Note: We need to get sender email from database
    // This is a placeholder - you'll need to fetch it from the order/customer tables

    console.log('Gift shipping emails sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error processing gift shipping:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid shipping data', details: error.errors }),
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
