import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  userName: string;
  generalRating: number;
  purchaseRating: number | null;
  understoodPurpose: boolean | null;
  intuitiveComment: string | null;
  suggestion: string | null;
  isPostPurchase: boolean;
}

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

const getRatingStars = (rating: number): string => {
  return '⭐'.repeat(rating);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Feedback email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userName,
      generalRating,
      purchaseRating,
      understoodPurpose,
      intuitiveComment,
      suggestion,
      isPostPurchase
    }: FeedbackRequest = await req.json();

    console.log("Processing feedback from:", userName);

    // Build email content
    let emailContent = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2f0164; color: #f5f3ef; border-radius: 12px;">
        <h1 style="color: #f57236; text-align: center; margin-bottom: 30px;">Nuevo Feedback Recibido</h1>
        
        <div style="background-color: rgba(245, 243, 239, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #f57236;">Usuario:</strong> ${escapeHtml(userName)}</p>
          <p style="margin: 0;"><strong style="color: #f57236;">Tipo:</strong> ${isPostPurchase ? 'Post-compra' : 'Desde menú'}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #f57236; margin-bottom: 10px;">Valoración General de la Web</h3>
          <p style="font-size: 24px; margin: 5px 0;">${getRatingStars(generalRating)} (${generalRating}/5)</p>
        </div>
    `;

    if (purchaseRating !== null && isPostPurchase) {
      emailContent += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #f57236; margin-bottom: 10px;">Sistema de Compras</h3>
          <p style="font-size: 24px; margin: 5px 0;">${getRatingStars(purchaseRating)} (${purchaseRating}/5)</p>
        </div>
      `;
    }

    emailContent += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #f57236; margin-bottom: 10px;">¿Ha entendido el propósito-mensaje?</h3>
          <p style="font-size: 18px; margin: 5px 0;">${understoodPurpose ? '✅ Sí' : '❌ No'}</p>
        </div>
    `;

    if (intuitiveComment) {
      emailContent += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #f57236; margin-bottom: 10px;">¿Le ha parecido intuitiva la web?</h3>
          <div style="background-color: rgba(245, 243, 239, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #f57236;">
            <p style="margin: 0; line-height: 1.6;">${escapeHtml(intuitiveComment)}</p>
          </div>
        </div>
      `;
    }

    if (suggestion) {
      emailContent += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #f57236; margin-bottom: 10px;">Sugerencias</h3>
          <div style="background-color: rgba(245, 243, 239, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #f57236;">
            <p style="margin: 0; line-height: 1.6;">${escapeHtml(suggestion)}</p>
          </div>
        </div>
      `;
    }

    emailContent += `
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(245, 243, 239, 0.2);">
          <p style="color: rgba(245, 243, 239, 0.7); font-size: 14px; margin: 0;">REUSEED - Feedback del sistema</p>
        </div>
      </div>
    `;

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "REUSEED Feedback <onboarding@resend.dev>",
      to: ["selectaexperiencia@gmail.com"],
      subject: `Nuevo Feedback - ${isPostPurchase ? 'Post-compra' : 'Menú'} - ${userName}`,
      html: emailContent,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
