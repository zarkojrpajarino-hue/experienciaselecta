import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, MousePointer2 } from "lucide-react";
import heroBgImage from "@/assets/hero-pareja-brindis-clean.png";
const VisualHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Solo mostrar en la página principal
  const allowedPaths = ['/'];
  const shouldShow = allowedPaths.includes(location.pathname);
  
  if (!shouldShow) return null;

  return <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center rounded-3xl"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${heroBgImage})` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mt-[15vh] sm:mt-0">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-8 py-4 sm:px-12 sm:py-16"
        >
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-12 sm:mb-16 whitespace-nowrap -mt-[20vh] sm:mt-0">
            <span style={{ color: '#FFD700' }}>Experiencia</span> Selecta.
          </h1>
          
          {/* Nueva frase "Crea tu propia experiencia" con flecha */}
          <div className="relative inline-block mb-12 sm:mb-16">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('categoria-cestas');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ color: '#FFD700' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-white font-poppins font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 uppercase tracking-normal sm:tracking-widest whitespace-nowrap"
            >
              Crea tu propia experiencia.
            </motion.button>
            
            {/* Animación del cursor en el primer botón */}
            <motion.div
              className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                opacity: [0, 1, 1, 1, 0],
                scale: [1, 1, 0.85, 1, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2.5,
                times: [0, 0.2, 0.35, 0.5, 0.7]
              }}
            >
              <MousePointer2 className="w-6 h-6 text-[#FFD700] drop-shadow-lg" />
            </motion.div>
          </div>
          
          <p className="font-poppins text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto font-bold">
            Cestas <span style={{ color: '#FFD700' }}>gourmet</span> con <span style={{ color: '#FFD700' }}>dinámicas</span> para <span style={{ color: '#FFD700' }}>abrirse</span>, <span style={{ color: '#FFD700' }}>conocerse</span> y <span style={{ color: '#FFD700' }}>descubrir</span>.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="relative inline-block">
              <motion.button 
                whileHover={{ color: '#FFD700' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 text-white font-poppins font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 uppercase tracking-normal sm:tracking-widest whitespace-nowrap"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('porque-no-vendemos-cestas');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                Conócenos.
              </motion.button>
              
              {/* Animación del cursor en el segundo botón */}
              <motion.div
                className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  opacity: [0, 0, 1, 1, 1, 0],
                  scale: [1, 1, 1, 0.85, 1, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  times: [0, 0.4, 0.5, 0.6, 0.7, 0.9]
                }}
              >
                <MousePointer2 className="w-6 h-6 text-[#FFD700] drop-shadow-lg" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default VisualHeader;