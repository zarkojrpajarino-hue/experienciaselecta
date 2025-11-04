import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const orderConfirmationSchema = z.object({
  email: z.string().trim().email().max(255),
  customerName: z.string().trim().min(1).max(200),
  orderId: z.string().uuid(),
  totalAmount: z.number().int().positive().max(1000000),
  items: z.array(z.object({
    basketName: z.string().trim().min(1).max(200),
    quantity: z.number().int().positive().max(100),
    price: z.number().int().positive().max(100000)
  })).min(1).max(50),
  howFoundUs: z.string().optional(),
  shippingAddress: z.string().optional(),
  isGift: z.boolean().optional()
});

type OrderConfirmationRequest = z.infer<typeof orderConfirmationSchema>;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestData = await req.json();
    const validationResult = orderConfirmationSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, customerName, orderId, items, totalAmount, howFoundUs, shippingAddress, isGift } = validationResult.data;

    console.log("Enviando correo de confirmación de pedido a:", email, "isGift:", isGift);

    // Send notification to host/admin ONLY for normal purchases (not gifts)
    // For gifts, admin will be notified when recipient fills shipping info
    if (!isGift) {
      try {
      const adminEmailResponse = await resend.emails.send({
        from: "Experiencia Selecta <onboarding@resend.dev>",
        to: ["selectaexperiencia@gmail.com"],
        subject: `🛒 Nuevo pedido de ${customerName} - ${orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #8B4513; }
                td { padding: 8px; border-bottom: 1px solid #eee; }
                .total { font-size: 1.2em; font-weight: bold; color: #8B4513; margin-top: 10px; }
                .highlight { background: #FFF9E6; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FFB800; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🛒 Nuevo Pedido Recibido</h2>
                </div>
                <div class="content">
                  <p><strong>Cliente:</strong> ${customerName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Pedido #:</strong> ${orderId}</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                  ${howFoundUs ? `<p><strong>¿Cómo nos conoció?:</strong> ${howFoundUs}</p>` : ''}
                  ${shippingAddress ? `<p><strong>Dirección de envío:</strong> ${shippingAddress}</p>` : ''}
                  
                  <div class="highlight">
                    <h3 style="margin: 0 0 10px 0;">📦 Artículos del pedido:</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Cesta</th>
                          <th style="text-align: center;">Cantidad</th>
                          <th style="text-align: right;">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items.map(item => `
                          <tr>
                            <td>${item.basketName}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">${(item.price / 100).toFixed(2)}€</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <div class="total">Total: ${(totalAmount / 100).toFixed(2)}€</div>
                  </div>
                  
                  <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    Este es un email automático de notificación de pedido.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
        console.log("Notificación al admin enviada:", adminEmailResponse);
      } catch (adminError) {
        console.error("Error enviando notificación al admin:", adminError);
        // Non-blocking - continue to send customer email
      }
    } else {
      console.log("Compra de regalo - admin será notificado cuando el destinatario rellene la dirección");
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.basketName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price / 100).toFixed(2)}€</td>
      </tr>
    `).join('');

    // Different email content for gift buyers vs normal customers
    const emailResponse = await resend.emails.send({
      from: "Experiencia Selecta <onboarding@resend.dev>",
      to: [email],
      subject: isGift ? "✅ Confirmación de pago - Regalo enviado" : "🎉 ¡Enhorabuena! Tu experiencia única te está esperando",
      html: isGift ? `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
              .order-summary { margin: 20px 0; }
              .total { font-size: 1.2em; font-weight: bold; color: #8B4513; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }
              .highlight { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFB800; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Pago Confirmado</h1>
              </div>
              <div class="content">
                <p>Hola ${customerName},</p>
                
                <p>Tu pago ha sido procesado correctamente y tus regalos han sido enviados a los destinatarios.</p>
                
                <div class="highlight">
                  <p style="margin: 0;"><strong>📧 Los destinatarios recibirán un email</strong> con las instrucciones para reclamar su regalo y proporcionar su dirección de envío.</p>
                  <p style="margin: 10px 0 0 0;">Te notificaremos cuando cada destinatario complete el proceso.</p>
                </div>
                
                <div class="order-summary">
                  <h2>📦 Resumen del pedido:</h2>
                  <p><strong>Número de orden:</strong> #${orderId}</p>
                  <p><strong>Cestas regaladas:</strong> ${items.map(item => `${item.quantity}x ${item.basketName}`).join(', ')}</p>
                  <div class="total">Total pagado: ${(totalAmount / 100).toFixed(2)}€</div>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                
                <p style="margin-top: 30px;">Gracias por elegir <strong>Experiencia Selecta</strong> para compartir momentos especiales.</p>
                
                <p>Con cariño,<br><strong>El equipo de Experiencia Selecta</strong></p>
              </div>
              <div class="footer">
                <p>¿Necesitas ayuda? Responde a este email, estamos aquí para ti.</p>
                <p>© 2024 Experiencia Selecta. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      ` : `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
              .order-summary { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              .total { font-size: 1.2em; font-weight: bold; color: #8B4513; margin-top: 20px; text-align: right; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }
              .highlight { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFB800; }
              .experience-box { background: linear-gradient(135deg, #8B4513 0%, #2F4F2F 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Enhorabuena ${customerName}!</h1>
              </div>
              <div class="content">
                <p>Has adquirido <strong>${items.map(item => `${item.quantity}x ${item.basketName}`).join(', ')}</strong>.</p>
                
                <p style="font-style: italic; color: #8B4513; font-size: 1.1em; margin: 20px 0;">Pero esto es solo el comienzo...</p>
                
                <div class="experience-box">
                  <h2 style="margin: 0 0 15px 0; font-size: 1.5em;">✨ Esto no es solo una cesta, es una experiencia</h2>
                  <p style="margin: 0; font-size: 1.1em;">No vendemos cestas. Creamos experiencias únicas que vivirás con tus seres queridos.</p>
                </div>
                
                <div class="highlight">
                  <h3 style="margin: 0 0 10px 0; color: #8B4513;">🔐 Acceso exclusivo a paragenteselecta.com</h3>
                  <p style="margin: 0 0 10px 0;">Con tu compra, tienes acceso a nuestra plataforma exclusiva donde cada cesta cobra vida con una experiencia personalizada y única.</p>
                  
                  <h3 style="margin: 20px 0 10px 0; color: #8B4513;">🕐 24 horas de experiencia por cada cesta</h3>
                  <p style="margin: 0 0 10px 0;"><strong>⚠️ MUY IMPORTANTE:</strong> Activa tu experiencia solo cuando estés listo para consumir la cesta con tus seres queridos. Cada cesta te da 24 horas de acceso activo para disfrutar de contenido exclusivo, guías, y todo lo necesario para vivir la experiencia completa.</p>
                  
                  <p style="margin: 15px 0 0 0; font-style: italic; color: #666;">Te recomendamos planificar con anticipación y activarla cuando realmente vayas a disfrutarla.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://paragenteselecta.com" style="display: inline-block; background-color: #8B4513; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em;">
                    🎯 Acceder a mi experiencia
                  </a>
                </div>
                
                <div class="order-summary">
                  <h2>📦 Tu pedido:</h2>
                  <p><strong>Número de orden:</strong> #${orderId}</p>
                  <p><strong>Total:</strong> ${(totalAmount / 100).toFixed(2)}€</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                </div>

                <p style="font-style: italic; text-align: center; margin: 30px 0; font-size: 1.2em; color: #8B4513;">
                  "No es solo lo que comes. Es cómo lo vives. 💝"
                </p>
                
                <p style="margin-top: 30px;">Mientras tanto, prepárate para vivir algo único que recordarás para siempre.</p>
                
                <p>Con cariño,<br><strong>El equipo de Experiencia Selecta</strong></p>
              </div>
              <div class="footer">
                <p>¿Necesitas ayuda? Responde a este email, estamos aquí para ti.</p>
                <p>© 2024 Experiencia Selecta. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Correo de confirmación enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error enviando correo de confirmación:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
