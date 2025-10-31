import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import picnicProductosIbericos from "@/assets/picnic-productos-ibericos.jpg";
import momentosUnicos from "@/assets/momentos-unicos.jpg";
import primerEncuentro from "@/assets/primer-encuentro.png";
import paraCualquiera from "@/assets/para-cualquiera.jpg";
import disfrutaRecuerdos from "@/assets/disfruta-recuerdos.jpg";
import jamonIbericoTraditional from "@/assets/jamon-iberico-traditional.jpg";
import celebracionIberica from "@/assets/celebracion-iberica.png";
import montanaMar from "@/assets/montana-mar.jpg";

const FAQSection = () => {
  const [openCard, setOpenCard] = useState<number | null>(0);
  const [currentBgImage, setCurrentBgImage] = useState<string>(picnicProductosIbericos);
  const [currentFaqIndex, setCurrentFaqIndex] = useState(0);

  const toggleCard = (index: number) => {
    if (openCard === index) {
      setOpenCard(null);
    } else {
      setOpenCard(index);
      setCurrentBgImage(faqs[index].image);
    }
  };

  const nextFaq = () => {
    setCurrentFaqIndex((prev) => (prev + 1) % faqs.length);
    setCurrentBgImage(faqs[(currentFaqIndex + 1) % faqs.length].image);
  };

  const prevFaq = () => {
    setCurrentFaqIndex((prev) => (prev - 1 + faqs.length) % faqs.length);
    setCurrentBgImage(faqs[(currentFaqIndex - 1 + faqs.length) % faqs.length].image);
  };

  const faqs = [
    {
      question: "¿Qué incluye exactamente cada cesta?",
      answer: "Cada cesta incluye una selección premium de productos ibéricos (jamón, chorizo, queso, etc.), una guía de conversación personalizada para el tipo de experiencia elegida, instrucciones detalladas y acceso a nuestro contenido digital exclusivo, todo viene perfectamente presentado y listo para disfrutar.",
      image: picnicProductosIbericos
    },
    {
      question: "¿Cuánto tiempo dura una experiencia típica?",
      answer: "La duración promedio es de 2-4 horas, pero esto varía según el grupo y las dinámicas que elijan, algunas experiencias íntimas pueden durar menos, mientras que las familiares o grupales pueden extenderse toda una tarde, lo importante es que cada uno vaya a su ritmo.",
      image: momentosUnicos
    },
    {
      question: "¿Es apto para personas que no se conocen?",
      answer: "Absolutamente, de hecho es uno de nuestros puntos fuertes, tenemos cestas específicamente diseñadas para primeros encuentros y desconocidos, nuestras dinámicas están pensadas para romper el hielo de forma natural y crear conexiones auténticas desde el primer momento.",
      image: primerEncuentro
    },
    {
      question: "¿Hay algún límite de edad o perfil específico?",
      answer: "Nuestras experiencias están diseñadas para mayores de 16 años y no hay límite superior, tenemos dinámicas adaptadas para diferentes generaciones, desde jóvenes universitarios hasta abuelos, la curiosidad y las ganas de conectar son los únicos requisitos.",
      image: paraCualquiera
    },
    {
      question: "¿Qué pasa si la experiencia no nos gusta?",
      answer: "Ofrecemos garantía de satisfacción completa, si por cualquier motivo no quedas satisfecho con tu experiencia, te devolvemos el 100% de tu dinero sin preguntas, sin embargo en más de 2 años, menos del 2% de nuestros clientes han solicitado reembolso.",
      image: disfrutaRecuerdos
    },
    {
      question: "¿Cómo aseguran la calidad de los productos ibéricos?",
      answer: "Trabajamos directamente con productores seleccionados de Extremadura y Andalucía, todos con denominación de origen, cada producto pasa por nuestro control de calidad y se envía en condiciones óptimas de conservación, incluimos certificados de autenticidad en cada cesta.",
      image: jamonIbericoTraditional
    },
    {
      question: "¿Se puede personalizar la experiencia para ocasiones especiales?",
      answer: "Por supuesto, ofrecemos personalizaciones para aniversarios, cumpleaños, despedidas, eventos corporativos y más, podemos adaptar las dinámicas, incluir elementos temáticos y crear experiencias completamente únicas para tu ocasión especial.",
      image: celebracionIberica
    },
    {
      question: "¿Hacen envíos internacionales?",
      answer: "Actualmente enviamos a toda España y Portugal, para otros países europeos estamos trabajando en expandir nuestro servicio, si estás interesado en recibir nuestras experiencias en otro país contáctanos y te informaremos sobre disponibilidad.",
      image: montanaMar
    }
  ];

  return (
    <section 
      id="faq" 
      className="py-4 relative overflow-hidden"
    >
      {/* Background Images with Crossfade */}
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${faq.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentFaqIndex === index ? 1 : 0,
            pointerEvents: 'none',
            willChange: 'opacity'
          }}
        />
      ))}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-cormorant font-light italic text-white tracking-wide"
            >
              Preguntas
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
              frecuentes
            </motion.span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-work-sans font-bold text-white max-w-3xl mx-auto px-4 mt-6">
            Resolvemos las <span className="text-gold">dudas más comunes</span> sobre nuestras <span className="text-gold">experiencias</span>
          </p>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevFaq}
            className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-gold hover:text-gold/80 rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextFaq}
            className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-transparent text-gold hover:text-gold/80 rounded-full shadow-lg hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 border-0"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {faqs.map((faq, index) => {
            if (index !== currentFaqIndex) return null;
            const isRight = index % 2 !== 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full"
              >
                <Collapsible
                  open={openCard === index}
                  onOpenChange={() => toggleCard(index)}
                >
                  <CollapsibleTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`group w-full md:w-[48%] ${isRight ? 'ml-auto' : 'mr-auto'} bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden`}
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${faq.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <motion.h3 
                          className="text-lg font-poppins font-semibold text-left pr-4"
                          animate={{
                            textShadow: [
                              '0 0 0px rgba(212, 175, 55, 0)',
                              '0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.6)',
                              '0 0 0px rgba(212, 175, 55, 0)'
                            ],
                            color: ['#ffffff', '#d4af37', '#ffffff']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          {faq.question}
                        </motion.h3>
                        <motion.div
                          animate={{ rotate: openCard === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <Minus className="w-5 h-5 text-gold transition-colors duration-300" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 mx-auto max-w-4xl">
                      <p className="font-work-sans text-white font-semibold leading-relaxed drop-shadow-lg text-center text-lg md:text-lg lowercase first-letter:uppercase">
                        {faq.answer}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-4"
        >
          <div className="rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-poppins font-bold text-white mb-4">
              ¿Tienes más preguntas?
            </h3>
            <p className="font-work-sans text-white/80 mb-6">
              Nuestro equipo está aquí para ayudarte con cualquier duda que tengas sobre nuestras experiencias.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 text-white font-poppins font-semibold transition-all duration-300 hover:text-gold"
            >
              Contáctanos
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;