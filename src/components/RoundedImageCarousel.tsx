import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
}

const RoundedImageCarousel = ({ slides, autoPlay = true, autoPlayDelay = 5000, hideMainTitle = false }: RoundedImageCarouselProps) => {
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
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-rubik font-bold text-black tracking-wide">
              ¿Quieres entender como te entendemos?
            </h2>
          </div>
        )}

        {/* Text */}
        <div className="w-full flex flex-col items-center justify-center py-4">
          <div className="px-6 max-w-4xl mb-4 text-center">
            <h3
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-poppins font-bold tracking-wide text-black"
              style={{ textTransform: "none" }}
              dangerouslySetInnerHTML={{ __html: current.title }}
            />
            {current.text && (
              <p className="mt-2 text-base md:text-lg font-poppins text-black" style={{ textTransform: "none" }} dangerouslySetInnerHTML={{ __html: current.text }} />
            )}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex gap-2 mb-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === i 
                    ? (i % 2 === 0 ? '#000000' : '#FFD700')
                    : '#D1D5DB'
                }}
              />
            ))}
          </div>

          {/* Nav */}
          <div className="flex gap-6">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronLeft className="w-10 h-10" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIndex((p) => (p + 1) % slides.length)} 
              className="p-0 bg-transparent border-0"
              style={{ color: '#000000' }}
            >
              <ChevronRight className="w-10 h-10" />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full max-w-3xl md:max-w-6xl mx-auto h-[35vh] md:h-[50vh] relative flex items-center justify-center rounded-[2rem] overflow-hidden">
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
        <DialogContent className="max-w-5xl bg-white/95 p-2 border-0">
          <img
            src={current.image}
            alt={current.alt || current.title}
            className="w-full h-[70vh] object-contain rounded-3xl"
            style={{ borderRadius: "1.5rem" }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RoundedImageCarousel;
