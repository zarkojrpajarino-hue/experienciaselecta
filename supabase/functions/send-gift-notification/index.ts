import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GiftNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  basketName: string;
  basketImage?: string;
  personalNote?: string;
  giftId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      senderEmail,
      basketName, 
      basketImage,
      personalNote,
      giftId 
    }: GiftNotificationRequest = await req.json();

    console.log("Enviando notificación de regalo a:", recipientEmail);

    const imageHtml = basketImage ? `
      <div style="text-align: center; margin: 30px 0;">
        <img src="${basketImage}" alt="${basketName}" style="max-width: 400px; width: 100%; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
      </div>
    ` : '';

    const noteHtml = personalNote ? `
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0; font-style: italic; color: #555;">"${personalNote}"</p>
        <p style="margin: 10px 0 0 0; text-align: right; color: #888;">- ${senderName}</p>
      </div>
    ` : '';

    const emailResponse = await resend.emails.send({
      from: "Experiencia Selecta <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `🎁 ${senderName} te ha enviado un regalo - Experiencia Selecta`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; }
              .cta-button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎁 ¡Tienes un regalo!</h1>
              </div>
              <div class="content">
                <p>Hola ${recipientName},</p>
                <p><strong>${senderName}</strong> te ha enviado un regalo especial:</p>
                
                ${imageHtml}
                
                <h2 style="color: #4F46E5; text-align: center;">${basketName}</h2>
                
                ${noteHtml}
                
                <p style="text-align: center;">
                  <a href="https://tyorpbzvjnasyaqbggcp.supabase.co/functions/v1/claim-gift?giftId=${giftId}" class="cta-button">
                    Reclamar mi regalo
                  </a>
                </p>
                
                <p style="font-size: 0.9em; color: #666;">Haz clic en el botón para proporcionar tu dirección de envío y recibir tu regalo.</p>
                
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

    console.log("Notificación de regalo enviada:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error enviando notificación de regalo:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
