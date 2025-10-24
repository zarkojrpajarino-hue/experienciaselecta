import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function to prevent XSS in emails
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

// Validation schema for order data
const orderItemSchema = z.object({
  basket_name: z.string().max(200),
  basket_category: z.string().max(100),
  price_per_item: z.number().int().positive(),
});

const orderSchema = z.object({
  id: z.string().uuid(),
  total_amount: z.number().int().positive(),
  created_at: z.string(),
  shipping_address_line1: z.string().max(200),
  shipping_address_line2: z.string().max(200).optional().nullable(),
  shipping_city: z.string().max(100),
  shipping_postal_code: z.string().max(20),
  shipping_country: z.string().max(100),
  customers: z.object({
    name: z.string().max(200),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional().nullable(),
  }),
  order_items: z.array(orderItemSchema).min(1),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const { order: rawOrder, isGift } = await req.json();

    // Validate and sanitize order data
    const order = orderSchema.parse(rawOrder);
    
    console.log('Sending order confirmation for:', order.id);

    // Format order items for email with HTML escaping
    const itemsList = order.order_items.map((item) => 
      `• ${escapeHtml(item.basket_name)} - ${escapeHtml(item.basket_category)} (${(item.price_per_item / 100).toFixed(2)}€)`
    ).join('\n');

    const customerEmailContent = `
¡Hola ${escapeHtml(order.customers.name)}!

${isGift ? '✅ Tu regalo ha sido pagado con éxito.' : '✅ Tu cesta ha sido pagada con éxito.'}

${isGift 
  ? 'La persona a la que se lo regalaste recibirá un correo para completar los datos de envío.'
  : 'Tu cesta será preparada con cariño y enviada a la dirección indicada.'
}

Puedes verla en la sección "Mis Pedidos" en tu perfil en la web: https://experienciaselecta.com

📦 DETALLES DEL PEDIDO
Número de pedido: ${escapeHtml(order.id)}
Total: ${(order.total_amount / 100).toFixed(2)}€

🛍️ PRODUCTOS ADQUIRIDOS
${itemsList}

${isGift 
? '' 
: `📍 DIRECCIÓN DE ENVÍO
${escapeHtml(order.customers.name)}
${escapeHtml(order.shipping_address_line1)}
${order.shipping_address_line2 ? escapeHtml(order.shipping_address_line2) + '\n' : ''}${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_postal_code)}
${escapeHtml(order.shipping_country)}

Tu cesta será preparada con cariño y enviada a la dirección indicada.
`}

¡Esperamos que disfrutes de esta experiencia gastronómica única!

Saludos,
El equipo de Experiencia Selecta
`;

    const adminEmailContent = `
NUEVO PEDIDO CONFIRMADO

Número de pedido: ${escapeHtml(order.id)}
Cliente: ${escapeHtml(order.customers.name)}
Email: ${escapeHtml(order.customers.email)}
Teléfono: ${order.customers.phone ? escapeHtml(order.customers.phone) : 'No proporcionado'}

Productos:
${itemsList}

Total: ${(order.total_amount / 100).toFixed(2)}€

Dirección de envío:
${escapeHtml(order.customers.name)}
${escapeHtml(order.shipping_address_line1)}
${order.shipping_address_line2 ? escapeHtml(order.shipping_address_line2) + '\n' : ''}${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_postal_code)}
${escapeHtml(order.shipping_country)}

Fecha del pedido: ${new Date(order.created_at).toLocaleString('es-ES')}
`;

    // Send email to customer
    const subject = isGift 
      ? '✅ Confirmación de pago de tu regalo - Experiencia Selecta'
      : '✅ Confirmación de tu pedido - Experiencia Selecta';
    
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [order.customers.email],
      subject: subject,
      text: customerEmailContent,
    });

    // Send email to admin (only if not a gift, or after recipient completes address)
    if (!isGift) {
      await resend.emails.send({
        from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
        to: ['selectaexperiencia@gmail.com'],
        subject: `🛒 Nuevo pedido confirmado - ${order.id}`,
        text: adminEmailContent,
      });
    }

    console.log('Order confirmation emails sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending order confirmation:', error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid order data', details: error.errors }),
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