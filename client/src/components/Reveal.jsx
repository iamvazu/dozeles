import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered reveal animation.
 * - Fades + slides content in when it enters the viewport
 * - Respects prefers-reduced-motion
 * - Falls back to visible if IntersectionObserver is unavailable
 *
 * <Reveal delay={120} variant="up">…</Reveal>
 */
export default function Reveal({
  children,
  delay = 0,
  variant = 'up', // 'up' | 'scale' | 'left' | 'right'
  as: Tag = 'div',
  className = '',
  style = {},
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;

    // No IO support (or SSR/test env) -> just show it
    if (typeof window === 'undefined' || !('IntersectionObserver' in window) || !el) {
      setShown(true);
      return;
    }
    // Honour reduced-motion preference
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);

    // Safety net: if the observer never fires (edge cases), reveal after 1.2s
    const t = setTimeout(() => setShown(true), 1200);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`rv rv-${variant} ${shown ? 'in' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
