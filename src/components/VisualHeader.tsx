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
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${heroBgImage})` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-sm rounded-2xl px-8 py-12 sm:px-12 sm:py-16"
        >
          <h1 className="font-poppins text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            <span style={{ color: '#FFD700' }}>Experiencia</span> <span style={{ color: '#FFD700' }}>Selecta</span>
          </h1>
          
          <p className="font-poppins text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto font-bold">
            Cestas <span style={{ color: '#FFD700' }}>gourmet</span> con <span style={{ color: '#FFD700' }}>dinámicas</span> para <span style={{ color: '#FFD700' }}>hablar</span>, <span style={{ color: '#FFD700' }}>conocer</span> y <span style={{ color: '#FFD700' }}>reír</span> con quién quieras
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button 
              whileHover={{ color: '#FFD700' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-white font-poppins font-semibold text-base sm:text-lg transition-all duration-300 uppercase"
              onClick={handleButtonClick}
            >
              Descubre tu <span style={{ color: '#FFD700' }}>experiencia</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ color: '#FFD700' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-white font-poppins font-semibold text-base sm:text-lg transition-all duration-300 uppercase"
              onClick={() => {
                const element = document.getElementById('categoria-cestas');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Escoja su <span style={{ color: '#FFD700' }}>categoría</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default VisualHeader;