import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const PageNavigation = () => {
  const [animate, setAnimate] = useState(false);
  const navItems = [
    { route: "/" },
    { route: "/experiencia" },
    { route: "/nosotros" },
    { route: "/impacto" },
    { route: "/testimonios" },
    { route: "/faq" },
  ];

  // Trigger animation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1500); // Animation lasts 1.5 seconds
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  const getCurrentSectionIndex = () => {
    return navItems.findIndex(item => item.route === window.location.pathname);
  };
  const navigateToSection = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex === -1) return;
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + navItems.length) % navItems.length
      : (currentIndex + 1) % navItems.length;
    const target = navItems[newIndex].route;
    window.location.assign(target);
  };
  const currentIndex = getCurrentSectionIndex();
  if (currentIndex === -1) return null;
  return (
    <>
      {/* Left Arrow */}
      <button
        onClick={() => navigateToSection('prev')}
        className={`fixed left-2 top-1/2 -translate-y-1/2 z-40 p-2 text-white hover:text-white/80 transition-all duration-300 bg-transparent hover-scale ${animate ? 'pulse' : ''}`}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => navigateToSection('next')}
        className={`fixed right-2 top-1/2 -translate-y-1/2 z-40 p-2 text-white hover:text-white/80 transition-all duration-300 bg-transparent hover-scale ${animate ? 'pulse' : ''}`}
        aria-label="Siguiente página"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </>
  );
};
export default PageNavigation;