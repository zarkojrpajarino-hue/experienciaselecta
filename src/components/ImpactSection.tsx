import { motion } from "framer-motion";
import { Users, Heart, Star, MessageCircle, Clock, Trophy } from "lucide-react";

const ImpactSection = () => {
  const stats = [
    {
      icon: Users,
      number: "2,500+",
      label: "Personas conectadas",
      description: "Han vivido experiencias auténticas con nosotros",
      color: "text-primary"
    },
    {
      icon: Heart,
      number: "95%",
      label: "Satisfacción",
      description: "De nuestros usuarios repiten la experiencia",
      color: "text-destructive"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Valoración media",
      description: "Basada en más de 1,200 reseñas verificadas",
      color: "text-accent"
    },
    {
      icon: MessageCircle,
      number: "78%",
      label: "Nuevas amistades",
      description: "Mantienen el contacto después de la experiencia",
      color: "text-secondary"
    },
    {
      icon: Clock,
      number: "3.2h",
      label: "Duración promedio",
      description: "Tiempo que dedican a cada experiencia",
      color: "text-primary"
    },
    {
      icon: Trophy,
      number: "50+",
      label: "Ciudades",
      description: "Donde se han vivido nuestras experiencias",
      color: "text-accent"
    }
  ];

  return (
    <section id="impacto" className="py-10 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, rotate: 8, scale: 0.7 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1.3, type: "spring", stiffness: 55, damping: 15 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-cormorant font-light italic text-white tracking-wide"
            >
              Nuestro
            </motion.h2>
            
            <motion.span 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.7,
                type: "spring",
                stiffness: 100
              }}
              className="text-5xl md:text-7xl font-cinzel font-black text-gold tracking-wider relative inline-block"
              style={{
                textShadow: "0 0 30px rgba(218, 165, 32, 0.5), 0 0 60px rgba(218, 165, 32, 0.3)"
              }}
            >
              impacto
            </motion.span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-work-sans font-bold text-white max-w-3xl mx-auto px-4 mt-6">
            <span style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.5)' }} className="backdrop-blur-sm px-6 py-3 rounded-3xl inline-block">
              <span className="text-gold">No hay algoritmo que entienda una mirada</span>. Ni <span className="text-gold">inteligencia artificial que sustituya una conversación sincera</span>
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ 
                scale: 1.08,
                rotateY: 5,
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
              }}
              className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-border/50 hover:border-gold hover:shadow-2xl hover:shadow-gold/50 transition-all duration-500 text-center group cursor-pointer"
            >
              <motion.div
                whileHover={{ 
                  rotate: 360,
                  scale: 1.2
                }}
                transition={{ duration: 0.8, type: "spring" }}
                className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-6 group-hover:shadow-2xl`}
              >
                <stat.icon className={`w-10 h-10 ${stat.color} group-hover:text-gold group-hover:scale-110 transition-all duration-300`} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
              >
                <motion.h3
                  initial={{ scale: 0, y: 20 }}
                  whileInView={{ scale: 1, y: 0 }}
                  transition={{ 
                    delay: 0.2 + index * 0.1, 
                    type: "spring", 
                    stiffness: 300,
                    damping: 20 
                  }}
                  className="text-4xl sm:text-5xl font-poppins font-bold text-primary mb-3 group-hover:text-gold transition-colors duration-300"
                >
                  <motion.span
                    whileHover={{ 
                      textShadow: "0 0 20px rgba(255, 215, 0, 0.6)"
                    }}
                  >
                    {stat.number}
                  </motion.span>
                </motion.h3>
                
                <h4 className="text-xl font-poppins font-semibold text-primary group-hover:text-[hsl(45,100%,65%)] transition-colors mb-3">
                  {stat.label}
                </h4>
                
                <p className="font-work-sans text-primary font-semibold leading-relaxed group-hover:text-primary/80 transition-colors duration-300">
                  {stat.description}
                </p>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-gold to-yellow-400 rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.05 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Interactive CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-8 border-2 border-gold/30 max-w-4xl mx-auto relative overflow-hidden">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/10 to-transparent rounded-full"
            />
            
            <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-4">
              <span style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.5)' }} className="backdrop-blur-sm px-6 py-3 rounded-3xl inline-block">
                <span className="font-bold">Estamos obsesionados con</span> <span className="text-gold">documentarlo todo</span>
              </span>
            </h3>
            <p className="text-lg font-work-sans text-white mb-6">
              <span style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.5)' }} className="backdrop-blur-sm px-6 py-3 rounded-3xl inline-block">
                <span className="font-bold">Fotos, vídeos, stories, likes. Pero</span> <span className="text-gold">lo mejor nunca sale en cámara</span>. <span className="font-bold">Porque</span> <span className="text-gold">los recuerdos reales no se graban, se viven</span>
              </span>
            </p>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Explora Nuestras Cestas
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;