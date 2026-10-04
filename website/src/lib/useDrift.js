import { gsap, useGSAP, finePointer, listeners } from './motion';

/* Elements marked data-drift="N" slide sideways (x only, up to N px) with the pointer,
   and ease back to centre when it leaves. The pointer is tracked over the nearest
   [data-drift-area] ancestor, or over the element itself. */
export default function useDrift(ready) {
  useGSAP(() => {
    if (!ready || !finePointer) return undefined;
    const [on, off] = listeners();

    gsap.utils.toArray('[data-drift]').forEach((el) => {
      const range = Number(el.dataset.drift) || 12;
      const area = el.closest('[data-drift-area]') || el;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
      on(area, 'pointermove', (e) => {
        const r = area.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 2 * range);
      });
      on(area, 'pointerleave', () => xTo(0));
    });

    return off;
  }, { dependencies: [ready] });
}
