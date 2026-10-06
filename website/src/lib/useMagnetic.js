import { gsap, useGSAP, finePointer, listeners } from './motion';

// Elements marked data-magnetic lean gently toward the pointer and glide back on leave.
export default function useMagnetic(ready) {
  useGSAP(() => {
    if (!ready || !finePointer) return undefined;
    const [on, off] = listeners();

    gsap.utils.toArray('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      on(el, 'pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.2);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      on(el, 'pointerleave', () => { xTo(0); yTo(0); });
    });

    return off;
  }, { dependencies: [ready] });
}
