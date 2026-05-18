'use client';
import { useEffect, useRef } from 'react';

/**
 * Enveloppe n'importe quel contenu pour lui appliquer
 * une animation d'apparition au scroll (fondu + glissement).
 *
 * Usage :
 *   <FadeIn>...</FadeIn>
 *   <FadeIn delay={1}>...</FadeIn>  ← délai de 0.1s
 *   <FadeIn delay={2}>...</FadeIn>  ← délai de 0.2s
 *   <FadeIn delay={3}>...</FadeIn>  ← délai de 0.3s
 */
export default function FadeIn({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in ${delay ? `fade-in-delay-${delay}` : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
