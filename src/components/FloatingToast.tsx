import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface FloatingToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
  position: { top: number; left: number } | null;
}

const FloatingToast: React.FC<FloatingToastProps> = ({ 
  message, 
  visible, 
  onClose, 
  autoHideDuration = 3000,
  position
}) => {
  useEffect(() => {
    if (visible && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideDuration, onClose]);

  if (!position) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
          className="bg-green-500 text-white rounded-lg shadow-xl p-3 max-w-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">
              {message}
            </p>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingToast;
