import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
const PageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animate, setAnimate] = useState(false);
  const navItems = [{
    route: "/"
  }, {
    route: "/experiencia"
  }, {
    route: "/nosotros"
  }, {
    route: "/impacto"
  }, {
    route: "/testimonios"
  }, {
    route: "/faq"
  }];

  // Trigger animation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1500); // Animation lasts 1.5 seconds
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  const getCurrentSectionIndex = () => {
    return navItems.findIndex(item => item.route === location.pathname);
  };
  const navigateToSection = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex === -1) return;
    const newIndex = direction === 'prev' ? (currentIndex - 1 + navItems.length) % navItems.length : (currentIndex + 1) % navItems.length;
    navigate(navItems[newIndex].route);
    // Immediate scroll to top for smoother transition
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto"
      });
    }, 0);
  };
  const currentIndex = getCurrentSectionIndex();
  if (currentIndex === -1) return null;
  return <>
      {/* Left Arrow */}
      <motion.button whileHover={{
      scale: 1.1,
      x: -2
    }} whileTap={{
      scale: 0.95
    }} animate={animate ? {
      x: [0, -6, 0, -6, 0],
      opacity: [1, 0.8, 1, 0.8, 1]
    } : {}} transition={animate ? {
      duration: 1.5,
      ease: "easeInOut"
    } : {}} onClick={() => navigateToSection('prev')} className="fixed left-2 top-1/2 -translate-y-1/2 z-40 p-2 text-white hover:text-white/80 transition-all duration-300 bg-transparent" aria-label="Página anterior">
        
      </motion.button>
      
      {/* Right Arrow */}
      <motion.button whileHover={{
      scale: 1.1,
      x: 2
    }} whileTap={{
      scale: 0.95
    }} animate={animate ? {
      x: [0, 6, 0, 6, 0],
      opacity: [1, 0.8, 1, 0.8, 1]
    } : {}} transition={animate ? {
      duration: 1.5,
      ease: "easeInOut"
    } : {}} onClick={() => navigateToSection('next')} className="fixed right-2 top-1/2 -translate-y-1/2 z-40 p-2 text-white hover:text-white/80 transition-all duration-300 bg-transparent" aria-label="Siguiente página">
        
      </motion.button>
    </>;
};
export default PageNavigation;