import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import heroBgImage from "@/assets/hero-pareja-brindis-clean.png";
const VisualHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Solo mostrar en la página principal
  const allowedPaths = ['/'];
  const shouldShow = allowedPaths.includes(location.pathname);
  
  if (!shouldShow) return null;
  const handleButtonClick = () => {
    if (location.pathname === '/cestas') {
      // Scroll to basket categories section
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    } else {
      navigate('/cestas');
    }
  };
  return <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroBgImage})` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-black/50 backdrop-blur-sm rounded-2xl px-8 py-12 sm:px-12 sm:py-16"
        >
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Experiencia Selecta
          </h1>
          
          <p className="font-inter text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Cestas gourmet con dinámicas para hablar, conocer y reír con quién quieras
          </p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-accent text-white font-inter font-semibold rounded-full text-base sm:text-lg transition-all duration-300 hover:bg-accent/90 shadow-lg hover:shadow-xl"
            onClick={handleButtonClick}
          >
            Descubre tu experiencia
          </motion.button>
        </motion.div>

        {/* Separador blanco bajo el contenedor */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 h-1 bg-white/80 w-3/4 max-w-2xl mx-auto shadow-lg"
        />
      </div>
    </section>;
};
export default VisualHeader;