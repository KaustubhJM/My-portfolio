import { Fragment, useRef } from 'react';
import { gsap, SplitText, useGSAP, onView, scramble } from '../lib/motion';

/* Brush kanji, decoding tag, and heading lines that rise out of a mask */
export default function SectionHead({ ready, kanji, tag, lines, intro }) {
  const root = useRef(null);

  useGSAP(() => {
    if (!ready) return;
    const head = root.current;
    const k = head.querySelector('.kanji');
    const t = head.querySelector('.section-tag');

    const tl = gsap.timeline({ scrollTrigger: onView(head, 'top 85%') })
      .fromTo(k, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.25, rotate: -12 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, rotate: 0, duration: 1.4, ease: 'expo.out' }, 0)
      .fromTo(t, { opacity: 0, x: -14, '--line': 0 }, { opacity: 1, x: 0, '--line': 1, duration: 1, ease: 'power3.out' }, 0.15)
      .add(scramble(t, 1.2), 0.15);
    if (intro) {
      tl.fromTo('.section-intro', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.5);
    }

    SplitText.create(head.querySelector('h2'), {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, rotate: 4, transformOrigin: '0% 100%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.2,
        scrollTrigger: onView(head, 'top 85%'),
      }),
    });

    // Kanji drifts a little against the scroll
    gsap.to(k, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: head, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.set(head, { opacity: 1 });
  }, { scope: root, dependencies: [ready] });

  // The space before each <br> keeps words apart in the split heading's aria-label
  const title = (
    <h2>
      {lines.map((line, i) => (
        <Fragment key={line}>{line}{i < lines.length - 1 && <>{' '}<br /></>}</Fragment>
      ))}
    </h2>
  );
  const top = (
    <>
      <span className="kanji" aria-hidden="true">{kanji}</span>
      <p className="section-tag">{tag}</p>
      {title}
    </>
  );

  return (
    <header className={`section-head${intro ? ' section-head--split' : ''}`} data-reveal="" ref={root}>
      {intro ? <><div>{top}</div><p className="section-intro">{intro}</p></> : top}
    </header>
  );
}
