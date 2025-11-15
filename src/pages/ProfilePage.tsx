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
import profileBgImg from "@/assets/profile-orders-bg.png";
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
  const [expandedImages, setExpandedImages] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<string>("orders");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('[ProfilePage] 🚀 Inicializando ProfilePage');
    
    let mounted = true;
    let initialCheckDone = false;
    
    // Primero verificar sesión actual de forma síncrona
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('[ProfilePage] ⚡ Usuario ya logueado:', session.user.email);
          setSession(session);
          setUser(session.user);
          // Cargar datos sin await para no bloquear
          loadUserData(session.user.id);
        } else {
          console.log('[ProfilePage] ℹ️ No hay sesión activa');
          setLoading(false);
        }
        
        initialCheckDone = true;
      } catch (error) {
        console.error('[ProfilePage] ❌ Error al verificar sesión:', error);
        if (mounted) setLoading(false);
      }
    };
    
    // Ejecutar verificación inicial inmediatamente
    checkInitialSession();
    
    // Configurar listener para cambios futuros
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[ProfilePage] 🔔 Auth cambió:', event);
        
        if (!mounted || !initialCheckDone) return;
        
        if (session?.user) {
          console.log('[ProfilePage] ✅ Nuevo login detectado:', session.user.email);
          setSession(session);
          setUser(session.user);
          setLoading(true);
          await loadUserData(session.user.id);
        } else {
          console.log('[ProfilePage] 🚪 Usuario deslogueado');
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('[ProfilePage] 📊 Cargando datos para:', userId);
      
      // Cargar profile y customer en paralelo SIN timeout
      const [profileResponse, customerResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("customers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle()
      ]);
      
      if (profileResponse?.data) {
        console.log('[ProfilePage] ✅ Profile cargado');
        setProfile(profileResponse.data);
      }
      
      if (customerResponse?.data) {
        console.log('[ProfilePage] ✅ Customer encontrado');
      } else {
        console.log('[ProfilePage] ℹ️ Sin customer - usuario nuevo');
      }
      
      // ✅ SIEMPRE quitar loading aunque fallen las queries
      console.log('[ProfilePage] ✅ FIN - quitando loading');
      setLoading(false);
      
    } catch (error) {
      console.error('[ProfilePage] ❌ ERROR:', error);
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
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(45,100%,65%)]" />
          <p className="text-lg font-poppins text-gray-700">Cargando tu perfil...</p>
        </div>
      </>
    );
  }

  // Not authenticated: show CTA instead of blank page (safety guard)
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24 px-4">
          <Card className="max-w-md w-full bg-white border-black border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="font-bungee text-center text-2xl">INICIA SESIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="font-poppins text-gray-700">
                Necesitas iniciar sesión para ver tu perfil.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-black text-white hover:bg-gray-800 font-bungee"
              >
                IR A LA PÁGINA PRINCIPAL
              </Button>
            </CardContent>
          </Card>
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
        {/* Background images with smooth transitions - same image for both */}
        <div className="absolute inset-0 z-0">
          <img 
            src={valoracionesBgImg} 
            alt="Fondo de perfil" 
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: 'center center'
            }} 
            loading="lazy"
            decoding="async"
          />
        </div>
        
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/65 z-[2]" />
        <div className="container mx-auto max-w-6xl relative z-[3]">
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
            <TabsList className="grid w-full grid-cols-2 gap-8 md:gap-16 mb-8 bg-transparent">
              <TabsTrigger value="orders" className="gap-1 md:gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-poppins font-bold">
                <Package className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-bungee tracking-wider text-xs md:text-base">Mis pedidos.</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1 md:gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-poppins font-bold">
                <Star className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-bungee tracking-wider text-xs md:text-base">Mis valoraciones.</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6 animate-fade-in">
              {/* Título de sección */}
              <h2 className="text-xl md:text-2xl font-bungee font-bold text-white mb-6 tracking-wider text-center">
                Pedidos:
              </h2>
              
              {/* Active/Paid Orders */}
              {orders.length === 0 ? (
                <Card className="bg-white border-black border-2 shadow-lg">
                  <CardContent className="pt-12 pb-12 text-center space-y-6">
                    <p className="text-xl md:text-2xl text-black font-poppins font-bold">
                      Aún no has realizado ninguna experiencia.
                    </p>
                    <Button
                        onClick={() => navigate('/comprar-cestas')}
                      className="bg-black hover:bg-black/80 text-white font-bungee tracking-wider uppercase border-2 border-black"
                    >
                      Ver catálogo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden bg-white border-black border-2 shadow-lg">
                    <CardHeader className="p-6">
                      <Collapsible
                        open={openOrders[order.id]}
                        onOpenChange={() => setOpenOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      >
                          <div className="space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-4">
                            <div className="flex-1 text-center md:text-right md:pr-4">
                              <h2 className="text-xl md:text-3xl font-bungee font-bold text-black mb-2 tracking-wider">
                                ¡Enhorabuena!
                              </h2>
                              <p className="text-xs md:text-sm text-black font-poppins font-bold">
                                📅 {new Date(order.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}.
                              </p>
                            </div>
                            <div className="flex-1 text-center px-2 md:px-4">
                              <p className="font-poppins font-bold text-black text-xl md:text-3xl">
                                {(
                                  order.items.reduce((sum, i) => sum + ((basketData[i.basket_name]?.precio ? basketData[i.basket_name].precio * 100 : i.price_per_item) * i.quantity), 0) / 100
                                ).toFixed(2)}€.
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-lg md:text-2xl text-green-600 font-poppins font-bold">
                                ✓ Pagado.
                              </p>
                            </div>
                          </div>

                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-center gap-2 text-black hover:text-black hover:bg-gray-100 font-poppins font-bold transition-colors"
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
                                  <p className="font-poppins font-bold text-black inline">{item.basket_name}.</p>
                                  <p className="text-sm text-black font-poppins font-bold inline ml-2">{( (basketData[item.basket_name]?.precio ?? (item.price_per_item / 100)) ).toFixed(2)}€.</p>
                                </div>
                              ))}
                            </div>

                            {/* Imagen de la cesta en el centro */}
                            <div className="flex flex-col items-center justify-start gap-2">
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
                                    <>
                                      {/* Imagen ampliada - Collapsible arriba */}
                                      <Collapsible
                                        open={expandedImages[order.id]}
                                        onOpenChange={(open) => {
                                          setExpandedImages(prev => ({ ...prev, [order.id]: open }));
                                          if (open) {
                                            setTimeout(() => {
                                              const expandedImg = document.querySelector(`[data-expanded-order="${order.id}"]`);
                                              if (expandedImg) {
                                                expandedImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                              }
                                            }, 150);
                                          }
                                        }}
                                        className="w-full"
                                      >
                                        <CollapsibleContent>
                                          <div data-expanded-order={order.id} className="bg-white/10 border-2 border-[#FFD700]/30 rounded-2xl p-3 mb-3 shadow-xl">
                                            <div className="flex justify-end mb-2">
                                              <Button 
                                                onClick={() => setExpandedImages(prev => ({ ...prev, [order.id]: false }))}
                                                className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 text-black shadow-md" 
                                                size="icon"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            <img
                                              src={imgSrc}
                                              alt={item.basket_name}
                                              className="w-full h-auto object-contain rounded-xl"
                                            />
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>

                                      {/* Imagen pequeña clickeable */}
                                      <div 
                                        className="w-28 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg"
                                        onClick={() => setExpandedImages(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                                      >
                                        <img 
                                          src={imgSrc} 
                                          alt={item.basket_name}
                                          className="w-full h-auto object-cover"
                                        />
                                      </div>
                                    </>
                                  );
                                })()
                              ) : null}
                            </div>

                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            <div className="flex flex-col items-end justify-start h-full">
                              <p className="text-sm text-black font-poppins font-bold">{order.shipping_address_line1}.</p>
                              {order.shipping_address_line2 && (
                                <p className="text-sm text-black font-poppins font-bold">{order.shipping_address_line2}.</p>
                              )}
                              <p className="text-sm text-black font-poppins font-bold">{order.shipping_city}, {order.shipping_postal_code}.</p>
                              <p className="text-sm text-black font-poppins font-bold">{order.shipping_country}.</p>
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
              {/* Título de sección */}
              <h2 className="text-xl md:text-2xl font-bungee font-bold text-white mb-6 tracking-wider text-center">
                Valoraciones:
              </h2>
              
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
                          <Card key={review.id} className="bg-white border-black border-2 shadow-lg">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg text-black font-poppins font-bold">{displayName}.</CardTitle>
                                  <div className="flex gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {precio !== undefined && (
                                    <p className="text-black font-poppins font-bold mt-1">{precio}€.</p>
                                  )}
                                  {review.profiles?.name && (
                                    <p className="text-sm text-black/70 font-poppins mt-1">
                                      Valoración tuya en paragenteselecta.com
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-black font-poppins font-bold">
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
                              <p className="text-black font-poppins font-bold">{review.comment}.</p>
                            </CardContent>
                          </Card>
                        );
                        })}
                </div>
              ) : (
                <Card className="bg-white border-black border-2 shadow-lg">
                  <CardContent className="pt-12 pb-12 text-center space-y-6">
                    <p className="text-xl md:text-2xl text-black font-poppins font-bold">
                      Aún no has realizado ninguna experiencia.
                    </p>
                    <Button
                      onClick={() => navigate('/comprar-cestas')}
                      className="bg-black hover:bg-black/80 text-white font-bungee tracking-wider uppercase border-2 border-black"
                    >
                      Ver catálogo
                    </Button>
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
