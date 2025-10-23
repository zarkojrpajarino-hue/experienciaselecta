import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  return (
    <>
      <section className="py-16 md:py-20 bg-background">
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
              <div className="relative group cursor-pointer" onClick={() => setIsImageOpen(true)}>
                <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-all duration-300">
                  <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500 rounded-3xl"
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
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setIsImageOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-3xl overflow-hidden">
            <img 
              src={image} 
              alt={imageAlt} 
              className="w-full h-auto max-h-[80vh] object-contain" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageTextSection;
