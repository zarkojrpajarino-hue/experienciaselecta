import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Truck, Check, Lock, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onClearCart?: () => void;
  onRemoveItems?: (itemIds: Array<{ id: number; isGift?: boolean }>) => void;
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

interface RecipientData {
  recipientName: string;
  recipientEmail: string;
  personalNote: string;
  basketIds: number[]; // IDs of baskets assigned to this recipient
}

interface GiftData {
  senderName: string;
  senderEmail: string;
  recipients: RecipientData[];
}

const PaymentForm: React.FC<{
  customerData: CustomerData;
  basketItems: BasketItem[];
  totalAmount: number;
  onSuccess: () => void;
  isGiftMode?: boolean;
  giftData?: GiftData;
  selectedBasketIds?: number[];
}> = ({ customerData, basketItems, totalAmount, onSuccess, isGiftMode, giftData, selectedBasketIds = [] }) => {
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

      // Filter basket items based on selection (only for gift mode)
      const itemsToProcess = isGiftMode 
        ? basketItems.filter(item => selectedBasketIds.includes(item.id))
        : basketItems;

      const calculatedTotal = itemsToProcess.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create payment intent with authentication
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            customerData,
            basketItems: itemsToProcess,
            totalAmount: calculatedTotal,
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

      // Prepare billing details - don't include address for gift mode
      const billingDetails: any = {
        name: customerData.name || giftData?.senderName,
        email: customerData.email
      };

      if (!isGiftMode) {
        billingDetails.phone = customerData.phone;
        billingDetails.address = {
          line1: customerData.address_line1,
          line2: customerData.address_line2,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country === 'España' ? 'ES' : customerData.country
        };
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        // Confirm payment in our system with authentication
        await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
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
            hidePostalCode: true,
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
        ) : isGiftMode ? (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar y Regalar
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar {totalAmount.toFixed(2)}€
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
  isGiftMode = false,
  onClearCart,
  onRemoveItems
}) => {
  const [step, setStep] = useState<'auth' | 'customer' | 'payment' | 'success'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedBasketIds, setSelectedBasketIds] = useState<number[]>(basketItems.map(item => item.id));
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
    senderName: '',
    senderEmail: '',
    recipients: [{ recipientName: '', recipientEmail: '', personalNote: '', basketIds: [] }]
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

  const recipientSchema = z.object({
    recipientName: z.string().trim().min(1, "El nombre del destinatario es requerido").max(100),
    recipientEmail: z.string().trim().email("Email inválido").max(255),
    personalNote: z.string().trim().max(500, "La nota debe tener menos de 500 caracteres").optional(),
    basketIds: z.array(z.number())
  });

  const giftSchema = z.object({
    senderName: z.string().trim().min(1, "Tu nombre es requerido").max(100),
    senderEmail: z.string().trim().email("Tu email es inválido").max(255),
    recipients: z.array(recipientSchema).min(1, "Debe haber al menos un destinatario")
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
    
    // Validate that at least one basket is selected in gift mode
    if (isGiftMode && selectedBasketIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos una cesta para enviar como regalo",
      });
      return;
    }
    
    // Validate based on mode
    try {
      if (isGiftMode) {
        giftSchema.parse(giftData);
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
    // Remove only selected items from cart after successful payment
    if (isGiftMode && onRemoveItems) {
      const itemsToRemove = basketItems
        .filter(item => selectedBasketIds.includes(item.id))
        .map(item => ({ id: item.id, isGift: true }));
      onRemoveItems(itemsToRemove);
    } else if (onClearCart) {
      onClearCart();
    }
    setStep('success');
  };

  const handleClose = () => {
    setStep('auth');
    setUser(null);
    setSelectedBasketIds(basketItems.map(item => item.id));
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
      senderName: '',
      senderEmail: '',
      recipients: [{ recipientName: '', recipientEmail: '', personalNote: '', basketIds: [] }]
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
            {isGiftMode && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Selecciona las cestas que quieres enviar como regalo:</p>
              </div>
            )}
            {basketItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  {isGiftMode && (
                    <input
                      type="checkbox"
                      checked={selectedBasketIds.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBasketIds(prev => [...prev, item.id]);
                        } else {
                          setSelectedBasketIds(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-semibold">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total a pagar:</span>
              <span>
                {basketItems
                  .filter(item => selectedBasketIds.includes(item.id))
                  .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                  .toFixed(2)}€
              </span>
            </div>
            {isGiftMode && selectedBasketIds.length < basketItems.length && (
              <p className="text-xs text-muted-foreground">
                Las cestas no seleccionadas permanecerán en tu carrito
              </p>
            )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="senderEmail">Tu email *</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={giftData.senderEmail}
                      onChange={(e) => setGiftData(prev => ({ ...prev, senderEmail: e.target.value }))}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <Separator />

{giftData.recipients.map((recipient, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Destinatario {index + 1}</h3>
                      {giftData.recipients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newRecipients = giftData.recipients.filter((_, i) => i !== index);
                            setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`recipientName-${index}`}>Nombre del destinatario *</Label>
                        <Input
                          id={`recipientName-${index}`}
                          value={recipient.recipientName}
                          onChange={(e) => {
                            const newRecipients = [...giftData.recipients];
                            newRecipients[index].recipientName = e.target.value;
                            setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                          placeholder="¿A quién se lo regalas?"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`recipientEmail-${index}`}>Email del destinatario *</Label>
                        <Input
                          id={`recipientEmail-${index}`}
                          type="email"
                          value={recipient.recipientEmail}
                          onChange={(e) => {
                            const newRecipients = [...giftData.recipients];
                            newRecipients[index].recipientEmail = e.target.value;
                            setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                          placeholder="email@ejemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`personalNote-${index}`}>Nota personal para {recipient.recipientName || 'el destinatario'}</Label>
                      <Textarea
                        id={`personalNote-${index}`}
                        value={recipient.personalNote}
                        onChange={(e) => {
                          const newRecipients = [...giftData.recipients];
                          newRecipients[index].personalNote = e.target.value;
                          setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                        }}
                        placeholder="Escribe una nota personal para acompañar tu regalo..."
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {recipient.personalNote.length}/500 caracteres
                      </p>
                    </div>

                    {selectedBasketIds.length > 1 && (
                      <div>
                        <Label htmlFor={`basketAssignment-${index}`}>
                          Asignar cestas a este destinatario
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Selecciona qué cestas van para {recipient.recipientName || 'este destinatario'}
                        </p>
                        <div className="space-y-2">
                          {basketItems.filter(item => selectedBasketIds.includes(item.id)).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`basket-${item.id}-recipient-${index}`}
                                checked={recipient.basketIds.includes(item.id)}
                                onChange={(e) => {
                                  const newRecipients = [...giftData.recipients];
                                  if (e.target.checked) {
                                    newRecipients[index].basketIds = [...newRecipients[index].basketIds, item.id];
                                  } else {
                                    newRecipients[index].basketIds = newRecipients[index].basketIds.filter(id => id !== item.id);
                                  }
                                  setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`basket-${item.id}-recipient-${index}`} className="cursor-pointer">
                                {item.name} x{item.quantity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {selectedBasketIds.length > 1 && giftData.recipients.length < selectedBasketIds.length && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setGiftData(prev => ({
                        ...prev,
                        recipients: [...prev.recipients, { recipientName: '', recipientEmail: '', personalNote: '', basketIds: [] }]
                      }));
                    }}
                    className="w-full font-bold tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-boulder)' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir otro destinatario
                  </Button>
                )}
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

            {!isGiftMode && (
              <>
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
              </>
            )}

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
              {isGiftMode ? (
                <div className="p-4 bg-gold/10 border-2 border-gold rounded-lg">
                  <p className="text-center font-poppins font-bold text-black text-lg">
                    🎁 Vas a regalar una cesta
                  </p>
                  <div className="mt-3 text-sm text-muted-foreground space-y-2">
                    <p><strong>De:</strong> {giftData.senderName} ({giftData.senderEmail})</p>
                    <div className="space-y-1">
                      <p><strong>Para:</strong></p>
                      {giftData.recipients.map((recipient, index) => (
                        <div key={index} className="ml-4">
                          <p>• {recipient.recipientName} ({recipient.recipientEmail})</p>
                          {recipient.personalNote && (
                            <p className="text-xs italic ml-2">Nota: "{recipient.personalNote.substring(0, 50)}{recipient.personalNote.length > 50 ? '...' : ''}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('customer')}
                    className="mt-3 w-full"
                  >
                    Editar información
                  </Button>
                </div>
              ) : (
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
              )}

              <PaymentForm
                customerData={customerData}
                basketItems={basketItems}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                isGiftMode={isGiftMode}
                giftData={giftData}
                selectedBasketIds={selectedBasketIds}
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
              Volver a Mis Pedidos
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