import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselSlide {
  image: string;
  text: JSX.Element;
}

interface ImageCarousel3DProps {
  slides: CarouselSlide[];
  title?: string;
  carouselId?: string;
}

const ImageCarousel3D = ({ slides, title, carouselId }: ImageCarousel3DProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const openModal = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let centerX = rect.left + rect.width / 2;
    let centerY = rect.top + rect.height / 2;

    // Anclar al contenedor raíz del carrusel específico
    const root = containerRef.current;
    if (root) {
      const carouselRect = root.getBoundingClientRect();
      centerX = carouselRect.left + carouselRect.width / 2;
      // Si es el carrusel de selecta, posicionar el modal más abajo
      if (carouselId === 'selecta') {
        centerY = carouselRect.top + carouselRect.height / 2 + 100;
      } else {
        centerY = carouselRect.top + carouselRect.height / 2;
      }
    }

    setImagePosition({
      top: centerY,
      left: centerX
    });
    setModalOpen(true);
  };

  const getCardPosition = (index: number) => {
    const diff = (index - currentIndex + slides.length) % slides.length;
    
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
        x: '65%',
        z: -350,
        rotateY: -40,
        scale: 0.7,
        opacity: 0.5,
        zIndex: 10
      };
    } else if (diff === slides.length - 1) {
      // Tarjeta izquierda
      return {
        x: '-65%',
        z: -350,
        rotateY: 40,
        scale: 0.7,
        opacity: 0.5,
        zIndex: 10
      };
    } else {
      // Tarjetas ocultas
      return {
        x: diff > slides.length / 2 ? '-100%' : '100%',
        z: -500,
        rotateY: diff > slides.length / 2 ? 60 : -60,
        scale: 0.5,
        opacity: 0,
        zIndex: 0
      };
    }
  };

  return (
    <>
      {/* Carousel */}
      <div ref={containerRef} id={carouselId ? `${carouselId}-carousel` : undefined} data-carousel-root="" data-carousel-id={carouselId || 'carousel'} className="relative max-w-6xl mx-auto">
        {/* 3D Carousel Container */}
        <div 
          className={`relative w-full flex items-center justify-center mx-auto mb-12 ${
            carouselId === 'experiencia' ? 'h-[220px] md:h-[340px]' : 'h-[180px] md:h-[240px]'
          }`}
          style={{ perspective: '1800px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {slides.map((slide, index) => {
              const position = getCardPosition(index);
              const isActive = (index - currentIndex + slides.length) % slides.length === 0;

              return (
                <div
                  key={index}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                    carouselId === 'experiencia' ? 'w-[45%] md:w-[28%]' : 'w-[35%] md:w-[25%]'
                  } max-w-md`}
                  style={{ zIndex: position.zIndex, pointerEvents: isActive ? 'auto' : 'none' }}
                >
                  <motion.div
                    animate={{
                      x: position.x,
                      z: position.z,
                      rotateY: position.rotateY,
                      scale: position.scale,
                      opacity: position.opacity
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="cursor-zoom-in"
                  >
                    <div
                      className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
                      onClick={isActive ? openModal : undefined}
                    >
                      <img
                        src={slide.image}
                        alt={`${title} ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons Below Images */}
        <div className="flex justify-center items-center gap-8 my-8 mt-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/90 text-black rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
          </motion.button>

          <span className="text-black font-poppins font-bold text-base md:text-lg">
            {currentIndex + 1} / {slides.length}
          </span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/90 text-black rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
          </motion.button>
        </div>

        {/* Text Below Navigation */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="text-center px-4 md:px-12 mt-4"
        >
          <div className="font-poppins text-base md:text-lg text-black leading-relaxed max-w-3xl mx-auto">
            {slides[currentIndex].text}
          </div>
        </motion.div>
      </div>

      {/* Modal to enlarge image */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: 'auto' }}
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ 
              scale: 0.5,
              opacity: 0,
              position: 'fixed',
              left: imagePosition.left,
              top: imagePosition.top,
              x: '-50%',
              y: '-50%'
            }}
            animate={{ 
              scale: 1.0,
              opacity: 1,
              position: 'fixed',
              left: imagePosition.left,
              top: imagePosition.top,
              x: '-50%',
              y: '-50%'
            }}
            exit={{ 
              scale: 0.5,
              opacity: 0
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[50vw] max-w-[360px] md:w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              onClick={() => setModalOpen(false)} 
              className="absolute -top-4 -right-4 z-50 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="rounded-[2rem] overflow-hidden bg-white shadow-2xl">
              <img
                src={slides[currentIndex].image}
                alt={`${title} ${currentIndex + 1} - Vista ampliada`}
                className="w-full h-auto object-contain rounded-[2rem]"
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel3D;
