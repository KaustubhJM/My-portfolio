import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, scramble, finePointer, listeners } from '../lib/motion';
import { TAILS } from '../data';
import SectionHead from './SectionHead';

export default function Tails({ ready }) {
  const root = useRef(null);
  const grid = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);

  useGSAP(() => {
    if (!ready) return undefined;
    const section = root.current;
    const cards = gsap.utils.toArray('.tail', section);
    const [on, off] = listeners();

    gsap.fromTo('.tails__watermark', { yPercent: -12, rotate: -8 }, {
      yPercent: 14, rotate: 24, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const cardIn = (batch) => gsap.timeline()
      .fromTo(batch, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0)
      // numerals are brushed on top-to-bottom (clip only — their hover tilt is a CSS transform)
      .fromTo(batch.map((t) => t.querySelector('.tail__num')), { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut', stagger: 0.08 }, 0.25)
      .fromTo(batch.flatMap((t) => Array.from(t.querySelectorAll('.tags li'))), { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.025 }, 0.5)
      .add(() => batch.forEach((t) => scramble(t.querySelector('.tail__count'), 0.8)), 0.3);

    const mm = gsap.matchMedia();

    // Desktop: the section pins and the cards travel sideways
    mm.add('(min-width: 1025px)', () => {
      section.classList.add('is-horizontal');
      const wrap = grid.current.parentElement;
      const distance = () => {
        const cs = getComputedStyle(wrap);
        return grid.current.scrollWidth - (wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      };

      const track = gsap.to(grid.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          // Pin at the top; if the section is taller than the window, pin once its bottom
          // reaches the screen bottom instead, so the whole card (tags included) stays in view
          start: () => (section.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(bar.current, { scaleX: self.progress });
            count.current.textContent = String(1 + Math.round(self.progress * 8)).padStart(2, '0');
          },
        },
      });

      // All cards cascade in once the section arrives…
      ScrollTrigger.create({ trigger: section, start: 'top 70%', once: true, onEnter: () => cardIn(cards) });

      // …then each one swings open in 3D as it slides in from the right edge
      cards.forEach((card) => {
        gsap.fromTo(card, { rotationY: -32, transformPerspective: 1100, transformOrigin: '0% 50%' }, {
          rotationY: 0, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: track, start: 'left 100%', end: 'left 55%', scrub: true },
        });
      });

      return () => section.classList.remove('is-horizontal');
    });

    // Smaller screens: a plain vertical cascade
    mm.add('(max-width: 1024px)', () => {
      ScrollTrigger.batch(cards, { start: 'top 90%', once: true, onEnter: cardIn });
    });

    // Crimson glow follows the pointer across each card
    if (finePointer) {
      cards.forEach((card) => on(card, 'pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }));
    }

    return () => { off(); mm.revert(); };
  }, { scope: root, dependencies: [ready] });

  return (
    <section className="section ink tails" id="tails" ref={root}>
      <span className="tails__watermark" aria-hidden="true">九</span>
      <div className="wrap">
        <SectionHead
          ready={ready} kanji="尾" tag="02 — Nine tails" lines={['Nine disciplines,', 'one body of work.']}
          intro="Every tail is a skill, from classical models to agents, that I use to take an AI system from idea to something people can rely on."
        />

        <ol className="tails__grid" ref={grid}>
          {TAILS.map((t, i) => (
            <li className="tail" data-reveal="" key={t.title}>
              <span className="tail__num" aria-hidden="true">{t.num}</span>
              {/* one text node, so the scramble effect can swap it cleanly */}
              <span className="tail__count">{`Tail ${i + 1} / ${TAILS.length}`}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              {t.proof && <p className="tail__proof"><span>Shown in</span> {t.proof}</p>}
              <ul className="tags">{t.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </li>
          ))}
        </ol>

        <div className="tails__rail" aria-hidden="true">
          <span className="tails__rail-num" ref={count}>01</span>
          <span className="tails__rail-bar"><span ref={bar} /></span>
          <span className="tails__rail-num">09</span>
        </div>
      </div>
    </section>
  );
}
