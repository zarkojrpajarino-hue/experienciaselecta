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
          <div className="px-6 max-w-4xl mb-4">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-cinzel font-bold leading-tight text-center tracking-wide" style={{ color: currentSlide.textColor || textColor, textTransform: 'none' }}>
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
              style={{ color: currentSlide.navigationColor || currentSlide.textColor || textColor }}
            >
              <ChevronUp className="w-4 h-4 md:w-6 md:h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="p-0 bg-transparent transition-all duration-300 border-0"
              style={{ color: currentSlide.navigationColor || currentSlide.textColor || textColor }}
            >
              <ChevronDown className="w-4 h-4 md:w-6 md:h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Image Section */}
        <div 
          className="w-full h-[35vh] md:h-[45vh] relative cursor-pointer" 
          onClick={() => setIsImageOpen(true)}
        >
          {slides.map((slide, index) => (
            <img
              key={`slide-${index}`}
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-contain rounded-3xl transition-opacity duration-700 ease-in-out ${
                currentIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                pointerEvents: currentIndex === index ? 'auto' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-4xl w-full p-2 bg-white border-2 border-gray-200">
          <img 
            src={currentSlide.image} 
            alt="Ampliado" 
            className="w-full h-auto object-contain rounded-3xl" 
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CarouselSection;
