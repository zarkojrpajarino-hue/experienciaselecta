import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

const CarouselSection = ({ slides, position = "left", autoPlay = true, autoPlayDelay = 5000, backgroundColor = "#000000", textColor = "#1e3a8a", imageHeightClasses = "h-[35vh] md:h-[50vh]" }: CarouselSectionProps) => {
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
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight tracking-wide text-black" style={{ textTransform: 'none' }}>
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

        {/* Image Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`w-full max-w-3xl md:max-w-6xl mx-auto ${imageHeightClasses} relative cursor-pointer overflow-hidden rounded-[2rem]`}
            onClick={() => setIsImageOpen(true)}
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

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent hideClose className="max-w-7xl bg-white border-0 p-2 shadow-none rounded-[2rem] overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setIsImageOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-[2rem] overflow-hidden">
            <img 
              src={currentSlide.image} 
              alt="Ampliado" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem] ring-1 ring-black/10"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CarouselSection;
