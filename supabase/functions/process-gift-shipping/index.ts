import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const shippingData = await req.json();

    const validatedData = shippingSchema.parse(shippingData);
    
    console.log('Processing gift shipping for:', validatedData.giftId);

    // Get gift details to find the associated order and sender email
    const { data: gift, error: giftError } = await supabase
      .from('pending_gifts')
      .select(`
        order_id, 
        recipient_email, 
        recipient_name, 
        sender_name, 
        basket_name,
        orders!inner(
          customer_id,
          customers!inner(
            email
          )
        )
      `)
      .eq('id', validatedData.giftId)
      .single();

    if (giftError || !gift) {
      console.error('Error fetching gift:', giftError);
      throw new Error('Gift not found');
    }

    // Mark the order as completed now that recipient has provided shipping info
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', gift.order_id);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      throw new Error('Failed to update order status');
    }

    // Mark gift as shipping completed
    const { error: giftUpdateError } = await supabase
      .from('pending_gifts')
      .update({ shipping_completed: true })
      .eq('id', validatedData.giftId);

    if (giftUpdateError) {
      console.error('Error updating gift status:', giftUpdateError);
    }

    console.log('Order marked as completed for gift:', validatedData.giftId);

    // Note: Using simplified schema - full implementation would fetch from DB
    const shippingDataExtended = {
      ...validatedData,
      shippingAddress1: validatedData.shippingAddress.split(',')[0] || validatedData.shippingAddress,
      shippingAddress2: '',
      shippingCity: 'Ciudad',
      shippingPostalCode: '00000',
      shippingCountry: 'España'
    };

    // Send all 3 emails with optimized content
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: ['selectaexperiencia@gmail.com'],
      subject: `📦 Regalo reclamado - Preparar envío #${gift.order_id}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
    .info-box { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #8B4513; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📦 Regalo reclamado - Acción requerida</h1></div>
    <div class="content">
      <div class="info-box">
        <p><strong>Comprador:</strong> ${validatedData.senderName}</p>
        <p><strong>Destinatario:</strong> ${validatedData.recipientName}</p>
        <p><strong>Pedido:</strong> #${gift.order_id}</p>
        <p><strong>Fecha reclamación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>
      <h3>📦 PRODUCTOS:</h3>
      <p>${validatedData.basketName}</p>
      <h3>📍 DIRECCIÓN DE ENVÍO:</h3>
      <p>${validatedData.shippingAddress}</p>
      <p><strong>🚚 Acción requerida: Preparar y enviar</strong></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Regalo reclamado - Acción requerida

Comprador: ${validatedData.senderName}
Destinatario: ${validatedData.recipientName}
Pedido: #${gift.order_id}
Fecha reclamación: ${new Date().toLocaleDateString('es-ES')}

📦 PRODUCTOS:
${validatedData.basketName}

📍 DIRECCIÓN DE ENVÍO:
${validatedData.shippingAddress}

🚚 Acción requerida: Preparar y enviar

---
Sistema Experiencia Selecta`,
    });

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [gift.recipient_email],
      subject: `✅ ¡Reclamado! Tu experiencia está de camino`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px 20px; border-radius: 0 0 10px 10px; }
    .info-box { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #8B4513; }
    .cta-button { display: inline-block; background: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✅ ¡Enhorabuena ${validatedData.recipientName}!</h1></div>
    <div class="content">
      <p>Tu regalo <strong>${validatedData.basketName}</strong> está reclamado y pronto estará contigo.</p>
      
      <div class="info-box">
        <h3>📦 Detalles de envío:</h3>
        <p><strong>Dirección:</strong> ${validatedData.shippingAddress}</p>
        <p><strong>Estimado:</strong> 3-5 días laborables</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
        <h3 style="color: #856404; margin-top: 0;">✨ Esto no es solo una cesta, es una experiencia</h3>
        <p style="color: #856404; margin: 10px 0;">
          Con este regalo no solo recibirás productos ibéricos premium. También tienes acceso exclusivo a <strong>paragenteselecta.com</strong>, donde tu cesta se convierte en una experiencia única e inolvidable.
        </p>
      </div>
      
      <h3 style="color: #8B4513;">🕐 24 horas de experiencia por cada cesta</h3>
      <p><strong>Muy importante:</strong> Activa tu experiencia en paragenteselecta.com solo cuando estés listo para consumir la cesta con tus seres queridos. Así disfrutarás de toda la experiencia completa durante 24 horas.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://paragenteselecta.com" class="cta-button">Acceder a paragenteselecta.com</a>
      </div>
      
      <p style="text-align: center; font-style: italic; margin-top: 30px; color: #8B4513; font-size: 18px;">
        No es solo lo que comes. Es cómo lo vives. 💝
      </p>
      
      <p style="margin-top: 30px;">Con cariño,<br><strong>El equipo de Experiencia Selecta</strong></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `¡Enhorabuena ${validatedData.recipientName}!

Tu regalo ${validatedData.basketName} está reclamado y pronto estará contigo.

📦 Detalles de envío:
- Dirección: ${validatedData.shippingAddress}
- Estimado: 3-5 días laborables

✨ Esto no es solo una cesta, es una experiencia

Con este regalo no solo recibirás productos ibéricos premium. También tienes acceso exclusivo a paragenteselecta.com, donde tu cesta se convierte en una experiencia única e inolvidable.

🕐 24 horas de experiencia por cada cesta

Muy importante: Activa tu experiencia en paragenteselecta.com solo cuando estés listo para consumir la cesta con tus seres queridos. Así disfrutarás de toda la experiencia completa durante 24 horas.

Acceder a paragenteselecta.com: https://paragenteselecta.com

No es solo lo que comes. Es cómo lo vives. 💝

Con cariño,
El equipo de Experiencia Selecta`,
    });

    const senderEmail = (gift as any).orders?.customers?.email;
    if (senderEmail) {
      await resend.emails.send({
        from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
        to: [senderEmail],
        subject: `🎉 ¡Buenas noticias! ${validatedData.recipientName} reclamó su regalo`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px 20px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 ¡Buenas noticias!</h1></div>
    <div class="content">
      <p>¡Hola ${validatedData.senderName}!</p>
      <p>Tenemos buenas noticias: <strong>${validatedData.recipientName}</strong> ya reclamó su regalo y está de camino.</p>
      <p>Tu detalle llegará pronto a su destino. Seguro que le encantará 💝</p>
      <p>Gracias por elegir Experiencia Selecta para crear momentos especiales.</p>
      <p style="margin-top: 30px;">Un abrazo,<br><strong>El equipo de Experiencia Selecta</strong></p>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
      <p style="text-align: center; color: #999; font-size: 14px;">¿Quieres regalar otra experiencia? → <a href="https://experienciaselecta.com">experienciaselecta.com</a></p>
    </div>
  </div>
</body>
</html>
        `,
        text: `¡Hola ${validatedData.senderName}!

Tenemos buenas noticias: ${validatedData.recipientName} ya reclamó su regalo y está de camino.

Tu detalle llegará pronto a su destino. Seguro que le encantará 💝

Gracias por elegir Experiencia Selecta para crear momentos especiales.

Un abrazo,
El equipo de Experiencia Selecta

---
¿Quieres regalar otra experiencia? → https://experienciaselecta.com`,
      });

      console.log('Sender notification email sent to:', senderEmail);
    }

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
