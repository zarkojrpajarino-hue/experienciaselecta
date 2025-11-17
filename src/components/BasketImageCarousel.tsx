import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import images - muestrario de cestas del catálogo
import parejaInicialImg from "@/assets/pareja-inicial-nueva-clean.jpg";
import conversacionNaturalImg from "@/assets/pareja-natural-nueva-clean.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";
import trioIbericoNuevoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
import mesaAbiertaNuevoImg from "@/assets/mesa-abierta-nuevo-clean.jpg";
import ibericosSelectosNuevoImg from "@/assets/ibericos-selectos-nuevo-clean.jpg";
import familiarClasicaNuevoImg from "@/assets/familiar-clasica-nuevo-clean.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica-clean.jpg";
import granTertuliaNuevoImg from "@/assets/gran-tertulia-nuevo-clean.jpg";
import celebracionIbericaNuevoImg from "@/assets/celebracion-iberica-nuevo-clean.jpg";
import festinSelectoNuevoImg from "@/assets/festin-selecto-nuevo-clean.jpg";
import experienciaSelectaImg from "@/assets/experiencia-selecta-nuevo-clean.jpg";

const basketImages = [
  parejaInicialImg,
  conversacionNaturalImg,
  parejaGourmetImg,
  trioIbericoNuevoImg,
  mesaAbiertaNuevoImg,
  ibericosSelectosNuevoImg,
  familiarClasicaNuevoImg,
  experienciaGastronomicaImg,
  granTertuliaNuevoImg,
  celebracionIbericaNuevoImg,
  festinSelectoNuevoImg,
  experienciaSelectaImg,
];

const BasketImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (isAutoPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % basketImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPaused]);

  useEffect(() => {
    if (!isAutoPaused) return;

    const timeout = setTimeout(() => {
      setIsAutoPaused(false);
    }, 7000);

    return () => clearTimeout(timeout);
  }, [isAutoPaused]);

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
      setCurrentIndex((prev) => (prev + 1) % basketImages.length);
      setIsAutoPaused(true);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + basketImages.length) % basketImages.length);
      setIsAutoPaused(true);
    }
  };

  const handleNavigationClick = (direction: 'prev' | 'next') => {
    setIsAutoPaused(true);
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev - 1 + basketImages.length) % basketImages.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % basketImages.length);
    }
  };

  const getVisibleIndices = () => {
    const prev = (currentIndex - 1 + basketImages.length) % basketImages.length;
    const next = (currentIndex + 1) % basketImages.length;
    return [prev, currentIndex, next];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <>
      <div 
        className="relative w-full mb-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carrusel principal - adaptado para móvil */}
        <div className="relative w-full h-24 sm:h-32 md:h-40 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleIndices.map((idx, position) => {
              const isCenter = position === 1;
              const offset = position === 0 ? -1 : position === 2 ? 1 : 0;

              return (
                <motion.div
                  key={`${idx}-${currentIndex}`}
                  initial={{
                    x: offset * (window.innerWidth < 640 ? 100 : 150),
                    scale: isCenter ? 1 : 0.7,
                    opacity: isCenter ? 1 : 0.4,
                    zIndex: isCenter ? 20 : 10,
                  }}
                  animate={{
                    x: offset * (window.innerWidth < 640 ? 100 : 150),
                    scale: isCenter ? 1 : 0.7,
                    opacity: isCenter ? 1 : 0.4,
                    zIndex: isCenter ? 20 : 10,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute"
                >
                  <button
                    onClick={() => isCenter && setExpandedImage(basketImages[idx])}
                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-black/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <img
                      src={basketImages[idx]}
                      alt={`Cesta ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Botones de navegación con flechas */}
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            onClick={() => handleNavigationClick('prev')}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            aria-label="Imagen anterior"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="#D4AF37" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleNavigationClick('next')}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            aria-label="Imagen siguiente"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="#D4AF37" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative w-full max-w-4xl">
              <Button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                size="icon"
              >
                <X className="h-6 w-6" />
              </Button>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={expandedImage}
                  alt="Imagen ampliada"
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BasketImageCarousel;
