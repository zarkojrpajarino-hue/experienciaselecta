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
  const bubbles = basketImages.map((image, index) => {
    const size = index % 3 === 0 ? 88 : index % 3 === 1 ? 72 : 64;
    const left = 8 + (index * 9) % 84;
    const top = 5 + ((index * 13) % 60);

    return { image, size, left, top, index };
  });

  return (
    <div className="relative w-full h-full max-w-6xl mx-auto">
      {bubbles.map(({ image, size, left, top, index }) => (
        <motion.div
          key={index}
          className="absolute rounded-full overflow-hidden shadow-xl border border-[#D4AF37]/50 bg-white/80"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
          }}
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{
            scale: [0, 1, 1.05, 0.8, 0],
            opacity: [0, 1, 1, 0.8, 0],
            y: [20, 0, -10, -25, -40],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: index * 0.6,
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
    </div>
  );
};

export default BasketBubbleField;
