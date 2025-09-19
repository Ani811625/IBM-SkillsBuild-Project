/**
 * Mobile Enhancement Hook - Touch gestures and mobile-optimized interactions
 * Provides swipe, touch, and gesture support for mobile devices
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Touch gesture hook
export const useTouch = ({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isHorizontalSwipe && Math.abs(distanceX) > threshold) {
      if (distanceX > 0) {
        onSwipeLeft && onSwipeLeft();
      } else {
        onSwipeRight && onSwipeRight();
      }
    }

    if (isVerticalSwipe && Math.abs(distanceY) > threshold) {
      if (distanceY > 0) {
        onSwipeUp && onSwipeUp();
      } else {
        onSwipeDown && onSwipeDown();
      }
    }

    setIsSwiping(false);
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isSwiping
  };
};

// Pull to refresh hook
export const usePullToRefresh = ({ onRefresh, threshold = 80, resistance = 0.5 }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    if (distance > 0) {
      e.preventDefault();
      const pullValue = Math.min(distance * resistance, threshold * 2);
      setPullDistance(pullValue);
    }
  }, [isPulling, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    pullHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

// Mobile device detection
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    screenSize
  };
};

// Long press hook
export const useLongPress = ({ onLongPress, onPress, delay = 500 }) => {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef(null);

  const start = useCallback((e) => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress && onLongPress(e);
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const end = useCallback((e) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onPress && onPress(e);
    }
    setIsPressed(false);
  }, [onPress]);

  return {
    isPressed,
    handlers: {
      onMouseDown: start,
      onMouseUp: end,
      onMouseLeave: clear,
      onTouchStart: start,
      onTouchEnd: end,
      onTouchCancel: clear
    }
  };
};

// Double tap hook
export const useDoubleTap = ({ onDoubleTap, onSingleTap, delay = 250 }) => {
  const [lastTap, setLastTap] = useState(0);
  const timeoutRef = useRef(null);

  const handleTap = useCallback((e) => {
    const now = Date.now();
    
    if (now - lastTap < delay) {
      // Double tap detected
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onDoubleTap && onDoubleTap(e);
      setLastTap(0);
    } else {
      // Potential single tap
      setLastTap(now);
      timeoutRef.current = setTimeout(() => {
        onSingleTap && onSingleTap(e);
        timeoutRef.current = null;
      }, delay);
    }
  }, [lastTap, delay, onDoubleTap, onSingleTap]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onTap: handleTap
  };
};

// Haptic feedback (if supported)
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'impact', intensity = 'medium') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      const patterns = {
        impact: {
          light: [10],
          medium: [20],
          heavy: [30]
        },
        notification: {
          success: [10, 50, 10],
          warning: [20, 100, 20],
          error: [30, 150, 30]
        },
        selection: [5]
      };

      const pattern = patterns[type];
      if (pattern) {
        const vibrationPattern = typeof pattern === 'object' ? pattern[intensity] || pattern.medium : pattern;
        navigator.vibrate(vibrationPattern);
      }
    }
  }, []);

  return { triggerHaptic };
};

// Pinch zoom hook
export const usePinchZoom = ({ onZoom, minScale = 0.5, maxScale = 3 }) => {
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const [isPinching, setIsPinching] = useState(false);

  const getDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      setLastDistance(getDistance(e.touches));
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches);
      const scaleChange = distance / lastDistance;
      const newScale = Math.min(Math.max(scale * scaleChange, minScale), maxScale);
      
      setScale(newScale);
      setLastDistance(distance);
      onZoom && onZoom(newScale);
    }
  }, [isPinching, lastDistance, scale, minScale, maxScale, onZoom]);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    setLastDistance(0);
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    onZoom && onZoom(1);
  }, [onZoom]);

  return {
    scale,
    isPinching,
    resetZoom,
    pinchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

export default {
  useTouch,
  usePullToRefresh,
  useMobileDetection,
  useLongPress,
  useDoubleTap,
  useHapticFeedback,
  usePinchZoom
};