import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import FeedbackModal from "./FeedbackModal";
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
  imagen?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  basketItems: BasketItem[];
  totalAmount: number;
  isGiftMode?: boolean;
  onClearCart?: () => void;
  onRemoveItems?: (itemIds: Array<{ id: number; isGift?: boolean; quantityToRemove?: number }>) => void;
  giftItemsCount?: number; // Number of items that are gifts
  personalItemsCount?: number; // Number of items that are personal
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
  recipientPhone?: string;
  personalNote: string;
  basketIds: string[]; // Unique IDs of baskets assigned to this recipient
}

interface GiftData {
  senderName: string;
  senderEmail: string;
  recipients: RecipientData[];
}

interface BackendRecipientData {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  personalNote: string;
  basketIds: number[]; // Original IDs for backend
}

interface BackendGiftData {
  senderName: string;
  senderEmail: string;
  recipients: BackendRecipientData[];
}

const PaymentForm: React.FC<{
  customerData: CustomerData;
  basketItems: BasketItem[];
  totalAmount: number;
  onSuccess: (orderId: string) => void;
  isGiftMode?: boolean;
  giftData?: GiftData;
  expandedBasketItems?: (BasketItem & { uniqueId: string })[];
}> = ({ customerData, basketItems, totalAmount, onSuccess, isGiftMode, giftData, expandedBasketItems = [] }) => {
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

      // For gift mode, use only assigned baskets
      let itemsToProcess: BasketItem[];
      if (isGiftMode && giftData) {
        const assignedIds = giftData.recipients.flatMap(r => r.basketIds);
        const assignedExpanded = expandedBasketItems.filter(item => assignedIds.includes(item.uniqueId));
        // Aggregate back by original ID
        const aggregated = new Map<number, BasketItem>();
        assignedExpanded.forEach(item => {
          if (aggregated.has(item.id)) {
            const existing = aggregated.get(item.id)!;
            aggregated.set(item.id, { ...existing, quantity: existing.quantity + 1 });
          } else {
            aggregated.set(item.id, { ...item, quantity: 1 });
          }
        });
        itemsToProcess = Array.from(aggregated.values());
      } else {
        itemsToProcess = basketItems;
      }

      const calculatedTotal = itemsToProcess.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Convert giftData basketIds from uniqueIds back to original IDs for backend
      let processedGiftData: BackendGiftData | undefined = undefined;
      if (isGiftMode && giftData) {
        processedGiftData = {
          ...giftData,
          recipients: giftData.recipients.map(recipient => ({
            ...recipient,
            basketIds: recipient.basketIds.map(uniqueId => {
              const expanded = expandedBasketItems.find(item => item.uniqueId === uniqueId);
              return expanded ? expanded.id : parseInt(uniqueId);
            })
          }))
        };
      }

      // Create payment intent with authentication
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            customerData,
            basketItems: itemsToProcess.map(item => ({
              ...item,
              image: item.imagen // Map 'imagen' to 'image' for backend
            })),
            totalAmount: calculatedTotal,
            isGiftMode,
            giftData: processedGiftData
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
      
      // Store orderId for later use
      const currentOrderId = orderId;

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

        onSuccess(currentOrderId);
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

// Component for clickable basket image
const BasketImageThumbnail: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageOpen, setImageOpen] = useState(false);
  
  return (
    <>
      <img
        src={src}
        alt={alt}
        className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
        onClick={() => setImageOpen(true)}
      />
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-2xl" hideClose={false}>
          <div className="relative">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  basketItems,
  totalAmount,
  isGiftMode = false,
  onClearCart,
  onRemoveItems,
  giftItemsCount = 0,
  personalItemsCount = 0
}) => {
  // Track removed items locally to update UI immediately
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  
  // Determine if this is a mixed checkout (both gifts and personal items)
  const isMixedMode = giftItemsCount > 0 && personalItemsCount > 0;
  
  // Expand basket items so each quantity becomes individual items with unique identifiers
  // Also mark which items are gifts vs personal
  const expandedBasketItems = useMemo(() => {
    const expanded: (BasketItem & { uniqueId: string; isGift?: boolean })[] = [];
    basketItems.forEach((item, itemIndex) => {
      // In mixed mode, first giftItemsCount items are gifts
      const isGiftItem = isMixedMode && itemIndex < giftItemsCount;
      for (let i = 0; i < item.quantity; i++) {
        const uniqueId = `${item.id}-${i}`;
        // Skip items that have been removed
        if (!removedItemIds.includes(uniqueId)) {
          expanded.push({
            ...item,
            quantity: 1,
            uniqueId,
            isGift: isGiftItem
          });
        }
      }
    });
    return expanded;
  }, [basketItems, isMixedMode, giftItemsCount, removedItemIds]);

  const [step, setStep] = useState<'auth' | 'customer' | 'payment' | 'success'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastOrderUserName, setLastOrderUserName] = useState<string>('');
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
    recipientEmail: z.string().trim().email("Email inválido").max(255).optional().or(z.literal('')),
    recipientPhone: z.string().trim().max(20).optional().or(z.literal('')),
    personalNote: z.string().trim().max(500, "La nota debe tener menos de 500 caracteres").optional(),
    basketIds: z.array(z.string())
  }).refine(
    (data) => data.recipientEmail || data.recipientPhone,
    {
      message: "Debe proporcionar al menos un email o un número de teléfono para el destinatario",
      path: ["recipientEmail"],
    }
  );

  const giftSchema = z.object({
    senderName: z.string().trim().min(1, "Tu nombre es requerido").max(100),
    senderEmail: z.string().trim().email("Tu email es inválido").max(255),
    recipients: z.array(recipientSchema).min(1, "Debe haber al menos un destinatario")
  });

  // Check authentication status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
      // Set flag to reopen checkout after OAuth redirect
      localStorage.setItem('pendingCheckout', 'true');
      // Reset removed items when modal opens
      setRemovedItemIds([]);
    }
  }, [isOpen]);

  // Reopen checkout after OAuth redirect
  useEffect(() => {
    const checkPendingCheckout = async () => {
      const hasPendingCheckout = localStorage.getItem('pendingCheckout');
      if (hasPendingCheckout && !isOpen) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          localStorage.removeItem('pendingCheckout');
          // Don't automatically reopen - let the parent component handle this
          // The user will see their cart is still there
        }
      }
    };
    checkPendingCheckout();
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
    // Clear the checkout flag from localStorage after successful auth
    localStorage.removeItem('pendingCheckout');
    checkAuthStatus();
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one basket is assigned in gift mode or mixed mode
    if (isGiftMode || isMixedMode) {
      const assignedBaskets = giftData.recipients.flatMap(r => r.basketIds);
      if (assignedBaskets.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes asignar al menos una cesta a un destinatario",
        });
        return;
      }
      
      // In mixed mode, verify all gift items are assigned
      const giftBasketCount = isMixedMode 
        ? expandedBasketItems.filter(item => item.isGift).length
        : expandedBasketItems.length;
        
      if (assignedBaskets.length < giftBasketCount) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Debes asignar todas las ${giftBasketCount} cestas de regalo a destinatarios`,
        });
        return;
      }
    }
    
    // Validate based on mode
    try {
      if (isGiftMode && !isMixedMode) {
        // Pure gift mode - only validate gift data
        giftSchema.parse(giftData);
      } else if (isMixedMode) {
        // Mixed mode - validate both gift data and customer data
        giftSchema.parse(giftData);
        customerSchema.parse(customerData);
      } else {
        // Personal mode - only validate customer data
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

    // Save/update profile data for future use (for mixed mode or personal purchases)
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

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment success - orderId:', orderId, 'isGiftMode:', isGiftMode, 'user:', user?.id);
    setCompletedOrderId(orderId);
    
    // Remove only assigned items from cart after successful payment
    if (isGiftMode && onRemoveItems) {
      // Get all assigned basket IDs
      const assignedIds = giftData.recipients.flatMap(r => r.basketIds);
      const assignedExpanded = expandedBasketItems.filter(item => assignedIds.includes(item.uniqueId));
      
      // Count how many of each basket type were assigned
      const countMap = new Map<number, number>();
      assignedExpanded.forEach(item => {
        countMap.set(item.id, (countMap.get(item.id) || 0) + 1);
      });
      
      // Remove only the assigned quantities
      const itemsToRemove = Array.from(countMap.entries()).map(([id, quantityToRemove]) => ({ 
        id, 
        isGift: true,
        quantityToRemove
      }));
      onRemoveItems(itemsToRemove);
    } else if (onClearCart) {
      onClearCart();
    }
    
    setStep('success');
    
    // Tras el pago correcto, marcar feedback de compra como pendiente (una sola vez por sesión)
    if (!isGiftMode) {
      try {
        const alreadyGiven = sessionStorage.getItem('feedbackGiven');
        const alreadyPending = sessionStorage.getItem('pendingPurchaseFeedback');
        if (!alreadyGiven && !alreadyPending) {
          sessionStorage.setItem('pendingPurchaseFeedback', JSON.stringify({ orderId, ts: Date.now() }));
          // Notificar al header para refrescar el badge inmediatamente
          window.dispatchEvent(new CustomEvent('pendingFeedbackChanged'));
          console.log('Pending purchase feedback set - orderId:', orderId);
        } else {
          console.log('Skipping pending feedback flag (alreadyGiven:', !!alreadyGiven, ', alreadyPending:', !!alreadyPending, ')');
        }
      } catch (e) {
        console.warn('Could not set pendingPurchaseFeedback flag:', e);
      }
    } else {
      console.log('Feedback modal NOT shown - isGiftMode:', isGiftMode);
    }
  };

  const handleClose = () => {
    // Si hay un pedido completado y el modal de feedback debería mostrarse, no cerrar aún
    if (completedOrderId && !isGiftMode && !showFeedbackModal) {
      const generalFeedbackGiven = sessionStorage.getItem('feedbackGiven');
      if (!generalFeedbackGiven) {
        console.log('Preventing close - feedback modal should show');
        return;
      }
    }
    
    setStep('auth');
    setUser(null);
    setShowFeedbackModal(false);
    setLastOrderUserName('');
    setCompletedOrderId('');
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
      recipients: [{ recipientName: '', recipientEmail: '', recipientPhone: '', personalNote: '', basketIds: [] }]
    });
    localStorage.removeItem('pendingCheckout');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showFeedbackModal} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] sm:w-auto sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto" hideClose={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {(isGiftMode || isMixedMode) ? '🎁' : <ShoppingCart className="w-5 h-5" />}
            {step === 'auth' && ((isGiftMode || isMixedMode) ? 'Acceso requerido para regalar' : 'Acceso requerido')}
            {step === 'customer' && (isMixedMode ? 'Información de regalos y envío' : isGiftMode ? 'Información del regalo' : 'Información de envío')}
            {step === 'payment' && 'Información de pago'}
            {step === 'success' && ((isGiftMode || isMixedMode) ? '¡Regalo enviado!' : '¡Pedido confirmado!')}
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(isGiftMode || isMixedMode) && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {isMixedMode ? 'Cestas para regalar:' : 'Cestas disponibles para asignar:'}
                </p>
              </div>
            )}
            
            {/* Gift items section */}
            {isMixedMode && expandedBasketItems.filter(item => item.isGift).map((item) => (
              <div key={item.uniqueId} className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  {item.imagen && <BasketImageThumbnail src={item.imagen} alt={item.name} />}
                  <div>
                    <p className="font-medium">{item.name} 🎁</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.price.toFixed(2)}€</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      // Mark as removed immediately for UI update
                      setRemovedItemIds(prev => [...prev, item.uniqueId]);
                      // Remove this basket from all recipients
                      const newRecipients = giftData.recipients.map(r => ({
                        ...r,
                        basketIds: r.basketIds.filter(id => id !== item.uniqueId)
                      }));
                      setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                      // Remove from cart
                      if (onRemoveItems) {
                        onRemoveItems([{ id: item.id, isGift: true, quantityToRemove: 1 }]);
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Personal items section */}
            {isMixedMode && (
              <>
                <Separator />
                <div className="mb-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Cestas personales:</p>
                </div>
                {expandedBasketItems.filter(item => !item.isGift).map((item) => (
                  <div key={item.uniqueId} className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                      {item.imagen && <BasketImageThumbnail src={item.imagen} alt={item.name} />}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.price.toFixed(2)}€</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          // Mark as removed immediately for UI update
                          setRemovedItemIds(prev => [...prev, item.uniqueId]);
                          // Remove from cart
                          if (onRemoveItems) {
                            onRemoveItems([{ id: item.id, isGift: false, quantityToRemove: 1 }]);
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Pure gift mode or pure personal mode */}
            {!isMixedMode && expandedBasketItems.map((item) => (
              <div key={item.uniqueId} className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  {item.imagen && <BasketImageThumbnail src={item.imagen} alt={item.name} />}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                </div>
                <p className="font-semibold">
                  {item.price.toFixed(2)}€
                </p>
              </div>
            ))}
            
            <Separator />
            {(isGiftMode || isMixedMode) && (
              <>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total a pagar:</span>
                  <span>
                    {(() => {
                      // Calculate total based on assigned baskets
                      const assignedIds = new Set(giftData.recipients.flatMap(r => r.basketIds));
                      const giftTotal = expandedBasketItems
                        .filter(item => item.isGift && assignedIds.has(item.uniqueId))
                        .reduce((sum, item) => sum + item.price, 0);
                      const personalTotal = isMixedMode 
                        ? expandedBasketItems
                            .filter(item => !item.isGift)
                            .reduce((sum, item) => sum + item.price, 0)
                        : 0;
                      return (giftTotal + personalTotal).toFixed(2);
                    })()}€
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isMixedMode 
                    ? 'Incluye cestas de regalo asignadas y cestas personales' 
                    : 'Solo se cobrarán las cestas que asignes a destinatarios'}
                </p>
              </>
            )}
            {!isGiftMode && !isMixedMode && (
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total a pagar:</span>
                <span>{totalAmount.toFixed(2)}€</span>
              </div>
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
            {isMixedMode ? (
              /* Mixed Mode - Both Personal and Gift Items */
              <>
                <div className="p-4 bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg mb-4">
                  <p className="text-sm font-medium">
                    🎁 Tienes {giftItemsCount} cesta(s) para regalar y {personalItemsCount} cesta(s) personales
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primero completa la información de los regalos, luego tus datos de envío personal
                  </p>
                </div>

                {/* Gift Section */}
                <div className="border-2 border-gold/20 rounded-lg p-4 bg-gold/5">
                  <h3 className="text-lg font-poppins font-bold mb-4 flex items-center gap-2">
                    🎁 Información de los regalos ({giftItemsCount} cestas)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  <Separator className="my-4" />

                  {giftData.recipients.map((recipient, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 mb-4 bg-white">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Regalo {index + 1}</h4>
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

                      <div>
                        <Label htmlFor={`recipientName-${index}`}>Nombre destinatario *</Label>
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

                      {/* Text and info button above email/phone fields */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <p className="text-center text-sm font-bold text-muted-foreground">
                          (solo uno de los dos obligatorio)
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full hover:bg-black/10"
                            >
                              <span className="sr-only">Información sobre el proceso de regalo</span>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                              </svg>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogTitle>¿Cómo funciona el proceso de regalo?</DialogTitle>
                            <DialogDescription asChild>
                              <div className="space-y-4 text-sm">
                                <p className="font-bold">Puedes elegir entre email o móvil:</p>
                                <ul className="space-y-3 list-disc pl-5">
                                  <li>
                                    <span className="font-bold">Por email:</span> El destinatario recibirá un correo con la información del regalo y un enlace para proporcionar su dirección de envío.
                                  </li>
                                  <li>
                                    <span className="font-bold">Por móvil:</span> El destinatario recibirá un mensaje SMS con un enlace a la web donde podrá dejar su dirección de envío.
                                  </li>
                                </ul>
                                <p className="font-bold">¿Qué tiene que hacer el destinatario?</p>
                                <ol className="space-y-2 list-decimal pl-5">
                                  <li>Recibir el mensaje (email o SMS)</li>
                                  <li>Hacer clic en el enlace proporcionado</li>
                                  <li>Completar sus datos de envío (nombre, dirección, ciudad, código postal)</li>
                                  <li>Confirmar la información</li>
                                </ol>
                                <p className="text-muted-foreground">
                                  Una vez recibida la información, procesaremos el envío del regalo en un plazo de 2-3 días laborables.
                                </p>
                              </div>
                            </DialogDescription>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`recipientEmail-${index}`}>Email destinatario</Label>
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
                        <div>
                          <Label htmlFor={`recipientPhone-${index}`}>Número destinatario</Label>
                          <Input
                            id={`recipientPhone-${index}`}
                            type="tel"
                            value={recipient.recipientPhone || ''}
                            onChange={(e) => {
                              const newRecipients = [...giftData.recipients];
                              newRecipients[index].recipientPhone = e.target.value;
                              setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                            }}
                            placeholder="+34 600 000 000"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`personalNote-${index}`}>Nota personal</Label>
                        <Textarea
                          id={`personalNote-${index}`}
                          value={recipient.personalNote}
                          onChange={(e) => {
                            const newRecipients = [...giftData.recipients];
                            newRecipients[index].personalNote = e.target.value;
                            setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                          placeholder="Escribe una nota personal..."
                          rows={2}
                          maxLength={500}
                        />
                      </div>

                      <div>
                        <Label>Asignar cestas de regalo</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Selecciona qué cestas van para {recipient.recipientName || 'este destinatario'}
                        </p>
                        <div className="space-y-2">
                          {expandedBasketItems.slice(0, giftItemsCount).map((item) => (
                            <div key={item.uniqueId} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`basket-${item.uniqueId}-recipient-${index}`}
                                checked={recipient.basketIds.includes(item.uniqueId)}
                                onChange={(e) => {
                                  const newRecipients = [...giftData.recipients];
                                  if (e.target.checked) {
                                    newRecipients[index].basketIds = [...newRecipients[index].basketIds, item.uniqueId];
                                  } else {
                                    newRecipients[index].basketIds = newRecipients[index].basketIds.filter(id => id !== item.uniqueId);
                                  }
                                  setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`basket-${item.uniqueId}-recipient-${index}`} className="text-sm cursor-pointer">
                                {item.name} - {item.price.toFixed(2)}€
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {expandedBasketItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (giftData.recipients.length >= expandedBasketItems.length) {
                          toast({
                            variant: "destructive",
                            title: "Límite alcanzado",
                            description: "No puedes añadir más destinatarios que cestas disponibles",
                          });
                          return;
                        }
                        setGiftData(prev => ({
                          ...prev,
                          recipients: [...prev.recipients, { recipientName: '', recipientEmail: '', recipientPhone: '', personalNote: '', basketIds: [] }]
                        }));
                      }}
                      disabled={giftData.recipients.length >= expandedBasketItems.length}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir otro destinatario
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Personal Shipping Section */}
                <div className="border-2 border-black/10 rounded-lg p-4">
                  <h3 className="text-lg font-poppins font-bold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Tu dirección de envío ({personalItemsCount} cestas personales)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre"
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
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address_line1">Dirección *</Label>
                      <Input
                        id="address_line1"
                        value={customerData.address_line1}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, address_line1: e.target.value }))}
                        placeholder="Calle, número"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address_line2">Dirección 2</Label>
                      <Input
                        id="address_line2"
                        value={customerData.address_line2}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, address_line2: e.target.value }))}
                        placeholder="Piso, puerta"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={customerData.city}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Ciudad"
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
                      <Label htmlFor="country">País *</Label>
                      <Select 
                        value={customerData.country} 
                        onValueChange={(value) => setCustomerData(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona país" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="España">España</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continuar al pago
                </Button>
              </>
            ) : isGiftMode ? (
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
                      <h3 className="font-medium">Regalo {index + 1}</h3>
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

                    <div>
                      <Label htmlFor={`recipientName-${index}`}>Nombre *</Label>
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

                    {/* Text and info button above email/phone fields */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-center text-sm font-bold text-muted-foreground">
                        (solo uno de los dos obligatorio)
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full hover:bg-black/10"
                          >
                            <span className="sr-only">Información sobre el proceso de regalo</span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 16v-4"/>
                              <path d="M12 8h.01"/>
                            </svg>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogTitle>¿Cómo funciona el proceso de regalo?</DialogTitle>
                          <DialogDescription asChild>
                            <div className="space-y-4 text-sm">
                              <p className="font-bold">Puedes elegir entre email o móvil:</p>
                              <ul className="space-y-3 list-disc pl-5">
                                <li>
                                  <span className="font-bold">Por email:</span> El destinatario recibirá un correo con la información del regalo y un enlace para proporcionar su dirección de envío.
                                </li>
                                <li>
                                  <span className="font-bold">Por móvil:</span> El destinatario recibirá un mensaje SMS con un enlace a la web donde podrá dejar su dirección de envío.
                                </li>
                              </ul>
                              <p className="font-bold">¿Qué tiene que hacer el destinatario?</p>
                              <ol className="space-y-2 list-decimal pl-5">
                                <li>Recibir el mensaje (email o SMS)</li>
                                <li>Hacer clic en el enlace proporcionado</li>
                                <li>Completar sus datos de envío (nombre, dirección, ciudad, código postal)</li>
                                <li>Confirmar la información</li>
                              </ol>
                              <p className="text-muted-foreground">
                                Una vez recibida la información, procesaremos el envío del regalo en un plazo de 2-3 días laborables.
                              </p>
                            </div>
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`recipientEmail-${index}`}>Email destinatario</Label>
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
                          required={!recipient.recipientPhone}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`recipientPhone-${index}`}>Número destinatario</Label>
                        <Input
                          id={`recipientPhone-${index}`}
                          type="tel"
                          value={recipient.recipientPhone || ''}
                          onChange={(e) => {
                            const newRecipients = [...giftData.recipients];
                            newRecipients[index].recipientPhone = e.target.value;
                            setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                          placeholder="+34 600 000 000"
                          required={!recipient.recipientEmail}
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

                    <div>
                      <Label htmlFor={`basketAssignment-${index}`}>
                        Asignar cestas a este destinatario
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Selecciona qué cestas van para {recipient.recipientName || 'este destinatario'}
                      </p>
                      <div className="space-y-2">
                        {expandedBasketItems
                          .filter(item => !isMixedMode || item.isGift) // Only show gift items in mixed mode
                          .map((item) => (
                            <div key={item.uniqueId} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`basket-${item.uniqueId}-recipient-${index}`}
                                  checked={recipient.basketIds.includes(item.uniqueId)}
                                  onChange={(e) => {
                                    const newRecipients = [...giftData.recipients];
                                    if (e.target.checked) {
                                      newRecipients[index].basketIds = [...newRecipients[index].basketIds, item.uniqueId];
                                    } else {
                                      newRecipients[index].basketIds = newRecipients[index].basketIds.filter(id => id !== item.uniqueId);
                                    }
                                    setGiftData(prev => ({ ...prev, recipients: newRecipients }));
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`basket-${item.uniqueId}-recipient-${index}`} className="cursor-pointer">
                                  {item.name}
                                </Label>
                              </div>
                              <span className="text-sm font-semibold">{item.price.toFixed(2)}€</span>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {(() => {
                  // Only count gift baskets for recipient limit
                  const giftBasketCount = isMixedMode 
                    ? expandedBasketItems.filter(item => item.isGift).length
                    : expandedBasketItems.length;
                  
                  return giftBasketCount > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (giftData.recipients.length >= giftBasketCount) {
                          toast({
                            variant: "destructive",
                            title: "Límite alcanzado",
                            description: "No puedes añadir más destinatarios que cestas de regalo disponibles",
                          });
                          return;
                        }
                        setGiftData(prev => ({
                          ...prev,
                          recipients: [...prev.recipients, { recipientName: '', recipientEmail: '', recipientPhone: '', personalNote: '', basketIds: [] }]
                        }));
                      }}
                      disabled={giftData.recipients.length >= giftBasketCount}
                      className="w-full font-bold tracking-[0.15em] uppercase"
                      style={{ fontFamily: 'Boulder, sans-serif' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir otro destinatario
                    </Button>
                  );
                })()}
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
              {isGiftMode || isMixedMode ? (
                <>Continuar al pago ({totalAmount.toFixed(2)}€)</>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Continuar al pago ({totalAmount.toFixed(2)}€)
                </>
              )}
            </Button>
          </form>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <Elements stripe={stripePromise}>
            <div className="space-y-4">
              {isMixedMode ? (
                /* Mixed Mode - Show both gift and personal info */
                <>
                  <div className="p-4 bg-gold/10 border-2 border-gold rounded-lg">
                    <p className="text-center font-poppins font-bold text-black text-lg">
                      🎁 Regalos ({giftItemsCount} cestas)
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground space-y-2">
                      <p><strong>De:</strong> {giftData.senderName} ({giftData.senderEmail})</p>
                      <div className="space-y-1">
                        <p><strong>Para:</strong></p>
                          {giftData.recipients.map((recipient, index) => (
                            <div key={index} className="ml-4">
                              <p>• {recipient.recipientName} ({recipient.recipientEmail || recipient.recipientPhone})</p>
                              {recipient.personalNote && (
                                <p className="text-xs italic ml-2">Nota: "{recipient.personalNote.substring(0, 50)}{recipient.personalNote.length > 50 ? '...' : ''}"</p>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Tu dirección de envío ({personalItemsCount} cestas)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customerData.name}<br />
                      {customerData.address_line1}<br />
                      {customerData.address_line2 && `${customerData.address_line2}\n`}
                      {customerData.city}, {customerData.postal_code}<br />
                      {customerData.country}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('customer')}
                    className="w-full"
                  >
                    Editar información
                  </Button>
                </>
              ) : isGiftMode ? (
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
                            <p>• {recipient.recipientName} ({recipient.recipientEmail || recipient.recipientPhone})</p>
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
              isGiftMode={isGiftMode || isMixedMode}
              giftData={giftData}
              expandedBasketItems={expandedBasketItems}
              />
            </div>
          </Elements>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              {(isGiftMode || isMixedMode) ? <span className="text-4xl">🎁</span> : <Check className="w-8 h-8 text-green-600" />}
            </div>
            <h3 className="text-xl font-semibold">
              {isMixedMode ? '¡Pedido confirmado!' : isGiftMode ? '¡Regalo enviado!' : '¡Pedido confirmado!'}
            </h3>
            <p className="text-muted-foreground">
              {isMixedMode
                ? 'Tu pago ha sido procesado correctamente. Los regalos serán enviados a sus destinatarios y tus cestas personales a tu dirección.'
                : isGiftMode 
                ? 'Tu regalo ha sido enviado correctamente. El destinatario recibirá un email con los detalles de tu regalo.'
                : 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación con todos los detalles de tu pedido.'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {(isGiftMode || isMixedMode)
                ? 'Las cestas serán preparadas con cariño y enviadas a las direcciones indicadas.'
                : 'Tu cesta será preparada con cariño y enviada a la dirección indicada.'
              }
            </p>
            <Button 
              onClick={() => {
                const generalFeedbackGiven = sessionStorage.getItem('feedbackGiven');
                if (!isGiftMode && completedOrderId && !generalFeedbackGiven) {
                  console.log('Showing feedback modal and hiding checkout dialog');
                  setShowFeedbackModal(true);
                } else {
                  handleClose();
                }
              }} 
              className="w-full" 
              size="lg"
            >
              Continuar
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
      
    {/* Feedback Modal - Rendered OUTSIDE the checkout Dialog to prevent blocking */}
    {!isGiftMode && completedOrderId && showFeedbackModal && (
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          console.log('Closing feedback modal');
          setShowFeedbackModal(false);
          setLastOrderUserName('');
          setCompletedOrderId('');
          // Close the checkout fully so it doesn't reopen
          onClose();
        }}
        userName={lastOrderUserName}
        showPurchaseQuestion={true}
        orderId={completedOrderId}
      />
    )}
    </>
  );
};

export default CheckoutModal;