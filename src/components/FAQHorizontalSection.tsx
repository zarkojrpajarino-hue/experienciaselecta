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
  const faqs = [{
    question: <>
        ¿Qué incluye cada cesta?
      </>,
    answer: "Contenido exclusivo personalizado.",
    image: faqPrimeraImagen
  }, {
    question: <>
        ¿Cuánto dura la experiencia?
      </>,
    answer: "A tu ritmo.",
    image: faqDuracionExperiencia
  }, {
    question: <>
        ¿Es apto para personas que no se conocen?
      </>,
    answer: "Tenemos cestas diseñadas específicamente para primeros encuentros y desconocidos.",
    image: faqDesconocidosEncuentro
  }, {
    question: <>
        ¿Calidad de productos?
      </>,
    answer: "Producto nacional certificado.",
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
    setOpenCard(prev => prev === index ? null : index);
  };
  return <section className="relative overflow-hidden" id="faq" style={{
    padding: 0,
    margin: 0,
    borderRadius: '1.5rem'
  }}>
      {/* Background Images with Crossfade - scoped to section */}
      {faqs.map((faq, index) => <div key={index} className="absolute inset-0 transition-opacity duration-700" style={{
      backgroundImage: `url(${faq.image})`,
      backgroundSize: 'cover',
      backgroundPosition: currentCardIndex === 1 ? 'center 20%' : 'center bottom',
      opacity: currentCardIndex === index ? 1 : 0,
      pointerEvents: 'none',
      zIndex: 0,
      borderRadius: '1.5rem'
    }} />)}
      {/* Dark overlay scoped to section - más oscuro */}
      <div className="absolute inset-0 bg-black/5" style={{
      zIndex: 1,
      borderRadius: '1.5rem'
    }} />

      <div className="relative z-10">
        {/* FAQ Section */}
        
      </div>
    </section>;
};
export default FAQHorizontalSection;