import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
        className="absolute inset-0 w-full h-full bg-cover bg-center rounded-3xl"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${heroBgImage})` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-8 py-12 sm:px-12 sm:py-16"
        >
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 whitespace-nowrap">
            <span style={{ color: '#FFD700' }}>Experiencia</span> Selecta.
          </h1>
          
          <p className="font-poppins text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto font-bold">
            Cestas <span style={{ color: '#FFD700' }}>gourmet</span> con <span style={{ color: '#FFD700' }}>dinámicas</span> para <span style={{ color: '#FFD700' }}>hablar</span>, <span style={{ color: '#FFD700' }}>conocer</span> y <span style={{ color: '#FFD700' }}>reír</span>.
          </p>

          <motion.button 
            whileHover={{ color: '#FFD700' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-white font-bebas font-semibold text-xl sm:text-2xl md:text-3xl transition-all duration-300 uppercase tracking-widest"
            onClick={() => {
              const element = document.getElementById('categoria-cestas');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            ¡Descubre tu <span style={{ color: '#FFD700' }}>experiencia</span>!. <ChevronDown className="inline-block ml-2 w-6 h-6 md:w-8 md:h-8" />
          </motion.button>
        </motion.div>
      </div>
    </section>;
};
export default VisualHeader;