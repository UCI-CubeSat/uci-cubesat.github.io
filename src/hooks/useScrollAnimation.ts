import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

// Hook for multiple elements
export function useMultipleScrollAnimation(count: number) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(count).fill(false)
  );
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            observer.unobserve(element);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [count]);

  const setRef = (index: number) => (element: HTMLElement | null) => {
    refs.current[index] = element;
  };

  return { setRef, visibleItems };
}


