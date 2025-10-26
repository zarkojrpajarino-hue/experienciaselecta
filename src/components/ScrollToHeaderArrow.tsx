import { motion } from "framer-motion";
import { ArrowUp, Menu } from "lucide-react";
import { useState } from "react";

const ScrollToHeaderArrow = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Trigger hamburger menu click after scrolling
    setTimeout(() => {
      const hamburgerButton = document.querySelector('[aria-label="Toggle menu"]') as HTMLButtonElement;
      if (hamburgerButton) {
        hamburgerButton.click();
      }
      setIsClicked(false);
    }, 500);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-40 flex flex-col items-center gap-2 bg-gold/90 hover:bg-gold text-white rounded-full p-4 shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ArrowUp className="w-6 h-6" />
      <Menu className="w-4 h-4" />
      <span className="text-xs font-bold">Menú</span>
    </motion.button>
  );
};

export default ScrollToHeaderArrow;
