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
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify JWT and get authenticated user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('User authenticated:', user.id);

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
        recipient_user_id,
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

    // Authorization: Verify user owns this gift
    const userEmail = user.email?.toLowerCase();
    const recipientEmail = gift.recipient_email?.toLowerCase();
    const recipientUserId = gift.recipient_user_id;

    if (recipientUserId !== user.id && recipientEmail !== userEmail) {
      console.error('Unauthorized gift claim attempt:', { userId: user.id, giftId: validatedData.giftId });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not own this gift' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    console.log('Authorization verified for gift:', validatedData.giftId);

    // Create user account automatically if it doesn't exist
    console.log('Checking if user exists for email:', recipientEmail);
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw new Error('Failed to check existing users');
    }

    const existingUser = users.find(u => u.email === recipientEmail);

    if (!existingUser) {
      console.log('User does not exist, creating new user for recipient...');
      
      // Create new user with random password
      const randomPassword = crypto.randomUUID();
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: recipientEmail,
        password: randomPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: validatedData.recipientName,
          created_via: 'gift_claim',
          auto_created: true
        }
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        // Don't throw - we can still process the gift
        console.warn('Failed to create user, continuing with gift processing');
      } else {
        console.log('User created successfully for recipient:', newUser.user.id);
        
        // Update the gift with the new user_id
        const { error: updateUserIdError } = await supabase
          .from('pending_gifts')
          .update({ recipient_user_id: newUser.user.id })
          .eq('id', validatedData.giftId);
          
        if (updateUserIdError) {
          console.error('Error updating gift with user_id:', updateUserIdError);
        }

        // Optionally send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: recipientEmail,
              name: validatedData.recipientName,
              isAutoCreated: true
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw - we don't want to fail the gift processing if email fails
        }
      }
    } else {
      console.log('User already exists for recipient:', existingUser.id);
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
        <p><strong>Comprador:</strong> ${escapeHtml(validatedData.senderName)}</p>
        <p><strong>Destinatario:</strong> ${escapeHtml(validatedData.recipientName)}</p>
        <p><strong>Pedido:</strong> #${gift.order_id}</p>
        <p><strong>Fecha reclamación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>
      <h3>📦 PRODUCTOS:</h3>
      <p>${escapeHtml(validatedData.basketName)}</p>
      <h3>📍 DIRECCIÓN DE ENVÍO:</h3>
      <p>${escapeHtml(validatedData.shippingAddress)}</p>
      <p><strong>🚚 Acción requerida: Preparar y enviar</strong></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Regalo reclamado - Acción requerida

Comprador: ${escapeHtml(validatedData.senderName)}
Destinatario: ${escapeHtml(validatedData.recipientName)}
Pedido: #${gift.order_id}
Fecha reclamación: ${new Date().toLocaleDateString('es-ES')}

📦 PRODUCTOS:
${escapeHtml(validatedData.basketName)}

📍 DIRECCIÓN DE ENVÍO:
${escapeHtml(validatedData.shippingAddress)}

🚚 Acción requerida: Preparar y enviar

---
Sistema Experiencia Selecta`,
    });

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [gift.recipient_email],
      subject: `🎉 ¡Enhorabuena! Tu regalo está en camino`,
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
    .highlight { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFB800; }
    .experience-box { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 ¡Enhorabuena ${escapeHtml(validatedData.recipientName)}!</h1></div>
    <div class="content">
      <p><strong>¡Perfecto!</strong> Hemos recibido tu dirección de envío correctamente.</p>
      
      <p>Tu regalo <strong>${escapeHtml(validatedData.basketName)}</strong> ${validatedData.senderName ? `de parte de ${escapeHtml(validatedData.senderName)}` : ''} está en camino y pronto lo disfrutarás.</p>
      
      <div class="info-box">
        <h3>📦 Tiempo estimado de entrega:</h3>
        <p><strong>3-5 días laborables</strong></p>
      </div>
      
      <p style="font-style: italic; color: #8B4513; font-size: 1.1em; margin: 20px 0;">Pero esto es solo el comienzo...</p>
      
      <div class="experience-box">
        <h2 style="margin: 0 0 15px 0; font-size: 1.5em;">✨ Esto no es solo una cesta, es una experiencia</h2>
        <p style="margin: 0; font-size: 1.1em;">No vendemos cestas. Creamos experiencias únicas que vivirás con tus seres queridos.</p>
      </div>
      
      <div class="highlight">
        <h3 style="margin: 0 0 10px 0; color: #8B4513;">🔐 Acceso exclusivo a paragenteselecta.com</h3>
        <p style="margin: 0 0 10px 0;">
          Con este regalo tienes acceso a nuestra plataforma exclusiva donde tu cesta cobra vida con una experiencia personalizada y única.
        </p>
        
        <h3 style="margin: 20px 0 10px 0; color: #8B4513;">🕐 24 horas de experiencia por cada cesta</h3>
        <p style="margin: 0 0 10px 0;"><strong>⚠️ MUY IMPORTANTE:</strong> Activa tu experiencia solo cuando estés listo para consumir la cesta con tus seres queridos. Cada cesta te da 24 horas de acceso activo para disfrutar de contenido exclusivo, guías, y todo lo necesario para vivir la experiencia completa.</p>
        
        <p style="margin: 15px 0 0 0; font-style: italic; color: #666;">Te recomendamos planificar con anticipación y activarla cuando realmente vayas a disfrutarla.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://paragenteselecta.com" style="display: inline-block; background-color: #8B4513; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em;">
          🎯 Acceder a mi experiencia
        </a>
      </div>
      
      <p style="font-style: italic; text-align: center; margin: 30px 0; font-size: 1.2em; color: #8B4513;">
        "No es solo lo que comes. Es cómo lo vives. 💝"
      </p>
      
      <p style="margin-top: 30px;">Prepárate para vivir algo único que recordarás para siempre.</p>
      
      <p>Con cariño,<br><strong>El equipo de Experiencia Selecta</strong></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `¡Enhorabuena ${escapeHtml(validatedData.recipientName)}!

¡Perfecto! Hemos recibido tu dirección de envío correctamente.

Tu regalo ${escapeHtml(validatedData.basketName)} ${validatedData.senderName ? `de parte de ${escapeHtml(validatedData.senderName)}` : ''} está en camino y pronto lo disfrutarás.

📦 Tiempo estimado de entrega: 3-5 días laborables

Pero esto es solo el comienzo...

✨ Esto no es solo una cesta, es una experiencia

No vendemos cestas. Creamos experiencias únicas que vivirás con tus seres queridos.

🔐 Acceso exclusivo a paragenteselecta.com

Con este regalo tienes acceso a nuestra plataforma exclusiva donde tu cesta cobra vida con una experiencia personalizada y única.

🕐 24 horas de experiencia por cada cesta

⚠️ MUY IMPORTANTE: Activa tu experiencia solo cuando estés listo para consumir la cesta con tus seres queridos. Cada cesta te da 24 horas de acceso activo para disfrutar de contenido exclusivo, guías, y todo lo necesario para vivir la experiencia completa.

Te recomendamos planificar con anticipación y activarla cuando realmente vayas a disfrutarla.

Acceder a paragenteselecta.com: https://paragenteselecta.com

"No es solo lo que comes. Es cómo lo vives. 💝"

Prepárate para vivir algo único que recordarás para siempre.

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
      <p>¡Hola ${escapeHtml(validatedData.senderName)}!</p>
      <p>Tenemos buenas noticias: <strong>${escapeHtml(validatedData.recipientName)}</strong> ya reclamó su regalo y está de camino.</p>
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
        text: `¡Hola ${escapeHtml(validatedData.senderName)}!

Tenemos buenas noticias: ${escapeHtml(validatedData.recipientName)} ya reclamó su regalo y está de camino.

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
