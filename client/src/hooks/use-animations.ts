import { useEffect } from "react";

export const useAnimations = () => {
  const setupScrollAnimation = () => {
    const scrollAnimations = document.querySelectorAll(".scroll-animation");
    
    const checkScroll = () => {
      scrollAnimations.forEach(animation => {
        const rect = animation.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top <= windowHeight * 0.85) {
          animation.classList.add("active");
        }
      });
    };
    
    window.addEventListener("scroll", checkScroll);
    // Check on initial load as well
    checkScroll();
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  };
  
  return {
    setupScrollAnimation,
  };
};
