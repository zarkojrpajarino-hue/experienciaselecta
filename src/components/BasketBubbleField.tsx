import React from "react";
import { motion } from "framer-motion";

import pompaJamon from "@/assets/pompa-jamon-1.jpg";
import pompaQueso from "@/assets/pompa-queso-2.jpg";
import pompaAceite from "@/assets/pompa-aceite-3.jpg";
import pompaEmbutidos from "@/assets/pompa-embutidos-4.jpg";
import pompaCesta from "@/assets/pompa-cesta-5.jpg";

const pompaImages = [
  pompaJamon,
  pompaQueso,
  pompaAceite,
  pompaEmbutidos,
  pompaCesta,
];

const BasketBubbleField: React.FC = () => {
  const bubbles = pompaImages.map((image, index) => {
    // Posiciones en las esquinas y laterales para no interferir con texto central
    const positions = [
      { left: 5, top: 10 },    // Superior izquierda
      { left: 85, top: 15 },   // Superior derecha
      { left: 8, top: 70 },    // Inferior izquierda
      { left: 88, top: 75 },   // Inferior derecha
      { left: 5, top: 40 },    // Medio izquierda
    ];

    const position = positions[index];
    const size = 85;

    return { image, size, ...position, index };
  });

  return (
    <div className="relative w-full h-full max-w-6xl mx-auto">
      {bubbles.map(({ image, size, left, top, index }) => (
        <motion.div
          key={index}
          className="absolute rounded-full overflow-hidden shadow-xl border-2 border-[#D4AF37]/60 bg-white/90"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.08, 1, 0.92, 0],
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
            alt="Producto Gourmet Ibérico"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default BasketBubbleField;
