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
      subject: "✅ Confirmación de tu pedido - Experiencia Selecta",
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
                <h1>¡Enhorabuena por tu compra! 🎉</h1>
              </div>
              <div class="content">
                <p>Hola ${customerName},</p>
                <p>¡Gracias por confiar en nosotros! Has adquirido nuestras exclusivas cestas gourmet que te darán acceso a una experiencia única en <strong>paragenteselecta.com</strong>.</p>
                
                <div class="highlight">
                  <p style="margin: 0 0 10px 0;"><strong>✨ ¿Qué incluye tu compra?</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Productos ibéricos premium de la más alta calidad</li>
                    <li>Acceso exclusivo a <strong>paragenteselecta.com</strong></li>
                    <li><strong>24 horas de experiencia personalizada</strong> por cada cesta</li>
                    <li>Un viaje sensorial único diseñado especialmente para ti</li>
                  </ul>
                  <p style="margin: 10px 0 0 0;"><strong>⚠️ Importante:</strong> Utiliza tus 24 horas de acceso <strong>solo cuando vayas a consumir cada cesta</strong>. Así podrás vivir la experiencia completa.</p>
                </div>
                
                <div class="order-summary">
                  <h2>Resumen de tu pedido</h2>
                  <p><strong>ID del pedido:</strong> ${orderId}</p>
                  
                  <table>
                    <thead>
                      <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; text-align: right;">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                  
                  <p class="total">Total: ${(totalAmount / 100).toFixed(2)}€</p>
                </div>

                <p>Recibirás otro correo cuando tu pedido sea enviado.</p>
                
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <p>Con cariño,<br><strong>El equipo de Experiencia Selecta</strong></p>
              </div>
              <div class="footer">
                <p>Experiencia selecta, personas auténticas.</p>
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
