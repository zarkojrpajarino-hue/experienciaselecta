import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

const HeaderMenuArrow = () => {
  const handleClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Trigger hamburger menu click after scrolling
    setTimeout(() => {
      const hamburgerButton = document.querySelector('button[aria-label="Toggle menu"]') as HTMLButtonElement;
      if (hamburgerButton) {
        hamburgerButton.click();
      }
    }, 600);
  };

  return (
    <div className="flex justify-center py-8">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.15, y: -5 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="p-0 bg-transparent border-0 cursor-pointer"
        aria-label="Abrir menú"
      >
        <ChevronUp 
          className="w-12 h-12 md:w-16 md:h-16" 
          style={{ color: '#D4AF37' }}
          strokeWidth={3}
        />
      </motion.button>
    </div>
  );
};

export default HeaderMenuArrow;
