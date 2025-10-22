import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, UserPlus, UsersRound, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import basketImage from "@/assets/conversaciones-profundas.jpg";
import catalogHeaderBg from "@/assets/catalog-header-background.jpg";
import basketDetailsBg from "@/assets/basket-details-background.jpg";
import cestas34Bg from "@/assets/cestas-3-4-bg-final.jpg";
import cestas56Bg from "@/assets/cestas-5-6-bg-final.jpg";
import cestas78Bg from "@/assets/cestas-7-8-bg-final.jpg";
import BasketCatalog from "./BasketCatalog";
import DesconocidosCategory from "./DesconocidosCategory";

// Import experience images
import familiaExperienceImg from "@/assets/familia-experience.jpg";
import amigosExperienceImg from "@/assets/amigos-experience.jpg";
import parejaExperienceImg from "@/assets/pareja-experience.jpg";
import desconocidosExperienceImg from "@/assets/desconocidos-experience.jpg";
import grupoMedianoExperienceImg from "@/assets/grupo-mediano-experience.jpg";
import grupoGrandeExperienceImg from "@/assets/grupo-grande-experience.jpg";

// Import new basket images
import parejaCestasImg from "@/assets/pareja-nueva-cesta-clean.png";
import familiaCestasImg from "@/assets/familia-nueva-cesta.jpg";
import amigosCestasImg from "@/assets/amigos-nueva-cesta-clean.png";
const BasketCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [groupSize, setGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const [sheetKey, setSheetKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine background based on group size
  const getBackgroundImage = () => {
    switch (groupSize) {
      case '3-4':
        return cestas34Bg;
      case '5-6':
        return cestas56Bg;
      case '7-8':
        return cestas78Bg;
      default:
        return cestas34Bg;
    }
  };

  const handleCategoryClick = (categoryTitle: string) => {
    if (categoryTitle === "Pareja" || categoryTitle === "Familia" || categoryTitle === "Amigos") {
      setSelectedCategory(categoryTitle);
      setIsSheetOpen(true);
      // Incrementar la key para forzar un re-render completo del Sheet
      setSheetKey(prev => prev + 1);
      // Reset group size cuando se abre una nueva categoría
      setGroupSize('3-4');
    } else {
      // Para otras categorías mostrar mensaje temporal
      alert(`Catálogo de ${categoryTitle} próximamente disponible`);
    }
  };
  // Animated Title Component
  const AnimatedTitle = ({ text, index }: { text: string; index: number }) => {
    return (
      <h3 className="text-lg sm:text-xl font-poppins font-bold text-white">
        {text}
      </h3>
    );
  };

  const categories = [{
    id: 1,
    title: "Familia",
    description: "3-8 personas",
    icon: Heart,
    color: "text-secondary",
    gradient: "from-secondary/10 to-secondary/5",
    basketImage: familiaCestasImg,
    order: 0,
    inspirationalPhrase: "Sabores que unen.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }, {
    id: 2,
    title: "Amigos",
    description: "3-8 personas",
    icon: Users,
    color: "text-accent",
    gradient: "from-accent/10 to-accent/5",
    basketImage: amigosCestasImg,
    order: 1,
    inspirationalPhrase: "Planes que crean recuerdos.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }, {
    id: 3,
    title: "Pareja",
    description: "2 personas",
    icon: UsersRound,
    color: "text-primary",
    gradient: "from-primary/10 to-primary/5",
    basketImage: parejaCestasImg,
    order: 2,
    inspirationalPhrase: "Experiencia íntima juntos.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const getCardPosition = (index: number) => {
    const diff = (index - currentIndex + categories.length) % categories.length;
    
    if (diff === 0) {
      // Tarjeta central (activa)
      return {
        x: 0,
        z: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30
      };
    } else if (diff === 1) {
      // Tarjeta derecha
      return {
        x: '60%',
        z: -400,
        rotateY: -45,
        scale: 0.75,
        opacity: 0.6,
        zIndex: 10
      };
    } else {
      // Tarjeta izquierda
      return {
        x: '-60%',
        z: -400,
        rotateY: 45,
        scale: 0.75,
        opacity: 0.6,
        zIndex: 10
      };
    }
  };

  const renderHighlightedPhrase = (phrase: string, title: string, color: string) => {
    if (title === "Pareja") {
      return phrase.replace(/experiencia|íntima|juntos/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    } else if (title === "Amigos") {
      return phrase.replace(/planes|crean|recuerdos/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    } else if (title === "Familia") {
      return phrase.replace(/sabores|unen/g, (match) => 
        `<span style="color: ${color}">${match}</span>`
      );
    }
    return phrase;
  };
  return <section id="recogida" className="pt-20 pb-10 relative overflow-hidden bg-black rounded-3xl">
      {/* Background decoration removed to reveal page background */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{
        opacity: 0,
        x: -100,
        scale: 0.85
      }} whileInView={{
        opacity: 1,
        x: 0,
        scale: 1
      }} transition={{
        duration: 1.3,
        type: "spring",
        stiffness: 50,
        damping: 15
      }} className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight font-poppins font-bold text-white" style={{ textTransform: 'none' }}>
            Escoja su categoría.
          </h2>
        </motion.div>

        {/* Carrusel 3D Container */}
        <div className="relative w-full max-w-7xl mx-auto h-[600px] md:h-[700px] flex items-center justify-center mt-4" style={{ perspective: '2000px' }}>
          {/* Tarjetas en carrusel 3D */}
          <div className="relative w-full h-full">
            {categories.map((category, index) => {
              const position = getCardPosition(index);
              const isActive = (index - currentIndex + categories.length) % categories.length === 0;

              return (
                <motion.div
                  key={category.id}
                  animate={{
                    x: position.x,
                    z: position.z,
                    rotateY: position.rotateY,
                    scale: position.scale,
                    opacity: position.opacity
                  }}
                  transition={{
                    duration: 0.7,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[70%] cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    zIndex: position.zIndex,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                  onClick={() => isActive && handleCategoryClick(category.title)}
                >
                  {/* Card Container */}
                  <div className="relative bg-gradient-to-br from-black/90 to-black/70 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-white/20">
                    {/* Imagen */}
                    <div className="w-full h-[250px] md:h-[350px] mb-6 rounded-3xl overflow-hidden">
                      <img
                        src={category.basketImage}
                        alt={`${category.title} cestas`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Título y Flecha */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h3 className="font-bebas font-bold text-3xl md:text-5xl text-white whitespace-nowrap tracking-[0.2em]">
                        {category.title}.
                      </h3>
                      <svg 
                        className="w-7 h-7 md:w-9 md:h-9 flex-shrink-0"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        style={{ color: category.arrowColor }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" 
                        />
                      </svg>
                    </div>

                    {/* Frase inspiracional */}
                    <p 
                      className="text-lg md:text-2xl font-inter font-bold text-white text-center"
                      dangerouslySetInnerHTML={{ 
                        __html: renderHighlightedPhrase(category.inspirationalPhrase, category.title, category.highlightColor) 
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Botones de navegación */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sheet for Basket Catalog */}
      <Sheet key={sheetKey} open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-4xl lg:max-w-6xl overflow-y-auto border-0 shadow-lg p-0 bg-white"
        >
          <SheetHeader className="relative p-6 text-left bg-white">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <SheetTitle className="text-2xl font-poppins font-bold text-left text-black">
                  <span className="text-gold">Experiencia</span> Selecta
                </SheetTitle>
            <SheetDescription className="font-work-sans font-bold text-left text-black">
              Descubre nuestras <span className="text-gold">cestas</span> para <span className="text-gold">descubrir personas</span>
            </SheetDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSheetOpen(false)} 
                className="h-8 w-8 text-black hover:bg-black/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-0">
            {selectedCategory ? <BasketCatalog categoria={selectedCategory} onGroupSizeChange={setGroupSize} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>;
};
export default BasketCategories;