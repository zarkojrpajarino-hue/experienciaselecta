import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BasketCTASectionProps {
  basketImage: string;
  basketName: string;
  position?: "left" | "right";
  arrowColor?: string;
  textColor?: string;
}

const BasketCTASection = ({ basketImage, basketName, position = "left", arrowColor = "#D4AF37", textColor = "#D4AF37" }: BasketCTASectionProps) => {
  const navigate = useNavigate();
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      <section className="py-8 md:py-10 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex ${position === "right" ? "flex-row-reverse md:flex-row-reverse" : "flex-row md:flex-row"} items-center gap-4 md:gap-12 max-w-6xl mx-auto`}>
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-1/2 md:w-1/2"
            >
              <div className="relative group cursor-pointer" onClick={() => setIsImageOpen(true)}>
                <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-all duration-300">
                  <img
                    src={basketImage}
                    alt={basketName}
                    className="w-full h-48 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500 rounded-3xl"
                  />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: position === "left" ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-1/2 md:w-1/2 flex flex-row items-center justify-center gap-2 md:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.1, x: position === "right" ? -10 : 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/cestas')}
                className="p-2 md:p-4 bg-transparent hover:opacity-80 rounded-full transition-all duration-300 border-0"
                style={{ color: arrowColor }}
              >
                {position === "right" ? (
                  <ArrowRight className="w-8 h-8 md:w-12 md:h-12 rotate-180" />
                ) : (
                  <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
                )}
              </motion.button>
              <div className="flex flex-col gap-1">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xs md:text-sm font-work-sans font-bold"
                  style={{ color: textColor }}
                >
                  Cesta
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-base md:text-lg lg:text-xl font-work-sans font-bold lowercase first-letter:capitalize"
                  style={{ color: textColor }}
                >
                  {basketName}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent hideClose className="max-w-7xl bg-background border-0 p-0 shadow-none rounded-[2rem] sm:rounded-[2rem] md:rounded-[2rem] lg:rounded-[2rem] xl:rounded-[2rem] overflow-hidden">
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
              src={basketImage} 
              alt={basketName} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem]" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BasketCTASection;
