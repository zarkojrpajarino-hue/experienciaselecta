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
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error("Error al procesar el pago");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/checkout')}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold"
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

  useEffect(() => {
    const initStripe = async () => {
      try {
        if (!stripePromise) {
          const { data, error } = await supabase.functions.invoke('get-stripe-publishable-key');
          if (error) throw error;
          const key = (data as any)?.publishableKey;
          if (!key) throw new Error('Missing Stripe publishable key');
          stripePromise = loadStripe(key);
        }
        setStripeInstance(stripePromise);
        setIsStripeReady(true);
      } catch (err) {
        console.error('Error loading Stripe key:', err);
        toast.error('No se pudo inicializar el pago. Inténtalo de nuevo.');
        navigate('/checkout', { replace: true });
      }
    };

    initStripe();
  }, [navigate]);

  useEffect(() => {
    if (!clientSecret || !orderId || !totalAmount) {
      toast.error("Información de pago inválida");
      navigate('/carrito', { replace: true });
    }
  }, [clientSecret, orderId, totalAmount, navigate]);

  if (!clientSecret || !orderId || !totalAmount || !isStripeReady || !stripeInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-black font-poppins">Cargando sistema de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-6 px-2 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Button
            onClick={() => navigate('/checkout')}
            variant="link"
            className="text-black hover:text-gold mb-4 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al checkout
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-poppins font-bold">
                💳 Pago Seguro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gold/10 rounded-lg border-2 border-gold">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total a pagar:</span>
                  <span className="text-2xl font-bold text-gold">
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
