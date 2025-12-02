import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  
  // Get orderId from state OR find it via payment_intent from URL
  const stateOrderId = location.state?.orderId;
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(stateOrderId || null);

  // First effect: resolve orderId from payment_intent if needed
  useEffect(() => {
    const resolveOrderId = async () => {
      // If we already have orderId from state, use it
      if (stateOrderId) {
        console.log('✅ OrderId from state:', stateOrderId);
        setResolvedOrderId(stateOrderId);
        return;
      }

      // If we have payment_intent from Stripe redirect, find the order
      if (paymentIntent && redirectStatus === 'succeeded') {
        console.log('🔍 Looking up order by payment_intent:', paymentIntent);
        try {
          const { data: order, error } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_payment_intent_id', paymentIntent)
            .single();

          if (error) {
            console.error('Error finding order by payment_intent:', error);
            toast.error('No se pudo encontrar el pedido');
            navigate('/', { replace: true });
            return;
          }

          if (order) {
            console.log('✅ Found order:', order.id);
            setResolvedOrderId(order.id);
            
            // Clean up URL params
            window.history.replaceState({}, '', '/pago-exitoso');
          }
        } catch (error) {
          console.error('Error resolving order:', error);
          navigate('/', { replace: true });
        }
        return;
      }

      // No orderId and no payment_intent - redirect home
      console.log('❌ No orderId or payment_intent found');
      navigate('/', { replace: true });
    };

    resolveOrderId();
  }, [stateOrderId, paymentIntent, redirectStatus, navigate]);

  // Second effect: fetch order details once we have resolvedOrderId
  useEffect(() => {
    if (!resolvedOrderId) return;

    const fetchOrderDetails = async () => {
      try {
        console.log('📦 Fetching order details for:', resolvedOrderId);
        
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
          .eq('id', resolvedOrderId)
          .single();

        if (orderError) {
          console.error('Order fetch error:', orderError);
          throw orderError;
        }

        // Fetch order items
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('basket_name, basket_category, quantity, price_per_item')
          .eq('order_id', resolvedOrderId);

        if (itemsError) {
          console.error('Items fetch error:', itemsError);
          throw itemsError;
        }

        // Check if there are any gifts associated with this order
        const { data: gifts } = await supabase
          .from('pending_gifts')
          .select('recipient_name, recipient_email, basket_name')
          .eq('order_id', resolvedOrderId);

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
        
        console.log('✅ Order details loaded successfully');
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        toast.error('Error al cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [resolvedOrderId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 pb-6 px-4 bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
            <p className="text-lg text-muted-foreground">Cargando detalles del pedido...</p>
          </div>
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 pb-6 px-4 bg-background flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-muted-foreground">No se encontró información del pedido</p>
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
      <div className="min-h-screen pt-16 pb-6 px-4 bg-background">
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
              <p className="text-muted-foreground mt-2">
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
                <div className="text-muted-foreground">Número de pedido:</div>
                <div className="font-mono text-xs break-all">{orderDetails.id}</div>
                
                <div className="text-muted-foreground">Fecha:</div>
                <div>{new Date(orderDetails.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
                
                <div className="text-muted-foreground">Cliente:</div>
                <div>{orderDetails.customer.name}</div>
                
                <div className="text-muted-foreground">Email:</div>
                <div>{orderDetails.customer.email}</div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Cestas Compradas:</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.basket_name}</p>
                        <p className="text-sm text-muted-foreground">{item.basket_category}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price_per_item * item.quantity / 100).toFixed(2)}€</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">{(item.price_per_item / 100).toFixed(2)}€ / unidad</p>
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
                <p className="text-foreground mb-4">
                  Los destinatarios recibirán un email con la notificación del regalo y 
                  las instrucciones para completar sus datos de envío.
                </p>
                <div className="space-y-3">
                  {orderDetails.gifts.map((gift: any, index: number) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <p className="font-semibold">{gift.recipient_name}</p>
                      <p className="text-sm text-muted-foreground">{gift.recipient_email}</p>
                      <p className="text-sm text-muted-foreground mt-1">{gift.basket_name}</p>
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
                  <p className="text-sm text-foreground">
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
