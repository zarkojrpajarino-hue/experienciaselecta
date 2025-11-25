import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Info } from "lucide-react";
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
import experienciaFamiliaCestaImg from "@/assets/experiencia-padel-cesta-clean.png";
import selectaJamonPizarraImg from "@/assets/selecta-jamon-pizarra-clean.png";
import faqPrimeraImagen from "@/assets/nueva-seccion-10.jpg";
import faqDuracionExperiencia from "@/assets/faq-pates-gourmet-final.png";
import faqDesconocidosEncuentro from "@/assets/faq-desconocidos-encuentro.jpg";
import faqGarantiaSatisfaccion from "@/assets/faq-embutidos-ibericos-final.png";
import cestaHeroImage from "@/assets/hero-cesta-principal.png";

const Index = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Datos para los carruseles
  const experienciaSelectaSlides = [
    {
      image: experienciaFamiliaCestaImg,
      backgroundColor: "#FFFFFF",
      textColor: "#D4AF37",
      navigationColor: "#ff1493",
      content: (
        <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <h3
              onClick={() => navigate("/nuestra-identidad#experiencia")}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-poppins font-bold leading-tight cursor-pointer"
              style={{ color: "#000000" }}
            >
              Experiencia
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/nuestra-identidad#experiencia")}
              className="p-0 bg-transparent border-0 transition-all duration-300"
              style={{ color: "#00BFFF" }}
            >
              <Info className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: "#00BFFF" }} />
            </motion.button>
          </div>
          <p
            className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize"
            style={{ color: "#00BFFF" }}
          >
            Momentos que conectan.
          </p>
        </div>
      ),
    },
    {
      image: selectaJamonPizarraImg,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <h3
              onClick={() => navigate("/nuestra-identidad#selecta")}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-poppins font-bold leading-tight cursor-pointer"
              style={{ color: "#000000" }}
            >
              Selecta
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/nuestra-identidad#selecta")}
              className="p-0 bg-transparent border-0 transition-all duration-300"
              style={{ color: "#ff1493" }}
            >
              <Info className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: "#ff1493" }} />
            </motion.button>
          </div>
          <p
            className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize"
            style={{ color: "#ff1493" }}
          >
            Calidad sin igual.
          </p>
        </div>
      ),
    },
  ];

  const faqSlides = [
    {
      image: faqPrimeraImagen,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿qué incluye cada cesta?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            <span className="font-bold" style={{ color: "#FFD700" }}>
              Contenido
            </span>{" "}
            <span className="font-bold" style={{ color: "#FFD700" }}>
              exclusivo
            </span>{" "}
            <span className="font-bold" style={{ color: "#FFD700" }}>
              personalizado
            </span>
            .
          </p>
        </>
      ),
    },
    {
      image: faqDuracionExperiencia,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿cuánto dura la experiencia?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            A tu{" "}
            <span className="font-bold" style={{ color: "#ff1493" }}>
              ritmo
            </span>
            .
          </p>
        </>
      ),
    },
    {
      image: faqDesconocidosEncuentro,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿para desconocidos?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            Cestas para{" "}
            <span className="font-bold" style={{ color: "#00BFFF" }}>
              primeros encuentros
            </span>
            .
          </p>
        </>
      ),
    },
    {
      image: faqGarantiaSatisfaccion,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿calidad de productos?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            <span className="font-bold" style={{ color: "#FFD700" }}>
              Certificada
            </span>
            .
          </p>
        </>
      ),
    },
  ];

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

      <ExperienciaSelectaSection slides={experienciaSelectaSlides} />

      <BasketCTASection />

      <FAQHorizontalSection slides={faqSlides} />

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
