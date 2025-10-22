import { motion } from "framer-motion";
import { Heart, Target, Lightbulb, Plus, Minus, Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import experienciaBg from "@/assets/experiencia-selecta-marca.jpg";
const AboutSection = () => {
  const navigate = useNavigate();
  const [openValue, setOpenValue] = useState<number | null>(null);
  const toggleValue = (index: number) => {
    setOpenValue(prev => prev === index ? null : index);
  };
  return <section id="nosotros" className="py-8 relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${experienciaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 115%',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-black/5" style={{ zIndex: 1 }} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ zIndex: 10 }}>
        <motion.div initial={{
        opacity: 0,
        scale: 0.5,
        rotate: -10
      }} whileInView={{
        opacity: 1,
        scale: 1,
        rotate: 0
      }} transition={{
        duration: 1.2,
        type: "spring",
        stiffness: 60,
        damping: 15
      }} className="text-center mb-4">
          
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start max-w-5xl mx-auto mb-4">
          {/* Selecta - arriba a la derecha */}
          <div></div>
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="rounded-2xl p-6 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 group cursor-pointer" onClick={() => {
          navigate('/nuestra-identidad#selecta');
        }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-cormorant font-bold text-white group-hover:text-gold group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] transition-all duration-300">
                    Selecta
                  </h3>
                </div>
                <motion.button whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }} className="flex items-center justify-center w-10 h-10 bg-transparent hover:bg-transparent text-gold rounded-full transition-all duration-300 border-0 shadow-none" onClick={e => {
              e.stopPropagation();
              navigate('/nuestra-identidad#selecta');
            }}>
                  <Info className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

          {/* Experiencia - abajo a la izquierda */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="rounded-2xl p-6 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 group cursor-pointer" onClick={() => {
          navigate('/experiencia');
        }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-cormorant font-bold text-white group-hover:text-gold group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] transition-all duration-300">
                    Experiencia
                  </h3>
                </div>
                <motion.button whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }} className="flex items-center justify-center w-10 h-10 bg-transparent hover:bg-transparent text-gold rounded-full transition-all duration-300 border-0 shadow-none" onClick={e => {
              e.stopPropagation();
              navigate('/experiencia');
            }}>
                  <Info className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
        </div>


        {/* Values */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
        </motion.div>
      </div>
    </section>;
};
export default AboutSection;
