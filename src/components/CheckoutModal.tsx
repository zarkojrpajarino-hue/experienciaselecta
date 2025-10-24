import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Truck, Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import AuthModal from "./AuthModal";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Stripe with environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface BasketItem {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  basketItems: BasketItem[];
  totalAmount: number;
  isGiftMode?: boolean;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
}

interface GiftData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
}

const PaymentForm: React.FC<{
  customerData: CustomerData;
  basketItems: BasketItem[];
  totalAmount: number;
  onSuccess: () => void;
  isGiftMode?: boolean;
  giftData?: GiftData;
}> = ({ customerData, basketItems, totalAmount, onSuccess, isGiftMode, giftData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Create payment intent with authentication
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            customerData,
            basketItems,
            totalAmount,
            isGiftMode,
            giftData
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      if (paymentError || !paymentData) {
        throw new Error(paymentError?.message || 'Error creating payment intent');
      }

      const { clientSecret, orderId } = paymentData;

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              address: {
                line1: customerData.address_line1,
                line2: customerData.address_line2,
                city: customerData.city,
                postal_code: customerData.postal_code,
                country: customerData.country === 'España' ? 'ES' : customerData.country
              }
            }
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment in our system
        await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id }
        });

        toast({
          title: "¡Pago realizado con éxito!",
          description: "Tu pedido ha sido confirmado. Recibirás un email de confirmación.",
        });

        onSuccess();
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: error.message || "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-muted/50">
        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
          Información de tarjeta
        </Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: 'hsl(var(--foreground))',
                '::placeholder': {
                  color: 'hsl(var(--muted-foreground))',
                },
              },
            },
          }}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar y Regalar
          </>
        )}
      </Button>
    </form>
  );
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  basketItems,
  totalAmount,
  isGiftMode = false
}) => {
  const [step, setStep] = useState<'auth' | 'customer' | 'payment' | 'success'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'España'
  });
  const [giftData, setGiftData] = useState<GiftData>({
    recipientName: '',
    recipientEmail: '',
    senderName: ''
  });
  const { toast } = useToast();

  // Validation schemas
  const customerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
    address_line1: z.string().trim().min(1, "Address is required").max(255, "Address must be less than 255 characters"),
    address_line2: z.string().trim().max(255, "Address line 2 must be less than 255 characters").optional(),
    city: z.string().trim().min(1, "City is required").max(100, "City must be less than 100 characters"),
    postal_code: z.string().trim().min(1, "Postal code is required").max(20, "Postal code must be less than 20 characters"),
    country: z.string().trim().min(1, "Country is required").max(100, "Country must be less than 100 characters")
  });

  const giftSchema = z.object({
    recipientName: z.string().trim().min(1, "El nombre del destinatario es requerido").max(100),
    recipientEmail: z.string().trim().email("Email inválido").max(255),
    senderName: z.string().trim().min(1, "Tu nombre es requerido").max(100)
  });

  // Check authentication status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setStep('customer');
      
      // Pre-fill with user data from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCustomerData({
          name: profile.name || '',
          email: user.email || '',
          phone: profile.phone || '',
          address_line1: profile.address_line1 || '',
          address_line2: profile.address_line2 || '',
          city: profile.city || '',
          postal_code: profile.postal_code || '',
          country: profile.country || 'España'
        });
      } else {
        // Just set email if no profile
        setCustomerData(prev => ({ ...prev, email: user.email || '' }));
      }
    } else {
      setStep('auth');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    checkAuthStatus();
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on mode
    try {
      if (isGiftMode) {
        giftSchema.parse(giftData);
        // For gifts, we still need shipping address from customerData
        const giftCustomerSchema = z.object({
          address_line1: z.string().trim().min(1, "Dirección requerida").max(255),
          address_line2: z.string().trim().max(255).optional(),
          city: z.string().trim().min(1, "Ciudad requerida").max(100),
          postal_code: z.string().trim().min(1, "Código postal requerido").max(20),
          country: z.string().trim().min(1, "País requerido").max(100)
        });
        giftCustomerSchema.parse(customerData);
      } else {
        customerSchema.parse(customerData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Datos inválidos",
          description: error.errors[0].message,
        });
        return;
      }
    }

    // Save/update profile data for future use (only for non-gift purchases)
    if (user && !isGiftMode) {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: customerData.name,
          phone: customerData.phone,
          address_line1: customerData.address_line1,
          address_line2: customerData.address_line2,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country
        }, {
          onConflict: 'user_id'
        });
    }

    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const handleClose = () => {
    setStep('auth');
    setUser(null);
    setCustomerData({
      name: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      country: 'España'
    });
    setGiftData({
      recipientName: '',
      recipientEmail: '',
      senderName: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGiftMode ? '🎁' : <ShoppingCart className="w-5 h-5" />}
            {step === 'auth' && (isGiftMode ? 'Acceso requerido para regalar' : 'Acceso requerido')}
            {step === 'customer' && (isGiftMode ? 'Información del regalo' : 'Información de envío')}
            {step === 'payment' && 'Información de pago'}
            {step === 'success' && (isGiftMode ? '¡Regalo enviado!' : '¡Pedido confirmado!')}
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {basketItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Cantidad: {item.quantity}
                    </span>
                  </div>
                </div>
                <p className="font-semibold">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>{totalAmount.toFixed(2)}€</span>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Step */}
        {step === 'auth' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Acceso requerido</h3>
              <p className="text-muted-foreground">
                Para procesar tu pedido de forma segura, necesitas iniciar sesión o crear una cuenta.
              </p>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)} 
              className="w-full" 
              size="lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              Iniciar sesión / Registrarse
            </Button>
          </div>
        )}

        {/* Customer Information Step */}
        {step === 'customer' && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            {isGiftMode ? (
              /* Gift Mode Fields */
              <>
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    🎁 Estás regalando esta cesta. Ingresa los datos del destinatario y tu nombre.
                  </p>
                </div>

                <div>
                  <Label htmlFor="senderName">Tu nombre *</Label>
                  <Input
                    id="senderName"
                    value={giftData.senderName}
                    onChange={(e) => setGiftData(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="¿Quién regala?"
                    required
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">Nombre del destinatario *</Label>
                    <Input
                      id="recipientName"
                      value={giftData.recipientName}
                      onChange={(e) => setGiftData(prev => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="¿A quién se lo regalas?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Email del destinatario *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={giftData.recipientEmail}
                      onChange={(e) => setGiftData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <Separator />
                <p className="text-sm font-medium">Dirección de envío del regalo</p>
              </>
            ) : (
              /* Normal Purchase Fields */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+34 123 456 789"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="address1">Dirección *</Label>
              <Input
                id="address1"
                value={customerData.address_line1}
                onChange={(e) => setCustomerData(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="Calle, número"
                required
              />
            </div>

            <div>
              <Label htmlFor="address2">Dirección (línea 2)</Label>
              <Input
                id="address2"
                value={customerData.address_line2}
                onChange={(e) => setCustomerData(prev => ({ ...prev, address_line2: e.target.value }))}
                placeholder="Piso, puerta, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Tu ciudad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Código postal *</Label>
                <Input
                  id="postal_code"
                  value={customerData.postal_code}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="28001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={customerData.country}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="España"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              {isGiftMode ? '🎁' : <Truck className="w-4 h-4 mr-2" />}
              Continuar al pago
            </Button>
          </form>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <Elements stripe={stripePromise}>
            <div className="space-y-4">
              {isGiftMode && (
                <div className="p-4 bg-gold/10 border-2 border-gold rounded-lg">
                  <p className="text-center font-poppins font-bold text-black text-lg">
                    🎁 Vas a regalar una cesta
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Dirección de envío:</h3>
                <p className="text-sm text-muted-foreground">
                  {customerData.name}<br />
                  {customerData.address_line1}<br />
                  {customerData.address_line2 && `${customerData.address_line2}\n`}
                  {customerData.city}, {customerData.postal_code}<br />
                  {customerData.country}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('customer')}
                  className="mt-2"
                >
                  Editar dirección
                </Button>
              </div>

              <PaymentForm
                customerData={customerData}
                basketItems={basketItems}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                isGiftMode={isGiftMode}
                giftData={giftData}
              />
            </div>
          </Elements>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              {isGiftMode ? <span className="text-4xl">🎁</span> : <Check className="w-8 h-8 text-green-600" />}
            </div>
            <h3 className="text-xl font-semibold">
              {isGiftMode ? '¡Regalo enviado!' : '¡Pedido confirmado!'}
            </h3>
            <p className="text-muted-foreground">
              {isGiftMode 
                ? 'Tu regalo ha sido enviado correctamente. El destinatario recibirá un email con los detalles de tu regalo.'
                : 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación con todos los detalles de tu pedido.'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {isGiftMode
                ? 'La cesta será preparada con cariño y enviada a la dirección indicada.'
                : 'Tu cesta será preparada con cariño y enviada a la dirección indicada.'
              }
            </p>
            <Button onClick={handleClose} className="w-full" size="lg">
              Continuar navegando
            </Button>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;