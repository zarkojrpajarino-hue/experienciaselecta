/**
 * Utility function for smooth scrolling to elements
 * Works reliably across mobile and desktop
 */

export const smoothScrollTo = (elementId: string, offset: number = 100) => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`⚠️ Element with id "${elementId}" not found`);
    return;
  }

  console.log(`✅ Scrolling to element: ${elementId}`);
  
  // Get element position relative to viewport
  const elementPosition = element.getBoundingClientRect().top;
  
  // Get current scroll position
  const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Calculate final position with offset (for navbar)
  const offsetPosition = elementPosition + currentPosition - offset;
  
  // Smooth scroll
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Alternative scroll function with hash navigation
 * Useful for deep linking
 */
export const scrollToHash = (hash: string, offset: number = 100) => {
  // Remove # if present
  const cleanHash = hash.replace('#', '');
  smoothScrollTo(cleanHash, offset);
};

/**
 * Scroll to top of page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Check if element exists before scrolling
 */
export const elementExists = (elementId: string): boolean => {
  return !!document.getElementById(elementId);
};
