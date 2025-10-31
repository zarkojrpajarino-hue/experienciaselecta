import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface StickyToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

const StickyToast: React.FC<StickyToastProps> = ({ 
  message, 
  visible, 
  onClose, 
  autoHideDuration = 2000 
}) => {
  useEffect(() => {
    if (visible && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideDuration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 right-4 z-[200] bg-white border-2 border-black rounded-xl shadow-2xl p-4 max-w-sm"
          style={{ willChange: "transform" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-black font-poppins font-medium text-sm leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-black/60 hover:text-black transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyToast;
