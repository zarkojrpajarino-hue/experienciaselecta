import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Gift, X, Home, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import basket images
import parejaInicialImg from "@/assets/pareja-inicial-nueva-clean.jpg";
import conversacionNaturalImg from "@/assets/pareja-natural-nueva-clean.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";
import trioIbericoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
import mesaAbiertaImg from "@/assets/mesa-abierta-nuevo-clean.jpg";
import ibericosSelectosImg from "@/assets/ibericos-selectos-nuevo-clean.jpg";
import familiarClasicaImg from "@/assets/familiar-clasica-nuevo-clean.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica-clean.jpg";
import granTertuliaImg from "@/assets/gran-tertulia-nuevo-clean.jpg";
import celebracionIbericaImg from "@/assets/celebracion-iberica-nuevo-clean.jpg";
import festinSelectoImg from "@/assets/festin-selecto-nuevo-clean.jpg";

// Mapeo de cestas a imágenes locales
const basketImages: Record<string, string> = {
  "Pareja Inicial": parejaInicialImg,
  "Conversación Natural (sin alcohol)": conversacionNaturalImg,
  "Pareja Gourmet": parejaGourmetImg,
  "Trio ibérico": trioIbericoImg,
  "Trio Ibérico": trioIbericoImg,
  "Mesa Abierta (sin alcohol)": mesaAbiertaImg,
  "Ibéricos Selectos": ibericosSelectosImg,
  "Familiar clásica": familiarClasicaImg,
  "Experiencia Gastronómica (sin alcohol)": experienciaGastronomicaImg,
  "Gran Tertulia": granTertuliaImg,
  "Celebración Ibérica": celebracionIbericaImg,
  "Festín Selecto": festinSelectoImg,
  "Cesta Trío Ibérico": trioIbericoImg,
};

interface PendingGift {
  id: string;
  sender_name: string;
  sender_email?: string;
  recipient_name: string;
  recipient_email: string;
  basket_name: string;
  basket_image: string;
  basket_category: string;
  price: number;
  quantity: number;
  gift_claimed: boolean;
  shipping_completed: boolean;
  personal_note: string | null;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Parejas': '#782C23',
  'Amigos': '#44667D', 
  'Familias': '#4A7050',
};

const RegalosPage = () => {
  const navigate = useNavigate();
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'España',
  });

  useEffect(() => {
    loadPendingGifts();
  }, []);

  // Real-time subscription for pending gifts
  useEffect(() => {
    const channel = supabase
      .channel('pending-gifts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_gifts'
        },
        () => {
          loadPendingGifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPendingGifts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.name) {
        setUserName(profile.name);
        setShippingData(prev => ({ ...prev, name: prev.name || profile.name }));
      }

      // Prefill email from authenticated user
      setShippingData(prev => ({ ...prev, email: prev.email || (user.email || '') }));

      // Get pending gifts by email
      const { data: gifts, error } = await supabase
        .from('pending_gifts')
        .select('*')
        .eq('recipient_email', user.email)
        .eq('shipping_completed', false);

      if (error) throw error;

      setPendingGifts(gifts || []);

      // Update gifts to link to this user
      if (gifts && gifts.length > 0) {
        await supabase
          .from('pending_gifts')
          .update({ recipient_user_id: user.id, gift_claimed: true })
          .eq('recipient_email', user.email)
          .is('recipient_user_id', null);
      }
    } catch (error) {
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitShipping = async (giftId: string) => {
    try {
      console.log('Iniciando envío de información de regalo:', giftId);
      console.log('Datos de envío:', shippingData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes iniciar sesión para enviar la información');
        return;
      }
      
      // Validación mejorada de campos
      if (!shippingData.name || shippingData.name.trim().length < 2) {
        toast.error('El nombre debe tener al menos 2 caracteres');
        return;
      }
      
      if (!shippingData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
        toast.error('Por favor introduce un email válido');
        return;
      }
      
      if (!shippingData.address_line1 || shippingData.address_line1.trim().length < 5) {
        toast.error('La dirección debe tener al menos 5 caracteres');
        return;
      }
      
      if (!shippingData.city || shippingData.city.trim().length < 2) {
        toast.error('La ciudad debe tener al menos 2 caracteres');
        return;
      }
      
      if (!shippingData.postal_code || !/^\d{5}$/.test(shippingData.postal_code.trim())) {
        toast.error('El código postal debe tener exactamente 5 dígitos');
        return;
      }

      // Update pending gift with shipping data
      console.log('Actualizando regalo en base de datos...');
      const { error: updateError } = await supabase
        .from('pending_gifts')
        .update({
          recipient_name: shippingData.name,
          recipient_email: shippingData.email,
          recipient_user_id: user.id,
          gift_claimed: true,
          shipping_address_line1: shippingData.address_line1,
          shipping_address_line2: shippingData.address_line2,
          shipping_city: shippingData.city,
          shipping_postal_code: shippingData.postal_code,
          shipping_country: shippingData.country,
          shipping_completed: true,
        })
        .eq('id', giftId);

      if (updateError) {
        console.error('Error al actualizar regalo:', updateError);
        throw updateError;
      }
      console.log('Regalo actualizado exitosamente');

      // Call edge function to send confirmation emails
      const gift = pendingGifts.find(g => g.id === giftId);
      if (gift) {
      await supabase.functions.invoke('process-gift-shipping', {
          body: {
            giftId,
            recipientName: gift.recipient_name,
            senderName: gift.sender_name,
            basketName: gift.basket_name,
            shippingAddress: `${shippingData.address_line1}, ${shippingData.city}, ${shippingData.postal_code}`,
          },
        });
      }

      toast.success('¡Regalo reclamado! Tu información ha sido enviada.');
      loadPendingGifts();
    } catch (error: any) {
      console.error('Error submitting shipping:', error);
      toast.error(`Error al enviar la información: ${error?.message || 'Error desconocido'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] pt-24 px-4 pb-12">
      <div className="container mx-auto px-4 pt-20 md:pt-8 pb-20 max-w-4xl">
        <Button
          onClick={() => navigate("/")}
          variant="link"
          className="text-black hover:text-black/80 mb-4"
        >
          ← Volver al inicio
        </Button>
        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-black mb-6 text-center">
          🎁 Tus Regalos
        </h1>

        {pendingGifts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No tienes regalos pendientes</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingGifts.map((gift) => {
              // Get correct image for basket
              const basketImg = basketImages[gift.basket_name] || gift.basket_image || parejaInicialImg;
              // Get category color
              const categoryColor = categoryColors[gift.basket_category] || '#4A7050';
              
              return (
                  <div key={gift.id} className="relative">
                    {/* Tarjeta del regalo */}
                    <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                        <div 
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg flex-shrink-0"
                          onClick={() => setZoomedImage(basketImg)}
                        >
                          <img
                            src={basketImg}
                            alt={gift.basket_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xs sm:text-sm md:text-base font-bold mb-2 leading-tight break-words">
                            🎁 {userName || gift.recipient_name}, tienes un regalo pendiente de: {gift.sender_email}
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
                            Te ha regalado: <strong className="break-words">{gift.basket_name}</strong>
                          </p>
                          {gift.personal_note && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 italic break-words">
                              Nota: "{gift.personal_note}"
                            </p>
                          )}
                          <p className="text-[0.6rem] sm:text-xs md:text-sm font-poppins font-bold text-center uppercase tracking-tight sm:tracking-wide mt-4 leading-tight text-black">
                            Rellena la información para que podamos enviártelo
                          </p>
                        </div>
                      </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                    <Input
                      value={shippingData.name}
                      onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mail de destinatario *</label>
                    <Input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                      placeholder="tu@email.com"
                      required
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Número del destinatario</label>
                    <Input
                      type="tel"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dirección *</label>
                    <Input
                      value={shippingData.address_line1}
                      onChange={(e) => setShippingData({...shippingData, address_line1: e.target.value})}
                      placeholder="Calle y número"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dirección adicional</label>
                    <Input
                      value={shippingData.address_line2}
                      onChange={(e) => setShippingData({...shippingData, address_line2: e.target.value})}
                      placeholder="Piso, puerta, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ciudad *</label>
                      <Input
                        value={shippingData.city}
                        onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                        placeholder="Ciudad"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Código Postal *</label>
                      <Input
                        value={shippingData.postal_code}
                        onChange={(e) => setShippingData({...shippingData, postal_code: e.target.value})}
                        placeholder="00000"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubmitShipping(gift.id)}
                    className="w-full"
                    size="lg"
                  >
                    Enviar Información
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Nota: el email debe ser el de tu cuenta para verificar el regalo.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

        {/* Image Zoom Modal - Deployable card style */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
              data-expanded-regalos-image
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl md:max-w-2xl px-4 overflow-hidden"
              onClick={() => setZoomedImage(null)}
            >
              <div className="bg-white border-2 border-[#FFD700]/30 rounded-[2rem] p-4 shadow-xl">
                <div className="flex justify-end mb-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImage(null);
                    }}
                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 text-black shadow-md" 
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img 
                  src={zoomedImage} 
                  alt="Cesta ampliada"
                  className="w-full h-auto object-contain rounded-[1.5rem]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegalosPage;
