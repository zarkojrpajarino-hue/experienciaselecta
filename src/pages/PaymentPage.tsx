import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

// Stripe publishable key will be loaded dynamically
let stripePromise: Promise<Stripe | null> | null = null;

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  totalAmount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, orderId, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!elementReady) {
        console.warn('PaymentElement not ready after timeout');
        toast.error('No se pudo cargar el formulario de pago. Recarga la página o vuelve al checkout.');
      }
    }, 7000);
    return () => clearTimeout(t);
  }, [elementReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pago-exitoso`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        toast.error(stripeError.message || "Error al procesar el pago");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Get session for auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Sesión expirada. Por favor, inicia sesión de nuevo");
          navigate('/auth');
          return;
        }

        // Call confirm-payment edge function
        const { data, error } = await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.error('Error confirming payment:', error);
          toast.error("Error al confirmar el pago");
          setIsProcessing(false);
          return;
        }

        if (data?.success) {
          toast.success("¡Pago completado con éxito!");
          
          // Limpiar datos del formulario de checkout guardados
          try {
            localStorage.removeItem('checkoutFormData');
            console.log('✅ Datos del formulario limpiados después del pago');
          } catch (error) {
            console.error('Error limpiando datos del formulario:', error);
          }
          
          // Redirect to success page
          navigate('/pago-exitoso', { 
            state: { 
              orderId: data.orderId,
              orderStatus: data.status
            },
            replace: true 
          });
        } else {
          toast.error("Error al confirmar el pago");
          setIsProcessing(false);
        }
      } else {
        toast.error("No se pudo confirmar el pago. Revisa los datos o prueba otra tarjeta.");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error("Error al procesar el pago");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="min-h-[200px] relative z-0">
        <PaymentElement 
          onReady={() => setElementReady(true)}
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: false
            }
          }}
          className="stripe-payment-element"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/checkout')}
          disabled={isProcessing}
          className="w-full sm:flex-1 order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full sm:flex-1 bg-gold hover:bg-gold/90 text-black font-bold order-1 sm:order-2 text-sm sm:text-base"
        >
          {isProcessing ? "Procesando..." : `Pagar ${totalAmount.toFixed(2)}€`}
        </Button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientSecret, orderId, totalAmount } = location.state || {};
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<Promise<Stripe | null> | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PaymentPage mounted with state:', { clientSecret: !!clientSecret, orderId, totalAmount });
    
    const initStripe = async () => {
      try {
        console.log('Initializing Stripe...');
        if (!stripePromise) {
          console.log('Fetching Stripe publishable key...');
          const { data, error } = await supabase.functions.invoke('get-stripe-publishable-key');
          
          if (error) {
            console.error('Error fetching Stripe key:', error);
            throw error;
          }
          
          const key = (data as any)?.publishableKey;
          console.log('Received Stripe key:', key ? 'pk_***' : 'missing');
          
          if (!key) {
            throw new Error('Missing Stripe publishable key');
          }
          
          console.log('Loading Stripe with key...');
          stripePromise = loadStripe(key);
        }
        
        const stripe = await stripePromise;
        console.log('Stripe loaded:', !!stripe);
        
        setStripeInstance(stripePromise);
        setIsStripeReady(true);
        console.log('Stripe initialization complete');
      } catch (err) {
        console.error('Error loading Stripe:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setLoadingError(errorMessage);
        toast.error('No se pudo inicializar el sistema de pago: ' + errorMessage);
      }
    };

    initStripe();
  }, [navigate]);

  useEffect(() => {
    if (!clientSecret || !orderId || !totalAmount) {
      console.error('Missing payment info:', { clientSecret: !!clientSecret, orderId, totalAmount });
      toast.error("Información de pago inválida. Redirigiendo al checkout...");
      setTimeout(() => navigate('/checkout', { replace: true }), 2000);
    }
  }, [clientSecret, orderId, totalAmount, navigate]);

  if (loadingError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center px-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mb-4 text-red-600">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Error al inicializar el pago</h2>
                <p className="text-gray-600 mb-4">{loadingError}</p>
                <Button onClick={() => navigate('/checkout')} className="bg-gold hover:bg-gold/90 text-black">
                  Volver al checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!clientSecret || !orderId || !totalAmount || !isStripeReady || !stripeInstance) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-black font-poppins">Cargando sistema de pago...</p>
            <p className="text-sm text-gray-500 mt-2">
              {!clientSecret && "Esperando información de pago..."}
              {!isStripeReady && "Inicializando Stripe..."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen pt-16 pb-6 px-3 sm:px-4 bg-white overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="container mx-auto max-w-2xl">
          <Button
            onClick={() => navigate('/checkout')}
            variant="link"
            className="text-black hover:text-gold mb-4 p-0 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al checkout
          </Button>

          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-poppins font-bold">
                💳 Pago Seguro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
              <div className="p-3 sm:p-4 bg-gold/10 rounded-lg border-2 border-gold">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm sm:text-base">Total a pagar:</span>
                  <span className="text-xl sm:text-2xl font-bold text-gold">
                    {totalAmount.toFixed(2)}€
                  </span>
                </div>
              </div>

              <Elements stripe={stripeInstance} options={{ clientSecret }}>
                <PaymentForm 
                  clientSecret={clientSecret} 
                  orderId={orderId}
                  totalAmount={totalAmount}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
