import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Minus, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ContactModal from "@/components/ContactModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import faqPrimeraImagen from "@/assets/nueva-seccion-10-clean.jpg";
import momentosUnicos from "@/assets/momentos-unicos.jpg";
import primerEncuentro from "@/assets/primer-encuentro.png";
import paraCualquiera from "@/assets/para-cualquiera.jpg";
import disfrutaRecuerdos from "@/assets/disfruta-recuerdos.jpg";
import faqCestaPremium from "@/assets/faq-cesta-premium.jpg";
import faqDuracionExperiencia from "@/assets/faq-pates-gourmet-final.png";
import faqDesconocidosEncuentro from "@/assets/faq-desconocidos-encuentro.jpg";
import faqTodasEdades from "@/assets/faq-todas-edades.jpg";
import faqGarantiaSatisfaccion from "@/assets/faq-embutidos-ibericos-final.png";

const FAQHorizontalSection = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [openCard, setOpenCard] = useState<number | null>(0);
  const [faqPage, setFaqPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [glowIndex, setGlowIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const faqs = [
    {
      question: <>
        ¿Qué incluye cada cesta?
      </>,
      answer: "Contenido exclusivo personalizado.",
      image: faqPrimeraImagen
    },
    {
      question: <>
        ¿Cuánto dura la experiencia?
      </>,
      answer: "A tu ritmo.",
      image: faqDuracionExperiencia
    },
    {
      question: <>
        ¿Es apto para personas que no se conocen?
      </>,
      answer: "Tenemos cestas diseñadas específicamente para primeros encuentros y desconocidos.",
      image: faqDesconocidosEncuentro
    },
    {
      question: <>
        ¿Calidad de productos?
      </>,
      answer: "Certificada.",
      image: faqGarantiaSatisfaccion
    },
  ];

  // Auto-animate cards and open them
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => {
        const startIndex = faqPage * 3;
        const endIndex = Math.min(startIndex + 3, faqs.length);
        const next = prev + 1;
        if (next >= endIndex) {
          return startIndex;
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, faqPage, faqs.length]);

  // Auto-open current card with delay, then close before transition
  useEffect(() => {
    setOpenCard(currentCardIndex);
  }, [currentCardIndex]);

  // Reset to first card of page when page changes
  useEffect(() => {
    setCurrentCardIndex(faqPage * 3);
  }, [faqPage]);

  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 7000);
    setInactivityTimer(timer);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const toggleCard = (index: number) => {
    setOpenCard((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative overflow-hidden" id="faq" style={{ padding: 0, margin: 0, borderRadius: '1.5rem' }}>
      {/* Background Images with Crossfade - scoped to section */}
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${faq.image})`,
            backgroundSize: 'cover',
            backgroundPosition: currentCardIndex === 1 ? 'center 20%' : 'center bottom',
            opacity: currentCardIndex === index ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: '1.5rem',
          }}
        />
      ))}
      {/* Dark overlay scoped to section - más oscuro */}
      <div className="absolute inset-0 bg-black/5" style={{ zIndex: 1, borderRadius: '1.5rem' }} />

      <div className="relative z-10">
        {/* FAQ Section */}
        <section className="pt-8 pb-4 flex items-end min-h-[500px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            <div
              className="relative max-w-4xl mx-auto h-[280px] perspective-1000 mb-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={cardRef}
            >
              <AnimatePresence mode="popLayout">
                {faqs.map((faq, index) => {
                  const offset = (index - currentCardIndex + faqs.length) % faqs.length;
                  const isActive = offset === 0;
                  const alignRight = index % 2 === 1;
                  return (
                    <motion.div
                      key={index}
                      initial={{ rotateY: -90, opacity: 0, z: -200, x: alignRight ? 100 : -100 }}
                      animate={{
                        rotateY: offset === 0 ? 0 : offset * 15,
                        opacity: offset === 0 ? 1 : 0.3,
                        z: offset === 0 ? 0 : -offset * 100,
                        scale: offset === 0 ? 1 : 0.9 - offset * 0.1,
                        x: alignRight ? (offset === 0 ? 0 : offset * 50) : (offset === 0 ? 0 : -offset * 50),
                      }}
                      exit={{ rotateY: 90, opacity: 0, z: -200, x: alignRight ? -100 : 100 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="absolute inset-0"
                      style={{ transformStyle: 'preserve-3d', pointerEvents: isActive ? 'auto' : 'none' }}
                    >
                      <Collapsible open={openCard === index} onOpenChange={() => setOpenCard(index)}>
                        <CollapsibleTrigger asChild>
                          <div
                            onMouseEnter={() => {
                              setGlowIndex(index);
                              setTimeout(() => setGlowIndex(null), 1000);
                            }}
                            className={`rounded-xl p-6 transition-all duration-300 group cursor-pointer ${glowIndex === index ? 'shadow-2xl shadow-gold/30' : ''} ${alignRight ? 'ml-auto' : 'mr-auto'} w-full md:w-[80%]`}
                          >
                            <div className={alignRight ? 'md:text-right' : 'md:text-left'}>
                              <div className={`flex items-center justify-between gap-4 ${alignRight ? 'flex-row-reverse' : ''}`}>
                                <h4 className={`text-sm md:text-base font-poppins font-bold text-white transition-all duration-300 ${alignRight ? 'text-right' : ''}`}>
                                  {faq.question}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-accordion-down">
                          <div className="rounded-lg p-4 mt-6 mx-auto w-full md:w-[90%] text-center">
                            <p className="text-white font-lora font-bold text-base md:text-lg leading-relaxed lowercase first-letter:capitalize">
                              {faq.answer}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Navigation Buttons - moved above */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCurrentCardIndex((prev) => (prev - 1 + faqs.length) % faqs.length);
                }}
                className="flex items-center justify-center w-14 h-14 bg-transparent hover:bg-transparent text-gold hover:text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
              >
                <ChevronLeft className="w-7 h-7" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCurrentCardIndex((prev) => (prev + 1) % faqs.length);
                }}
                className="flex items-center justify-center w-14 h-14 bg-transparent hover:bg-transparent text-gold hover:text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
              >
                <ChevronRight className="w-7 h-7" />
              </motion.button>
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center mt-2"
            >
              <ContactModal>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white hover:text-gold font-cinzel font-bold text-lg lowercase transition-all duration-300 inline-flex items-center gap-3"
                  style={{ textShadow: '0 0 0px rgba(212, 175, 55, 0)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.9), 0 0 30px rgba(212, 175, 55, 0.6)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textShadow = '0 0 0px rgba(212, 175, 55, 0)'; }}
                >
                  contáctanos
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="w-6 h-6 text-gold" />
                  </motion.div>
                </motion.button>
              </ContactModal>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default FAQHorizontalSection;
