import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselSlide {
  image: string;
  content: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  navigationColor?: string;
}

interface CarouselSectionProps {
  slides: CarouselSlide[];
  position?: "left" | "right";
  autoPlay?: boolean;
  autoPlayDelay?: number;
  backgroundColor?: string;
  textColor?: string;
  imageHeightClasses?: string;
}

const CarouselSection = ({ slides, position = "left", autoPlay = true, autoPlayDelay = 5000, backgroundColor = "#000000", textColor = "#1e3a8a", imageHeightClasses = "h-[44vh] md:h-[63vh]" }: CarouselSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayDelay, isPaused, slides.length]);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <section 
      className="relative w-full h-auto flex items-center leading-none"
      style={{ backgroundColor: currentSlide.backgroundColor || backgroundColor, margin: 0, padding: 0 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col w-full h-full" style={{ margin: 0, padding: 0 }}>
        {/* Text above image */}
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full flex flex-col items-center justify-center py-4"
          style={{ backgroundColor: currentSlide.backgroundColor || backgroundColor, margin: 0 }}
        >
          <div className="px-6 max-w-4xl mb-4 text-center">
            <div className="text-sm md:text-base leading-tight tracking-wide text-black font-poppins" style={{ textTransform: 'none' }}>
              {currentSlide.content}
            </div>
          </div>
          
          {/* Indicadores de puntos */}
          <div className="flex gap-2 mb-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: currentIndex === i 
                    ? (i % 2 === 0 ? '#000000' : '#FFD700')
                    : '#D1D5DB'
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons below indicators */}
          <div className="flex flex-row gap-4 md:gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="p-0 bg-transparent transition-all duration-300 border-0"
              style={{ color: '#000000' }}
            >
              <ChevronLeft className="w-10 h-10" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="p-0 bg-transparent transition-all duration-300 border-0"
              style={{ color: '#000000' }}
            >
              <ChevronRight className="w-10 h-10" />
            </motion.button>
          </div>
        </motion.div>

        {/* Tarjeta desplegable con imagen ampliada - ARRIBA */}
        <AnimatePresence>
          {isImageOpen && (
            <motion.div
              data-expanded-carousel-image
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-xl md:max-w-2xl mx-auto mb-4 overflow-hidden"
            >
              <div className="bg-white border-2 border-[#FFD700]/30 rounded-[2rem] p-4 shadow-xl">
                <div className="flex justify-end mb-2">
                  <Button 
                    onClick={() => {
                      setIsImageOpen(false);
                      // Auto-scroll después de cerrar
                      setTimeout(() => {
                        const imageSection = document.querySelector('[data-carousel-image-section]');
                        if (imageSection) {
                          const yOffset = -80;
                          const y = imageSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 text-black shadow-md" 
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={currentSlide.image}
                  alt="Imagen ampliada"
                  className="w-full h-auto object-contain rounded-[1.5rem]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            data-carousel-image-section
            className={`w-full max-w-2xl md:max-w-4xl mx-auto ${imageHeightClasses} relative cursor-pointer overflow-hidden rounded-[2rem]`}
            onClick={() => {
              setIsImageOpen(true);
              // Auto-scroll a la imagen ampliada
              setTimeout(() => {
                const expandedImage = document.querySelector('[data-expanded-carousel-image]');
                if (expandedImage) {
                  const yOffset = -80;
                  const y = expandedImage.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 150);
            }}
          >
            {slides.map((slide, index) => (
              <img
                key={`slide-${index}`}
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover rounded-3xl md:rounded-[2rem] transition-opacity duration-700 ease-in-out ${
                  currentIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  pointerEvents: currentIndex === index ? 'auto' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
