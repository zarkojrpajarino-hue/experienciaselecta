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

const reviewRequestSchema = z.object({
  email: z.string().trim().email().max(255),
  customerName: z.string().trim().min(1).max(200),
  orderId: z.string().uuid(),
  basketNames: z.array(z.string().trim().min(1).max(200)).min(1).max(20)
});

type ReviewRequestData = z.infer<typeof reviewRequestSchema>;

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
    const validationResult = reviewRequestSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, customerName, orderId, basketNames } = validationResult.data;

    console.log("Enviando solicitud de valoración a:", email);

    const basketsList = basketNames.map(name => `<li style="margin: 5px 0;">${escapeHtml(name)}</li>`).join('');

    const emailResponse = await resend.emails.send({
      from: "Experiencia Selecta <noreply@experienciaselecta.com>",
      to: [email],
      subject: "⭐ ¿Qué te pareció tu experiencia? - Experiencia Selecta",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
              .cta-button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }
              ul { background: #f8f9fa; padding: 20px 20px 20px 40px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⭐ Tu opinión nos importa</h1>
              </div>
              <div class="content">
                <p>Hola ${escapeHtml(customerName)},</p>
                <p>Esperamos que hayas disfrutado de tu experiencia con nosotros.</p>
                
                <p>Nos encantaría conocer tu opinión sobre:</p>
                <ul>
                  ${basketsList}
                </ul>
                
                <p style="text-align: center;">
                  <a href="https://experienciaselecta.lovable.app/profile?tab=orders" class="cta-button">
                    Dejar mi valoración
                  </a>
                </p>
                
                <p>Tu feedback nos ayuda a seguir mejorando y ofreciendo las mejores experiencias.</p>
                
                <p>¡Gracias por confiar en nosotros!</p>
                
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

    console.log("Solicitud de valoración enviada:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error enviando solicitud de valoración:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
