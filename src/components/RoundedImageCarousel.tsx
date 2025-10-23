import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SlideItem {
  image: string;
  title: string;
  text?: string;
  alt?: string;
  navigationColor?: string;
}

interface RoundedImageCarouselProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
  hideMainTitle?: boolean;
  titleBold?: boolean;
}

const RoundedImageCarousel = ({ slides, autoPlay = true, autoPlayDelay = 5000, hideMainTitle = false, titleBold = true }: RoundedImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), autoPlayDelay);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayDelay, paused, slides.length]);

  const current = slides[index];

  return (
    <section className="w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal */}
        {!hideMainTitle && (
          <div className="text-center mb-3">
            <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-poppins font-bold text-black tracking-wide">
              Déjanos explicarte como te entendemos.
            </h2>
          </div>
        )}

        {/* Text */}
        <div className="w-full flex flex-col items-center justify-center py-2">
          <div className="px-4 max-w-2xl mb-2 text-center">
            <h3
              className={`text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-poppins ${titleBold ? 'font-bold' : 'font-normal'} tracking-wide text-black`}
              style={{ textTransform: "none" }}
              dangerouslySetInnerHTML={{ __html: current.title }}
            />
            {current.text && (
              <p className="mt-1 text-sm md:text-sm font-poppins font-normal text-black no-bold" style={{ textTransform: "none", fontWeight: 400 }} dangerouslySetInnerHTML={{ __html: current.text }} />
            )}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex gap-2 mb-3">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === i 
                    ? (i % 2 === 0 ? '#000000' : '#FFD700')
                    : '#D1D5DB'
                }}
              />
            ))}
          </div>

          {/* Nav */}
          <div className="flex gap-4 py-4">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p + 1) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronRight className="w-8 h-8" />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full max-w-2xl md:max-w-3xl mx-auto h-[28vh] md:h-[32vh] relative flex items-center justify-center rounded-[2rem] overflow-hidden">
          {slides.map((s, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 cursor-zoom-in rounded-[2rem] overflow-hidden"
              style={{ pointerEvents: index === i ? "auto" : "none" }}
              onClick={() => setOpen(true)}
            >
              <img
                src={s.image}
                alt={s.alt || s.title}
                className="w-full h-full object-cover rounded-[2rem]"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal enlarge */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-3xl overflow-hidden">
            <img
              src={current.image}
              alt={current.alt || current.title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RoundedImageCarousel;
