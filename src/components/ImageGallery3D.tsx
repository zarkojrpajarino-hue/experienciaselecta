import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageGallery3DProps {
  images: string[];
  title?: string;
}

const ImageGallery3D = ({ images, title }: ImageGallery3DProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openImage = (index: number) => {
    setSelectedImage(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: 5,
              z: 50,
              transition: { duration: 0.3 }
            }}
            className="cursor-pointer perspective-1000"
            onClick={() => openImage(index)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="w-full h-48 md:h-56 object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </motion.div>
        ))}
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
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
                    >
                      <ChevronLeft className="w-6 h-6 text-black" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
                    >
                      <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                  </>
                )}

                {/* Image */}
                <img
                  src={images[selectedImage]}
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

export default ImageGallery3D;
