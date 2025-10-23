import { motion } from "framer-motion";
import { ArrowRight, Leaf, Recycle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import iberianBackground from "@/assets/iberian-products-background.jpg";
import couplePicnic from "@/assets/couple-picnic-basket.png";
const HeroSection = () => {
  const features = [{
    icon: Leaf,
    text: "100% Auténtico",
    color: "text-accent"
  }, {
    icon: Recycle,
    text: "Conexiones Reales",
    color: "text-secondary"
  }, {
    icon: Heart,
    text: "Momentos Únicos",
    color: "text-destructive"
  }];
  return <section className="py-10 bg-gradient-to-br from-background via-crema to-background relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-5 bg-cover bg-center" style={{
      backgroundImage: `url(${iberianBackground})`
    }} />
      
      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{
        rotate: 360,
        scale: [1, 1.2, 1]
      }} transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-secondary opacity-10" />
        <motion.div animate={{
        rotate: -360,
        scale: [1, 0.8, 1]
      }} transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-primary opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="space-y-8">
            <div>
              <motion.h2 initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.2
            }} className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-6 leading-tight">
                Cestas <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">ibéricas</span> que conectan corazones.
              </motion.h2>
              
              <motion.p initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.4
            }} className="text-xl font-work-sans font-bold text-muted-foreground mb-8 leading-relaxed">
                Más que una <span className="text-gold">cesta de productos ibéricos,</span> una <span className="text-gold">experiencia que transforma</span> 
                encuentros cotidianos, en <span className="text-gold">conversaciones profundas</span> y <span className="text-gold">conexiones auténticas.</span>
              </motion.p>

              <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.6
            }} className="flex flex-wrap gap-6 mb-8">
                {features.map((feature, index) => <motion.div key={index} whileHover={{
                scale: 1.05,
                y: -5
              }} className="flex items-center space-x-3 bg-background/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg">
                    <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.color}`} />
                    
                  </motion.div>)}
              </motion.div>
            </div>

            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.8
          }} className="flex flex-col sm:flex-row gap-4">
              
            </motion.div>
          </motion.div>

          {/* Right Content - Image and Stats */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="space-y-6">
            {/* Jamón ibérico image */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6 mt-8 lg:mt-0">
              <img src={couplePicnic} alt="Pareja disfrutando cesta ibérica en picnic." className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-3xl md:rounded-[2rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-3xl"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[{
              number: "1000+",
              label: "Experiencias Creadas",
              color: "text-secondary"
            }, {
              number: "500+",
              label: "Conexiones Auténticas",
              color: "text-accent"
            }, {
              number: "4",
              label: "Categorías Disponibles",
              color: "text-primary"
            }, {
              number: "100%",
              label: "Momentos Únicos",
              color: "text-destructive"
            }].map((stat, index) => <motion.div key={index} initial={{
              opacity: 0,
              scale: 0.8
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.6,
              delay: 0.6 + index * 0.1
            }} whileHover={{
              scale: 1.05,
              rotate: 2
            }} className="bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-lg text-center border border-gold/20">
                  <div className={`text-xl sm:text-2xl md:text-3xl font-poppins font-bold ${stat.color} mb-1`}>
                    {stat.number}
                  </div>
                  <div className="font-work-sans text-muted-foreground text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </motion.div>)}
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default HeroSection;