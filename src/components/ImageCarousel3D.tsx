import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CarouselSlide {
  image: string;
  text: JSX.Element;
}

interface ImageCarousel3DProps {
  slides: CarouselSlide[];
  title?: string;
}

const ImageCarousel3D = ({ slides, title }: ImageCarousel3DProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const openImage = (index: number) => {
    setSelectedImage(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImageModal = () => {
    if (selectedImage !== null) {
      const newIndex = (selectedImage + 1) % slides.length;
      setSelectedImage(newIndex);
      setCurrentIndex(newIndex);
    }
  };

  const prevImageModal = () => {
    if (selectedImage !== null) {
      const newIndex = (selectedImage - 1 + slides.length) % slides.length;
      setSelectedImage(newIndex);
      setCurrentIndex(newIndex);
    }
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
      <div className="relative max-w-6xl mx-auto">
        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-8 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-gold text-black hover:text-white rounded-full shadow-lg transition-all duration-300"
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
            className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-gold text-black hover:text-white rounded-full shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
          </motion.button>
        </div>

        {/* 3D Carousel Container */}
        <div 
          className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center mx-auto mb-8" 
          style={{ perspective: '1800px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {slides.map((slide, index) => {
              const position = getCardPosition(index);
              const isActive = (index - currentIndex + slides.length) % slides.length === 0;

              return (
                <div
                  key={index}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] md:w-[50%] max-w-lg"
                  style={{ zIndex: position.zIndex, pointerEvents: isActive ? 'auto' : 'none' }}
                  onClick={() => isActive && openImage(index)}
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
                    className="cursor-pointer"
                  >
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
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

        {/* Text Below Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center px-4 md:px-12 mt-4"
          >
            <div className="font-poppins text-base md:text-lg font-bold text-black leading-relaxed max-w-3xl mx-auto">
              {slides[currentIndex].text}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal for enlarged image */}
      <Dialog open={selectedImage !== null} onOpenChange={closeImage}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none">
          <AnimatePresence mode="wait">
            {selectedImage !== null && (
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Close button */}
                <button
                  onClick={closeImage}
                  className="absolute -top-12 right-0 z-50 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
                >
                  <X className="w-6 h-6 text-black" />
                </button>

                {/* Navigation buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImageModal();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImageModal();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>

                {/* Image */}
                <img
                  src={slides[selectedImage].image}
                  alt={`${title} ${selectedImage + 1}`}
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-2xl shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCarousel3D;
