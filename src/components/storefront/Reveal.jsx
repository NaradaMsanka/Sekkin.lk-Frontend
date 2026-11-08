import { useLayoutEffect, useRef } from 'react';
import { Box } from '@mui/material';

let observer;

// Presentation only: one shared observer, no scroll listeners or React state updates.
export default function Reveal({ children, delay = 0, className = '', sx, ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof window.IntersectionObserver !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    observer ??= new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.dataset.reveal = 'visible';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 32px 0px' });
    node.dataset.reveal = 'pending';
    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  return <Box ref={ref} className={`motion-reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }} sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]} {...props}>{children}</Box>;
}
