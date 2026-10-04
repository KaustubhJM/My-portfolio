import { useRef } from 'react';
import { gsap, useGSAP, finePointer, listeners } from '../lib/motion';

/* Ink cursor: a ring that trails the pointer, swells over links, and shows the
   data-cursor-text of whatever it's over ("Write", "Open", "Scroll"…). */
export default function Cursor({ ready }) {
  const ring = useRef(null);
  const label = useRef(null);

  useGSAP(() => {
    if (!ready || !finePointer) return undefined;
    const cursor = ring.current;
    const [on, off] = listeners();
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });

    on(window, 'pointermove', (e) => {
      cx(e.clientX); cy(e.clientY);
      cursor.classList.add('is-visible');
      let labelled = e.target.closest('[data-cursor-text]');
      // "Scroll" only makes sense while the tails track is horizontal
      if (labelled?.classList.contains('tail') && !document.querySelector('.tails.is-horizontal')) labelled = null;
      cursor.classList.toggle('has-label', !!labelled);
      if (labelled) label.current.textContent = labelled.dataset.cursorText;
      cursor.classList.toggle('is-link', !labelled && !!e.target.closest('a, button'));
    }, { passive: true });
    on(document, 'pointerleave', () => cursor.classList.remove('is-visible'));
    on(window, 'pointerdown', () => cursor.classList.add('is-down'));
    on(window, 'pointerup', () => cursor.classList.remove('is-down'));
    return off;
  }, { dependencies: [ready] });

  if (!finePointer) return null;
  return (
    <div className="cursor" aria-hidden="true" ref={ring}>
      <span className="cursor__label" ref={label} />
    </div>
  );
}
