import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface StickyToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

const formatMessage = (raw: string): string => {
  if (!raw) return "";
  let text = raw.trim();
  // Primera letra mayúscula
  text = text.charAt(0).toUpperCase() + text.slice(1);
  // Asegurar punto final si no hay puntuación
  if (!/[\.!?]$/.test(text)) {
    text = text + ".";
  }
  return text;
};

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

  const formatted = useMemo(() => formatMessage(message), [message]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          className="z-[200] bg-background border border-border rounded-xl shadow p-4 w-full max-w-md mx-auto my-4 animate-enter"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-foreground font-normal text-base leading-relaxed">
                {formatted}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
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
