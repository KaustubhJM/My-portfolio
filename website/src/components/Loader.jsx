import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/motion';
import { Mark } from './Svg';

const KANJI = [...'九尾の狐'];
const SEEN = 'kitsune-seen';

// Repeat visits in the same session skip the count and go straight to the split
const seenThisSession = (() => {
  try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; }
})();

/* Counts the page in while the fox and fonts load (onReady), then — once `open` —
   splits apart onto the hero: onIntro fires as the panels part (the page is usable from
   then on), onDone when they're gone. */
export default function Loader({ open, onReady, onIntro, onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);

  useGSAP((_, contextSafe) => {
    let cancelled = false;
    const progress = { p: 0 };
    const paint = () => {
      count.current.textContent = String(Math.round(progress.p)).padStart(3, '0');
      gsap.set(bar.current, { scaleX: progress.p / 100 });
    };

    const heroImg = document.querySelector('.hero__art img');
    const imgReady = new Promise((resolve) => {
      if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) return resolve();
      heroImg.addEventListener('load', resolve, { once: true });
      heroImg.addEventListener('error', resolve, { once: true });
    });
    const waitFor = (ms) => Promise.race([Promise.all([imgReady, document.fonts.ready]), new Promise((r) => setTimeout(r, ms))]);

    if (seenThisSession) {
      waitFor(700).then(() => !cancelled && onReady());
      return () => { cancelled = true; };
    }

    gsap.timeline()
      .fromTo('.loader__mark', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut' }, 0)
      .from('.loader__kanji span', { opacity: 0, yPercent: 60, filter: 'blur(8px)', duration: 0.55, ease: 'expo.out', stagger: 0.07 }, 0.12)
      .from('.loader__foot', { opacity: 0, duration: 0.4 }, 0.2);

    // Creep to 86% on a timer; the last stretch waits for the real assets
    const creep = gsap.to(progress, { p: 86, duration: 0.6, ease: 'power2.inOut', onUpdate: paint });
    const minTime = new Promise((r) => creep.eventCallback('onComplete', r));

    const finish = contextSafe(() => {
      if (cancelled) return;
      gsap.to(progress, { p: 100, duration: 0.2, ease: 'power2.out', onUpdate: paint, onComplete: () => !cancelled && onReady() });
    });
    Promise.all([waitFor(900), minTime]).then(finish);

    return () => { cancelled = true; };
  }, { scope: root });

  useGSAP(() => {
    if (!open) return;
    try { sessionStorage.setItem(SEEN, '1'); } catch { /* storage blocked: the full loader plays next time */ }
    gsap.timeline({ onComplete: onDone })
      .to('.loader__inner', { yPercent: -40, opacity: 0, duration: seenThisSession ? 0.2 : 0.3, ease: 'power3.in' })
      .to('.loader__panel--top', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .to('.loader__panel--bottom', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
      // Clicks and scrolling go through to the page while the panels finish parting
      .set(root.current, { pointerEvents: 'none' }, '<')
      .add(onIntro, '<');
  }, { scope: root, dependencies: [open] });

  return (
    <div className={`loader${seenThisSession ? ' is-quick' : ''}`} aria-hidden="true" ref={root}>
      <div className="loader__panel loader__panel--top" />
      <div className="loader__panel loader__panel--bottom" />
      <div className="loader__inner">
        <Mark className="loader__mark" />
        <p className="loader__kanji">
          {KANJI.map((c) => <span key={c} style={{ display: 'inline-block' }}>{c}</span>)}
        </p>
        <div className="loader__foot">
          <span className="loader__name">Kaustubh Jeet Mishra</span>
          <span className="loader__count"><span ref={count}>000</span>%</span>
        </div>
        <div className="loader__bar"><span ref={bar} /></div>
      </div>
    </div>
  );
}
