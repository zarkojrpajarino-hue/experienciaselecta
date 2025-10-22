import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Package, Send, Calculator, Sparkles, Upload, Heart, AlertTriangle, DollarSign } from "lucide-react";
import headerBg from "@/assets/iberian-products-background.jpg";

// Import step images
import eligeConQuienImg from "@/assets/paso-elige-embutidos-cayendo.png";
import compraCestaImg from "@/assets/paso-compra-cesta.jpg";
import escenarioPerfectoImg from "@/assets/paso-escenario-perfecto.jpg";
import disfrutaRecuerdosImg from "@/assets/paso-disfruta-recuerdos.jpg";
const ProcessSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [glowIndex, setGlowIndex] = useState(0);
  const steps = [{
    id: 1,
    title: <>Elige.</>,
    description: "Familia, amigos, pareja o desconocidos.",
    icon: Heart,
    details: <span>
        Cestas, <span style={{ color: '#D4AF37' }} className="font-semibold">para cada conexión.</span>
      </span>,
    color: "text-secondary",
    image: eligeConQuienImg
  }, {
    id: 2,
    title: <>Compra.</>,
    description: "Productos ibéricos premium, con experiencia incluida.",
    icon: Package,
    details: <span>
        <span style={{ color: '#D4AF37' }} className="font-semibold">Calidad, conversación.</span>
      </span>,
    color: "text-accent",
    image: compraCestaImg
  }, {
    id: 3,
    title: <>Escoge.</>,
    description: "En casa, al aire libre o donde quieras.",
    icon: Sparkles,
    details: <span>
        <span style={{ color: '#D4AF37' }} className="font-semibold">Cualquier lugar.</span>
      </span>,
    color: "text-primary",
    image: escenarioPerfectoImg
  }, {
    id: 4,
    title: <>Disfruta.</>,
    description: "Conversaciones profundas y momentos inolvidables.",
    icon: DollarSign,
    details: <span>
        <span style={{ color: '#D4AF37' }} className="font-semibold">Conversación profunda, recuerdos.</span>
      </span>,
    color: "text-destructive",
    image: disfrutaRecuerdosImg
  }];

  // Auto-slide functionality - 4 seconds
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, steps.length]);

  // Glow effect rotation
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowIndex(prev => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(glowInterval);
  }, [steps.length]);
  const nextStep = () => {
    setCurrentStep(prev => (prev + 1) % steps.length);
  };
  const prevStep = () => {
    setCurrentStep(prev => (prev - 1 + steps.length) % steps.length);
  };
  const goToStep = (index: number) => {
    setCurrentStep(index);
  };
  return <section id="proceso" className="relative overflow-hidden rounded-3xl" style={{ padding: 0, margin: 0 }}>
      {/* Background Images with Crossfade */}
      {steps.map((step, index) => <div key={`bg-${step.id}-${index}`} className="absolute inset-0 z-0 transition-opacity duration-500 rounded-3xl" style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${step.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      backgroundAttachment: 'scroll',
      opacity: currentStep === index ? 1 : 0,
      pointerEvents: 'none'
    }} />)}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5" style={{ zIndex: 1 }} />

      <div className="relative z-10">
        <section className="pt-8 pb-4 flex items-end min-h-[500px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: -50,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            y: 0,
            scale: 1
          }} transition={{
            duration: 1.1,
            type: "spring",
            stiffness: 60,
            damping: 15
          }} className="text-center mb-6 sm:mb-8">
              
              <p className="text-base sm:text-lg md:text-xl font-lora text-white/90 max-w-3xl mx-auto px-4 mt-6">
                
              </p>
            </motion.div>

            {/* Stacked Cards Container */}
            <div className="flex flex-col items-center justify-center min-h-[240px] relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
              <div className="relative w-full max-w-4xl mx-4 sm:mx-auto h-[220px] flex items-center justify-center">
                {(() => {
                  const activeStep = steps[currentStep];
                  return (
                    <motion.div
                      key={activeStep.id}
                      className="absolute inset-0 z-30 flex items-center justify-center w-full"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                      <div className="p-6 sm:p-8 w-full max-w-2xl mx-auto">
                        <div className="text-center">
                          <h3 className="text-xl md:text-2xl font-cinzel font-semibold text-white mb-6 lowercase first-letter:uppercase">
                            {activeStep.title}
                          </h3>
                          <div className="font-lora text-white font-semibold leading-relaxed text-lg md:text-xl lg:text-2xl">
                            {activeStep.details}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

              </div>

              {/* Horizontal Navigation Buttons */}
              <div className="flex gap-4 mt-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  onClick={prevStep} 
                  className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-white hover:text-white/80 rounded-full shadow-none hover:shadow-none transition-all duration-300 border-0"
                >
                  <ChevronUp className="w-8 h-8" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  onClick={nextStep} 
                  className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-white hover:text-white/80 rounded-full shadow-none hover:shadow-none transition-all duration-300 border-0"
                >
                  <ChevronDown className="w-8 h-8" />
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>;
};
export default ProcessSteps;
