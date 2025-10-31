import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Users, UserPlus, UsersRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SideSheet from "@/components/ui/side-sheet";
import BasketCatalog from "@/components/BasketCatalog";
import basketImage from "@/assets/conversaciones-profundas.jpg";
import catalogHeaderBg from "@/assets/catalog-header-background.jpg";
import basketDetailsBg from "@/assets/basket-details-background.jpg";

// Import experience images
import familiaExperienceImg from "@/assets/familia-experience.jpg";
import amigosExperienceImg from "@/assets/amigos-experience.jpg";
import parejaExperienceImg from "@/assets/pareja-experience.jpg";
import desconocidosExperienceImg from "@/assets/desconocidos-experience.jpg";
import grupoMedianoExperienceImg from "@/assets/grupo-mediano-experience.jpg";
import grupoGrandeExperienceImg from "@/assets/grupo-grande-experience.jpg";

// Import new basket images
import parejaCestasImg from "@/assets/pareja-nueva-cesta-clean.png";
import familiaCestasImg from "@/assets/familia-nueva-cesta.jpg";
import amigosCestasImg from "@/assets/amigos-nueva-cesta-clean.png";
import OptimizedImage from "./OptimizedImage";
import ErrorBoundary from "@/components/ErrorBoundary";
const BasketCategories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<'Pareja' | 'Familia' | 'Amigos'>('Pareja');
  const sectionRef = useRef<HTMLElement | null>(null);
  const tooltipTimerRef = useRef<number | null>(null);
  const hasShownRef = useRef(false);
  const openTooltipTemporarily = (ms = 2000) => {
    setTooltipOpen(true);
    if (tooltipTimerRef.current) window.clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = window.setTimeout(() => setTooltipOpen(false), ms);
  };

  // Auto-open tooltip when the section enters viewport or when hash targets the section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hideTimer: number | null = null;
    let cooldownTimer: number | null = null;
    let canOpen = true;

    const openTemporarily = () => {
      if (!canOpen) return;
      setTooltipOpen(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setTooltipOpen(false), 2000);
      // cooldown to avoid flicker while staying in view, but allow re-open after leaving
      canOpen = false;
      if (cooldownTimer) window.clearTimeout(cooldownTimer);
      cooldownTimer = window.setTimeout(() => { canOpen = true; }, 3000);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        openTemporarily();
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -20% 0px' });

    observer.observe(el);

    // If hash already targets the section, open shortly after mount
    if (window.location.hash === '#categoria-cestas') {
      setTimeout(openTemporarily, 150);
    }

    const onHash = () => {
      if (window.location.hash === '#categoria-cestas') {
        setTimeout(openTemporarily, 50);
      }
    };
    window.addEventListener('hashchange', onHash);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', onHash);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (cooldownTimer) window.clearTimeout(cooldownTimer);
    };
  }, []);

  const handleCategoryClick = (categoryTitle: string) => {
    console.log('[BasketCategories] handleCategoryClick:', categoryTitle);
    console.log('[BasketCategories] Current sheetOpen state:', sheetOpen);
    if (categoryTitle === "Pareja" || categoryTitle === "Familia" || categoryTitle === "Amigos") {
      setSelectedCatalogCategory(categoryTitle as 'Pareja' | 'Familia' | 'Amigos');
      // Open on next frame to avoid the initial click closing it immediately
      requestAnimationFrame(() => {
        console.log('[BasketCategories] Opening sheet via rAF');
        setSheetOpen(true);
      });
    } else {
      alert(`Catálogo de ${categoryTitle} próximamente disponible`);
    }
  };
  // Animated Title Component
  const AnimatedTitle = ({ text, index }: { text: string; index: number }) => {
    return (
      <h3 className="text-lg sm:text-xl font-poppins font-bold text-white">
        {text}
      </h3>
    );
  };

  const categories = [{
    id: 1,
    title: "Familia",
    description: "3-8 personas",
    icon: Heart,
    color: "text-secondary",
    gradient: "from-secondary/10 to-secondary/5",
    basketImage: familiaCestasImg,
    order: 0,
    inspirationalPhrase: "Sabores que unen.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }, {
    id: 2,
    title: "Amigos",
    description: "3-8 personas",
    icon: Users,
    color: "text-accent",
    gradient: "from-accent/10 to-accent/5",
    basketImage: amigosCestasImg,
    order: 1,
    inspirationalPhrase: "Planes que crean recuerdos.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }, {
    id: 3,
    title: "Pareja",
    description: "2 personas",
    icon: UsersRound,
    color: "text-primary",
    gradient: "from-primary/10 to-primary/5",
    basketImage: parejaCestasImg,
    order: 2,
    inspirationalPhrase: "Experiencia íntima juntos.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const getCardPosition = (index: number) => {
    const diff = (index - currentIndex + categories.length) % categories.length;
    
    if (diff === 0) {
      // Tarjeta central (activa)
      return {
        x: 0,
        z: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30
      };
    } else if (diff === 1) {
      // Tarjeta derecha
      return {
        x: '60%',
        z: -400,
        rotateY: -45,
        scale: 0.75,
        opacity: 0.6,
        zIndex: 10
      };
    } else {
      // Tarjeta izquierda
      return {
        x: '-60%',
        z: -400,
        rotateY: 45,
        scale: 0.75,
        opacity: 0.6,
        zIndex: 10
      };
    }
  };

  const renderHighlightedPhrase = (phrase: string, title: string, color: string) => {
    if (title === "Pareja") {
      return phrase.replace(/experiencia|íntima|juntos/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    } else if (title === "Amigos") {
      return phrase.replace(/planes|crean|recuerdos/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    } else if (title === "Familia") {
      return phrase.replace(/sabores|unen/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    }
    return phrase;
  };
  // Eliminado scroll automático al montar para evitar desplazamiento al abrir la página
  // useEffect(() => {
  //   // Antes: desplazaba a #recogida
  // }, []);

  return <section id="categoria-cestas" ref={sectionRef} className="pt-24 pb-24 relative overflow-hidden bg-black rounded-3xl">
      {/* Background decoration removed to reveal page background */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{
        opacity: 0,
        x: -100,
        scale: 0.85
      }} whileInView={{
        opacity: 1,
        x: 0,
        scale: 1
      }} transition={{
        duration: 1.3,
        type: "spring",
        stiffness: 50,
        damping: 15
      }} className="text-center mb-8">
          <h2 className="text-base sm:text-xl md:text-2xl leading-tight font-poppins font-bold text-white inline-flex items-center gap-3 sm:gap-4" style={{ textTransform: 'none' }}>
            Crea tu experiencia personalizada.
            <TooltipProvider delayDuration={80}>
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger asChild>
                  <motion.span 
                    onClick={() => {
                      const element = document.getElementById('que-vendemos');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                    onFocus={() => setTooltipOpen(true)}
                    onBlur={() => setTooltipOpen(false)}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-300"
                    style={{ fontSize: 'inherit', color: '#FFD700' }}
                    animate={{ rotateZ: [0, 180, 0] }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    ¿?
                  </motion.span>
                </TooltipTrigger>
                <TooltipContent side="top" className="relative rounded-2xl border-2 border-black/10 bg-white text-black shadow-lg px-4 py-2 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-black/10 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-transparent after:border-b-white">
                  <p className="font-medium">Haz click</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl font-inter text-white">
            Elige con quién quieres compartir: <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.
          </p>
        </motion.div>
          
        {/* Contenedor flex para ordenar botones y carrusel */}
        <div className="flex flex-col md:flex-col items-center">
          {/* Botones de navegación - orden 2 en móvil, orden 1 en desktop */}
          <div className="flex items-center justify-center gap-8 mb-1 md:mb-2 order-2 md:order-1">
            <button
              onClick={prevSlide}
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        {/* Carrusel 3D Container - orden 1 en móvil, orden 2 en desktop */}
        <div className="relative w-full h-[180px] md:h-[450px] flex items-center justify-center mx-auto mt-0 order-1 md:order-2" style={{ perspective: '2000px' }}>
          {/* Tarjetas en carrusel 3D */}
          <div className="absolute inset-0 flex items-center justify-center">
            {categories.map((category, index) => {
              const position = getCardPosition(index);
              const isActive = (index - currentIndex + categories.length) % categories.length === 0;

              return (
                  <div
                    key={category.id}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] md:w-[55%] max-w-2xl cursor-pointer"
                    style={{ zIndex: position.zIndex, pointerEvents: 'auto' }}
                    aria-label={`Abrir catálogo: ${category.title}`}
                    onClick={() => handleCategoryClick(category.title)}
                  >
                  <motion.div
                    animate={{
                      x: position.x,
                      z: position.z,
                      rotateY: position.rotateY,
                      scale: position.scale,
                      opacity: position.opacity
                    }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Card Container */}
                    <button
                      type="button"
                      aria-label={`Abrir catálogo: ${category.title}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCategoryClick(category.title); }}
                      className="relative bg-transparent rounded-3xl p-3 md:p-6 shadow-2xl border-0 w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {/* Imagen */}
                      <div className="w-full h-[75px] md:h-[280px] mb-3 rounded-3xl overflow-hidden px-0 md:px-2">
                        <img
                          src={category.basketImage}
                          alt={`${category.title} cestas`}
                          className="w-full h-full object-cover rounded-3xl md:rounded-[2rem]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Título y Flecha */}
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <h3 
                          className="font-bebas font-bold text-2xl md:text-4xl whitespace-nowrap tracking-[0.2em]"
                          style={{ 
                            color: category.title === "Familia" ? '#4A7050' 
                                 : category.title === "Pareja" ? '#782C23'
                                 : category.title === "Amigos" ? '#44667D'
                                 : '#FFFFFF'
                          }}
                        >
                          {category.title}.
                        </h3>
                        <svg 
                          className="w-5 h-5 md:w-7 md:h-7 flex-shrink-0"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          style={{ color: category.arrowColor }}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M13 7l5 5m0 0l-5 5m5-5H6" 
                          />
                        </svg>
                      </div>
                    </button>
                  </motion.div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Indicador de depuración visible cuando sheetOpen=true */}
      {sheetOpen && (
        <div className="fixed top-4 right-4 z-[10000] px-3 py-2 rounded-md bg-primary text-primary-foreground shadow-lg">
          Panel: abierto ({selectedCatalogCategory})
        </div>
      )}

      {/* Sheet lateral para el catálogo de cestas (sin Radix) */}
      <SideSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={<>Catálogo de {selectedCatalogCategory}</>}
        className="w-full sm:max-w-2xl"
      >
        <ErrorBoundary fallback={<div className="text-foreground">Cargando catálogo…</div>}>
          <BasketCatalog categoria={selectedCatalogCategory} />
        </ErrorBoundary>
      </SideSheet>
    </section>;
};
export default BasketCategories;