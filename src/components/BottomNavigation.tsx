import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BottomNavigation = () => {
  const navigate = useNavigate();

  const navigationItems = [
    { label: "Experiencia Selecta", path: "/experiencia-selecta" },
    { label: "Sobre Nosotros", path: "/sobre-nosotros-detalle" },
    { label: "Nuestros Clientes", path: "/nuestros-clientes" },
    { label: "Preguntas Frecuentes", path: "/preguntas-frecuentes" }
  ];

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black shadow-lg z-40"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center gap-8 py-4">
          {navigationItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(item.path)}
              className="text-black font-work-sans font-bold text-sm md:text-base hover:text-gray-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
