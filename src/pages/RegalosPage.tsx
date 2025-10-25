import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Gift, X } from 'lucide-react';

interface PendingGift {
  id: string;
  sender_name: string;
  recipient_name: string;
  basket_name: string;
  basket_image: string;
  basket_category: string;
  price: number;
  quantity: number;
  gift_claimed: boolean;
  shipping_completed: boolean;
  personal_note: string | null;
}

const RegalosPage = () => {
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

  const loadPendingGifts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

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
      
      if (!shippingData.name || !shippingData.email || !shippingData.address_line1 || !shippingData.city || !shippingData.postal_code) {
        console.error('Campos obligatorios faltantes');
        toast.error('Por favor completa todos los campos obligatorios');
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

      toast.success('¡Información enviada! Tu regalo está de camino.');
      loadPendingGifts();
    } catch (error: any) {
      console.error('Error submitting shipping:', error);
      toast.error(`Error al enviar la información: ${error?.message || 'Error desconocido'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-24 px-4">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Tus Regalos</h1>
        </div>

        {pendingGifts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No tienes regalos pendientes</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingGifts.map((gift) => (
              <div key={gift.id} className="bg-card rounded-lg p-6 border border-border shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  {gift.basket_image && (
                    <div 
                      className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg flex-shrink-0"
                      onClick={() => setZoomedImage(gift.basket_image)}
                    >
                      <img
                        src={gift.basket_image}
                        alt={gift.basket_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                      🎁 {userName || gift.recipient_name}, tienes un regalo pendiente de: {gift.sender_name}
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground mb-2">
                      Te ha regalado: <strong>{gift.basket_name}</strong>
                    </p>
                    {gift.personal_note && (
                      <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-md my-3">
                        <p className="text-sm italic text-foreground">
                          "{gift.personal_note}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          - {gift.sender_name}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
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
                    <label className="block text-sm font-medium mb-2">Email *</label>
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
            ))}
          </div>
        )}

        {/* Image Zoom Modal */}
        {zoomedImage && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setZoomedImage(null);
            }}
          >
            <Button 
              onClick={() => setZoomedImage(null)} 
              className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
              size="icon"
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={zoomedImage} 
              alt="Cesta ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RegalosPage;
