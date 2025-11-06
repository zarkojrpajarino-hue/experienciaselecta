import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * PageLayout - Wrapper que proporciona transiciones fluidas entre páginas
 * Usa framer-motion para fade-in/out suaves de 250ms
 */
export const PageLayout = ({ children }: PageLayoutProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1], // cubic-bezier easing para suavidad
        }}
        style={{
          width: '100%',
          minHeight: '100vh',
          willChange: 'opacity',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
