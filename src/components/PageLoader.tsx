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
    // Solo mostrar el loader si la carga toma más de 200ms
    const timer = setTimeout(() => {
      setShow(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen bg-background flex flex-col gpu-accelerated"
          style={{ willChange: 'opacity' }}
        >
          {/* Navbar skeleton */}
          <div className="w-full h-20 bg-background border-b border-border/50">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 container mx-auto px-4 py-8 space-y-6">
            {/* Hero section skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Skeleton className="h-64 w-full rounded-lg" />
            </motion.div>

            {/* Content cards skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </motion.div>

            {/* Additional content skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-4"
            >
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </motion.div>
          </div>

          {/* Loading spinner overlay - sutil */}
          <div className="fixed bottom-8 right-8 z-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
              style={{ willChange: 'transform' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
