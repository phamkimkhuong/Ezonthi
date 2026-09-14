import { useEffect } from 'react';

/**
 * useSpotlightCards Hook (Linear-Style Magnetic Spotlight Border)
 * 
 * Tracks pointer coordinates relative to any element with .bento-card or .spotlight-card
 * and sets CSS Custom Properties --mouse-x, --mouse-y for hardware-accelerated radial glow.
 * 
 * - Zero extra bundle weight (0 KB library overhead)
 * - 120 FPS performance via requestAnimationFrame & Compositor thread
 * - Automatically disabled on touch devices to conserve battery
 */
export function useSpotlightCards(): void {
  useEffect(() => {
    // Only activate on pointer devices with hover capability (mice, trackpads)
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const card = target.closest?.('.bento-card, .spotlight-card') as HTMLElement | null;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}
