import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

// HTML escape function to prevent XSS attacks
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing contact form submission");
    
    const { name, email, message }: ContactRequest = await req.json();

    // Check if API key is configured
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    // Escape all user inputs to prevent XSS
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    
    console.log("Sending notification email to admin");

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Experiencia Selecta <noreply@experienciaselecta.com>",
      to: ["selectaexperiencia@gmail.com"],
      replyTo: email, // So you can reply directly to the customer
      subject: `🔔 Nueva consulta de ${safeName} - Experiencia Selecta`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B4513; border-bottom: 2px solid #DAA520; padding-bottom: 10px;">
            Nueva consulta desde el FAQ
          </h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Nombre:</strong> ${safeName}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${email}">${safeEmail}</a></p>
            <p><strong>💬 Mensaje:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${safeMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="border: 1px solid #DAA520; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            <em>Este mensaje fue enviado desde el formulario de contacto de Experiencia Selecta</em>
          </p>
        </div>
      `,
    });
    
    if (adminEmailResponse.error) {
      console.error("Error sending admin email");
      throw new Error(`Error enviando notificación al admin: ${adminEmailResponse.error.message}`);
    }

    console.log("Sending confirmation email to user");

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Experiencia Selecta <noreply@experienciaselecta.com>",
      to: [email],
      subject: "✅ Hemos recibido tu consulta - Experiencia Selecta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B4513; border-bottom: 2px solid #DAA520; padding-bottom: 10px;">
            ¡Gracias por contactarnos, ${safeName}!
          </h2>
          <p>Hemos recibido tu consulta y nos pondremos en contacto contigo lo antes posible.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📝 Tu mensaje:</strong></p>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              ${safeMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p>Saludos cordiales,<br><strong>El equipo de Experiencia Selecta</strong> 🍯</p>
        </div>
      `,
    });
    
    if (userEmailResponse.error) {
      console.warn("Confirmation email to user failed (non-blocking)");
      // Continue without failing the entire request to avoid blocking the contact flow when domain isn't verified.
    }

    console.log("Contact form processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Consulta enviada correctamente" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error?.message || 'Unknown error');
    return new Response(
      JSON.stringify({ 
        error: "Error al enviar la consulta",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
