import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ValuesSection from "@/components/ValuesSection";
import aboutBackgroundImg from "@/assets/sobre-nosotros-hero-final.jpg";
import { useNavigate } from "react-router-dom";

const AboutSectionComplete = () => {
  const navigate = useNavigate();
  
  return <>
      {/* Hero Section */}
      <section id="sobre-nosotros" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden w-full py-16" style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${aboutBackgroundImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 35%',
      backgroundAttachment: 'fixed'
    }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          x: 100,
          rotate: -5
        }} animate={{
          opacity: 1,
          x: 0,
          rotate: 0
        }} transition={{
          duration: 1.3,
          type: "spring",
          stiffness: 50,
          damping: 15
        }} className="max-w-4xl mx-auto">
            
            
            <motion.div initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.8,
            delay: 0.3
          }} className="inline-block">
              <Button type="button" onClick={() => navigate('/sobre-nosotros-detalle')} size="lg" variant="ghost" className="text-white font-bold hover:text-gold hover:bg-transparent transition-all duration-300 font-work-sans tracking-wide text-lg">
                <ChevronDown className="mr-2" />
                Ver más sobre nosotros
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Values Section - refactorizado */}
      <ValuesSection />
    </>;
};
export default AboutSectionComplete;