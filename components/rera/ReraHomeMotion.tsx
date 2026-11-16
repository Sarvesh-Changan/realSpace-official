'use client';

import { useEffect, type ReactNode } from 'react';

const entranceOffsets = [
  'translate3d(0, 28px, 0)',
  'translate3d(0, -28px, 0)',
  'translate3d(-28px, 0, 0)',
  'translate3d(28px, 0, 0)',
];

/** Adds one-time, directional reveal motion to the RERA page sections. */
export default function ReraHomeMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-rera-home-motion] section'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    sections.forEach((section, index) => {
      // Keep content fully readable during the entrance motion. Hiding the
      // whole section can make text appear missing if an observer callback is delayed.
      section.style.opacity = '1';
      section.style.transform = entranceOffsets[index % entranceOffsets.length];
      section.style.transition = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)';
      section.style.willChange = 'opacity, transform';
    });

    const reveal = (section: HTMLElement) => {
      section.style.transform = 'translate3d(0, 0, 0)';
      section.style.willChange = 'auto';
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        reveal(section);
        observer.unobserve(section);
      });
    }, { threshold: 0, rootMargin: '0px' });

    sections.forEach((section) => observer.observe(section));
    // A failsafe ensures no content remains offset if the browser delays or
    // skips an IntersectionObserver notification (for example, after tab restore).
    const revealFailsafe = window.setTimeout(() => {
      sections.forEach(reveal);
      observer.disconnect();
    }, 1600);

    return () => {
      window.clearTimeout(revealFailsafe);
      observer.disconnect();
    };
  }, []);

  return <div data-rera-home-motion>{children}</div>;
}
