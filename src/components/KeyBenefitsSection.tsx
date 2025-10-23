import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Leaf, Clock, Shield, Truck, Star, Heart, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ContactModal from "@/components/ContactModal";
import iberianBasket from "@/assets/iberian-basket.jpg";

// Import benefit images
import planDiferenteImg from "@/assets/beneficio-diferente-torre-pimientos.png";
import cuandoDondeQuierasImg from "@/assets/nueva-seccion-03.jpg";
import conocerEscucharImg from "@/assets/nueva-seccion-04-final.jpg";
import momentosUnicosImg from "@/assets/nueva-seccion-05-final.jpg";
import conversacionesProfundasImg from "@/assets/nueva-seccion-06.jpg";
import alternativaAsequibleImg from "@/assets/beneficio-tiempo-enrollados.png";
const KeyBenefitsSection = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [benefitsPage, setBenefitsPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const benefits = [{
    icon: Heart,
    title: "Todos buscamos algo distinto.",
    description: <>Lo <span className="text-gold">diferente</span> solo cuesta <span className="text-gold">atreverse.</span></>,
    color: "text-accent",
    bgColor: "bg-accent/10",
    image: planDiferenteImg
  }, {
    icon: Clock,
    title: "LA PAUSA NO ES PERDER TIEMPO",
    description: <>La <span className="text-gold">pausa</span> no es perder tiempo, es empezar a <span className="text-gold">vivirlo</span>.</>,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    image: cuandoDondeQuierasImg
  }, {
    icon: Star,
    title: "HAY PERSONAS QUE VES CADA DÍA Y NO CONOCES",
    description: <>Conocer no es <span className="text-gold">saludar</span>, es <span className="text-gold">escuchar</span>.</>,
    color: "text-primary",
    bgColor: "bg-primary/10",
    image: conocerEscucharImg
  }, {
    icon: Leaf,
    title: "QUEREMOS QUE TODO SEA RÁPIDO",
    description: <>Lo que vale la pena necesita <span className="text-gold">tiempo</span>.</>,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    image: momentosUnicosImg
  }, {
    icon: Shield,
    title: "TENEMOS MILES DE AMIGOS",
    description: <>No faltan <span className="text-gold">planes</span>, falta <span className="text-gold">propósito</span>.</>,
    color: "text-accent",
    bgColor: "bg-accent/10",
    image: conversacionesProfundasImg
  }, {
    icon: DollarSign,
    title: "NO HAY SOBREMESAS, SOLO RELOJES",
    description: <>Ocupar el tiempo no es <span className="text-gold">disfrutarlo</span>.</>,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    image: alternativaAsequibleImg
  }];

  // Auto-animate cards
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCardIndex(prev => {
        const startIndex = benefitsPage * 3;
        const endIndex = Math.min(startIndex + 3, benefits.length);
        const next = prev + 1;

        // If we reach the end of current page, loop back to start of page
        if (next >= endIndex) {
          return startIndex;
        }
        return next;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, benefitsPage, benefits.length]);
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };
  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Reset to first card of page when page changes
  useEffect(() => {
    setCurrentCardIndex(benefitsPage * 3);
  }, [benefitsPage]);
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
  const currentBenefit = benefits[currentCardIndex];
  const startIndex = benefitsPage * 3;
  const endIndex = Math.min(startIndex + 3, benefits.length);
  const isLeft = currentCardIndex % 2 === 0;
  const bgPosition = currentCardIndex === 0 ? 'center 35%' : 'center';
return <section id="beneficios" className="py-24 relative overflow-hidden flex items-center" style={{
    minHeight: '107vh'
  }}>
      {/* Background Images with Crossfade */}
      {benefits.map((benefit, index) => <div key={index} className="absolute inset-0 transition-opacity duration-700" style={{
      backgroundImage: `url(${benefit.image})`,
      backgroundSize: 'cover',
      backgroundPosition: index === 0 || index === 2 ? 'center 65%' : index === 1 ? 'center 75%' : index === 3 ? 'center 75%' : index === 5 ? 'center 85%' : 'center',
      backgroundAttachment: 'scroll',
      opacity: currentCardIndex === index ? 1 : 0,
      pointerEvents: 'none'
    }} />)}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Response - Centered in middle */}
        <div className="flex-1 max-w-4xl mx-auto mb-8">
          <AnimatePresence mode="wait">
            <motion.div key={`desc-${currentCardIndex}`} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.5
          }} className="text-center">
              <p className="font-lato text-white font-semibold leading-relaxed text-lg md:text-xl lg:text-2xl normal-case">
                {currentBenefit.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons below */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.button whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }} onClick={() => {
          setCurrentCardIndex(prev => (prev - 1 + benefits.length) % benefits.length);
          handleUserInteraction();
        }} className="flex items-center justify-center w-10 h-10 bg-transparent hover:bg-transparent text-white hover:text-gold rounded-full transition-all duration-300 border-0">
            <ChevronLeft className="w-8 h-8" />
          </motion.button>

          <motion.button whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }} onClick={() => {
          setCurrentCardIndex(prev => (prev + 1) % benefits.length);
          handleUserInteraction();
        }} className="flex items-center justify-center w-10 h-10 bg-transparent hover:bg-transparent text-white hover:text-gold rounded-full transition-all duration-300 border-0">
            <ChevronRight className="w-8 h-8" />
          </motion.button>
        </div>

        <div className="flex flex-col items-center gap-6 mt-8">
          {benefitsPage > 0 && <Button variant="ghost" onClick={() => {
          setBenefitsPage(benefitsPage - 1);
          handleUserInteraction();
        }} className="text-white hover:text-gold bg-transparent hover:bg-transparent transition-all duration-300 font-bold border-0" style={{
          textShadow: '0 0 0px rgba(212, 175, 55, 0)'
        }} onMouseEnter={e => {
          e.currentTarget.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.9), 0 0 30px rgba(212, 175, 55, 0.6)';
        }} onMouseLeave={e => {
          e.currentTarget.style.textShadow = '0 0 0px rgba(212, 175, 55, 0)';
        }}>
              ← Volver
            </Button>}
          
          
        </div>
      </div>
    </section>;
};
export default KeyBenefitsSection;