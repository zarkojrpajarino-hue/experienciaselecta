import React, { useEffect, useState, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SlideItem {
  image: string;
  title: string | React.ReactNode;
  text?: string | React.ReactNode;
  alt?: string;
  navigationColor?: string;
}

interface RoundedImageCarouselProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
  hideMainTitle?: boolean;
  titleBold?: boolean;
  carouselTitle?: string;
  isSecondCarousel?: boolean;
}

const RoundedImageCarousel = ({ slides, autoPlay = true, autoPlayDelay = 5000, hideMainTitle = false, titleBold = true, carouselTitle, isSecondCarousel = false }: RoundedImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [arrowTooltipOpen, setArrowTooltipOpen] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Auto-show tooltip for arrow every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setArrowTooltipOpen(true);
      setTimeout(() => setArrowTooltipOpen(false), 2000);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setIndex((p) => (p + 1) % slides.length);
    } else if (isRightSwipe) {
      setIndex((p) => (p - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), autoPlayDelay);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayDelay, paused, slides.length]);

  const toggleImageExpand = () => {
    const wasExpanded = imageExpanded;
    setImageExpanded(!imageExpanded);
    
    // Si estamos expandiendo, hacer scroll después de la animación
    if (!wasExpanded) {
      setTimeout(() => {
        // Buscar el contenedor de la imagen ampliada
        const expandedImageContainer = document.querySelector('[data-expanded-image]');
        if (expandedImageContainer) {
          expandedImageContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100); // Pequeño delay para que el DOM se actualice
    }
  };

  const current = slides[index];

  return (
    <section id="que-vendemos" className="w-full py-4 bg-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título del carrusel si existe */}
        {carouselTitle && (
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black">
              {carouselTitle}
            </h2>
          </div>
        )}

        {/* Título principal */}
        {!hideMainTitle && (
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-poppins font-bold text-black tracking-wide">
                ¿Por qué no vendemos cestas y cómo te entendemos?
              </h2>
              <TooltipProvider delayDuration={0}>
                <Tooltip open={arrowTooltipOpen} onOpenChange={setArrowTooltipOpen}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => {
                        // Abrir el menú hamburger inmediatamente sin hacer scroll
                        const buttons = document.querySelectorAll('button');
                        const hamburgerButton = Array.from(buttons).find(btn => {
                          const svg = btn.querySelector('svg');
                          return svg && (svg.classList.contains('lucide-menu') || svg.classList.contains('lucide-x'));
                        }) as HTMLButtonElement | undefined;
                        hamburgerButton?.click();
                      }}
                      whileHover={{ scale: 1.15, y: -3 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      onMouseEnter={() => setArrowTooltipOpen(true)}
                      onMouseLeave={() => setArrowTooltipOpen(false)}
                      className="p-0 bg-transparent border-0 cursor-pointer flex-shrink-0"
                      aria-label="Abrir menú"
                    >
                      <ChevronUp 
                        className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" 
                        style={{ color: '#D4AF37' }}
                        strokeWidth={3}
                      />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="relative rounded-2xl border-2 border-black/10 bg-white text-black shadow-lg px-4 py-2 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-black/10 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-transparent after:border-b-white"
                  >
                    click
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Text */}
        <div className="w-full flex flex-col items-center justify-center py-1">
          <div className="px-4 max-w-2xl mb-1 text-center">
            <div
              className={`text-sm sm:text-base md:text-base lg:text-lg xl:text-xl font-poppins ${titleBold ? 'font-bold' : 'font-normal'} tracking-wide text-black`}
              style={{ textTransform: "none" }}
            >
              {current.title}
            </div>
            {current.text && (
              <div className="mt-1 text-xs md:text-sm font-poppins font-normal text-black no-bold" style={{ textTransform: "none", fontWeight: 400 }}>
                {current.text}
              </div>
            )}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex gap-2 mb-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === i 
                    ? (i % 2 === 0 ? '#000000' : '#D4AF37')
                    : '#D1D5DB'
                }}
              />
            ))}
          </div>

          {/* Nav */}
          <div className="flex gap-3 py-2">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p + 1) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <div 
          ref={containerRef}
          data-rounded-carousel-root
          className={`mx-auto relative flex items-center justify-center rounded-[2rem] overflow-hidden ${
            isSecondCarousel 
              ? 'w-[60%] sm:w-[50%] md:w-[40%] h-[25vh] md:h-[30vh]' 
              : 'w-full max-w-2xl md:max-w-3xl h-[25vh] md:h-[30vh]'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((s, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 cursor-pointer rounded-[2rem] overflow-hidden"
              style={{ pointerEvents: index === i ? "auto" : "none" }}
              onClick={toggleImageExpand}
            >
              <img
                src={s.image}
                alt={s.alt || (typeof s.title === 'string' ? s.title : 'Imagen del carrusel')}
                loading={i === index ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover rounded-[2rem]"
              />
            </motion.div>
          ))}
        </div>

        {/* Tarjeta desplegable con imagen ampliada */}
        <AnimatePresence>
          {imageExpanded && (
            <motion.div
              data-expanded-image
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-2xl md:max-w-3xl mx-auto mt-4 overflow-hidden"
            >
              <div className="bg-white border-2 border-[#FFD700]/30 rounded-[2rem] p-4 shadow-xl">
                <div className="flex justify-end mb-2">
                  <Button 
                    onClick={toggleImageExpand} 
                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 text-black shadow-md" 
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={current.image}
                  alt={current.alt || (typeof current.title === 'string' ? current.title : 'Imagen ampliada')}
                  className="w-full h-auto object-contain rounded-[1.5rem]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
};

export default memo(RoundedImageCarousel);
