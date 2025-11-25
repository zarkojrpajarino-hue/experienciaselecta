import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import experienciaSelectaImg from "@/assets/experiencia-selecta-nueva-limpia.png";
const ExperienciaSelectaSection = () => {
  const navigate = useNavigate();
  return <section className="py-4 md:py-4 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-7xl mx-auto">
          {/* Text Content - SWAPPED TO LEFT */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }} className="w-full md:w-1/2">
            
          </motion.div>

          {/* Image - SWAPPED TO RIGHT */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} viewport={{
          once: true
        }} className="w-full md:w-1/2">
            <div className="relative group cursor-pointer" onClick={() => navigate('/nuestra-identidad')}>
              <div className="rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-gold/50 transition-all duration-300">
                
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default ExperienciaSelectaSection;