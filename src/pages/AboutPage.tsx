import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Target, Lightbulb, Award, Users, Star, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import aboutBackgroundImg from "@/assets/sobre-nosotros-hero-marca.jpg";
import basketImg from "@/assets/experiencia-selecta-nuevo.jpg";
import teamBackgroundImg from "@/assets/equipo-background-nueva.jpg";
import valuesAutenticidadImg from "@/assets/valores-autenticidad-bg.jpg";
import valuesExcelenciaImg from "@/assets/valores-excelencia-bg.jpg";
import valuesCreatividadImg from "@/assets/valores-creatividad-bg.jpg";
import historyBackgroundImg from "@/assets/historia-background-final.jpg";
import ctaBackgroundImg from "@/assets/experiencia-cta-background.jpg";
const AboutPage = () => {
  const [openValueId, setOpenValueId] = useState<number | null>(null);
  const [openValuesSection, setOpenValuesSection] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [valuesPage, setValuesPage] = useState(0); // 0 = cards 0-2, 1 = cards 3-5, 2 = cards 6-8
  const [activeCard, setActiveCard] = useState<number>(0); // 0 = Historia, 1 = Expertos, 2 = Listo
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  
  const missionSectionRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLDivElement>(null);
  // Auto-animate values
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setOpenValueId((prev) => {
        const startIndex = valuesPage * 3;
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
  }, [isAutoPlaying, valuesPage]);

  // Reset animation when page changes
  useEffect(() => {
    setOpenValueId(valuesPage * 3); // Start from first card of new page
  }, [valuesPage]);

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
    setOpenValueId(openValueId === index ? null : index);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Get background image for current values page
  const getValuesBackground = () => {
    switch(valuesPage) {
      case 0:
        return valuesAutenticidadImg;
      case 1:
        return valuesExcelenciaImg;
      case 2:
        return valuesCreatividadImg;
      default:
        return valuesAutenticidadImg;
    }
  };

  // Auto-rotate carousel cards - only when no card is expanded
  useEffect(() => {
    if (!isCarouselOpen || expandedCard !== null) return; // Don't rotate if closed or a card is expanded

    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isCarouselOpen, expandedCard]);

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveCard(index); // Set as active card
    setExpandedCard(expandedCard === index ? null : index); // Toggle expansion
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  const carouselCards = [
    {
      title: "Nuestra Historia",
      subtitle: "Cómo comenzó todo",
      backgroundImage: historyBackgroundImg
    },
    {
      title: "Expertos en Conexión Humana",
      subtitle: "Nuestro equipo",
      backgroundImage: teamBackgroundImg
    },
    {
      title: "¿Listo para crear tu próxima experiencia?",
      subtitle: "Únete a nosotros",
      backgroundImage: ctaBackgroundImg
    }
  ];
  const values = [{
    icon: Heart,
    title: "Autenticidad",
    description: "Conexiones genuinas que marcan la diferencia.",
    color: "text-accent",
    bgGradient: "from-accent/20 to-accent/5"
  }, {
    icon: Users,
    title: "Conexión Humana",
    description: "Encuentros significativos que crean vínculos duraderos.",
    color: "text-primary",
    bgGradient: "from-primary/20 to-primary/5"
  }, {
    icon: Heart,
    title: "Conexión Auténtica",
    description: "Relaciones que nacen de momentos genuinos.",
    color: "text-accent",
    bgGradient: "from-accent/20 to-accent/5"
  }, {
    icon: Target,
    title: "Impacto Real",
    description: "Experiencias memorables con impacto positivo.",
    color: "text-destructive",
    bgGradient: "from-destructive/20 to-destructive/5"
  }, {
    icon: Star,
    title: "Calidad Premium",
    description: "Cada producto y experiencia con máxima excelencia.",
    color: "text-secondary",
    bgGradient: "from-secondary/20 to-secondary/5"
  }, {
    icon: Leaf,
    title: "Sostenibilidad",
    description: "Productores locales con prácticas responsables.",
    color: "text-destructive",
    bgGradient: "from-destructive/20 to-destructive/5"
  }, {
    icon: Target,
    title: "Innovación",
    description: "Nuevas formas de conectar y crear experiencias únicas.",
    color: "text-accent",
    bgGradient: "from-accent/20 to-accent/5"
  }, {
    icon: Lightbulb,
    title: "Innovación Cultural",
    description: "Tradición española con dinámicas modernas.",
    color: "text-primary",
    bgGradient: "from-primary/20 to-primary/5"
  }, {
    icon: Award,
    title: "Excelencia",
    description: "Superamos expectativas en cada detalle.",
    color: "text-primary",
    bgGradient: "from-primary/20 to-primary/5"
  }];
  return <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <PageNavigation />
    </div>;
};
export default AboutPage;