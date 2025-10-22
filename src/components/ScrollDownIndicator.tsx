import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollDownIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // Solo mostrar en la página principal
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      // Ocultar después de scrollear 100px
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !isHomePage) return null;

  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 pointer-events-auto"
      >
        <motion.div
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown 
            className="w-10 h-10" 
            style={{ color: '#ff1493' }}
            strokeWidth={2.5}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ScrollDownIndicator;
