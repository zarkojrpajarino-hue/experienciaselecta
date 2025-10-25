import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, Package, LogOut, Loader2, ChevronDown, ChevronUp, X, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

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

// Mapeo de cestas a imágenes y precios reales
const basketData: Record<string, { imagen: string; precio: number }> = {
  "Pareja Inicial": { imagen: parejaInicialImg, precio: 35 },
  "Conversación Natural (sin alcohol)": { imagen: conversacionNaturalImg, precio: 45 },
  "Pareja Gourmet": { imagen: parejaGourmetImg, precio: 55 },
  "Trio ibérico": { imagen: trioIbericoImg, precio: 65 },
  "Trio Ibérico": { imagen: trioIbericoImg, precio: 65 },
  "Mesa Abierta (sin alcohol)": { imagen: mesaAbiertaImg, precio: 55 },
  "Ibéricos Selectos": { imagen: ibericosSelectosImg, precio: 65 },
  "Familiar clásica": { imagen: familiarClasicaImg, precio: 60 },
  "Experiencia Gastronómica (sin alcohol)": { imagen: experienciaGastronomicaImg, precio: 70 },
  "Gran Tertulia": { imagen: granTertuliaImg, precio: 85 },
  "Celebración Ibérica": { imagen: celebracionIbericaImg, precio: 110 },
  "Festín Selecto": { imagen: festinSelectoImg, precio: 140 },
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
  hasReview?: boolean;
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
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState<{ [key: string]: boolean }>({});
  const [reviewForm, setReviewForm] = useState<{
    orderId: string;
    basketName: string;
    rating: number;
    comment: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [openPreviousReviews, setOpenPreviousReviews] = useState(false);
  const [newReview, setNewReview] = useState<{
    basketName: string;
    rating: number;
    comment: string;
  }>({
    basketName: "",
    rating: 0,
    comment: ""
  });
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
        // Calculate date 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

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

          // Check if order is older than 10 days
          const orderDate = new Date(order.created_at);
          const isOlderThan10Days = orderDate < tenDaysAgo;

          const { data: items } = await supabase
            .from("order_items")
            .select("basket_name, basket_category, quantity, price_per_item")
            .eq("order_id", order.id);

          // Create a separate order entry for each item (no grouping)
          for (const item of items || []) {
            // Check if this specific item has a review
            const { data: reviewData } = await supabase
              .from("reviews")
              .select("id")
              .eq("order_id", order.id)
              .eq("basket_name", item.basket_name)
              .eq("user_id", userId);

            const hasReview = (reviewData?.length || 0) > 0;

            // If order is older than 10 days, mark as completed for review section
            const orderStatus = isOlderThan10Days ? 'completed' : order.status;

            expandedOrders.push({
              ...order,
              status: orderStatus,
              items: [item], // Single item per order
              hasReview: hasReview,
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
          const giftDate = new Date(gift.created_at);
          const isOlderThan10Days = giftDate < tenDaysAgo;

          const { data: reviewData } = await supabase
            .from("reviews")
            .select("id")
            .eq("order_id", gift.order_id)
            .eq("basket_name", gift.basket_name)
            .eq("user_id", userId);

          expandedOrders.push({
            id: gift.order_id,
            created_at: gift.created_at,
            total_amount: gift.price * gift.quantity,
            status: isOlderThan10Days ? "completed" : "pending",
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
            hasReview: (reviewData?.length || 0) > 0,
          });
        }

        setOrders(expandedOrders);
        
        // Set default basket name from first order item
        if (expandedOrders.length > 0 && expandedOrders[0].items.length > 0) {
          setNewReview(prev => ({
            ...prev,
            basketName: expandedOrders[0].items[0].basket_name
          }));
        }
      }

      // Load user reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);
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

  const startReview = (orderId: string, basketName: string) => {
    setReviewForm({
      orderId,
      basketName,
      rating: 5,
      comment: "",
    });
  };

  const submitReview = async () => {
    if (!reviewForm || !user) return;

    setSubmitting(true);
    try {
      const { data: reviewData, error } = await supabase.from("reviews").insert({
        user_id: user.id,
        order_id: reviewForm.orderId,
        basket_name: reviewForm.basketName,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      }).select().single();

      if (error) throw error;

      // Send review to admin email
      try {
        await supabase.functions.invoke('send-review-to-admin', {
          body: { reviewId: reviewData.id }
        });
      } catch (emailError) {
        console.error('Error sending review to admin:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "¡Gracias por tu valoración!",
        description: "Tu opinión nos ayuda a mejorar.",
      });

      setReviewForm(null);
      await loadUserData(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar tu valoración.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitNewReview = async () => {
    if (!user || newReview.rating === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una puntuación.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: reviewData, error } = await supabase.from("reviews").insert({
        user_id: user.id,
        order_id: orders[0]?.id || "demo-order-id",
        basket_name: newReview.basketName,
        rating: newReview.rating,
        comment: newReview.comment,
      }).select().single();

      if (error) throw error;

      // Enviar notificación al administrador
      try {
        await supabase.functions.invoke('send-review-to-admin', {
          body: { reviewId: reviewData.id }
        });
        console.log('Notificación enviada al administrador');
      } catch (emailError) {
        console.error('Error enviando email al admin:', emailError);
        // No mostramos error al usuario, la valoración ya está guardada
      }

      toast({
        title: "¡Valoración enviada!",
        description: "Gracias por tu feedback.",
      });

      // Reload reviews
      await loadUserData(user.id);

      // Reset form
      setNewReview({
        basketName: "Pareja Gourmet",
        rating: 0,
        comment: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar tu valoración.",
      });
    } finally {
      setSubmitting(false);
    }
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
        className="min-h-screen pt-24 pb-12 px-4 relative"
      >
        <img 
          key={activeTab}
          src={activeTab === 'reviews' ? valoracionesBgImg : profileBgImg} 
          alt="Fondo de la página de perfil" 
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500" 
          loading="lazy" 
          style={{ objectPosition: 'center 40%' }} 
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        <div className="container mx-auto max-w-6xl relative z-[2]">
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
            <TabsContent value="orders" className="space-y-6 animate-slide-in-left">
              {/* Active/Paid Orders Only */}
              {orders.filter(o => o.status !== 'completed').length === 0 ? (
                <Card className="bg-transparent border-none">
                  <CardContent className="pt-6 text-center text-white font-poppins font-bold">
                    No tienes pedidos activos.
                  </CardContent>
                </Card>
              ) : (
                orders.filter(o => o.status !== 'completed').map((order) => (
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
                            
                          {!order.hasReview && order.status === "completed" && (
                            <Button
                              onClick={() => startReview(order.id, order.items[0]?.basket_name)}
                              className="w-full mt-4 bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-black font-poppins font-bold"
                            >
                              ⭐ Valorar experiencia.
                            </Button>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6 animate-slide-in-right">
              {/* Orders ready for review (older than 10 days without review) */}
              {orders.filter(o => o.status === 'completed' && !o.hasReview).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bungee text-[hsl(45,100%,65%)] mb-4 tracking-wider">Experiencias por valorar.</h2>
                  {orders.filter(o => o.status === 'completed' && !o.hasReview).map((order) => (
                    <Card key={order.id + order.items[0].basket_name} className="mb-6 bg-transparent border-none shadow-lg">
                      <CardHeader className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start px-4">
                            <div className="flex-1 text-left pr-4">
                              <h3 className="text-xl font-bungee font-bold text-[hsl(45,100%,65%)] mb-2 tracking-wider">
                                {order.items[0].basket_name}.
                              </h3>
                              <p className="text-sm text-white font-poppins font-bold">
                                📅 {new Date(order.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}.
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              {order.items[0] && (() => {
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
                                    className="w-24 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-lg inline-block"
                                    onClick={() => setZoomedImage(imgSrc)}
                                  >
                                    <img 
                                      src={imgSrc} 
                                      alt={item.basket_name}
                                      className="w-full h-auto object-cover"
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <Button
                            onClick={() => startReview(order.id, order.items[0]?.basket_name)}
                            className="w-full bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-black font-poppins font-bold"
                          >
                            ⭐ Valorar esta experiencia.
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Formulario para nueva valoración */}
              <Card className="bg-transparent border-none shadow-lg">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="block mb-2 font-bungee tracking-wider text-[hsl(45,100%,65%)]">Cesta.</label>
                    <select
                      value={newReview.basketName}
                      onChange={(e) => setNewReview({ ...newReview, basketName: e.target.value })}
                      className="w-full p-3 bg-white text-black font-poppins font-bold border-2 border-[hsl(45,100%,65%)]/30 focus:outline-none focus:border-[hsl(45,100%,65%)] hover:border-[hsl(45,100%,65%)] transition-all cursor-pointer" 
                    >
                      {orders.length === 0 ? (
                        <option value="" className="font-poppins font-bold bg-white text-black">No hay pedidos disponibles.</option>
                      ) : (
                        orders.flatMap(o => o.items.map(i => i.basket_name)).map((basketName, idx) => (
                          <option key={`${basketName}-${idx}`} value={basketName} className="font-poppins font-bold bg-white text-black">
                            {basketName}.
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-bungee tracking-wider text-[hsl(45,100%,65%)]">Puntuación.</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        >
                          <Star
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                              star <= newReview.rating
                                ? "fill-[hsl(45,100%,50%)] text-[hsl(45,100%,50%)]"
                                : "text-white hover:text-[hsl(45,100%,50%)]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-bungee tracking-wider text-[hsl(45,100%,65%)]">Comentario.</label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Cuéntanos tu experiencia..."
                      rows={4}
                      className="bg-white text-black font-poppins font-bold border-2 border-[hsl(45,100%,65%)]/30 focus:border-[hsl(45,100%,65%)] placeholder:text-black/50"
                    />
                  </div>
                  <Button
                    onClick={submitNewReview}
                    disabled={submitting}
                    className="w-full bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-black font-poppins font-bold border-none shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar valoración."
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Valoraciones existentes */}
              {reviews.length > 0 && (
                <Card className="bg-transparent border-none shadow-lg">
                  <CardContent className="pt-6">
                    <Collapsible
                      open={openPreviousReviews}
                      onOpenChange={setOpenPreviousReviews}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-bungee tracking-wider">Mis valoraciones anteriores.</h3>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-white hover:text-[hsl(45,100%,65%)] hover:bg-transparent font-poppins font-bold"
                          >
                            {openPreviousReviews ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Ver valoraciones
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="mt-4 space-y-4">
                        {reviews.map((review) => (
                          <Card key={review.id} className="bg-white/10 border-none shadow-lg">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg text-white font-poppins font-bold">{review.basket_name}.</CardTitle>
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
                            <CardContent>
                              <p className="text-white font-poppins font-bold">{review.comment}.</p>
                            </CardContent>
                          </Card>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
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

          {/* Review Form Modal */}
          {reviewForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Valorar: {reviewForm.basketName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Puntuación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          <Star
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                              star <= reviewForm.rating
                                ? "fill-[hsl(45,100%,50%)] text-[hsl(45,100%,50%)]"
                                : "text-gray-300 hover:text-[hsl(45,100%,50%)]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Comentario</label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      placeholder="Cuéntanos tu experiencia..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setReviewForm(null)}
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={submitReview}
                      className="flex-1 bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(271,100%,20%)]"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
