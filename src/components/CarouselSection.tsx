import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
}

const CarouselSection = ({ slides, position = "left", autoPlay = true, autoPlayDelay = 5000, backgroundColor = "#000000", textColor = "#1e3a8a" }: CarouselSectionProps) => {
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
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-poppins leading-tight tracking-wide text-black" style={{ textTransform: 'none' }}>
              {currentSlide.content}
            </div>
          </div>
          
          {/* Navigation Buttons below text */}
          <div className="flex flex-row gap-4 md:gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="p-0 bg-transparent transition-all duration-300 border-0"
              style={{ color: '#000000' }}
            >
              <ChevronUp className="w-10 h-10" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="p-0 bg-transparent transition-all duration-300 border-0"
              style={{ color: '#000000' }}
            >
              <ChevronDown className="w-10 h-10" />
            </motion.button>
          </div>
        </motion.div>

        {/* Image Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="w-full h-[35vh] md:h-[35vh] relative cursor-pointer overflow-hidden rounded-3xl"
            onClick={() => setIsImageOpen(true)}
          >
            {slides.map((slide, index) => (
              <img
                key={`slide-${index}`}
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover md:object-contain transition-opacity duration-700 ease-in-out rounded-3xl ${
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
        <DialogContent className="max-w-5xl bg-white/95 p-2 border-0">
          <button
            onClick={() => setIsImageOpen(false)}
            className="absolute top-3 right-3 z-10 h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/80"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={currentSlide.image} 
            alt="Ampliado" 
            className="w-full h-[70vh] object-contain"
            style={{ borderRadius: "1.5rem" }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CarouselSection;
