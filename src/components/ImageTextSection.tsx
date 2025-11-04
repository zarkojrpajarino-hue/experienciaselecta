import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageTextSectionProps {
  image: string;
  text: string;
  position?: "left" | "right";
  imageAlt?: string;
}

const ImageTextSection = ({ image, text, position = "left", imageAlt = "" }: ImageTextSectionProps) => {
  const [isImageOpen, setIsImageOpen] = useState(false);

  const handleImageClick = () => {
    setIsImageOpen(true);
    // Centrar en la imagen ampliada después de que se abra
    setTimeout(() => {
      const expandedImage = document.querySelector('[data-expanded-image-section]');
      if (expandedImage) {
        expandedImage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  return (
    <>
      <section className="py-16 md:py-20 bg-background image-text-section-container">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col ${position === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12 max-w-6xl mx-auto`}>
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-all duration-300">
                  <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500 rounded-3xl md:rounded-[2rem]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: position === "left" ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 flex items-center justify-center"
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-cormorant font-bold text-foreground text-center">
                {text}
              </h2>
            </motion.div>
          </div>
          
          {/* Imagen ampliada debajo */}
          <AnimatePresence>
            {isImageOpen && (
              <motion.div
                data-expanded-image-section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-6xl mx-auto mt-8 overflow-hidden"
              >
                <div className="bg-white border-2 border-[#FFD700]/30 rounded-3xl p-4 shadow-xl relative">
                  <Button 
                    onClick={() => setIsImageOpen(false)} 
                    className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white hover:bg-gray-100 text-black shadow-md" 
                    size="icon"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-auto object-contain rounded-[1.5rem]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default ImageTextSection;
