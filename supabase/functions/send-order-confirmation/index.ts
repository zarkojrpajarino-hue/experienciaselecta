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
  })).min(1).max(50)
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

    const { email, customerName, orderId, items, totalAmount } = validationResult.data;

    console.log("Enviando correo de confirmación de pedido a:", email);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.basketName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price / 100).toFixed(2)}€</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Experiencia Selecta <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 ¡Enhorabuena! Tu experiencia única te está esperando",
      html: `
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Enhorabuena ${customerName}!</h1>
              </div>
              <div class="content">
                <p>Has adquirido <strong>${items.map(item => `${item.quantity}x ${item.basketName}`).join(', ')}</strong>.</p>
                
                <p style="font-style: italic; color: #8B4513;">Pero esto es solo el comienzo...</p>
                
                <div class="highlight">
                  <h3 style="margin: 0 0 10px 0; color: #8B4513;">✨ Tu acceso exclusivo a paragenteselecta.com</h3>
                  <p style="margin: 0 0 10px 0;">Con tu compra, tienes acceso a nuestra plataforma exclusiva donde cada cesta cobra vida con una experiencia personalizada y única.</p>
                  
                  <h3 style="margin: 20px 0 10px 0; color: #8B4513;">🕐 24 horas de experiencia por cada cesta</h3>
                  <p style="margin: 0;"><strong>Importante:</strong> Cada cesta te da 24 horas de acceso activo. Te recomendamos activarlas solo cuando vayas a consumirlas con tus seres queridos para disfrutar de la experiencia completa.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://paragenteselecta.com" style="display: inline-block; background-color: #8B4513; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Acceder a mi experiencia
                  </a>
                </div>
                
                <div class="order-summary">
                  <h2>📦 Tu pedido:</h2>
                  <p><strong>Número de orden:</strong> #${orderId}</p>
                  <p><strong>Total:</strong> ${(totalAmount / 100).toFixed(2)}€</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                </div>

                <p style="font-style: italic; text-align: center; margin: 30px 0;">Mientras tanto, prepárate para vivir algo único.</p>
                
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
