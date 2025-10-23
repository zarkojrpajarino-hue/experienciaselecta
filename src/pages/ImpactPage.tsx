import { motion } from "framer-motion";
import { Target, Users, Award, TrendingUp, Heart, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import impactBackgroundImg from "@/assets/people-sharing-experience.jpg";
import statsBackgroundImg from "@/assets/experiencia-gastronomica-clean.jpg";
import celebracionBackgroundImg from "@/assets/celebracion-iberica-nuevo-clean.jpg";

const ImpactPage = () => {
  const [openStatId, setOpenStatId] = useState<number | null>(null);
  const [openMission, setOpenMission] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [statsPage, setStatsPage] = useState(0); // 0 = cards 0-2, 1 = cards 3-5
  
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const missionSectionRef = useRef<HTMLDivElement>(null);

  // Auto-animate stats
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setOpenStatId((prev) => {
        const startIndex = statsPage * 3;
        const endIndex = startIndex + 3;
        
        if (prev === null || prev < startIndex || prev >= endIndex) {
          return startIndex; // Start from first card of current page
        }
        
        const next = prev + 1;
        // If we reach the end of current page, loop back to start of page
        if (next >= endIndex) {
          return startIndex;
        }
        return next;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, statsPage]);

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Reset animation when page changes
  useEffect(() => {
    setOpenStatId(statsPage * 3); // Start from first card of new page
  }, [statsPage]);

  const handleUserInteraction = (index: number) => {
    // Stop auto-play
    setIsAutoPlaying(false);
    
    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Set new timer to resume after 7 seconds
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 7000);
    
    setInactivityTimer(timer);
    
    // Toggle the card
    const isOpening = openStatId !== index;
    setOpenStatId(isOpening ? index : null);
    
    // Center the card when opening
    if (isOpening && statRefs.current[index]) {
      setTimeout(() => {
        statRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const handleMissionToggle = (open: boolean) => {
    setOpenMission(open);
    if (open && missionSectionRef.current) {
      setTimeout(() => {
        missionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const handleStatToggle = (index: number, open: boolean) => {
    // mirror Collapsible change + ensure scroll works when using the chevron trigger
    setIsAutoPlaying(false);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => setIsAutoPlaying(true), 7000);
    setInactivityTimer(timer);

    setOpenStatId(open ? index : null);
    if (open && statRefs.current[index]) {
      setTimeout(() => {
        statRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  const impactStats = [
    {
      icon: Users,
      number: "15,000+",
      label: "Personas Conectadas",
      description: (
        <>
          Hemos facilitado <span className="text-gold font-bold">conexiones auténticas</span> entre <span className="font-bold">miles de personas</span>, creando <span className="text-gold font-bold">vínculos que perduran</span> más allá de la <span className="font-bold">experiencia inicial</span>.
        </>
      ),
      color: "text-primary",
      bgGradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Heart,
      number: "94%",
      label: "Satisfacción Cliente",
      description: (
        <>
          Nuestros <span className="font-bold">clientes</span> valoran especialmente la <span className="text-gold font-bold">originalidad y autenticidad</span> de nuestras <span className="font-bold">experiencias</span>, <span className="text-gold font-bold">recomendándolas activamente</span>.
        </>
      ),
      color: "text-accent",
      bgGradient: "from-accent/20 to-accent/5"
    },
    {
      icon: Award,
      number: "500+",
      label: "Experiencias Únicas",
      description: (
        <>
          Cada <span className="font-bold">mes</span> creamos nuevas <span className="text-gold font-bold">experiencias personalizadas</span>, adaptándonos a <span className="font-bold">diferentes grupos</span> y <span className="text-gold font-bold">ocasiones especiales</span>.
        </>
      ),
      color: "text-secondary",
      bgGradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Target,
      number: "89%",
      label: "Repetición de Compra",
      description: (
        <>
          La <span className="font-bold">mayoría</span> de nuestros <span className="font-bold">clientes</span> <span className="text-gold font-bold">repiten</span>, convirtiéndose en <span className="text-gold font-bold">embajadores de la marca</span> y creando <span className="text-gold font-bold">comunidades locales</span>.
        </>
      ),
      color: "text-destructive",
      bgGradient: "from-destructive/20 to-destructive/5"
    },
    {
      icon: TrendingUp,
      number: "250%",
      label: "Crecimiento Anual",
      description: (
        <>
          Nuestro <span className="font-bold">impacto</span> crece <span className="text-gold font-bold">exponencialmente</span> gracias al <span className="text-gold font-bold">boca a boca</span> y la <span className="text-gold font-bold">satisfacción genuina</span> de nuestros <span className="font-bold">usuarios</span>.
        </>
      ),
      color: "text-primary",
      bgGradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Leaf,
      number: "100%",
      label: "Productos Sostenibles",
      description: (
        <>
          Colaboramos <span className="font-bold">exclusivamente</span> con <span className="text-gold font-bold">productores locales</span> comprometidos con <span className="text-gold font-bold">prácticas sostenibles</span> y <span className="text-gold font-bold">comercio justo</span>.
        </>
      ),
      color: "text-accent",
      bgGradient: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageNavigation />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${celebracionBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.4, type: "spring", stiffness: 50, damping: 15 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-cinzel font-bold text-white mb-6">
              Nuestro <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">impacto</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-lora font-bold text-white/90 mb-8 leading-relaxed">
              Transformando <span className="text-gold">vidas</span> a través de <span className="text-gold">conexiones auténticas</span> y <span className="text-gold">experiencias inolvidables</span>
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white font-lora font-bold text-lg">
                Creando <span className="text-gold">momentos que importan</span> desde <span className="text-gold">2024</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section 
        ref={missionSectionRef}
        className="py-12 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${celebracionBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Collapsible open={openMission} onOpenChange={handleMissionToggle}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto hover:bg-transparent border-0 mb-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-white hover:text-gold transition-all duration-300 flex items-center justify-center gap-3">
                    Nuestra <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">misión</span>
                    {openMission ? <ChevronUp className="h-6 w-6 text-white" /> : <ChevronDown className="h-6 w-6 text-white" />}
                  </h2>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="animate-accordion-down">
                <div className="text-center">
                  <motion.p 
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-lg sm:text-xl font-lora font-bold text-white leading-relaxed mb-6"
                  >
                    En un mundo cada vez más digital y desconectado, creemos que las <span className="text-gold font-bold">experiencias auténticas</span> y las <span className="text-gold font-bold">conexiones genuinas</span> son más importantes que nunca.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl font-lora font-bold text-white leading-relaxed mb-6"
                  >
                    Nuestra misión es facilitar <span className="text-gold font-bold">momentos únicos</span> que rompan con la rutina, fomenten la <span className="text-gold font-bold">conversación real</span> y creen <span className="text-gold font-bold">recuerdos que perduren</span> en el tiempo.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-xl sm:text-2xl font-lora font-bold text-white"
                  >
                    Cada cesta que enviamos es una oportunidad de <span className="text-gold font-bold">transformar</span> una tarde ordinaria en una <span className="text-gold font-bold">experiencia extraordinaria</span>.
                  </motion.p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section 
        className="py-20 relative overflow-hidden transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${statsPage === 0 ? statsBackgroundImg : celebracionBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 1.2, type: "spring", stiffness: 60, damping: 15 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-white mb-6">
              Impacto en <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">números</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 container mx-auto px-4">
            {impactStats.map((stat, index) => {
              const isOpen = openStatId === index;
              
              // Show only 3 cards based on current page
              const startIndex = statsPage * 3;
              const endIndex = startIndex + 3;
              if (index < startIndex || index >= endIndex) return null;
              
              // Local index within current page (0, 1, or 2)
              const localIndex = index - startIndex;
              
              // Primera escalera (page 0): left to right (0=left, 1=center, 2=right)
              // Segunda escalera (page 1): right to left (0=right, 1=center, 2=left)
              let alignClass;
              if (statsPage === 0) {
                // Left to right
                alignClass = localIndex === 0 ? 'mr-auto' : localIndex === 1 ? 'mx-auto' : 'ml-auto';
              } else {
                // Right to left
                alignClass = localIndex === 0 ? 'ml-auto' : localIndex === 1 ? 'mx-auto' : 'mr-auto';
              }
              
              return (
                <motion.div
                  key={index}
                  ref={el => statRefs.current[index] = el}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: localIndex * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 group w-full md:w-[60%] ${alignClass}`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="relative z-10">
                    <Collapsible open={isOpen} onOpenChange={(open) => handleStatToggle(index, open)}>
                      {/* Header with icon and chevron */}
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => handleUserInteraction(index)}>
                        <motion.div 
                          animate={{
                            rotate: isOpen ? 360 : 0,
                            scale: isOpen ? 1.2 : 1
                          }} 
                          transition={{
                            duration: 0.6,
                            repeat: isOpen ? Infinity : 0,
                            repeatDelay: 1
                          }} 
                          className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl"
                        >
                          <stat.icon className={`w-6 h-6 transition-all duration-300 ${isOpen ? 'text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]' : 'text-white'}`} />
                        </motion.div>

                        <CollapsibleTrigger asChild>
                          <div className="flex-shrink-0 h-10 w-10 text-white/90 hover:text-white rounded-full flex items-center justify-center">
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </CollapsibleTrigger>
                      </div>
                      
                      {/* Content below header */}
                      <CollapsibleContent className="animate-accordion-down">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 mt-2">
                          {/* Number */}
                          <motion.h3 
                            className="text-4xl sm:text-5xl font-cinzel font-bold text-gold mb-4"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: isOpen ? 1 : 0.8 }}
                            transition={{ duration: 0.4 }}
                          >
                            {stat.number}
                          </motion.h3>

                          {/* Label */}
                          <h4 className="text-xl font-lora font-bold text-white/90 mb-4">
                            {stat.label}
                          </h4>

                          {/* Description */}
                          <p className="font-lora font-bold text-white leading-relaxed text-sm">
                            {stat.description}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {statsPage > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStatsPage(statsPage - 1)}
                className="text-white hover:text-gold bg-transparent hover:bg-transparent transition-all duration-300 font-bold border-0"
              >
                ← Volver
              </Button>
            )}
            
            {statsPage < 1 && (
              <Button
                variant="ghost"
                onClick={() => setStatsPage(statsPage + 1)}
                className="text-white hover:text-gold bg-transparent hover:bg-transparent transition-all duration-300 font-bold border-0"
              >
                Ver más →
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImpactPage;
