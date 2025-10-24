import BasketCatalog from "@/components/BasketCatalog";
import ScrollIndicator from "@/components/ScrollIndicator";
import PageNavigation from "@/components/PageNavigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const CestasPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'Pareja' | 'Familia' | 'Amigos'>('Pareja');
  const [groupSize, setGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Prevent auto-scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle deep-link from external catalog (#cesta-ID)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#cesta-')) return;
    const match = hash.match(/^#cesta-(\d+)$/);
    if (!match) return;
    const basketId = parseInt(match[1], 10);

    // Set category based on ID
    if (basketId >= 1 && basketId <= 3) {
      setSelectedCategory('Pareja');
      setGroupSize('3-4');
    } else if (basketId >= 9 && basketId <= 11) {
      setSelectedCategory('Familia');
      setGroupSize('3-4');
    } else if (basketId >= 12 && basketId <= 14) {
      setSelectedCategory('Familia');
      setGroupSize('5-6');
    } else if (basketId >= 15 && basketId <= 17) {
      setSelectedCategory('Familia');
      setGroupSize('7-8');
    }

    // Scroll to basket after render
    setTimeout(() => {
      const element = document.getElementById(`cesta-${basketId}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        element.classList.add('ring-2', 'ring-accent', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-accent', 'ring-offset-2');
        }, 2000);
      }
    }, 500);
  }, []);
  return <div className="min-h-screen font-work-sans bg-white">
      {/* Add Navbar */}
      <Navbar />
      
      <PageNavigation />
      
      {/* Hero Section */}
      <div className="relative">
        <ScrollIndicator />
      </div>
      
      {/* Header Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-10 bg-black rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start mb-4">
            <Button variant="link" onClick={() => {
            navigate('/');
            setTimeout(() => window.scrollTo({
              top: 0,
              behavior: 'smooth'
            }), 100);
          }} className="text-white hover:text-white/80 p-0">
              ← Volver al inicio
            </Button>
          </div>
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
            <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
              <h2 className="text-xl sm:text-2xl md:text-4xl leading-tight font-poppins font-bold text-white">
                Regala una experiencia personalizada.
              </h2>
              
              {/* Interrogaciones al final de la frase */}
              <TooltipProvider delayDuration={80}>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                  <TooltipTrigger asChild>
                    <motion.span onClick={() => {
                    window.location.href = '/#que-vendemos';
                  }} onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)} className="cursor-pointer hover:opacity-80 transition-opacity duration-300 text-xl sm:text-2xl md:text-4xl font-bold" style={{
                    color: '#FFD700'
                  }} animate={{
                    rotateZ: [0, 180, 0]
                  }} transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}>
                      ¿?
                    </motion.span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="relative rounded-2xl border-2 border-black/10 bg-white text-black shadow-lg px-4 py-2">
                    <p className="font-medium">Haz click</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl mb-4 font-inter text-white">
              Elige la experiencia perfecta: <span className="font-bold" style={{
              color: '#4A7050'
            }}>familia</span>, <span className="font-bold" style={{
              color: '#782C23'
            }}>pareja</span> o <span className="font-bold" style={{
              color: '#44667D'
            }}>amigos</span>.
            </p>

            {/* Flecha hacia abajo */}
            <motion.div animate={{
            y: [0, 10, 0]
          }} transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }} className="flex justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Category Filter Buttons - Pareja primero */}
          <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
            <motion.button onClick={() => setSelectedCategory('Pareja')} className={`font-poppins font-bold transition-all duration-300 px-6 py-3 rounded-xl ${selectedCategory === 'Pareja' ? 'bg-[#782C23] text-white scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`} whileHover={{
            scale: selectedCategory === 'Pareja' ? 1.1 : 1.05
          }}>
              Pareja.
            </motion.button>

            <motion.button onClick={() => setSelectedCategory('Familia')} className={`font-poppins font-bold transition-all duration-300 px-6 py-3 rounded-xl ${selectedCategory === 'Familia' ? 'bg-[#4A7050] text-white scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`} whileHover={{
            scale: selectedCategory === 'Familia' ? 1.1 : 1.05
          }}>
              Familia.
            </motion.button>
            
            <motion.button onClick={() => setSelectedCategory('Amigos')} className={`font-poppins font-bold transition-all duration-300 px-6 py-3 rounded-xl ${selectedCategory === 'Amigos' ? 'bg-[#44667D] text-white scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`} whileHover={{
            scale: selectedCategory === 'Amigos' ? 1.1 : 1.05
          }}>
              Amigos.
            </motion.button>
          </div>
        </div>
      </section>
      
      {/* Basket Catalog Section */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BasketCatalog categoria={selectedCategory} onGroupSizeChange={setGroupSize} />
        </div>
      </section>

      {/* Interrogaciones al final */}
      
    </div>;
};
export default CestasPage;