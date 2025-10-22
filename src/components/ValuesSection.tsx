import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import valoresTablaIbericosImg from "@/assets/valores-tabla-ibericos.jpg";
import valoresTostasAceiteImg from "@/assets/valores-tostas-aceite.jpg";
import valoresJamonTablaImg from "@/assets/valores-proposito-nuevo-limpio.png";
import valoresConversacionImg from "@/assets/valores-conversacion-nueva.png";

const values = [
  { text: "productores locales, ", highlight: "máxima excelencia", end: "." },
  { text: "tradición española con ", highlight: "dinámicas modernas", end: "." },
  { text: "los mejores recuerdos ", highlight: "se viven", mid: ", no se graban. lo ", highlight2: "auténtico", end: " nunca sale en cámara." },
  { text: "hablamos más pero ", highlight: "escuchamos menos", mid: ". ", highlight2: "conversación, silencio", end: " importan." },
];

const valueBackgrounds = [
  { img: valoresTablaIbericosImg, position: "center 80%" },
  { img: valoresTostasAceiteImg, position: "center 80%" },
  { img: valoresJamonTablaImg, position: "center 80%" },
  { img: valoresConversacionImg, position: "center 60%" },
];

const ValuesSection = () => {
  const [index, setIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-play every 5s with proper cleanup
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % values.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isAutoPlaying]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  const handleUserInteraction = () => {
    // Stop auto-play
    setIsAutoPlaying(false);

    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Set new timer to resume after 7 seconds
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 7000);
    setInactivityTimer(timer);
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + values.length) % values.length);
    handleUserInteraction();
  };
  
  const goNext = () => {
    setIndex((prev) => (prev + 1) % values.length);
    handleUserInteraction();
  };

  return (
    <section className="relative overflow-hidden w-full" style={{ backgroundColor: '#0a0a0a', padding: 0, margin: 0 }}>
      {/* Crossfade backgrounds */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: '#0a0a0a' }}>
        {valueBackgrounds.map((bg, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url(${bg.img})`,
              backgroundSize: "cover",
              backgroundPosition: bg.position,
              opacity: index === i ? 0.6 : 0,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* Overlay oscuro para evitar destellos */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1 }} />

      <div className="relative z-10">
        <section className="pt-16 pb-8 flex items-center min-h-[500px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 w-full px-4 overflow-hidden">
              {/* Fixed-height text area with crossfade to avoid layout shifts */}
              <div className="relative w-full h-[100px] md:h-[120px] lg:h-[140px] overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={index}
                    className={`absolute inset-0 flex items-center ${index % 2 === 0 ? "justify-end text-right" : "justify-start text-left"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <p className="font-lora font-bold leading-relaxed text-base md:text-lg lg:text-xl normal-case" style={{ color: '#1e3a8a', textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}>
                      {values[index].text}
                      <span style={{ color: '#d4af37' }}>{values[index].highlight}</span>
                      {(values[index] as any).mid}
                      {(values[index] as any).highlight2 && <span style={{ color: '#d4af37' }}>{(values[index] as any).highlight2}</span>}
                      {(values[index] as any).mid2}
                      {(values[index] as any).highlight3 && <span style={{ color: '#d4af37' }}>{(values[index] as any).highlight3}</span>}
                      {values[index].end}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls - reduced size per request */}
              <div className="flex justify-center w-full gap-4 mt-4">
                <Button
                  onClick={goPrev}
                  variant="ghost"
                  size="icon"
                  style={{ color: '#1e3a8a' }}
                  className="hover:text-gold font-bold bg-white/10 hover:bg-white/20 border-0 h-10 w-10 md:h-12 md:w-12 lg:h-12 lg:w-12 [&_svg]:!w-10 [&_svg]:!h-10 md:[&_svg]:!w-12 md:[&_svg]:!h-12 lg:[&_svg]:!w-12 lg:[&_svg]:!h-12"
                  aria-label="Anterior valor"
                >
                  <ChevronLeft />
                </Button>

                <Button
                  onClick={goNext}
                  variant="ghost"
                  size="icon"
                  style={{ color: '#1e3a8a' }}
                  className="hover:text-gold font-bold bg-white/10 hover:bg-white/20 border-0 h-10 w-10 md:h-12 md:w-12 lg:h-12 lg:w-12 [&_svg]:!w-10 [&_svg]:!h-10 md:[&_svg]:!w-12 md:[&_svg]:!h-12 lg:[&_svg]:!w-12 lg:[&_svg]:!h-12"
                  aria-label="Siguiente valor"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default ValuesSection;
