import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import experienciaSelectaImg from "@/assets/experiencia-selecta-nueva-limpia.png";

const ExperienciaSelectaSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-8 md:py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-24 md:gap-48 max-w-7xl mx-auto">
          {/* Text Content - SWAPPED TO LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2"
          >
            <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gold/20">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-cormorant font-bold text-white mb-4">
                <span className="text-black">Experiencia</span> <span className="inline-block ml-32">selecta.</span>
              </h2>
              <p className="text-white text-base md:text-lg leading-relaxed font-work-sans mb-3">
                Productos <span className="text-gold font-semibold">ibéricos premium</span>, con{" "}
                <span className="text-gold font-semibold">experiencias</span> de{" "}
                <span className="text-gold font-semibold">conexión</span> incluidas.
              </p>
              <p className="text-white/90 text-sm md:text-base leading-relaxed font-work-sans">
                Comprometidos con la <span className="text-gold font-semibold">sostenibilidad</span> y el respeto por el medio ambiente, en cada paso de nuestra cadena de producción, <span className="text-[#ff1493] font-semibold">calidad sin igual.</span>
              </p>
            </div>
          </motion.div>

          {/* Image - SWAPPED TO RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2"
          >
            <div className="relative group cursor-pointer" onClick={() => navigate('/nuestra-identidad')}>
              <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-all duration-300">
                <img
                  src={experienciaSelectaImg}
                  alt="Experiencia Selecta"
                  className="w-full h-[500px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-500 rounded-3xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienciaSelectaSection;
