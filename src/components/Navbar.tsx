import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
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
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleNavigation = (item: {
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
  };
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

  const navigateToSection = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSectionIndex();
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + navItems.length) % navItems.length
      : (currentIndex + 1) % navItems.length;
    handleNavigation(navItems[newIndex]);
  };
  if (location.pathname !== '/') { return null; }
  return <motion.nav initial={{
    y: -100,
    opacity: 0
  }} animate={{
    y: isScrolled ? 0 : -100,
    opacity: isScrolled ? 1 : 0
  }} transition={{
    duration: 0.3
  }} className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{
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

          {/* Right: User, Cestas Button, Cart and Menu */}
          <div className="flex items-center gap-2">
            {/* User Button */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/perfil")}
                className="p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
                aria-label="Mi perfil"
              >
                <User size={20} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-white hover:text-[hsl(45,100%,65%)] rounded-lg transition-all duration-300"
                aria-label="Iniciar sesión"
              >
                <User size={20} />
              </motion.button>
            )}

            {/* Cart Button - Only show if cart has items */}
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
                            onClick={() => removeFromCart(item.id)}
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
                  {navItems.map((item, index) => <motion.button key={item.id} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.05
              }} onClick={() => handleNavigation(item)} className="group relative w-full px-4 py-2.5 text-center font-playfair font-bold text-sm tracking-wide text-black hover:text-[hsl(45,100%,50%)] transition-all duration-300 overflow-hidden flex items-center justify-center whitespace-nowrap">
                      <span className="relative z-10">{item.label}</span>
                      <motion.div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(45,100%,50%)] to-transparent origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{
                  boxShadow: '0 0 10px hsl(45 100% 50%)'
                }} />
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(45,100%,70%)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>)}
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