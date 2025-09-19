// Performance utilities for Flavory Recipe App
import { useEffect, useRef, useState } from 'react';

// Debounce function for smooth interactions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Image preloader for better performance
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  return [elementRef, isIntersecting];
};

// Animation configuration for better performance
export const animationConfig = {
  reducedMotion: typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 100
  },
  
  smooth: {
    ease: 'easeOut',
    duration: 0.3
  }
};

// Flavory-specific optimizations
export const flavoryConfig = {
  baseUrl: process.env.NODE_ENV === 'production' ? '' : '',
  enableServiceWorker: process.env.NODE_ENV === 'production'
};