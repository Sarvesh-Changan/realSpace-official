'use client';

import { useEffect, type ReactNode } from 'react';

const entranceOffsets = [
  'translate3d(0, 32px, 0)',
  'translate3d(0, -32px, 0)',
  'translate3d(0, 32px, 0)',
  'translate3d(0, -32px, 0)',
];

/** Adds one-time, directional reveal motion to the RERA page sections. */
export default function ReraHomeMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-rera-home-motion] section'));
    const panelSections = sections.filter((section) => section.hasAttribute('data-rera-home-motion-panels'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    panelSections.forEach((section) => {
      section.style.opacity = '0';
      section.style.visibility = 'hidden';
      Array.from(section.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        child.style.opacity = '1';
        child.style.transform = 'translate3d(0, 16px, 0)';
        child.style.transition = 'opacity 950ms cubic-bezier(0.22, 1, 0.36, 1), transform 950ms cubic-bezier(0.22, 1, 0.36, 1)';
        child.style.transitionDelay = `${index * 140}ms`;
        child.style.willChange = 'opacity, transform';
      });
    });

    sections.forEach((section, index) => {
      section.style.opacity = '1';
      section.style.transform = entranceOffsets[index % entranceOffsets.length];
      section.style.transition = 'opacity 850ms cubic-bezier(0.22, 1, 0.36, 1), transform 850ms cubic-bezier(0.22, 1, 0.36, 1)';
      section.style.transitionDelay = `${(index % 3) * 80}ms`;
      section.style.willChange = 'opacity, transform';
    });

    const reveal = (section: HTMLElement) => {
      if (section.hasAttribute('data-rera-home-motion-panels')) {
        section.style.visibility = 'visible';
      }
      section.style.opacity = '1';
      section.style.transform = 'translate3d(0, 0, 0)';
      section.style.willChange = 'auto';

      if (section.hasAttribute('data-rera-home-motion-panels')) {
        Array.from(section.children).forEach((child) => {
          if (!(child instanceof HTMLElement)) return;
          child.style.opacity = '1';
          child.style.transform = 'translate3d(0, 0, 0) scale(1)';
          child.style.willChange = 'auto';
        });
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          if (section.hasAttribute('data-rera-home-motion-panels') && !hasUserScrolled) return;
          reveal(section);
          return;
        }

        if (scrollDirection < 0) hide(section);
      });
    }, { threshold: 0, rootMargin: '0px' });

    let hasUserScrolled = false;
    let scrollDirection = 1;
    let previousScrollY = window.scrollY;
    const trackScrollDirection = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY !== previousScrollY) scrollDirection = currentScrollY > previousScrollY ? 1 : -1;
      previousScrollY = currentScrollY;
    };
    const hide = (section: HTMLElement) => {
      section.style.opacity = section.hasAttribute('data-rera-home-motion-panels') ? '0' : '1';
      section.style.transform = entranceOffsets[sections.indexOf(section) % entranceOffsets.length];
      section.style.willChange = 'opacity, transform';
      if (section.hasAttribute('data-rera-home-motion-panels')) {
        section.style.visibility = 'hidden';
        Array.from(section.children).forEach((child, index) => {
          if (!(child instanceof HTMLElement)) return;
          child.style.opacity = '1';
          child.style.transform = 'translate3d(0, 16px, 0)';
          child.style.willChange = 'opacity, transform';
        });
      }
    };
    const revealWelcomeAfterScroll = () => {
      if (hasUserScrolled) return;
      hasUserScrolled = true;
      panelSections.forEach((section) => {
        const bounds = section.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          reveal(section);
          observer.unobserve(section);
        }
      });
    };
    const onScrollKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        revealWelcomeAfterScroll();
      }
    };

    window.addEventListener('wheel', revealWelcomeAfterScroll, { passive: true });
    window.addEventListener('touchmove', revealWelcomeAfterScroll, { passive: true });
    window.addEventListener('keydown', onScrollKey);
    window.addEventListener('scroll', trackScrollDirection, { passive: true });
    sections.forEach((section) => observer.observe(section));
    // If a notification is delayed, reveal visible content without disabling
    // the observer for sections the visitor reaches later while scrolling.
    const revealFailsafe = window.setTimeout(() => {
      sections.forEach((section) => {
        const bounds = section.getBoundingClientRect();
        const isWelcomeWaitingForScroll = section.hasAttribute('data-rera-home-motion-panels') && !hasUserScrolled;
        if (!isWelcomeWaitingForScroll && bounds.top < window.innerHeight && bounds.bottom > 0) reveal(section);
      });
    }, 1600);

    return () => {
      window.clearTimeout(revealFailsafe);
      window.removeEventListener('wheel', revealWelcomeAfterScroll);
      window.removeEventListener('touchmove', revealWelcomeAfterScroll);
      window.removeEventListener('keydown', onScrollKey);
      window.removeEventListener('scroll', trackScrollDirection);
      observer.disconnect();
    };
  }, []);

  return <div data-rera-home-motion>{children}</div>;
}
