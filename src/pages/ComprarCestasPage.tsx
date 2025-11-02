import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BasketCatalog from "@/components/BasketCatalog";
import ScrollIndicator from "@/components/ScrollIndicator";
import Navbar from "@/components/Navbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import StickyToast from "@/components/StickyToast";
import ExitConfirmDialog from "@/components/ExitConfirmDialog";
import { supabase } from "@/integrations/supabase/client";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isGiftMode, setIsGiftMode] = useState(false);

  // Scroll al inicio en cambio de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  useEffect(() => {
    // Force scroll to top immediately with multiple methods for reliability
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setShowWelcomeToast(true);
        setIsLoading(false);
      } else {
        setShowAuthModal(true);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowAuthModal(false);
        setShowWelcomeToast(true);
        // Scroll to top after auth without page reload
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render catalog until user is authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen font-work-sans bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-black font-poppins">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-work-sans bg-background">
      <Navbar />
      
      <div className="relative">
        <ScrollIndicator />
      </div>
      
      {/* Header Section */}
      {user && (
        <>
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
            <div className="flex justify-center items-center gap-2 mb-3 flex-nowrap">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={isGiftMode ? 'gift' : 'normal'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="text-base sm:text-2xl md:text-4xl leading-tight font-poppins font-bold text-black whitespace-nowrap"
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
                      onClick={() => { window.location.href = '/#que-vendemos'; }}
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
                    <p className="font-medium">Haz click</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl mb-4 font-inter text-black">
              Elige la experiencia perfecta: <span className="font-bold" style={{ color: '#4A7050' }}>familia</span>, <span className="font-bold" style={{ color: '#782C23' }}>pareja</span> o <span className="font-bold" style={{ color: '#44667D' }}>amigos</span>.
            </p>

            {/* Indicador del modo actual con animación */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={isGiftMode ? 'gift-indicator' : 'normal-indicator'}
                initial={{ opacity: 0, scale: 0.8, x: isGiftMode ? 100 : -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: isGiftMode ? -100 : 100 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`mb-3 px-4 py-2 rounded-xl font-bold text-sm inline-block ${
                  isGiftMode 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-400' 
                    : 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                }`}
              >
                {isGiftMode ? '🎁 Modo Regalo' : '🛒 Modo Compra'}
              </motion.div>
            </AnimatePresence>

            <motion.div 
              onClick={() => {
                console.log('Cambiando modo de:', isGiftMode ? 'regalo' : 'normal', 'a:', !isGiftMode ? 'regalo' : 'normal');
                setIsGiftMode(!isGiftMode);
              }}
              className="flex justify-center items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-sm sm:text-base md:text-lg font-poppins font-bold text-black">
                {isGiftMode ? '¿Prefieres compra normal?' : '¿Quieres regalar algo original?'}
              </p>
              <motion.svg 
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-6 gpu-accelerated"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Category Filter Buttons */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8">
            <motion.button 
              onClick={() => setSelectedCategory('Pareja')} 
              className={`font-poppins font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base gpu-accelerated ${
                selectedCategory === 'Pareja' 
                  ? 'bg-[#782C23] text-white scale-110' 
                  : 'bg-black/10 text-black hover:bg-black/20 border-2 border-black'
              }`}
              whileHover={{ scale: selectedCategory === 'Pareja' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Pareja.
            </motion.button>

            <motion.button 
              onClick={() => setSelectedCategory('Familia')} 
              className={`font-poppins font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base gpu-accelerated ${
                selectedCategory === 'Familia' 
                  ? 'bg-[#4A7050] text-white scale-110' 
                  : 'bg-black/10 text-black hover:bg-black/20 border-2 border-black'
              }`}
              whileHover={{ scale: selectedCategory === 'Familia' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Familia.
            </motion.button>
            
            <motion.button 
              onClick={() => setSelectedCategory('Amigos')} 
              className={`font-poppins font-bold transition-all duration-200 px-3 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base gpu-accelerated ${
                selectedCategory === 'Amigos' 
                  ? 'bg-[#44667D] text-white scale-110' 
                  : 'bg-black/10 text-black hover:bg-black/20 border-2 border-black'
              }`}
              whileHover={{ scale: selectedCategory === 'Amigos' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Amigos.
            </motion.button>
              </div>
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
        </>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          if (user) {
            setShowAuthModal(false);
          }
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          setShowWelcomeToast(true);
        }}
        onBack={() => setShowExitDialog(true)}
      />

      {/* Welcome Toast - Esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-[200] max-w-md">
        <StickyToast
          message={`¡Bienvenido, ${user?.email?.split('@')[0] || 'Usuario'}!`}
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
          setShowAuthModal(true);
        }}
      />
    </div>
  );
};

export default ComprarCestasPage;
