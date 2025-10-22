import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import aboutBackgroundImg from "@/assets/sobre-nosotros-jamon-clean.png";
import { useNavigate } from "react-router-dom";

const AboutHeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full bg-white py-8 px-8 md:px-16 lg:px-24">
      <section id="sobre-nosotros" className="relative min-h-[50vh] md:min-h-[84vh] flex items-start justify-center overflow-hidden w-full py-16 md:rounded-2xl">
        <div className="absolute inset-0 md:rounded-2xl overflow-hidden">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${aboutBackgroundImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundAttachment: 'scroll'
          }}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-8">
          <motion.div 
            initial={{ opacity: 0, x: 100, rotate: -5 }} 
            animate={{ opacity: 1, x: 0, rotate: 0 }} 
            transition={{ duration: 1.3, type: "spring", stiffness: 50, damping: 15 }} 
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, delay: 0.3 }} 
              className="flex flex-col items-center gap-2"
            >
              <p 
                onClick={() => {
                  sessionStorage.setItem('scrollPosition', window.scrollY.toString());
                  navigate('/sobre-nosotros-detalle');
                }}
                className="text-white font-bold font-work-sans tracking-wide text-xl cursor-pointer mb-2"
              >
                Sobre nosotros
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  sessionStorage.setItem('scrollPosition', window.scrollY.toString());
                  navigate('/sobre-nosotros-detalle');
                }}
                className="p-0 bg-transparent text-white hover:text-gold transition-all duration-300 border-0"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutHeroSection;
