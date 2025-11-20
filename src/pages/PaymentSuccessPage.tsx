import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, MapPin, Gift, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  basket_name: string;
  basket_category: string;
  quantity: number;
  price_per_item: number;
}

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  customer: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  gifts?: any[];
}

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // Fetch order with customer and items
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            shipping_address_line1,
            shipping_address_line2,
            shipping_city,
            shipping_postal_code,
            shipping_country,
            customers!inner (
              name,
              email
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('basket_name, basket_category, quantity, price_per_item')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        // Check if there are any gifts associated with this order
        const { data: gifts } = await supabase
          .from('pending_gifts')
          .select('recipient_name, recipient_email, basket_name')
          .eq('order_id', orderId);

        setOrderDetails({
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          shipping_address_line1: order.shipping_address_line1,
          shipping_address_line2: order.shipping_address_line2,
          shipping_city: order.shipping_city,
          shipping_postal_code: order.shipping_postal_code,
          shipping_country: order.shipping_country,
          customer: Array.isArray(order.customers) ? order.customers[0] : order.customers,
          items: items || [],
          gifts: gifts || []
        });
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        toast.error('Error al cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 pb-6 px-4 bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
            <p className="text-lg text-gray-600">Cargando detalles del pedido...</p>
          </div>
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 pb-6 px-4 bg-white flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-gray-600">No se encontró información del pedido</p>
              <Button
                onClick={() => navigate('/')}
                className="mt-4 bg-gold hover:bg-gold/90 text-black font-bold"
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const isGift = (orderDetails.gifts && orderDetails.gifts.length > 0) || orderDetails.status === 'pending';

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-6 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-poppins font-bold text-green-600">
                ¡Pago Completado con Éxito!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Tu pedido ha sido procesado correctamente
              </p>
            </CardHeader>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="w-5 h-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Número de pedido:</div>
                <div className="font-mono text-xs break-all">{orderDetails.id}</div>
                
                <div className="text-gray-600">Fecha:</div>
                <div>{new Date(orderDetails.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
                
                <div className="text-gray-600">Cliente:</div>
                <div>{orderDetails.customer.name}</div>
                
                <div className="text-gray-600">Email:</div>
                <div>{orderDetails.customer.email}</div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Cestas Compradas:</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.basket_name}</p>
                        <p className="text-sm text-gray-600">{item.basket_category}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price_per_item * item.quantity / 100).toFixed(2)}€</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">{(item.price_per_item / 100).toFixed(2)}€ / unidad</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Pagado:</span>
                  <span className="text-2xl font-bold text-gold">
                    {(orderDetails.total_amount / 100).toFixed(2)}€
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping/Gift Information */}
          {isGift && orderDetails.gifts && orderDetails.gifts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Gift className="w-5 h-5" />
                  Información de Regalos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Los destinatarios recibirán un email con la notificación del regalo y 
                  las instrucciones para completar sus datos de envío.
                </p>
                <div className="space-y-3">
                  {orderDetails.gifts.map((gift: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold">{gift.recipient_name}</p>
                      <p className="text-sm text-gray-600">{gift.recipient_email}</p>
                      <p className="text-sm text-gray-500 mt-1">{gift.basket_name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{orderDetails.shipping_address_line1}</p>
                  {orderDetails.shipping_address_line2 && (
                    <p>{orderDetails.shipping_address_line2}</p>
                  )}
                  <p>{orderDetails.shipping_postal_code} {orderDetails.shipping_city}</p>
                  <p>{orderDetails.shipping_country}</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    📦 Recibirás un email de confirmación con todos los detalles y 
                    el número de seguimiento una vez que tu pedido sea enviado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              Volver a la página principal
            </Button>
            <Button
              onClick={() => navigate('/perfil')}
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10"
            >
              Ver mis pedidos
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
