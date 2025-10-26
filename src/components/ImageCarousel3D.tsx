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

  const openImage = () => {
    setSelectedImage(currentIndex);
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

  return (
    <>
      {/* Carousel */}
      <div className="relative max-w-5xl mx-auto">
        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-gold text-black hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <span className="text-black font-poppins font-bold text-lg">
            {currentIndex + 1} / {slides.length}
          </span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-gold text-black hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -100, rotateY: 20 }}
            transition={{ duration: 0.5 }}
            className="perspective-1500"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Image */}
            <motion.div
              whileHover={{ 
                scale: 1.02, 
                rotateY: 2,
                z: 30,
                transition: { duration: 0.3 }
              }}
              className="cursor-pointer mb-8"
              onClick={openImage}
            >
              <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={slides[currentIndex].image}
                  alt={`${title} ${currentIndex + 1}`}
                  className="w-full h-[200px] md:h-[250px] object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center px-4 md:px-12"
            >
              <div className="font-poppins text-base md:text-lg font-bold text-black leading-relaxed">
                {slides[currentIndex].text}
              </div>
            </motion.div>
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
