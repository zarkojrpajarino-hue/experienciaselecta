import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import ExperienciaSelectaSection from "@/components/ExperienciaSelectaSection";
import BasketCTASection from "@/components/BasketCTASection";
import FAQHorizontalSection from "@/components/FAQHorizontalSection";
import BottomNavigation from "@/components/BottomNavigation";
import VisualHeader from "@/components/VisualHeader";

// Importar imágenes
import cestaHeroImage from "@/assets/hero-cesta-principal.png";

const Index = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);

        if (session) {
          setShowAuthModal(false);
          sessionStorage.removeItem("hasClosedAuthModal");
          try {
            localStorage.removeItem("oauthInProgress");
          } catch {}

          const hasPendingCheckout = localStorage.getItem("pendingCheckout");
          if (hasPendingCheckout && event === "SIGNED_IN") {
            if (window.location.pathname !== "/checkout") {
              navigate("/checkout", { replace: true });
            }
          }
        } else {
          setShowAuthModal(false);
        }
      }
    });

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        setIsAuthenticated(true);
        setShowAuthModal(false);
        sessionStorage.removeItem("hasClosedAuthModal");
      } else {
        setIsAuthenticated(false);
        setShowAuthModal(false);
      }
    };
    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const locationState = location.state as { preventScroll?: boolean } | null;
    const firstLoadHandled = sessionStorage.getItem("initialLoadHandled");

    if (!firstLoadHandled) {
      sessionStorage.setItem("initialLoadHandled", "true");
      if (location.pathname === "/" && location.hash) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
          window.history.replaceState({}, document.title, "/");
        });
        return;
      }
    }

    if (locationState?.preventScroll) {
      const savedScrollPosition = sessionStorage.getItem("scrollPosition");
      if (savedScrollPosition) {
        const scrollY = parseInt(savedScrollPosition, 10);
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant",
          });
        });
        sessionStorage.removeItem("scrollPosition");
      }
      window.history.replaceState({}, document.title);
      return;
    }

    if (location.hash && firstLoadHandled) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [location.pathname, location.hash, location.state]);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    sessionStorage.setItem("hasClosedAuthModal", "true");
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-background font-work-sans">
      <Navbar />

      <VisualHeader />

      <ExperienciaSelectaSection />

      <BasketCTASection 
        basketImage={cestaHeroImage}
        basketName="Experiencia Selecta"
      />

      <FAQHorizontalSection />

      <BottomNavigation />

      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent
          hideClose
          className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden"
        >
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button
            onClick={() => setIsImageOpen(false)}
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-[1.5rem] overflow-hidden border-2 border-black/10 bg-white">
            <img
              src={cestaHeroImage}
              alt="Cesta de experiencia ampliada"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} onSuccess={handleAuthSuccess} />
    </div>
  );
};

export default Index;
