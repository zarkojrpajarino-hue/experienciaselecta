import React from "react";
import { motion } from "framer-motion";

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

const BasketBubbleField: React.FC = () => {
  const bubbles = basketImages.slice(0, 12).map((image, index) => {
    const fromLeftSide = index % 2 === 0;
    const left = fromLeftSide ? 10 + (index % 3) * 5 : 75 - (index % 3) * 5;
    const top = 15 + ((index * 12) % 50);
    const size = index % 3 === 0 ? 90 : index % 3 === 1 ? 78 : 68;

    return { image, size, left, top, fromLeftSide, index };
  });

  return (
    <div className="relative w-full h-full max-w-6xl mx-auto">
      {bubbles.map(({ image, size, left, top, fromLeftSide, index }) => (
        <motion.div
          key={index}
          className="absolute rounded-full overflow-hidden shadow-xl border border-[#D4AF37]/50 bg-white/80"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
          }}
          initial={{ scale: 0, opacity: 0, y: fromLeftSide ? 20 : -20 }}
          animate={{
            scale: [0, 1.05, 1, 0.95, 0],
            opacity: [0, 0.9, 1, 0.7, 0],
            y: fromLeftSide ? [20, 8, -8, -20, -35] : [-20, -8, 8, 20, 35],
          }}
          transition={{
            duration: 11,
            delay: index * 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0,
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
    </div>
  );
};

export default BasketBubbleField;
