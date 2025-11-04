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
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 whitespace-nowrap -mt-[20vh] sm:mt-0">
            <span style={{ color: '#FFD700' }}>Experiencia</span> Selecta.
          </h1>
          
          {/* Botón "Crea tu propia experiencia" a la izquierda con flecha al lado */}
          <div className="relative mb-8 sm:mb-12 w-full text-left">
            <motion.div
              onClick={(e) => {
                e.preventDefault();
                navigate('/comprar-cestas');
              }}
              initial={{ x: -100, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                scale: [1, 1.05, 1],
              }}
              transition={{
                x: { duration: 0.8 },
                opacity: { duration: 0.8 },
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  times: [0, 0.5, 1]
                }
              }}
              className="inline-flex items-center gap-3 cursor-pointer group"
            >
              <motion.button
                whileHover={{ color: '#FFD700' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 text-white font-poppins font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 uppercase tracking-normal sm:tracking-widest whitespace-nowrap"
              >
                Crea tu propia experiencia.
              </motion.button>
              
              {/* Flecha al lado */}
              <motion.div
                whileHover={{ x: 10 }}
                animate={{
                  y: [0, 5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  },
                  opacity: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  },
                  x: { duration: 0.3 }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </motion.div>
            </motion.div>
          </div>
          
          <p 
            onClick={(e) => {
              e.preventDefault();
              navigate('/comprar-cestas');
            }}
            className="font-poppins text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto font-bold cursor-pointer hover:text-[#FFD700] transition-colors duration-300"
          >
            Cestas <span style={{ color: '#FFD700' }}>gourmet</span> con <span style={{ color: '#FFD700' }}>dinámicas</span> para <span style={{ color: '#FFD700' }}>abrirse</span>, <span style={{ color: '#FFD700' }}>conocerse</span> y <span style={{ color: '#FFD700' }}>descubrir</span>.
          </p>

          {/* Botón "Conócenos" debajo de la frase, a la derecha con flecha al lado */}
          <div className="relative w-full text-right mb-8">
            <motion.div
              onClick={(e) => {
                e.preventDefault();
                navigate('/conocenos');
              }}
              initial={{ x: 100, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                scale: [1, 1.05, 1],
              }}
              transition={{
                x: { duration: 0.8, delay: 0.3 },
                opacity: { duration: 0.8, delay: 0.3 },
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 1.5,
                  times: [0, 0.5, 1]
                }
              }}
              className="inline-flex items-center gap-3 cursor-pointer group"
            >
              <motion.button 
                whileHover={{ color: '#FFD700' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 text-white font-poppins font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 uppercase tracking-normal sm:tracking-widest whitespace-nowrap"
              >
                Conócenos.
              </motion.button>
              
              {/* Flecha al lado */}
              <motion.div
                whileHover={{ x: 10 }}
                animate={{
                  y: [0, 5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 1.5
                  },
                  opacity: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 1.5
                  },
                  x: { duration: 0.3 }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default VisualHeader;