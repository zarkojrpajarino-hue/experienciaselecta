import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 gpu-accelerated"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-white/80 text-sm font-medium gpu-accelerated"
      >
        Descubre más
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2 gpu-accelerated"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-1.5 h-1.5 bg-white/80 rounded-full gpu-accelerated"
        />
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        className="gpu-accelerated"
      >
        <ChevronDown className="w-6 h-6 text-white/60" />
      </motion.div>
    </motion.div>
  );
};

export default ScrollIndicator;