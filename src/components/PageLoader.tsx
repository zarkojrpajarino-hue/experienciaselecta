import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * PageLoader - Loader mejorado que solo aparece si la carga toma >200ms
 * Evita flashes en cargas rápidas
 */
export const PageLoader: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Solo mostrar el loader si la carga toma más de 150ms
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="min-h-screen bg-background flex items-center justify-center"
        >
          {/* Simple loading spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
