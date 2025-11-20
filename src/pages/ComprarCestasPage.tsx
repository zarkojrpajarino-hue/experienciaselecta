import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BasketCatalog from "@/components/BasketCatalog";
// import BasketImageCarousel from "@/components/BasketImageCarousel";
import ScrollIndicator from "@/components/ScrollIndicator";
import Navbar from "@/components/Navbar";
import BasketBubbleField from "@/components/BasketBubbleField";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import StickyToast from "@/components/StickyToast";
import ExitConfirmDialog from "@/components/ExitConfirmDialog";
import { Gift, ShoppingCart } from "lucide-react";

const ComprarCestasPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCategory = (location.state as { selectedCategory?: string })?.selectedCategory || 'Pareja';
  const [selectedCategory, setSelectedCategory] = useState<'Pareja' | 'Familia' | 'Amigos'>(
    (initialCategory === 'Pareja' || initialCategory === 'Familia' || initialCategory === 'Amigos') 
      ? initialCategory 
      : 'Pareja'
  );
  const [groupSize, setGroupSize] = useState<'3-4' | '5-6' | '7-8'>('3-4');
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isGiftMode, setIsGiftMode] = useState<boolean | null>(null);

  const scrollToElementWithOffset = (selector: string, offset = 160) => {
    const target = document.querySelector(selector) as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top - offset;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  // Scroll al inicio en cambio de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen font-work-sans transition-colors duration-500 bg-[#F5F5DC]">
      <Navbar />
      
      <div className="relative">
        <ScrollIndicator />
      </div>
      
      {/* Header Section */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-10 bg-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-8 border-2 border-black overflow-hidden">
        {/* Botón Volver al Inicio - Esquina superior derecha */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 z-50 bg-[#D4AF37] text-white p-2 rounded-full shadow-lg hover:bg-[#C49E2E] transition-colors"
          aria-label="Volver al inicio"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>

        <div className="pointer-events-none absolute inset-x-0 top-16 bottom-8 z-0">
          <BasketBubbleField />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabecera limpia: solo pompas de fondo y título ELIGE */}

              {/* Texto "ELIGE:" - Siempre visible encima del toggle */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-4"
              >
                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'Boulder', cursive", color: '#D4AF37' }}
                >
                  ELIGE:
                </h2>
              </motion.div>

              {/* Botones para Compra y Regalo */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 sm:gap-4 mb-6"
              >
                <Button
                  onClick={() => setIsGiftMode(false)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1.5 text-xs sm:text-sm transition-all duration-300 border-2 ${
                    isGiftMode === false 
                      ? 'bg-black text-white border-[#D4AF37] hover:bg-black shadow-lg scale-105' 
                      : 'bg-transparent text-black border-black hover:bg-transparent'
                  }`}
                >
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Compra
                </Button>
                <Button
                  onClick={() => setIsGiftMode(true)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1.5 text-xs sm:text-sm transition-all duration-300 border-2 ${
                    isGiftMode === true 
                      ? 'bg-black text-white border-[#D4AF37] hover:bg-black shadow-lg scale-105' 
                      : 'bg-transparent text-black border-black hover:bg-transparent'
                  }`}
                >
                  <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Regalo
                </Button>
              </motion.div>
          
          
          <motion.div 
            initial={{ opacity: 0, x: -100, scale: 0.85 }} 
            whileInView={{ opacity: 1, x: 0, scale: 1 }} 
            transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }} 
            viewport={{ once: true }}
            className="text-center mb-8 gpu-accelerated"
          >
            {isGiftMode !== null && (
              <div className="flex justify-center items-center gap-2 mb-6 px-2">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={isGiftMode === true ? 'gift' : 'normal'}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="text-base sm:text-xl md:text-2xl lg:text-4xl leading-tight font-poppins font-bold text-black text-center"
                  >
                    <span style={{ fontFamily: "'Boulder', cursive", color: '#D4AF37' }}>
                      {isGiftMode === true ? 'REGALA' : 'COMPRA'}
                    </span>{' '}
                    <span className="hidden sm:inline">tu experiencia personalizada.</span>
                    <span className="sm:hidden">tu experiencia.</span>
                  </motion.h2>
                </AnimatePresence>
              </div>
            )}
            
            {isGiftMode !== null && (
              <AnimatePresence mode="wait">
                <motion.p 
                  key={isGiftMode === true ? 'gift-text' : 'normal-text'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl mb-2 font-inter text-black px-2"
                >
                  {isGiftMode === true ? (
                    <>
                      <span className="hidden md:inline">Elige a quién quieres regalar: </span>
                      <span className="md:hidden">Regala a: </span>
                      <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.
                    </>
                ) : (
                  <>
                    <span className="hidden md:inline">Elige con quién quieres compartir: </span>
                    <span className="md:hidden">Comparte con: </span>
                    <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.
                  </>
                )}
              </motion.p>
              
              {/* ¿Tienes dudas? con animación */}
              <div className="flex justify-center w-full mt-6">
                <motion.button
                  onClick={() => navigate('/conocenos')}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity duration-200 bg-transparent border-0 p-0 w-auto"
                >
                  <motion.span
                    animate={{ rotateZ: [0, -15, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: '#D4AF37' }}
                  >
                    ¿
                  </motion.span>
                  <span className="text-sm sm:text-base font-poppins text-black">
                    Tienes dudas
                  </span>
                  <motion.span
                    animate={{ rotateZ: [0, 15, -15, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: '#D4AF37' }}
                  >
                    ?
                  </motion.span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </div>
            </AnimatePresence>
          )}

          {/* Botones de Categoría */}
            {isGiftMode !== null && (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isGiftMode ? 'gift-categories' : 'buy-categories'}
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex flex-col items-center mt-8"
                >
                  <div className="flex justify-center gap-2 sm:gap-4 mb-2">
                    <motion.button
                      onClick={() => setSelectedCategory('Pareja')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-poppins font-bold text-sm sm:text-lg transition-all duration-300 ${
                        selectedCategory === 'Pareja'
                          ? 'bg-[#782C23] text-white shadow-lg'
                          : 'bg-white text-[#782C23] border-2 border-[#782C23] hover:bg-[#782C23]/10'
                      }`}
                    >
                      Pareja
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setSelectedCategory('Familia')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-poppins font-bold text-sm sm:text-lg transition-all duration-300 ${
                        selectedCategory === 'Familia'
                          ? 'bg-[#4A7050] text-white shadow-lg'
                          : 'bg-white text-[#4A7050] border-2 border-[#4A7050] hover:bg-[#4A7050]/10'
                      }`}
                    >
                      Familia
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setSelectedCategory('Amigos')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-poppins font-bold text-sm sm:text-lg transition-all duration-300 ${
                        selectedCategory === 'Amigos'
                          ? 'bg-[#44667D] text-white shadow-lg'
                          : 'bg-white text-[#44667D] border-2 border-[#44667D] hover:bg-[#44667D]/10'
                      }`}
                    >
                      Amigos
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

          </motion.div>
            </div>
          </section>
          
          {/* Flecha para scroll a cestas - Colocada encima del catálogo */}
          {isGiftMode !== null && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center py-4"
            >
              <motion.button
                onClick={() => {
                  console.log('⬇️ Scroll flecha a cestas');
                  scrollToElementWithOffset('[data-basket-id]', 140);
                }}
                whileHover={{ scale: 1.15, y: 3 }}
                whileTap={{ scale: 0.9 }}
                animate={{ y: [0, 5, 0] }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="p-0 bg-transparent border-0 cursor-pointer"
                aria-label="Ver cestas"
              >
                <svg 
                  className="w-10 h-10 sm:w-12 sm:h-12" 
                  fill="none" 
                  stroke="#D4AF37" 
                  strokeWidth="3" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
            </motion.div>
          )}

          {/* Basket Catalog Section */}
          {isGiftMode !== null && (
            <AnimatePresence mode="wait">
              <motion.section 
                key={isGiftMode ? 'gift-mode' : 'buy-mode'}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
                className="py-8 md:py-10"
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <BasketCatalog 
                    categoria={selectedCategory} 
                    onGroupSizeChange={setGroupSize}
                    isGiftMode={isGiftMode}
                  />
                </div>
              </motion.section>
            </AnimatePresence>
          )}

      {/* Welcome Toast - Esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-[200] max-w-md">
        <StickyToast
          message="¡Bienvenido al catálogo!"
          visible={showWelcomeToast}
          onClose={() => setShowWelcomeToast(false)}
          autoHideDuration={3000}
        />
      </div>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onContinueToAuth={() => {
          setShowExitDialog(false);
          // Establecer flag para preservar carrito durante login
          localStorage.setItem('pendingCheckout', 'true');
          navigate('/checkout');
        }}
      />
    </div>
  );
};

export default ComprarCestasPage;
