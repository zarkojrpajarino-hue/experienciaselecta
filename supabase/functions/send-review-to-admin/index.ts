import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML escape function to prevent XSS attacks
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { reviewId } = await req.json();

    console.log('Processing review notification');

    // Get review details
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!inner(name)
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;

    const stars = '⭐'.repeat(review.rating);
    
    // Escape user-generated content
    const safeName = escapeHtml(review.profiles.name);
    const safeBasketName = escapeHtml(review.basket_name);
    const safeComment = escapeHtml(review.comment || 'Sin comentarios');

    const emailContent = `
NUEVA VALORACIÓN RECIBIDA

Cliente: ${safeName}
Producto: ${safeBasketName}
Puntuación: ${stars} (${review.rating}/5)

Comentario:
${safeComment}

Fecha: ${new Date(review.created_at).toLocaleString('es-ES')}
`;

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: ['selectaexperiencia@gmail.com'],
      subject: `⭐ Nueva valoración - ${safeBasketName}`,
      text: emailContent,
    });

    console.log('Review notification sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error sending review to admin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});