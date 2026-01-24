import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Always show header at the very top
      if (scrollY < 10) {
        setIsVisible(true);
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      const diff = scrollY - lastScrollY.current;

      // Only trigger if scroll exceeds threshold
      if (Math.abs(diff) > threshold) {
        // Scrolling down: hide header
        // Scrolling up: show header
        setIsVisible(diff < 0);
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isVisible;
}
