import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, Package, LogOut, Loader2, ChevronDown, ChevronUp, X, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

// Import images
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
import profileBgImg from "@/assets/amigos-celebracion.png";
import valoracionesBgImg from "@/assets/familia-terraza-nueva.png";

// Mapeo de cestas a imágenes y precios correctos del catálogo actual
const basketData: Record<string, { imagen: string; precio: number }> = {
  // Pareja (2 personas)
  "Pareja Inicial": { imagen: parejaInicialImg, precio: 30 },
  "Pareja Natural (sin alcohol)": { imagen: conversacionNaturalImg, precio: 40 },
  "Pareja Gourmet": { imagen: parejaGourmetImg, precio: 50 },
  
  // Grupos 3-4 personas
  "Trio ibérico": { imagen: trioIbericoImg, precio: 45 },
  "Mesa Abierta (sin alcohol)": { imagen: mesaAbiertaImg, precio: 55 },
  "Ibéricos Selectos": { imagen: ibericosSelectosImg, precio: 65 },
  
  // Grupos 5-6 personas
  "Familiar Clásica": { imagen: familiarClasicaImg, precio: 65 },
  "Experiencia Gastronómica (sin alcohol)": { imagen: experienciaGastronomicaImg, precio: 70 },
  "Gran Tertulia": { imagen: granTertuliaImg, precio: 80 },
  
  // Grupos 7-8 personas
  "Celebración Ibérica": { imagen: celebracionIbericaImg, precio: 85 },
  "Festín Selecto (sin alcohol)": { imagen: festinSelectoImg, precio: 90 },
  "Experiencia Selecta": { imagen: experienciaGastronomicaImg, precio: 100 },
};

// Fallback por categoría si no encontramos la cesta exacta
const categoryFallbackImage: Record<string, string> = {
  Pareja: parejaGourmetImg,
  Familia: familiarClasicaImg,
  Amigos: granTertuliaImg,
};

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  items: OrderItem[];
}

interface OrderItem {
  basket_name: string;
  basket_category: string;
  quantity: number;
  price_per_item: number;
}

interface Review {
  id: string;
  basket_name: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  source_site: string;
  profiles?: {
    name: string | null;
    user_id: string;
  };
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState<{ [key: string]: boolean }>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadUserData(user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          loadUserData(user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          loadUserData(user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_gifts'
        },
        () => {
          loadUserData(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [user?.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setSession(session);
    setUser(session.user);
    await loadUserData(session.user.id);
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      setProfile(profileData);

      // Load customer ID
      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (customerData) {
        // Load orders with items and shipping info
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            total_amount,
            status,
            shipping_address_line1,
            shipping_address_line2,
            shipping_city,
            shipping_postal_code,
            shipping_country
          `)
          .eq("customer_id", customerData.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Get all gift order IDs for this user (items they gifted to others)
        const { data: giftedItems } = await supabase
          .from("pending_gifts")
          .select("order_id")
          .in("order_id", ordersData?.map(o => o.id) || []);

        const giftedOrderIds = new Set(giftedItems?.map(g => g.order_id) || []);

        // Load order items for each order, expanding items individually
        const expandedOrders: Order[] = [];
        
        for (const order of ordersData || []) {
          // Skip orders that were entirely gifts
          if (giftedOrderIds.has(order.id)) continue;

          const { data: items } = await supabase
            .from("order_items")
            .select("basket_name, basket_category, quantity, price_per_item")
            .eq("order_id", order.id);

          // Create a separate order entry for each item (no grouping)
          for (const item of items || []) {
            expandedOrders.push({
              ...order,
              items: [item], // Single item per order
            });
          }
        }

        // Load received gifts as additional orders
        const { data: receivedGifts } = await supabase
          .from("pending_gifts")
          .select("*")
          .eq("recipient_user_id", userId)
          .eq("shipping_completed", true);

        for (const gift of receivedGifts || []) {
          expandedOrders.push({
            id: gift.order_id,
            created_at: gift.created_at,
            total_amount: gift.price * gift.quantity,
            status: "pending",
            shipping_address_line1: gift.shipping_address_line1 || "",
            shipping_address_line2: gift.shipping_address_line2,
            shipping_city: gift.shipping_city || "",
            shipping_postal_code: gift.shipping_postal_code || "",
            shipping_country: gift.shipping_country || "España",
            items: [{
              basket_name: gift.basket_name,
              basket_category: gift.basket_category,
              quantity: gift.quantity,
              price_per_item: gift.price,
            }],
          });
        }

        setOrders(expandedOrders);
      }

      // Load user's reviews from paragenteselecta.com only
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("source_site", "paragenteselecta")
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Error loading reviews:", reviewsError);
      }

      // Map profile to reviews using the profile data already loaded
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        profiles: profileData
      }));

      setReviews(reviewsWithProfiles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar tus datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(45,100%,65%)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden"
      >
        {/* Background images with smooth transitions */}
        <div className="absolute inset-0 z-0">
          <img 
            src={profileBgImg} 
            alt="Fondo mis pedidos" 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ 
              objectPosition: 'center 40%',
              opacity: activeTab === 'orders' ? 1 : 0,
              pointerEvents: activeTab === 'orders' ? 'auto' : 'none'
            }} 
            loading="eager"
          />
          <img 
            src={valoracionesBgImg} 
            alt="Fondo mis valoraciones" 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ 
              objectPosition: 'center 40%',
              opacity: activeTab === 'reviews' ? 1 : 0,
              pointerEvents: activeTab === 'reviews' ? 'auto' : 'none'
            }} 
            loading="eager"
          />
        </div>
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/65 z-[1]" />
        <div className="container mx-auto max-w-6xl relative z-[2]">
          {/* User Profile Avatar - moved to top */}
          <div className="mb-4 flex justify-center">
            <UserProfileDropdown 
              user={user} 
              profile={profile} 
              onProfileUpdate={() => loadUserData(user.id)}
            />
          </div>
          
          {/* Header with Back and Logout buttons */}
          <div className="mb-8 flex justify-between items-center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="gap-2 text-white hover:text-[hsl(45,100%,65%)] hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="gap-2 text-white hover:text-[hsl(45,100%,65%)] hover:bg-transparent uppercase"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="orders" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent">
              <TabsTrigger value="orders" className="gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-poppins font-bold">
                <Package className="w-4 h-4" />
                <span className="font-bungee tracking-wider">Mis pedidos.</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-poppins font-bold">
                <Star className="w-4 h-4" />
                <span className="font-bungee tracking-wider">Mis valoraciones.</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6 animate-fade-in">
              {/* Active/Paid Orders */}
              {orders.length === 0 ? (
                <Card className="bg-transparent border-none">
                  <CardContent className="pt-6 text-center text-white font-poppins font-bold">
                    No tienes pedidos activos.
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden bg-transparent border-none shadow-lg">
                    <CardHeader className="p-6">
                      <Collapsible
                        open={openOrders[order.id]}
                        onOpenChange={() => setOpenOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start px-4">
                            <div className="flex-1 text-right pr-4">
                              <h2 className="text-3xl font-bungee font-bold text-[hsl(45,100%,65%)] mb-2 tracking-wider">
                                ¡Enhorabuena!
                              </h2>
                              <p className="text-sm text-white font-poppins font-bold">
                                📅 {new Date(order.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}.
                              </p>
                            </div>
                            <div className="flex-1 text-center px-4">
                              <p className="font-poppins font-bold text-white text-3xl">
                                {(
                                  order.items.reduce((sum, i) => sum + ((basketData[i.basket_name]?.precio ? basketData[i.basket_name].precio * 100 : i.price_per_item) * i.quantity), 0) / 100
                                ).toFixed(2)}€.
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-2xl text-green-600 font-poppins font-bold">
                                ✓ Pagado.
                              </p>
                            </div>
                          </div>

                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-center gap-2 text-white hover:text-[hsl(45,100%,65%)] hover:bg-transparent font-poppins font-bold transition-colors"
                            >
                              {openOrders[order.id] ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ocultar detalles.
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Ver detalles del pedido.
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-start px-2">
                            {/* Productos - escalera de izquierda a derecha bajando */}
                            {/* Productos - escalera de izquierda a derecha bajando */}
                            <div className="flex flex-col items-start justify-start h-full">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="inline-block">
                                  <p className="font-poppins font-bold text-white inline">{item.basket_name}.</p>
                                  <p className="text-sm text-white font-poppins font-bold inline ml-2">{( (basketData[item.basket_name]?.precio ?? (item.price_per_item / 100)) ).toFixed(2)}€.</p>
                                </div>
                              ))}
                            </div>

                            {/* Imagen de la cesta en el centro */}
                            <div className="flex justify-center items-start">
                              {order.items && order.items.length > 0 ? (
                                (() => {
                                  const item = order.items[0];
                                  const byName = basketData[item.basket_name]?.imagen;
                                  const cat = (item.basket_category || '').toLowerCase();
                                  const byCategory = cat.includes('pareja')
                                    ? categoryFallbackImage.Pareja
                                    : cat.includes('familia')
                                      ? categoryFallbackImage.Familia
                                      : cat.includes('amig')
                                        ? categoryFallbackImage.Amigos
                                        : undefined;
                                  const imgSrc = byName || byCategory || parejaInicialImg;
                                  return (
                                    <div 
                                      className="w-28 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg"
                                      onClick={() => setZoomedImage(imgSrc)}
                                    >
                                      <img 
                                        src={imgSrc} 
                                        alt={item.basket_name}
                                        className="w-full h-auto object-cover"
                                      />
                                    </div>
                                  );
                                })()
                              ) : null}
                            </div>

                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            <div className="flex flex-col items-end justify-start h-full">
                              <p className="text-sm text-white font-poppins font-bold">{order.shipping_address_line1}.</p>
                              {order.shipping_address_line2 && (
                                <p className="text-sm text-white font-poppins font-bold">{order.shipping_address_line2}.</p>
                              )}
                              <p className="text-sm text-white font-poppins font-bold">{order.shipping_city}, {order.shipping_postal_code}.</p>
                              <p className="text-sm text-white font-poppins font-bold">{order.shipping_country}.</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6 animate-fade-in">
              {/* Valoraciones desde paragenteselecta.com */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                        {reviews.map((review) => {
                          const normalize = (s: string) => s
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^\w\s]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                          const n = normalize(review.basket_name || '');
                          const matchKey = Object.keys(basketData).find((k) => {
                            const nk = normalize(k);
                            return nk === n || nk.includes(n) || n.includes(nk);
                          });
                          const displayName = matchKey || review.basket_name;
                          const precio = matchKey ? basketData[matchKey].precio : undefined;

                          const imgSrc = matchKey ? basketData[matchKey].imagen : parejaGourmetImg;

                          return (
                          <Card key={review.id} className="bg-white/10 border-none shadow-lg">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg text-white font-poppins font-bold">{displayName}.</CardTitle>
                                  {precio !== undefined && (
                                    <p className="text-white font-poppins font-bold mt-1">{precio}€.</p>
                                  )}
                                  {review.profiles?.name && (
                                    <p className="text-sm text-white/80 font-poppins mt-1">
                                      Valoración tuya en paragenteselecta.com
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < review.rating
                                          ? "fill-[hsl(45,100%,65%)] text-[hsl(45,100%,65%)]"
                                          : "text-white"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-white font-poppins font-bold">
                                {new Date(review.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-center">
                                <div 
                                  className="w-32 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg"
                                  onClick={() => setZoomedImage(imgSrc)}
                                >
                                  <img 
                                    src={imgSrc} 
                                    alt={displayName}
                                    className="w-full h-auto object-cover"
                                  />
                                </div>
                              </div>
                              <p className="text-white font-poppins font-bold">{review.comment}.</p>
                            </CardContent>
                          </Card>
                        );
                        })}
                </div>
              ) : (
                <Card className="bg-transparent border-none">
                  <CardContent className="pt-6 text-center text-white font-poppins font-bold">
                    Aún no has dejado valoraciones en paragenteselecta.com.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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
    </>
  );
};

export default ProfilePage;
