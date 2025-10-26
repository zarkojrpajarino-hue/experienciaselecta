import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Minus, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import faqPrimeraImagen from "@/assets/faq-primera-imagen.jpg";
import momentosUnicos from "@/assets/momentos-unicos.jpg";
import primerEncuentro from "@/assets/primer-encuentro.png";
import paraCualquiera from "@/assets/para-cualquiera.jpg";
import disfrutaRecuerdos from "@/assets/disfruta-recuerdos.jpg";
import faqCestaPremium from "@/assets/faq-cesta-premium.jpg";
import faqDuracionExperiencia from "@/assets/faq-duracion-experiencia.jpg";
import faqDesconocidosEncuentro from "@/assets/faq-desconocidos-encuentro.jpg";
import faqTodasEdades from "@/assets/faq-todas-edades.jpg";
import faqGarantiaSatisfaccion from "@/assets/faq-garantia-satisfaccion.jpg";
import ContactModal from "@/components/ContactModal";
const FAQPage = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [openCard, setOpenCard] = useState<number | null>(0);
  const [faqPage, setFaqPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [glowIndex, setGlowIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const faqs = [{
    question: <>
          ¿Qué <span className="text-gold">incluye</span> cada <span className="text-gold">cesta</span>?
        </>,
    answer: <>
          Cada cesta incluye una selección <span className="text-gold font-bold">premium de productos ibéricos</span> (jamón, chorizo, queso, etc.), una <span className="text-gold font-bold">guía de conversación personalizada</span> para el tipo de experiencia elegida, instrucciones detalladas y acceso a nuestro <span className="text-gold font-bold">contenido digital exclusivo</span>. Todo viene perfectamente presentado y listo para disfrutar.
        </>,
    image: faqPrimeraImagen
  }, {
    question: <>
          ¿Cuánto <span className="text-gold">dura</span> la <span className="text-gold">experiencia</span>?
        </>,
    answer: <>
          La duración promedio es de <span className="text-gold font-bold">2-4 horas</span>, pero esto varía según el grupo y las dinámicas que elijan. Algunas experiencias íntimas pueden durar menos, mientras que las familiares o grupales pueden extenderse toda una tarde. Lo importante es que cada uno vaya a su ritmo.
        </>,
    image: faqDuracionExperiencia
  }, {
    question: <>
          ¿Es apto para <span className="text-gold">personas</span> que <span className="text-gold">no se conocen</span>?
        </>,
    answer: <>
          ¡Absolutamente! De hecho, es uno de nuestros puntos fuertes. Tenemos cestas específicamente diseñadas para <span className="text-gold font-bold">primeros encuentros y desconocidos</span>. Nuestras dinámicas están pensadas para <span className="text-gold font-bold">romper el hielo</span> de forma natural y crear <span className="text-gold font-bold">conexiones auténticas</span> desde el primer momento.
        </>,
    image: faqDesconocidosEncuentro
  }, {
    question: <>
          ¿<span className="text-gold">Límite</span> de <span className="text-gold">edad</span>?
        </>,
    answer: <>
          Nuestras experiencias están diseñadas para <span className="text-gold font-bold">mayores de 16 años</span> y no hay límite superior. Tenemos dinámicas adaptadas para <span className="text-gold font-bold">diferentes generaciones</span>, desde jóvenes universitarios hasta abuelos. La <span className="text-gold font-bold">curiosidad y las ganas de conectar</span> son los únicos requisitos.
        </>,
    image: faqTodasEdades
  }, {
    question: <>
          ¿<span className="text-gold">Calidad</span> de <span className="text-gold">productos</span>?
        </>,
    answer: <>
          Trabajamos directamente con <span className="text-gold font-bold">productores seleccionados de Extremadura y Andalucía</span>, todos con <span className="text-gold font-bold">denominación de origen</span>. Cada producto pasa por nuestro <span className="text-gold font-bold">control de calidad</span> y se envía en condiciones óptimas de conservación. Incluimos <span className="text-gold font-bold">certificados de autenticidad</span> en cada cesta.
        </>,
    image: faqGarantiaSatisfaccion
  }];

  // Auto-animate cards and open them
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCardIndex(prev => {
        const startIndex = faqPage * 3;
        const endIndex = Math.min(startIndex + 3, faqs.length);
        const next = prev + 1;

        // If we reach the end of current page, loop back to start of page
        if (next >= endIndex) {
          return startIndex;
        }
        return next;
      });
    }, 6000); // Increased to 6 seconds total per card

    return () => clearInterval(interval);
  }, [isAutoPlaying, faqPage, faqs.length]);

  // Auto-open current card with delay, then close before transition
  useEffect(() => {
    // Close immediately when card changes
    setOpenCard(null);

    // Open after 1.5 seconds (card stays closed first)
    const openTimer = setTimeout(() => {
      setOpenCard(currentCardIndex);
    }, 1500);

    // Close 1 second before next card transition
    const closeTimer = setTimeout(() => {
      setOpenCard(null);
    }, 5000);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [currentCardIndex]);

  // Reset to first card of page when page changes
  useEffect(() => {
    setCurrentCardIndex(faqPage * 3);
  }, [faqPage]);
  const handleUserInteraction = () => {
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
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };
  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };
  const currentFaq = faqs[currentCardIndex];
  const toggleCard = (index: number) => {
    setOpenCard(prev => prev === index ? null : index);
  };
  const startIndex = faqPage * 3;
  const endIndex = Math.min(startIndex + 3, faqs.length);
  return <div className="min-h-screen font-work-sans relative">
      {/* Background Images with Crossfade */}
      {faqs.map((faq, index) => <div key={index} className="fixed inset-0 transition-opacity duration-700" style={{
      backgroundImage: `url(${faq.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: currentCardIndex === index ? 1 : 0,
      pointerEvents: 'none',
      zIndex: 0
    }} />)}
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none" style={{ zIndex: 1 }} />
      <Navbar />
      <PageNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-2" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{
          opacity: 0,
          scale: 0.8,
          y: -30
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} transition={{
          duration: 1.2,
          type: "spring",
          stiffness: 60,
          damping: 15
        }} className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-cinzel font-bold text-white mb-4">
              Preguntas <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">frecuentes</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA - moved up */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.1
      }} className="text-center mt-2 mb-6">
          <ContactModal>
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} className="text-white hover:text-gold font-cinzel font-bold text-2xl transition-all duration-300 inline-flex items-center gap-3 border-0 outline-0" style={{
            textShadow: '0 0 0px rgba(212, 175, 55, 0)',
            border: 'none',
            outline: 'none'
          }} onMouseEnter={e => {
            e.currentTarget.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.9), 0 0 30px rgba(212, 175, 55, 0.6)';
          }} onMouseLeave={e => {
            e.currentTarget.style.textShadow = '0 0 0px rgba(212, 175, 55, 0)';
          }}>
              Contáctanos
              <motion.div animate={{
              x: [0, 5, 0]
            }} transition={{
              duration: 1.5,
              repeat: Infinity
            }}>
                <ArrowRight className="w-6 h-6 text-gold" />
              </motion.div>
            </motion.button>
          </ContactModal>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <section className="py-4 flex items-center min-h-[500px] relative" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <motion.button whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }} onClick={() => {
            setCurrentCardIndex(prev => (prev - 1 + faqs.length) % faqs.length);
            handleUserInteraction();
          }} className="flex items-center justify-center w-14 h-14 bg-transparent hover:bg-transparent text-gold hover:text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-2 border-gold/50 hover:border-gold relative z-10">
              <ChevronLeft className="w-7 h-7" />
            </motion.button>
            
            <motion.button whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }} onClick={() => {
            setCurrentCardIndex(prev => (prev + 1) % faqs.length);
            handleUserInteraction();
          }} className="flex items-center justify-center w-14 h-14 bg-transparent hover:bg-transparent text-gold hover:text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-2 border-gold/50 hover:border-gold relative z-10">
              <ChevronRight className="w-7 h-7" />
            </motion.button>
          </div>

          <div className="relative max-w-4xl mx-auto h-[400px] perspective-1000" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={cardRef}>
            <AnimatePresence mode="popLayout">
              {faqs.map((faq, index) => {
              const offset = (index - currentCardIndex + faqs.length) % faqs.length;
              const isActive = offset === 0;
              const alignRight = index % 2 === 1;
              return <motion.div key={index} initial={{
                rotateY: -90,
                opacity: 0,
                z: -200,
                x: alignRight ? 100 : -100
              }} animate={{
                rotateY: offset === 0 ? 0 : offset * 15,
                opacity: offset === 0 ? 1 : 0.3,
                z: offset === 0 ? 0 : -offset * 100,
                scale: offset === 0 ? 1 : 0.9 - offset * 0.1,
                x: alignRight ? offset === 0 ? 0 : offset * 50 : offset === 0 ? 0 : -offset * 50
              }} exit={{
                rotateY: 90,
                opacity: 0,
                z: -200,
                x: alignRight ? -100 : 100
              }} transition={{
                duration: 0.6,
                ease: "easeInOut"
              }} className="absolute inset-0" style={{
                transformStyle: 'preserve-3d',
                pointerEvents: isActive ? 'auto' : 'none'
              }} onClick={handleUserInteraction}>
                    <Collapsible open={openCard === index} onOpenChange={() => toggleCard(index)}>
                      <CollapsibleTrigger asChild>
                        <div onMouseEnter={() => {
                      setGlowIndex(index);
                      setTimeout(() => setGlowIndex(null), 1000);
                    }} className={`rounded-xl p-6 transition-all duration-300 group cursor-pointer ${glowIndex === index ? 'shadow-2xl shadow-gold/30' : ''} ${alignRight ? 'ml-auto' : 'mr-auto'} w-full md:w-[80%]`}>
                          <div className={alignRight ? 'md:text-right' : 'md:text-left'}>
                            <div className={`flex items-center justify-between gap-4 ${alignRight ? 'flex-row-reverse' : ''}`}>
                              <h4 className={`text-xl font-cinzel font-bold text-white ${glowIndex === index ? 'text-gold' : ''} transition-all duration-300 ${alignRight ? 'text-right' : ''}`}>
                                {faq.question}
                              </h4>
                              <motion.div animate={{
                            rotate: openCard === index ? 180 : 0
                          }} transition={{
                            duration: 0.3
                          }} className="flex-shrink-0">
                                <Minus className="w-5 h-5 text-gold" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="animate-accordion-down">
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mt-2 mx-auto w-full md:w-[90%] text-center">
                          <p className="text-white font-lora font-bold text-sm lowercase first-letter:uppercase leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>;
            })}
            </AnimatePresence>
          </div>



        </div>
      </section>
    </div>;
};
export default FAQPage;