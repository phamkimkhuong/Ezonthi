import { useEffect } from 'react';

/**
 * useScrollReveal Hook (Smart Scroll-Triggered Reveal with Staggered Cascade)
 * 
 * Uses Native IntersectionObserver & MutationObserver to reveal sections and cards
 * as they enter the user's viewport with smooth 60ms staggered cascades.
 * 
 * - 0 KB external library overhead
 * - 100% GPU accelerated (Composite layer: transform & opacity)
 * - Automatically handles dynamic tabs and DOM updates via MutationObserver
 * - Automatically unobserves elements after reveal to free memory
 * - Fully respects prefers-reduced-motion accessibility guidelines
 */
export function useScrollReveal(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Accessibility check: immediately reveal all elements if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-group').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback for older environments without IntersectionObserver
      document.querySelectorAll('.reveal-on-scroll, .reveal-group').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -35px 0px'
      }
    );

    // Initial query
    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-group');
    elements.forEach(el => observer.observe(el));

    // Observe dynamic changes (e.g. switching tabs in GradeSubjectTabs)
    let mutationObserver: MutationObserver | null = null;
    if ('MutationObserver' in window) {
      mutationObserver = new MutationObserver(() => {
        const pendingElements = document.querySelectorAll(
          '.reveal-on-scroll:not(.is-revealed), .reveal-group:not(.is-revealed)'
        );
        pendingElements.forEach(el => observer.observe(el));
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, []);
}
