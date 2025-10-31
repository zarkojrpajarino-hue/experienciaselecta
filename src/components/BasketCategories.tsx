import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Users, UserPlus, UsersRound, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import basketImage from "@/assets/conversaciones-profundas.jpg";
import catalogHeaderBg from "@/assets/catalog-header-background.jpg";
import basketDetailsBg from "@/assets/basket-details-background.jpg";
import cestas34Bg from "@/assets/cestas-3-4-bg-final.jpg";
import cestas56Bg from "@/assets/cestas-5-6-bg-final.jpg";
import cestas78Bg from "@/assets/cestas-7-8-bg-final.jpg";
import BasketCatalog from "./BasketCatalog";
import DesconocidosCategory from "./DesconocidosCategory";

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
const BasketCategories = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [groupSize, setGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const [sheetKey, setSheetKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [initialBasketId, setInitialBasketId] = useState<number | null>(null);
  // Tooltip open state (show once on first visit + hover)
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const tooltipTimerRef = useRef<number | null>(null);
  const hasShownRef = useRef(false);
  const openTooltipTemporarily = (ms = 2000) => {
    setTooltipOpen(true);
    if (tooltipTimerRef.current) window.clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = window.setTimeout(() => setTooltipOpen(false), ms);
  };

  // Debug: monitor opening of the sheet and selected category
  useEffect(() => {
    if (isSheetOpen) {
      console.info('sheet open with category', selectedCategory);
    }
  }, [isSheetOpen, selectedCategory]);
  // Handle deep-links: /cestas#cesta-ID (abre categoría correcta y hace scroll a la cesta)
  useEffect(() => {
    const parseBasketId = (): number | null => {
      const hash = window.location.hash;
      const match = hash.match(/^#cesta-(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    };

    const basketId = parseBasketId();
    if (basketId == null) return;

    const categoriesToTry: Array<'Familia' | 'Amigos' | 'Pareja'> = ['Familia', 'Amigos', 'Pareja'];

    const tryCategory = (idx: number) => {
      if (idx >= categoriesToTry.length) return;

      const category = categoriesToTry[idx];
      setSelectedCategory(category);
      setIsSheetOpen(true);
      setSheetKey(prev => prev + 1);
      setInitialBasketId(basketId);

      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(`cesta-${basketId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-accent', 'ring-offset-2');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-accent', 'ring-offset-2');
          }, 2000);
        } else if (attempt < 10) {
          setTimeout(() => tryScroll(attempt + 1), 200);
        } else {
          // No encontrado en esta categoría; probar la siguiente
          setTimeout(() => tryCategory(idx + 1), 200);
        }
      };

      // Dar tiempo a montar el contenido del Sheet
      setTimeout(() => tryScroll(0), 400);
    };

    tryCategory(0);

    const onHashChange = () => {
      const newId = parseBasketId();
      if (newId != null) {
        setInitialBasketId(newId);
        tryCategory(0);
      }
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

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


  // Determine background based on group size
  const getBackgroundImage = () => {
    switch (groupSize) {
      case '3-4':
        return cestas34Bg;
      case '5-6':
        return cestas56Bg;
      case '7-8':
        return cestas78Bg;
      default:
        return cestas34Bg;
    }
  };

  const handleCategoryClick = (categoryTitle: string) => {
    console.info('handleCategoryClick:', categoryTitle);
    if (categoryTitle === "Pareja" || categoryTitle === "Familia" || categoryTitle === "Amigos") {
      setSelectedCategory(categoryTitle);
      setIsSheetOpen(true);
      // Incrementar la key para forzar un re-render completo del Sheet
      setSheetKey(prev => prev + 1);
      // Reset group size cuando se abre una nueva categoría
      setGroupSize('3-4');
    } else {
      // Para otras categorías mostrar mensaje temporal
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
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir catálogo: ${category.title}`}
                    onClickCapture={() => handleCategoryClick(category.title)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(category.title); } }}
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
                      onClick={() => handleCategoryClick(category.title)}
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

      {/* Sheet for Basket Catalog */}
      <Sheet key={sheetKey} open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side="right" 
          className="z-[120] w-full sm:max-w-4xl lg:max-w-6xl overflow-y-auto border-0 shadow-lg p-0 bg-white"
        >
          <SheetHeader className="relative p-6 text-left bg-white" style={{ paddingTop: '3rem' }}>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <SheetTitle className="text-2xl sm:text-3xl font-poppins font-bold text-left text-black whitespace-nowrap">
                  <span className="text-gold">Experiencia</span> Selecta
                </SheetTitle>
            <SheetDescription className="font-work-sans font-bold text-left text-black">
              Descubre nuestras <span className="text-gold">cestas</span> para <span className="text-gold">descubrir personas</span>
            </SheetDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSheetOpen(false)} 
                className="h-8 w-8 text-black hover:bg-black/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-0">
            {selectedCategory ? <BasketCatalog categoria={selectedCategory} initialBasketId={initialBasketId ?? undefined} onGroupSizeChange={setGroupSize} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>;
};
export default BasketCategories;