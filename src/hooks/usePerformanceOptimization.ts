import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { rafThrottle, debounce, prefersReducedMotion } from '../utils/performance';

export interface PerformanceOptimizationOptions {
  enableAnimations?: boolean;
  throttleDelay?: number;
  debounceDelay?: number;
  enableVirtualization?: boolean;
  maxVisibleItems?: number;
}

export function usePerformanceOptimization(options: PerformanceOptimizationOptions = {}) {
  const {
    enableAnimations = !prefersReducedMotion(),
    throttleDelay = 16, // ~60fps
    debounceDelay = 300,
    enableVirtualization = false,
    maxVisibleItems = 100
  } = options;

  const frameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Throttled update function using RAF
  const throttledUpdate = useCallback(rafThrottle((callback: () => void) => {
    const now = performance.now();
    if (now - lastUpdateRef.current >= throttleDelay) {
      callback();
      lastUpdateRef.current = now;
    }
  }), [throttleDelay]);

  // Debounced update function
  const debouncedUpdate = useCallback(debounce((callback: () => void) => {
    callback();
  }, debounceDelay), [debounceDelay]);

  // Batch DOM updates
  const batchUpdate = useCallback((updates: (() => void)[]) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('Error in batched update:', error);
        }
      });
      frameRef.current = undefined;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Memoized performance settings
  const performanceSettings = useMemo(() => ({
    enableAnimations,
    enableVirtualization,
    maxVisibleItems,
    shouldOptimize: maxVisibleItems > 50
  }), [enableAnimations, enableVirtualization, maxVisibleItems]);

  return {
    throttledUpdate,
    debouncedUpdate,
    batchUpdate,
    performanceSettings
  };
}

// Hook for optimizing large lists with virtualization
export function useVirtualization<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const handleScroll = useCallback(rafThrottle((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }), []);

  return {
    ...visibleRange,
    handleScroll
  };
}

// Hook for intersection observer-based lazy loading
export function useLazyLoading(threshold: number = 0.1) {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver>();

  const observe = useCallback((element: Element, id: string) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const elementId = entry.target.getAttribute('data-id');
            if (elementId) {
              setVisibleElements(prev => {
                const newSet = new Set(prev);
                if (entry.isIntersecting) {
                  newSet.add(elementId);
                } else {
                  newSet.delete(elementId);
                }
                return newSet;
              });
            }
          });
        },
        { threshold }
      );
    }

    element.setAttribute('data-id', id);
    observerRef.current.observe(element);
  }, [threshold]);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    visibleElements,
    observe,
    unobserve,
    isVisible: (id: string) => visibleElements.has(id)
  };
}