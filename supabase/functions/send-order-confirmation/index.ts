import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  email: string;
  customerName: string;
  orderId: string;
  items: Array<{
    basketName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, orderId, items, totalAmount }: OrderConfirmationRequest = await req.json();

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
              .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
              .order-summary { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              .total { font-size: 1.2em; font-weight: bold; color: #4F46E5; margin-top: 20px; text-align: right; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Gracias por tu compra!</h1>
              </div>
              <div class="content">
                <p>Hola ${customerName},</p>
                <p>Tu pedido ha sido confirmado y está siendo preparado con todo nuestro cariño.</p>
                
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
