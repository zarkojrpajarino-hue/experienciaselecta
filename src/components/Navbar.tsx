import { useState, useEffect, useCallback, useMemo } from "react";
import { throttle } from "@/utils/throttle";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight, ShoppingCart, User, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "./AuthModal";
import logo from "@/assets/logo-experiencia-selecta.png";
import headerBg from "@/assets/iberian-products-background.jpg";
import dropdownBg from "@/assets/jamon-iberico-traditional.jpg";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [pendingGiftsCount, setPendingGiftsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [hasPendingFeedback, setHasPendingFeedback] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalItems, getTotalAmount, removeFromCart } = useCart();
  const { toast } = useToast();

  // Check auth status with proper session persistence
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Send welcome email on new Google login
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer to next tick to avoid blocking
        setTimeout(async () => {
          try {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', session.user.id)
              .single();

            const { data, error } = await supabase.functions.invoke('send-welcome-email', {
              body: {
                userEmail: session.user.email,
                userName: profiles?.name || session.user.user_metadata?.name || 'amigo'
              }
            });
            
            if (error) {
              console.error('Error sending welcome email:', error);
            } else {
              console.log('Welcome email sent successfully');
            }
          } catch (error) {
            console.error('Error sending welcome email:', error);
          }
        }, 0);
      }

      // Redirigir tras login: SIEMPRE ir a checkout
      if (event === 'SIGNED_IN') {
        try { localStorage.removeItem('pendingCheckout'); } catch {}
        try { localStorage.removeItem('oauthInProgress'); } catch {}
        if (location.pathname !== '/checkout') {
          window.location.assign('/checkout');
        }
      }

      if (session?.user) {
        checkPendingGifts(session.user.email!);
        checkPendingReviews(session.user.id);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkPendingGifts(session.user.email!);
        checkPendingReviews(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, getTotalItems]);

  // Listen for pending feedback changes (session-based)
  useEffect(() => {
    const update = () => {
      const hasPending = !!sessionStorage.getItem('pendingPurchaseFeedback');
      const given = !!sessionStorage.getItem('feedbackGiven');
      setHasPendingFeedback(hasPending && !given);
    };
    update();
    window.addEventListener('pendingFeedbackChanged', update);
    return () => window.removeEventListener('pendingFeedbackChanged', update);
  }, []);

  const checkPendingGifts = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('pending_gifts')
        .select('id')
        .eq('recipient_email', email)
        .eq('shipping_completed', false);

      if (!error && data) {
        setPendingGiftsCount(data.length);
      }
    } catch (error) {
      console.error('Error checking pending gifts:', error);
    }
  }, []);

  const checkPendingReviews = useCallback(async (userId: string) => {
    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!customerData) return;

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .lt('created_at', tenDaysAgo.toISOString());

      if (!ordersData || ordersData.length === 0) {
        setPendingReviewsCount(0);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('user_id', userId);

      const reviewedOrderIds = new Set(reviewsData?.map(r => r.order_id) || []);
      const pendingCount = ordersData.filter(o => !reviewedOrderIds.has(o.id)).length;
      
      setPendingReviewsCount(pendingCount);
    } catch (error) {
      console.error('Error checking pending reviews:', error);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };
  useEffect(() => {
    const getScrollTop = () =>
      (typeof window !== 'undefined' && typeof window.pageYOffset === 'number' ? window.pageYOffset : 0) ||
      (typeof window !== 'undefined' && typeof window.scrollY === 'number' ? window.scrollY : 0) ||
      (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0) ||
      (typeof document !== 'undefined' ? (document.body?.scrollTop ?? 0) : 0);

    const THRESHOLD = 12; // Evita falsos positivos al cargar

    const handleScroll = throttle(() => {
      const top = getScrollTop();
      const scrolled = top > THRESHOLD;
      if (scrolled && !hasRevealed) setHasRevealed(true);
      setIsScrolled(scrolled || hasRevealed);
    }, 100);

    const bind = (target: any, event: string) => target.addEventListener(event, handleScroll, { passive: true });
    const unbind = (target: any, event: string) => target.removeEventListener(event, handleScroll);

    ['scroll', 'wheel', 'touchmove', 'resize'].forEach((evt) => {
      bind(window, evt);
      bind(document, evt);
    });

    document.addEventListener('visibilitychange', handleScroll);

    return () => {
      ['scroll', 'wheel', 'touchmove', 'resize'].forEach((evt) => {
        unbind(window, evt);
        unbind(document, evt);
      });
      document.removeEventListener('visibilitychange', handleScroll);
    };
  }, [hasRevealed]);
  // Reset reveal when entering home (hide until scroll again)
  useEffect(() => {
    if (location.pathname === '/') {
      setHasRevealed(false);
      setIsScrolled(false);
    }
  }, [location.pathname]);
  const handleNavigation = useCallback((item: {
    label: string;
    id: string;
    route?: string;
  }) => {
    setIsMobileMenuOpen(false);
    if (item.route) {
      navigate(item.route);
      const hash = item.route.split('#')[1];
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }, 100);
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    } else {
      // If we're not on the homepage, navigate there first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.getElementById(item.id);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth"
            });
          }
        }, 100);
      } else {
        // We're on homepage, just scroll
        const element = document.getElementById(item.id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    }
  }, [navigate, location.pathname]);
  const navItems = [{
    label: "Experiencia selecta.",
    id: "experiencia-selecta",
    route: "/experiencia-selecta"
  }, {
    label: "Sobre nosotros.",
    id: "sobre-nosotros",
    route: "/sobre-nosotros-detalle#porque-elegirnos-section"
  }, {
    label: "Nuestros clientes.",
    id: "nuestros-clientes",
    route: "/nuestros-clientes"
  }, {
    label: "Preguntas frecuentes.",
    id: "preguntas-frecuentes",
    route: "/preguntas-frecuentes"
  }];

  const getCurrentSectionIndex = () => {
    return navItems.findIndex(item => item.id === location.hash.replace('#', ''));
  };

  const navigateToSection = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSectionIndex();
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + navItems.length) % navItems.length
      : (currentIndex + 1) % navItems.length;
    handleNavigation(navItems[newIndex]);
  }, [handleNavigation, location.hash]);
  
  // Mostrar navbar siempre en páginas que no son home, o en home cuando se ha revelado por scroll
  const shouldShowNavbar = location.pathname !== '/' || (isScrolled || hasRevealed) || getTotalItems() > 0;

  return <motion.nav initial={{
    y: location.pathname === '/' ? -100 : 0,
    opacity: location.pathname === '/' ? 0 : 1
  }} animate={{
    y: shouldShowNavbar ? 0 : -100,
    opacity: shouldShowNavbar ? 1 : 0
  }} transition={{
    duration: 0.3
  }} className="sticky top-0 z-50 shadow-lg" style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${headerBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Title with Glow Effect */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            className="text-base md:text-lg font-playfair font-bold tracking-wider cursor-pointer" 
            style={{
              color: 'hsl(45 100% 65%)',
              textShadow: '0 0 4px rgba(218, 165, 32, 0.3), 0 0 8px rgba(218, 165, 32, 0.2)',
              letterSpacing: '0.1em'
            }}
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            EXPERIENCIA SELECTA
          </motion.h1>

          {/* Right: User, Gift, Cart and Menu */}
          <div className="flex items-center gap-2">
            {/* User Button with Badge */}
            {user ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/perfil")}
                    className="relative p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
                    aria-label="Mi perfil"
                  >
                    <User size={20} />
                    {pendingReviewsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {pendingReviewsCount}
                      </motion.span>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pendingReviewsCount > 0 ? 'Experiencias por valorar' : 'Mi perfil'}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}


            {/* Pending Gifts Badge */}
            {user && pendingGiftsCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/regalos')}
                    className="relative p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
                    aria-label="Ver regalos pendientes"
                  >
                    <Gift size={20} />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {pendingGiftsCount}
                    </motion.span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regalos pendientes</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Cart Button - Show whenever cart has items (with or without login) */}
            {getTotalItems() > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCartPreview(!showCartPreview)}
                className="relative p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={24} />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{
                    boxShadow: '0 0 10px rgba(218, 165, 32, 0.6)'
                  }}
                >
                  {getTotalItems()}
                </motion.span>
              </motion.button>
            )}

            {/* Hamburger Menu Button */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="relative z-50 p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              {hasPendingFeedback && (
                <span
                  className="absolute -top-1 -right-1 bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] text-[10px] font-bold rounded-full px-1.5 h-5 flex items-center justify-center shadow"
                  aria-label="Feedback pendiente"
                >
                  +1
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Cart Preview Dropdown */}
        <AnimatePresence>
          {showCartPreview && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
                onClick={() => setShowCartPreview(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-4 mt-2 rounded-xl shadow-2xl z-50 w-[320px] max-h-[400px] overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.98)), url(${headerBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid hsl(45 100% 65%)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 20px rgba(218,165,32,0.3)'
                }}
              >
                <div className="p-4 border-b border-[hsl(45,100%,65%)]/30">
                  <h3 className="font-playfair font-bold text-[hsl(271,100%,20%)] flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[hsl(45,100%,65%)]" />
                    Tu Carrito
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-[250px] p-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-[hsl(271,100%,20%)]/60 py-8">
                      Tu carrito está vacío
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                          <img 
                            src={item.imagen} 
                            alt={item.nombre}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[hsl(271,100%,20%)] truncate">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-[hsl(271,100%,20%)]/60">
                              {item.quantity} x {item.precio}€
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.isGift)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 border-t border-[hsl(45,100%,65%)]/30 bg-white/70">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-playfair font-bold text-[hsl(271,100%,20%)]">Total:</span>
                      <span className="font-playfair font-bold text-lg text-[hsl(45,100%,65%)]">
                        {getTotalAmount().toFixed(2)}€
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setShowCartPreview(false);
                        navigate('/carrito');
                      }}
                      className="w-full bg-[hsl(45,100%,65%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(271,100%,20%)] font-bold"
                    >
                      Ver Carrito Completo
                    </Button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Navigation Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && <>
              {/* Backdrop */}
              <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
              
              {/* Dropdown Menu */}
              <motion.div initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl shadow-2xl z-50 w-[200px] overflow-hidden" style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${headerBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: '2px solid hsl(45 100% 65%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 20px rgba(218,165,32,0.3)'
          }}>
                <div className="py-2">
                  {/* Botón Regalar con emoji */}
                  <motion.button 
                    initial={{
                      opacity: 0,
                      x: -20
                    }} 
                    animate={{
                      opacity: 1,
                      x: 0
                    }} 
                    transition={{
                      delay: 0
                    }} 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/comprar-cestas');
                    }}
                    className="group relative w-full px-4 py-2.5 text-center font-playfair font-bold text-sm tracking-wide text-black hover:text-[hsl(45,100%,50%)] transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span className="text-xl">🎁</span>
                    <span className="relative z-10">Regalar.</span>
                    <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(45,100%,50%)] to-transparent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{
                      boxShadow: '0 0 10px hsl(45 100% 50%)'
                    }} />
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(45,100%,70%)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  {navItems.map((item, index) => <motion.button key={item.id} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: (index + 1) * 0.05
              }} onClick={() => handleNavigation(item)} className="group relative w-full px-4 py-2.5 text-center font-playfair font-bold text-sm tracking-wide text-black hover:text-[hsl(45,100%,50%)] transition-all duration-300 overflow-hidden flex items-center justify-center whitespace-nowrap">
                      <span className="relative z-10">{item.label}</span>
                      <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(45,100%,50%)] to-transparent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{
                  boxShadow: '0 0 10px hsl(45 100% 50%)'
                }} />
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(45,100%,70%)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>)}

                  {/* Feedback button */}
                  <motion.button 
                    initial={{
                      opacity: 0,
                      x: -20
                    }} 
                    animate={{
                      opacity: 1,
                      x: 0
                    }} 
                    transition={{
                      delay: (navItems.length + 1) * 0.05
                    }} 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/feedback');
                    }}
                    className="group relative w-full px-4 py-2.5 text-center font-playfair font-bold text-sm tracking-wide text-[hsl(45,100%,50%)] hover:text-[hsl(45,100%,60%)] transition-all duration-300 overflow-hidden flex items-center justify-center whitespace-nowrap"
                  >
                    <span className="relative z-10">Feedback.</span>
                    {hasPendingFeedback && (
                      <span
                        className="absolute top-2 right-4 bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] text-[10px] font-bold rounded-full px-1.5 h-5 flex items-center justify-center shadow"
                        aria-label="Feedback pendiente"
                      >
                        +1
                      </span>
                    )}
                    <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(45,100%,50%)] to-transparent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{
                      boxShadow: '0 0 10px hsl(45 100% 50%)'
                    }} />
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(45,100%,70%)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
              </motion.div>
            </>}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </motion.nav>;
};
export default Navbar;