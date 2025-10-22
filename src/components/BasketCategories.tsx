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
  const [sheetKey, setSheetKey] = useState(0); // Para forzar re-render del Sheet

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
    inspirationalPhrase: "Sabores que unen generaciones.",
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
    inspirationalPhrase: "Planes que se convierten en recuerdos.",
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
    inspirationalPhrase: "Una experiencia íntima para disfrutar juntos.",
    highlightColor: "#FFD700",
    arrowColor: "#FFD700",
    cestaColor: "#FFD700"
  }];
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
      }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight font-poppins font-bold text-white" style={{ textTransform: 'none' }}>
            Escoja su categoría.
          </h2>
        </motion.div>

        <div className="max-w-6xl mx-auto flex flex-col gap-16 sm:gap-20 mt-6">
          {categories.sort((a, b) => a.order - b.order).map((category, index) => {
          const isAmigos = category.title === "Amigos";
          
          // Función para resaltar palabras importantes
          const renderHighlightedPhrase = (phrase: string, color: string) => {
            if (category.title === "Pareja") {
              return phrase.replace(/experiencia|íntima|disfrutar|juntos/g, (match) => 
                `<span style="color: ${color}">${match}</span>`
              );
            } else if (category.title === "Amigos") {
              return phrase.replace(/planes|convierten|recuerdos/g, (match) => 
                `<span style="color: ${color}">${match}</span>`
              );
            } else if (category.title === "Familia") {
              return phrase.replace(/sabores|unen|generaciones/g, (match) => 
                `<span style="color: ${color}">${match}</span>`
              );
            }
            return phrase;
          };
          
          return <motion.div 
            key={category.id} 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{
              duration: 0.6,
              delay: index * 0.2,
              type: "spring",
              stiffness: 100
            }} 
            className="relative"
          >
            {/* Línea separatoria blanca si no es el primer elemento */}
            {index > 0 && (
              <div className="mb-12 sm:mb-16">
                <div className="w-full h-[1px] bg-white/30"></div>
              </div>
            )}

            {/* Title Card + Image Card Side by Side - Always side by side on all devices */}
            <div className={`grid grid-cols-2 items-center ${
              isAmigos ? 'gap-2 sm:gap-4' : 'gap-6 sm:gap-8 md:gap-12'
            }`}>
              
              {/* Image Card - Clickable - Para Amigos va primero */}
              {isAmigos && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="rounded-3xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition-shadow">
                      <img
                        src={category.basketImage}
                        alt={`${category.title} cestas`}
                        className="w-full h-32 sm:h-52 md:h-64 object-cover rounded-3xl"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full p-2 bg-white border-2 border-gray-200">
                    <img
                      src={category.basketImage}
                      alt={`${category.title} cestas`}
                      className="w-full h-auto object-contain rounded-3xl"
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Content Card - Always visible */}
              <div>
                <div className="mt-2 mb-12">
                  <div 
                    className="relative cursor-pointer transition-opacity h-32"
                    onClick={() => handleCategoryClick(category.title)}
                  >
                    {/* Title - Horizontal letters in center with arrow */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                      <h3 className="font-bebas font-bold text-lg sm:text-3xl text-white whitespace-nowrap" style={{ textTransform: 'none' }}>
                        {category.title}.
                      </h3>
                      <svg 
                        className="w-5 h-5 sm:w-6 sm:h-6 font-bold flex-shrink-0"
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

                    {/* Inspirational phrase - Below the card */}
                    <p 
                      className="absolute -bottom-6 left-0 right-0 text-sm sm:text-base font-inter font-bold text-white text-center"
                      style={{ textTransform: 'none' }}
                      dangerouslySetInnerHTML={{ __html: renderHighlightedPhrase(category.inspirationalPhrase, '#FFD700') }}
                    />

                    {/* Arrow button - Bottom right corner - REMOVED */}
                  </div>
                </div>
              </div>

              {/* Image Card - Clickable - Para otras categorías va después */}
              {!isAmigos && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="rounded-3xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition-shadow">
                      <img
                        src={category.basketImage}
                        alt={`${category.title} cestas`}
                        className="w-full h-32 sm:h-52 md:h-64 object-cover rounded-3xl"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full p-2 bg-white border-2 border-gray-200">
                    <img
                      src={category.basketImage}
                      alt={`${category.title} cestas`}
                      className="w-full h-auto object-contain rounded-3xl"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>;
        })}
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