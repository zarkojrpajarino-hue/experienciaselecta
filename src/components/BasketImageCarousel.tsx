import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Import images - muestrario de cestas del catálogo
import parejaInicialImg from "@/assets/pareja-inicial-nueva-clean.jpg";
import conversacionNaturalImg from "@/assets/pareja-natural-nueva-clean.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";
import trioIbericoNuevoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
import mesaAbiertaNuevoImg from "@/assets/mesa-abierta-nuevo-clean.jpg";
import ibericosSelectosNuevoImg from "@/assets/ibericos-selectos-nuevo-clean.jpg";
import familiarClasicaNuevoImg from "@/assets/familiar-clasica-nuevo-clean.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica-clean.jpg";
import granTertuliaNuevoImg from "@/assets/gran-tertulia-nuevo-clean.jpg";
import celebracionIbericaNuevoImg from "@/assets/celebracion-iberica-nuevo-clean.jpg";
import festinSelectoNuevoImg from "@/assets/festin-selecto-nuevo-clean.jpg";
import experienciaSelectaImg from "@/assets/experiencia-selecta-nuevo-clean.jpg";

const basketImages = [
  parejaInicialImg,
  conversacionNaturalImg,
  parejaGourmetImg,
  trioIbericoNuevoImg,
  mesaAbiertaNuevoImg,
  ibericosSelectosNuevoImg,
  familiarClasicaNuevoImg,
  experienciaGastronomicaImg,
  granTertuliaNuevoImg,
  celebracionIbericaNuevoImg,
  festinSelectoNuevoImg,
  experienciaSelectaImg,
];

const BasketImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % basketImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calcular índices visibles (actual, siguiente, anterior)
  const getVisibleIndices = () => {
    const prev = (currentIndex - 1 + basketImages.length) % basketImages.length;
    const next = (currentIndex + 1) % basketImages.length;
    return [prev, currentIndex, next];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div className="relative w-full h-32 md:h-40 mb-6 overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {visibleIndices.map((idx, position) => {
          const isCenter = position === 1;
          const offset = position === 0 ? -1 : position === 2 ? 1 : 0;

          return (
            <motion.div
              key={`${idx}-${currentIndex}`}
              initial={{
                x: offset * 150,
                scale: isCenter ? 1 : 0.7,
                opacity: isCenter ? 1 : 0.4,
                zIndex: isCenter ? 20 : 10,
              }}
              animate={{
                x: offset * 150,
                scale: isCenter ? 1 : 0.7,
                opacity: isCenter ? 1 : 0.4,
                zIndex: isCenter ? 20 : 10,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-black/10">
                <img
                  src={basketImages[idx]}
                  alt={`Cesta ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
        {basketImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: idx === currentIndex ? '#D4AF37' : '#D1D5DB',
            }}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BasketImageCarousel;
