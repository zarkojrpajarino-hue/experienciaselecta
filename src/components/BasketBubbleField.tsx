import React from "react";
import { motion } from "framer-motion";

import parejaInicialImg from "@/assets/pareja-inicial-nueva-clean.jpg";
import parejaGourmetImg from "@/assets/pareja-gourmet-nueva-clean.jpg";
import trioIbericoNuevoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
import ibericosSelectosNuevoImg from "@/assets/ibericos-selectos-nuevo-clean.jpg";
import experienciaGastronomicaImg from "@/assets/experiencia-gastronomica-clean.jpg";

const cestaImages = [
  parejaInicialImg,
  parejaGourmetImg,
  trioIbericoNuevoImg,
  ibericosSelectosNuevoImg,
  experienciaGastronomicaImg,
];

const BasketBubbleField: React.FC = () => {
  const bubbles = cestaImages.map((image, index) => {
    // Posiciones estratégicas que evitan el centro y se adaptan a móvil
    const positions = [
      { left: 2, top: 8 },     // Superior izquierda
      { left: 90, top: 12 },   // Superior derecha
      { left: 4, top: 80 },    // Inferior izquierda
      { left: 88, top: 85 },   // Inferior derecha
      { left: 2, top: 45 },    // Medio izquierda
    ];

    const position = positions[index];

    return { image, ...position, index };
  });

  return (
    <div className="relative w-full h-full max-w-6xl mx-auto">
      {bubbles.map(({ image, left, top, index }) => (
        <motion.div
          key={index}
          className="absolute rounded-full overflow-hidden shadow-xl border-2 border-[#D4AF37]/60 bg-white/90"
          style={{
            width: 60,
            height: 60,
            left: `${left}%`,
            top: `${top}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.05, 1, 0.95, 0],
            opacity: [0, 0.85, 1, 0.75, 0],
          }}
          transition={{
            duration: 12,
            delay: index * 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src={image}
            alt="Cesta Experiencia Selecta"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
      
      {/* Versión desktop - pompas más grandes en pantallas medianas y grandes */}
      <style>{`
        @media (min-width: 768px) {
          .absolute.rounded-full {
            width: 85px !important;
            height: 85px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BasketBubbleField;
