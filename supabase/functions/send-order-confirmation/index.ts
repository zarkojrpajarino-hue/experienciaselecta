import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const { order } = await req.json();

    console.log('Sending order confirmation for:', order.id);

    // Format order items for email
    const itemsList = order.order_items.map((item: any) => 
      `• ${item.basket_name} - ${item.basket_category} (${(item.price_per_item / 100).toFixed(2)}€)`
    ).join('\n');

    const customerEmailContent = `
¡Hola ${order.customers.name}!

¡Gracias por tu pedido! Hemos recibido tu pago correctamente.

📦 DETALLES DEL PEDIDO
Número de pedido: ${order.id}
Total: ${(order.total_amount / 100).toFixed(2)}€

🛍️ PRODUCTOS ADQUIRIDOS
${itemsList}

📍 DIRECCIÓN DE ENVÍO
${order.customers.name}
${order.shipping_address_line1}
${order.shipping_address_line2 ? order.shipping_address_line2 + '\n' : ''}${order.shipping_city}, ${order.shipping_postal_code}
${order.shipping_country}

Tu cesta será preparada con cariño y enviada a la dirección indicada.

¡Esperamos que disfrutes de esta experiencia gastronómica única!

Saludos,
El equipo de Experiencia Selecta
`;

    const adminEmailContent = `
NUEVO PEDIDO CONFIRMADO

Número de pedido: ${order.id}
Cliente: ${order.customers.name}
Email: ${order.customers.email}
Teléfono: ${order.customers.phone || 'No proporcionado'}

Productos:
${itemsList}

Total: ${(order.total_amount / 100).toFixed(2)}€

Dirección de envío:
${order.customers.name}
${order.shipping_address_line1}
${order.shipping_address_line2 ? order.shipping_address_line2 + '\n' : ''}${order.shipping_city}, ${order.shipping_postal_code}
${order.shipping_country}

Fecha del pedido: ${new Date(order.created_at).toLocaleString('es-ES')}
`;

    // Send email to customer
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: [order.customers.email],
      subject: '✅ Confirmación de tu pedido - Experiencia Selecta',
      text: customerEmailContent,
    });

    // Send email to admin
    await resend.emails.send({
      from: 'Experiencia Selecta <noreply@experienciaselecta.com>',
      to: ['selectaexperiencia@gmail.com'],
      subject: `🛒 Nuevo pedido confirmado - ${order.id}`,
      text: adminEmailContent,
    });

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
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});