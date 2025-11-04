import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BasketCatalog from "@/components/BasketCatalog";
import ScrollIndicator from "@/components/ScrollIndicator";
import Navbar from "@/components/Navbar";

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
  const [isGiftMode, setIsGiftMode] = useState(false);

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
    <div className="min-h-screen font-work-sans bg-background">
      <Navbar />
      
      <div className="relative">
        <ScrollIndicator />
      </div>
      
      {/* Header Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-10 bg-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-8 border-2 border-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-start mb-4">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/')} 
                  className="text-black hover:text-black/80 p-0"
                >
                  ← Volver al inicio
                </Button>
              </div>
          
          
          <motion.div 
            initial={{ opacity: 0, x: -100, scale: 0.85 }} 
            whileInView={{ opacity: 1, x: 0, scale: 1 }} 
            transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }} 
            viewport={{ once: true }}
            className="text-center mb-8 gpu-accelerated"
          >
            <div className="flex justify-center items-center gap-2 mb-3 flex-wrap">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={isGiftMode ? 'gift' : 'normal'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="text-base sm:text-2xl md:text-4xl leading-tight font-poppins font-bold text-black text-center break-words"
                >
                  <span style={{ fontFamily: "'Boulder', cursive", color: '#D4AF37' }}>
                    {isGiftMode ? 'REGALA' : 'COMPRA'}
                  </span> tu experiencia personalizada.
                </motion.h2>
              </AnimatePresence>
              
              <TooltipProvider delayDuration={80}>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                  <TooltipTrigger asChild>
                    <motion.span 
                      onClick={() => { navigate('/conocenos'); }}
                      onMouseEnter={() => setTooltipOpen(true)} 
                      onMouseLeave={() => setTooltipOpen(false)} 
                      className="cursor-pointer hover:opacity-80 transition-opacity duration-200 text-xl sm:text-2xl md:text-4xl font-bold gpu-accelerated" 
                      style={{ color: '#D4AF37' }}
                      animate={{ rotateZ: [0, 180, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ¿?
                    </motion.span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="relative rounded-2xl border-2 border-black/10 bg-white text-black shadow-lg px-4 py-2">
                    <p className="font-medium">¿Tienes dudas?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={isGiftMode ? 'gift-text' : 'normal-text'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-lg md:text-xl mb-4 font-inter text-black"
              >
                {isGiftMode ? (
                  <>Elige a quién quieres regalar: <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.</>
                ) : (
                  <>Elige con quién quieres compartir: <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.</>
                )}
              </motion.p>
            </AnimatePresence>

            {/* Botones para Modo Compra y Modo Regalo */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <Button
                onClick={() => setIsGiftMode(false)}
                variant={!isGiftMode ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Modo Compra
              </Button>
              <Button
                onClick={() => setIsGiftMode(true)}
                variant={isGiftMode ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                Modo Regalo
              </Button>
            </motion.div>

            {/* Botones de Categoría */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-4">
              <motion.button
                onClick={() => setSelectedCategory('Pareja')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 sm:px-8 py-3 rounded-xl font-poppins font-bold text-base sm:text-lg transition-all duration-300 ${
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
                className={`px-6 sm:px-8 py-3 rounded-xl font-poppins font-bold text-base sm:text-lg transition-all duration-300 ${
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
                className={`px-6 sm:px-8 py-3 rounded-xl font-poppins font-bold text-base sm:text-lg transition-all duration-300 ${
                  selectedCategory === 'Amigos'
                    ? 'bg-[#44667D] text-white shadow-lg'
                    : 'bg-white text-[#44667D] border-2 border-[#44667D] hover:bg-[#44667D]/10'
                }`}
              >
                Amigos
              </motion.button>
            </div>

          </motion.div>
            </div>
          </section>
          
          {/* Basket Catalog Section */}
          <section className="py-8 md:py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <BasketCatalog 
                categoria={selectedCategory} 
                onGroupSizeChange={setGroupSize}
                isGiftMode={isGiftMode}
              />
            </div>
          </section>

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
