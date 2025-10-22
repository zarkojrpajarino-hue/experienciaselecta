import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Info, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import AuthModal from "@/components/AuthModal";
import ContactModal from "@/components/ContactModal";
import ScrollDownIndicator from "@/components/ScrollDownIndicator";
import { supabase } from "@/integrations/supabase/client";
import RoundedImageCarousel from "@/components/RoundedImageCarousel";
import ExperienciaSelectaSection from "@/components/ExperienciaSelectaSection";
import BasketCTASection from "@/components/BasketCTASection";
import BasketCategories from "@/components/BasketCategories";
import ClickableImage from "@/components/ClickableImage";
import FAQHorizontalSection from "@/components/FAQHorizontalSection";
import BottomNavigation from "@/components/BottomNavigation";
import VisualHeader from "@/components/VisualHeader";
import experienciaFamiliaCestaImg from "@/assets/experiencia-padel-cesta-clean.png";
import aboutBackgroundImg from "@/assets/sobre-nosotros-hero-final.jpg";
import jamonPinzasImg from "@/assets/jamon-pinzas-primera.png";
import cestaHeroImage from "@/assets/hero-cesta-principal.png";
import heroEmbrutidoAlmendrasImg from "@/assets/hero-plato-embutido-almendras.png";
import selectaJamonPizarraImg from "@/assets/selecta-jamon-pizarra-clean.png";
import nuevaSeccion01Img from "@/assets/nueva-seccion-01-clean.png";
import nuevaSeccion02Img from "@/assets/nueva-seccion-02-clean.png";
import nuevaSeccion03Img from "@/assets/nueva-seccion-03.png";
import nuevaSeccion04Img from "@/assets/nueva-seccion-04-clean.png";
import nuevaSeccion05Img from "@/assets/nueva-seccion-05-clean.png";
import nuevaSeccion06Img from "@/assets/nueva-seccion-06-clean.png";
import planDiferenteImg from "@/assets/beneficio-diferente-torre-pimientos.png";
import cuandoDondeQuierasImg from "@/assets/nueva-seccion-03.jpg";
import conocerEscucharImg from "@/assets/nueva-seccion-04-final.jpg";
import momentosUnicosImg from "@/assets/nueva-seccion-05-final.jpg";
import conversacionesProfundasImg from "@/assets/proposito-planes-final.png";
import alternativaAsequibleImg from "@/assets/beneficio-tiempo-enrollados.png";
import valoresTablaIbericosImg from "@/assets/valores-tabla-ibericos-final.jpg";
import valoresTostasAceiteImg from "@/assets/valores-tostas-aceite-final.jpg";
import valoresJamonTablaImg from "@/assets/valores-jamon-tabla.jpg";
import valoresEmbutidosVinoImg from "@/assets/valores-embutidos-vino-final.png";
import valoresConversacionImg from "@/assets/valores-conversacion-nueva.png";
import parejaInicialImg from "@/assets/pareja-inicial-nueva-2.jpg";
import conversacionNaturalImg from "@/assets/conversacion-natural-original.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-2.jpg";
import ibericosSelectosImg from "@/assets/ibericos-selectos-nuevo.jpg";
import familiarClasicaImg from "@/assets/familiar-clasica-nuevo.jpg";
import granTertuliaImg from "@/assets/gran-tertulia-nuevo.jpg";
import mesaAbiertaImg from "@/assets/mesa-abierta-nuevo.jpg";
import celebracionIbericaImg from "@/assets/celebracion-iberica-nuevo.jpg";
import familiaCestaExperienciaImg from "@/assets/experiencia-familia-cesta-clean.png";
import festinSelectoImg from "@/assets/festin-selecto-nuevo.jpg";
import faqPrimeraImagen from "@/assets/nueva-seccion-10.jpg";
import faqDuracionExperiencia from "@/assets/faq-pates-gourmet-final.png";
import faqDesconocidosEncuentro from "@/assets/faq-desconocidos-encuentro.jpg";
import faqGarantiaSatisfaccion from "@/assets/faq-embutidos-ibericos-final.png";
const Index = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Datos para los carruseles
  const experienciaSelectaSlides = [{
    image: experienciaFamiliaCestaImg,
    backgroundColor: "#FFFFFF",
    textColor: "#D4AF37",
    navigationColor: "#ff1493",
    content: <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <h3 
              onClick={() => navigate('/nuestra-identidad#experiencia')}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-tight cursor-pointer" 
              style={{ color: '#000000' }}
            >
              Experiencia
            </h3>
            <motion.button whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }} onClick={() => navigate('/nuestra-identidad#experiencia')} className="p-0 bg-transparent border-0 transition-all duration-300" style={{
              color: '#00BFFF'
            }}>
              <Info className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#00BFFF' }} />
            </motion.button>
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize" style={{ color: '#00BFFF' }}>
            Momentos que conectan.
          </p>
        </div>
  }, {
    image: selectaJamonPizarraImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <h3 
              onClick={() => navigate('/nuestra-identidad#selecta')}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-tight cursor-pointer" 
              style={{ color: '#000000' }}
            >
              Selecta
            </h3>
            <motion.button whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }} onClick={() => navigate('/nuestra-identidad#selecta')} className="p-0 bg-transparent border-0 transition-all duration-300" style={{
              color: '#ff1493'
            }}>
              <Info className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#ff1493' }} />
            </motion.button>
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize" style={{ color: '#ff1493' }}>
            Calidad sin igual.
          </p>
        </div>
  }];
  const processSlides = [
    { image: nuevaSeccion01Img, title: "<span style='color: black;'>Creamos <span style='color: #FFD700; font-weight: bold;'>experiencias</span> para que vosotros conozcáis a <span style='color: #FFD700; font-weight: bold;'>personas</span>.</span>" },
    { image: nuevaSeccion02Img, title: "<span style='color: black;'>Transformamos <span style='color: #FFD700; font-weight: bold;'>productos gourmet</span> en un plan <span style='color: #FFD700; font-weight: bold;'>alternativo</span>, <span style='color: #FFD700; font-weight: bold;'>personalizado</span> y <span style='color: #FFD700; font-weight: bold;'>asequible</span>.</span>" },
    { image: nuevaSeccion03Img, title: "<span style='color: black;'>Cada cesta incluye un <span style='color: #FFD700; font-weight: bold;'>QR</span>, que te guía hacia una <span style='color: #FFD700; font-weight: bold;'>experiencia única</span>, con <span style='color: #FFD700; font-weight: bold;'>dinámicas diseñadas</span> para tu grupo.</span>" },
    { image: nuevaSeccion04Img, title: "<span style='color: black;'>Estas actividades fomentan <span style='color: #FFD700; font-weight: bold;'>conversaciones reales</span>, <span style='color: #FFD700; font-weight: bold;'>vínculos profundos</span>, y el valor de mostrarse <span style='color: #FFD700; font-weight: bold;'>vulnerable</span>.</span>" },
    { image: nuevaSeccion05Img, title: "<span style='color: black;'>Convertimos una comida excepcional en una <span style='color: #FFD700; font-weight: bold;'>experiencia emocional</span>, <span style='color: #FFD700; font-weight: bold;'>memorable</span>.</span>" },
    { image: nuevaSeccion06Img, title: "<span style='color: black;'>Hacemos posible un <span style='color: #FFD700; font-weight: bold;'>ocio distinto</span>, rompemos la <span style='color: #FFD700; font-weight: bold;'>monotonía</span>, y devolvemos <span style='color: #FFD700; font-weight: bold;'>sentido</span> a compartir.</span>" }
  ];
  const benefitsSlides = [{
    image: planDiferenteImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            busca lo distinto.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#00BFFF' }}>diferente</span> es <span className="font-bold" style={{ color: '#00BFFF' }}>atreverse</span>.
          </p>
        </>
  }, {
    image: cuandoDondeQuierasImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            pausa para vivir.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#FFD700' }}>pausa</span> es <span className="font-bold" style={{ color: '#FFD700' }}>vivir</span>.
          </p>
        </>
  }, {
    image: conocerEscucharImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            ver no es conocer.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#ff1493' }}>conocer es</span> <span className="font-bold" style={{ color: '#ff1493' }}>escuchar</span>.
          </p>
        </>
  }, {
    image: momentosUnicosImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            lo valioso lleva tiempo.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            lo <span className="font-bold" style={{ color: '#00BFFF' }}>bueno</span> necesita <span className="font-bold" style={{ color: '#00BFFF' }}>tiempo</span>.
          </p>
        </>
  }, {
    image: conversacionesProfundasImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            planes con propósito.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            falta <span className="font-bold" style={{ color: '#FFD700' }}>propósito</span>.
          </p>
        </>
  }, {
    image: alternativaAsequibleImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFFFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            sobremesas reales.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            ocupar no es <span className="font-bold" style={{ color: '#ff1493' }}>disfrutar</span>.
          </p>
        </>
  }];
  const valuesSlides = [{
    image: valoresTablaIbericosImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <p className="font-bold lowercase first-letter:capitalize">
          Productores <span className="font-bold" style={{ color: '#00BFFF' }}>locales</span>.
        </p>
  }, {
    image: valoresTostasAceiteImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <p className="font-bold lowercase first-letter:capitalize">
          <span className="font-bold" style={{ color: '#FFD700' }}>Tradición</span> <span className="font-bold" style={{ color: '#FFD700' }}>española</span> con <span className="font-bold" style={{ color: '#FFD700' }}>dinámicas modernas</span>.
        </p>
  }, {
    image: valoresEmbutidosVinoImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <p className="font-bold lowercase first-letter:capitalize">
          Los mejores <span className="font-bold" style={{ color: '#ff1493' }}>recuerdos</span> <span className="font-bold" style={{ color: '#ff1493' }}>se viven</span>, no se graban.
        </p>
  }, {
    image: valoresConversacionImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <p className="font-bold lowercase first-letter:capitalize">
          Hablamos más pero <span className="font-bold" style={{ color: '#00BFFF' }}>escuchamos menos</span>.
        </p>
  }];
  const faqSlides = [{
    image: faqPrimeraImagen,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿qué incluye cada cesta?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            <span className="font-bold" style={{ color: '#FFD700' }}>Contenido</span> <span className="font-bold" style={{ color: '#FFD700' }}>exclusivo</span> <span className="font-bold" style={{ color: '#FFD700' }}>personalizado</span>.
          </p>
        </>
  }, {
    image: faqDuracionExperiencia,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿cuánto dura la experiencia?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            A tu <span className="font-bold" style={{ color: '#ff1493' }}>ritmo</span>.
          </p>
        </>
  }, {
    image: faqDesconocidosEncuentro,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿para desconocidos?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            Cestas para <span className="font-bold" style={{ color: '#00BFFF' }}>primeros encuentros</span>.
          </p>
        </>
  }, {
    image: faqGarantiaSatisfaccion,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    content: <>
          <h3 className="text-xl md:text-2xl font-work-sans font-bold mb-4 lowercase first-letter:uppercase">
            ¿calidad de productos?
          </h3>
          <p className="lowercase first-letter:capitalize font-bold">
            <span className="font-bold" style={{ color: '#FFD700' }}>Certificada</span>.
          </p>
        </>
  }];
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        if (session) {
          setShowAuthModal(false);
          // Limpiar el flag si el usuario inicia sesión
          sessionStorage.removeItem('hasClosedAuthModal');
        }
      }
    });

    // THEN check for existing session
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        // Usuario ya tiene sesión activa - NO mostrar modal
        setIsAuthenticated(true);
        setShowAuthModal(false);
      } else {
        // Usuario NO tiene sesión
        setIsAuthenticated(false);

        // Solo mostrar modal si no lo ha cerrado antes en esta sesión
        const hasClosedAuthModal = sessionStorage.getItem('hasClosedAuthModal');
        if (!hasClosedAuthModal) {
          setTimeout(() => {
            if (mounted) {
              setShowAuthModal(true);
            }
          }, 1000);
        }
      }
    };
    checkAuth();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle scroll behavior on navigation
  useEffect(() => {
    const locationState = location.state as { preventScroll?: boolean } | null;
    
    // If preventScroll is set, restore the saved scroll position smoothly
    if (locationState?.preventScroll) {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition) {
        const scrollY = parseInt(savedScrollPosition, 10);
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: 'instant' // Instant to avoid white flash
          });
        });
        sessionStorage.removeItem('scrollPosition');
      }
      // Clear the state so future navigation works normally
      window.history.replaceState({}, document.title);
      return;
    }
    
    // If there's a hash, scroll to that section
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [location.pathname, location.hash, location.state]);
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Guardar en sessionStorage que el usuario cerró el modal
    sessionStorage.setItem('hasClosedAuthModal', 'true');
  };
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsAuthenticated(true);
  };
  return <div className="min-h-screen bg-background font-work-sans">
      <Navbar />
      {/* <PageNavigation /> */}
      <ScrollDownIndicator />
      
      <VisualHeader />
      
      {/* Espaciado blanco */}
      <div className="bg-white py-16"></div>
      
      <RoundedImageCarousel slides={processSlides} />
      
      {/* Espaciado blanco antes de categorías */}
      <div className="bg-white py-16"></div>
      
      {/* SECCIÓN DE CATEGORÍAS - FAMILIA, PAREJA Y AMIGOS */}
      <div id="categoria-cestas">
        <BasketCategories />
      </div>

      {/* Image Modal for cesta */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-4xl w-full p-2 bg-white border-2 border-gray-200">
          <img 
            src={cestaHeroImage} 
            alt="Cesta de experiencia ampliada" 
            className="w-full h-auto object-contain rounded-3xl" 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de autenticación */}
      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} onSuccess={handleAuthSuccess} />
    </div>;
};
export default Index;