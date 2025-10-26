import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SlideItem {
  image: string;
  title: string | React.ReactNode;
  text?: string | React.ReactNode;
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setIndex((p) => (p + 1) % slides.length);
    } else if (isRightSwipe) {
      setIndex((p) => (p - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), autoPlayDelay);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayDelay, paused, slides.length]);

  const current = slides[index];

  return (
    <section id="que-vendemos" className="w-full py-4 bg-black" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal */}
        {!hideMainTitle && (
          <div className="text-center mb-2">
            <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-poppins font-bold text-white tracking-wide">
              Por qué no vendemos cestas y cómo te entendemos.
            </h2>
          </div>
        )}

        {/* Text */}
        <div className="w-full flex flex-col items-center justify-center py-1">
          <div className="px-4 max-w-2xl mb-1 text-center">
            <div
              className={`text-sm sm:text-base md:text-base lg:text-lg xl:text-xl font-poppins ${titleBold ? 'font-bold' : 'font-normal'} tracking-wide text-white`}
              style={{ textTransform: "none" }}
            >
              {current.title}
            </div>
            {current.text && (
              <div className="mt-1 text-xs md:text-sm font-poppins font-normal text-white no-bold" style={{ textTransform: "none", fontWeight: 400 }}>
                {current.text}
              </div>
            )}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex gap-2 mb-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === i 
                    ? (i % 2 === 0 ? '#FFFFFF' : '#FFD700')
                    : '#D1D5DB'
                }}
              />
            ))}
          </div>

          {/* Nav */}
          <div className="flex gap-3 py-2">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#FFFFFF' }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p + 1) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#FFFFFF' }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <div 
          className="w-full max-w-2xl md:max-w-3xl mx-auto h-[25vh] md:h-[30vh] relative flex items-center justify-center rounded-[2rem] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
                alt={s.alt || (typeof s.title === 'string' ? s.title : 'Imagen del carrusel')}
                className="w-full h-full object-cover rounded-[2rem]"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal enlarge */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="max-w-7xl bg-background border-0 p-0 shadow-none rounded-[2rem] sm:rounded-[2rem] md:rounded-[2rem] lg:rounded-[2rem] xl:rounded-[2rem] overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-[2rem] overflow-hidden">
            <img
              src={current.image}
              alt={current.alt || (typeof current.title === 'string' ? current.title : 'Imagen ampliada')}
              className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RoundedImageCarousel;
