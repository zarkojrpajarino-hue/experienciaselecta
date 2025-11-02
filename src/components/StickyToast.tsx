import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  autoHideDuration = 3000 
}) => {
  useEffect(() => {
    if (visible && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideDuration, onClose]);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl shadow-2xl p-4 max-w-sm w-auto"
          style={{ willChange: "transform" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-black font-poppins font-medium text-base leading-relaxed">
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
    </AnimatePresence>,
    document.body
  );
};

export default StickyToast;
