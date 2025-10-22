import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, Package, LogOut, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";

// Import images
import parejaInicialImg from "@/assets/pareja-inicial-nueva-2.jpg";
import conversacionNaturalImg from "@/assets/conversacion-natural-original.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-2.jpg";
import trioIbericoImg from "@/assets/trio-iberico-nuevo.jpg";
import mesaAbiertaImg from "@/assets/mesa-abierta-nuevo.jpg";
import ibericosSelectosImg from "@/assets/ibericos-selectos-nuevo.jpg";
import familiarClasicaImg from "@/assets/familiar-clasica-nuevo.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica.jpg";
import granTertuliaImg from "@/assets/gran-tertulia-nuevo.jpg";
import celebracionIbericaImg from "@/assets/celebracion-iberica-nuevo.jpg";
import festinSelectoImg from "@/assets/festin-selecto-nuevo.jpg";
import profileBgImg from "@/assets/perfil-marca-final.jpg";
import valoracionesBgImg from "@/assets/valoraciones-background.jpg";

// Mapeo de cestas a imágenes y precios reales
const basketData: Record<string, { imagen: string; precio: number }> = {
  "Pareja Inicial": { imagen: parejaInicialImg, precio: 35 },
  "Conversación Natural (sin alcohol)": { imagen: conversacionNaturalImg, precio: 45 },
  "Pareja Gourmet": { imagen: parejaGourmetImg, precio: 55 },
  "Trio ibérico": { imagen: trioIbericoImg, precio: 45 },
  "Trio Ibérico": { imagen: trioIbericoImg, precio: 45 },
  "Mesa Abierta (sin alcohol)": { imagen: mesaAbiertaImg, precio: 55 },
  "Ibéricos Selectos": { imagen: ibericosSelectosImg, precio: 65 },
  "Familiar clásica": { imagen: familiarClasicaImg, precio: 60 },
  "Experiencia Gastronómica (sin alcohol)": { imagen: experienciaGastronomicaImg, precio: 70 },
  "Gran Tertulia": { imagen: granTertuliaImg, precio: 85 },
  "Celebración Ibérica": { imagen: celebracionIbericaImg, precio: 110 },
  "Festín Selecto": { imagen: festinSelectoImg, precio: 140 },
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

        // Load order items for each order
        const ordersWithItems = await Promise.all(
          (ordersData || []).map(async (order) => {
            const { data: items } = await supabase
              .from("order_items")
              .select("basket_name, basket_category, quantity, price_per_item")
              .eq("order_id", order.id);

            // Check if order has reviews
            const { data: reviewData } = await supabase
              .from("reviews")
              .select("id")
              .eq("order_id", order.id)
              .eq("user_id", userId);

            return {
              ...order,
              items: items || [],
              hasReview: (reviewData?.length || 0) > 0,
            };
          })
        );

        setOrders(ordersWithItems);
        
        // Set default basket name from first order item
        if (ordersWithItems.length > 0 && ordersWithItems[0].items.length > 0) {
          setNewReview(prev => ({
            ...prev,
            basketName: ordersWithItems[0].items[0].basket_name
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
        style={{
          backgroundImage: `url(${activeTab === 'reviews' ? valoracionesBgImg : profileBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // backgroundAttachment: 'fixed', // removed for mobile compatibility
          backgroundColor: 'hsl(var(--petroleo))'
        }}
      >
        <img src={activeTab === 'reviews' ? valoracionesBgImg : profileBgImg} alt="Fondo de la página de perfil" className="absolute inset-0 w-full h-full object-cover z-0 rounded-3xl" loading="lazy" />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(45,100%,50%)]/25 to-black/50 z-[1]" />
        <div className="container mx-auto max-w-6xl relative z-[2]">
          {/* Header with Logout */}
          <div className="mb-8 flex justify-end">
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
              <TabsTrigger value="orders" className="gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-bold">
                <Package className="w-4 h-4" />
                <span className="block">
                  <span className="font-cormorant font-light italic text-sm block">Mis</span>
                  <span className="font-cinzel font-black uppercase text-base block">Pedidos</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2 text-white data-[state=active]:text-[hsl(45,100%,65%)] border-b-2 border-transparent data-[state=active]:border-[hsl(45,100%,65%)] rounded-none bg-transparent font-bold">
                <Star className="w-4 h-4" />
                <span className="block">
                  <span className="font-cormorant font-light italic text-sm block">Mis</span>
                  <span className="font-cinzel font-black uppercase text-base block">Valoraciones</span>
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6 animate-slide-in-left">
              {orders.filter(o => o.status !== 'completed').slice(0, 1).length === 0 ? (
                <Card className="bg-transparent border-none">
                  <CardContent className="pt-6 text-center text-white">
                    No tienes pedidos activos
                  </CardContent>
                </Card>
              ) : (
                orders.filter(o => o.status !== 'completed').slice(0, 1).map((order) => (
                  <Card key={order.id} className="overflow-hidden bg-transparent border-none shadow-none">
                    <CardHeader className="p-6">
                      <Collapsible
                        open={openOrders[order.id]}
                        onOpenChange={() => setOpenOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start px-4">
                            <div className="flex-1 text-right pr-4">
                              <h2 className="text-3xl font-cinzel font-bold text-[hsl(45,100%,65%)] mb-2">
                                ¡Enhorabuena!
                              </h2>
                              <p className="text-sm text-white font-bold">
                                📅 {new Date(order.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="flex-1 text-center px-4">
                              <p className="font-bold text-white text-3xl">
                                {(
                                  order.items.reduce((sum, i) => sum + ((basketData[i.basket_name]?.precio ? basketData[i.basket_name].precio * 100 : i.price_per_item) * i.quantity), 0) / 100
                                ).toFixed(2)}€
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-sm text-green-400 font-bold">
                                ✓ PAGADO
                              </p>
                            </div>
                          </div>

                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-center gap-2 text-white hover:text-[hsl(45,100%,65%)] hover:bg-transparent uppercase font-bold transition-colors"
                            >
                              {openOrders[order.id] ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ocultar detalles
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Ver detalles del pedido
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
                                  <p className="font-bold text-white inline">{item.basket_name}</p>
                                  <p className="text-sm text-white font-bold inline ml-2">{( (basketData[item.basket_name]?.precio ?? (item.price_per_item / 100)) ).toFixed(2)}€</p>
                                </div>
                              ))}
                            </div>

                            {/* Imagen de la cesta en el centro */}
                            <div className="flex justify-center items-start">
                              {order.items[0] && basketData[order.items[0].basket_name] && (
                                <div 
                                  className="w-32 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                                  onClick={() => setZoomedImage(basketData[order.items[0].basket_name].imagen)}
                                >
                                  <img 
                                    src={basketData[order.items[0].basket_name].imagen} 
                                    alt={order.items[0].basket_name}
                                    className="w-full h-auto object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            {/* Dirección de envío - escalera de derecha a izquierda bajando */}
                            <div className="flex flex-col items-end justify-start h-full">
                              <p className="text-sm text-white font-bold">{order.shipping_address_line1}</p>
                              {order.shipping_address_line2 && (
                                <p className="text-sm text-white font-bold">{order.shipping_address_line2}</p>
                              )}
                              <p className="text-sm text-white font-bold">{order.shipping_city}, {order.shipping_postal_code}</p>
                              <p className="text-sm text-white font-bold">{order.shipping_country}</p>
                            </div>
                          </div>
                            
                          {!order.hasReview && order.status === "completed" && (
                            <Button
                              onClick={() => startReview(order.id, order.items[0]?.basket_name)}
                              className="w-full mt-4 bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(271,100%,20%)]"
                            >
                              ⭐ Valorar Experiencia
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
              {/* Formulario para nueva valoración */}
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="space-y-4">
                  <div>
                    <label className="block mb-2 font-bold text-[hsl(45,100%,65%)]">Cesta</label>
                    <select
                      value={newReview.basketName}
                      onChange={(e) => setNewReview({ ...newReview, basketName: e.target.value })}
                      className="w-full p-2 rounded bg-white/90 text-black font-bold uppercase border-none focus:outline-none hover:bg-white transition-all cursor-pointer" 
                    >
                      {orders.length === 0 ? (
                        <option value="" className="font-bold uppercase bg-white text-black">No hay pedidos disponibles</option>
                      ) : (
                        Array.from(new Set(orders.flatMap(o => o.items.map(i => i.basket_name)))).map((basketName) => (
                          <option key={basketName} value={basketName} className="font-bold uppercase bg-white text-black">
                            {basketName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-bold text-[hsl(45,100%,65%)]">Puntuación</label>
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
                                : "text-black hover:text-[hsl(45,100%,50%)]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-bold text-[hsl(45,100%,65%)]">Comentario</label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Cuéntanos tu experiencia..."
                      rows={4}
                      className="bg-transparent text-white font-bold border-white/30 placeholder:text-white/50"
                    />
                  </div>
                  <Button
                    onClick={submitNewReview}
                    disabled={submitting}
                    className="w-full bg-transparent hover:bg-transparent text-white font-extrabold uppercase border-none shadow-none transition-all duration-300 hover:text-[hsl(45,100%,65%)] hover:drop-shadow-[0_0_20px_rgba(218,165,32,0.8)] disabled:opacity-100"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Valoración"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Valoraciones existentes */}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-bold">Mis Valoraciones Anteriores</h3>
                  {reviews.map((review) => (
                    <Card key={review.id} className="bg-transparent border-none shadow-none">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-white font-bold">{review.basket_name}</CardTitle>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? "fill-[hsl(45,100%,65%)] text-[hsl(45,100%,65%)]"
                                    : "text-black"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-white font-bold">
                          {new Date(review.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white font-bold">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Image Zoom Modal */}
          {zoomedImage && (
            <div 
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 cursor-pointer"
              onClick={() => setZoomedImage(null)}
            >
              <img 
                src={zoomedImage} 
                alt="Cesta ampliada"
                className="max-w-full max-h-full object-cover rounded-lg"
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
