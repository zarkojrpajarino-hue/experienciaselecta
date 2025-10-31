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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    // Send all 3 emails with optimized content as specified
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: ['selectaexperiencia@gmail.com'],
      subject: `📦 Nuevo Pedido de Regalo - ${validatedData.basketName}`,
      text: `Nuevo pedido: ${validatedData.basketName}\nDestinatario: ${validatedData.recipientName}\nDirección: ${validatedData.shippingAddress}`,
    });

    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [gift.recipient_email],
      subject: `🎁 ¡Enhorabuena! Tu regalo ${validatedData.basketName} está reclamado y de camino`,
      text: `¡Enhorabuena! Tu regalo ${validatedData.basketName} está reclamado y de camino. Con este regalo tienes acceso a productos ibéricos premium y a paragenteselecta.com con 24 horas de experiencia personalizada.`,
    });

    const senderEmail = (gift as any).orders?.customers?.email;
    if (senderEmail) {
      await resend.emails.send({
        from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
        to: [senderEmail],
        subject: `✅ ${validatedData.recipientName} ha canjeado su regalo y está de camino`,
        text: `¡Buenas noticias! ${validatedData.recipientName} ha canjeado su regalo y está de camino.`,
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
