import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SlideItem {
  image: string;
  title: string;
  text?: string;
  alt?: string;
}

interface RoundedImageCarouselProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

const RoundedImageCarousel = ({ slides, autoPlay = true, autoPlayDelay = 5000 }: RoundedImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), autoPlayDelay);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayDelay, paused, slides.length]);

  const current = slides[index];

  return (
    <section className="w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Text */}
        <div className="w-full flex flex-col items-center justify-center py-4">
          <div className="px-6 max-w-4xl mb-4 text-center">
            <h3
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-cinzel font-bold tracking-wide normal-case"
              style={{ textTransform: "none" }}
            >
              {current.title}
            </h3>
            {current.text && (
              <p className="mt-2 text-base md:text-lg font-work-sans normal-case" style={{ textTransform: "none" }}>
                {current.text}
              </p>
            )}
          </div>

          {/* Nav */}
          <div className="flex gap-6">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIndex((p) => (p - 1 + slides.length) % slides.length)} className="p-0 bg-transparent border-0 text-white/90">
              <ChevronUp className="w-6 h-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIndex((p) => (p + 1) % slides.length)} className="p-0 bg-transparent border-0 text-white/90">
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full h-[35vh] md:h-[45vh] relative flex items-center justify-center">
          {slides.map((s, i) => (
            <motion.img
              key={i}
              src={s.image}
              alt={s.alt || s.title}
              initial={false}
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full object-contain rounded-3xl shadow-xl"
              style={{ pointerEvents: index === i ? "auto" : "none" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoundedImageCarousel;
