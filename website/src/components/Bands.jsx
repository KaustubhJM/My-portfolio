import { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/motion';
import { BANDS } from '../data';
import { Mark } from './Svg';

// Enough copies to overfill a wide screen, then doubled so a -50% shift loops seamlessly
const COPIES = 3;

function Track({ items }) {
  const run = Array.from({ length: COPIES * 2 }, () => items).flat();
  return (
    <div className="band__track">
      {run.map((item, i) => (
        <Fragment key={i}><span>{item}</span><Mark /></Fragment>
      ))}
    </div>
  );
}

/* Endless marquee that speeds up with scroll velocity and flips with scroll direction */
export default function Bands({ ready }) {
  const root = useRef(null);

  useGSAP(() => {
    if (!ready) return;
    const loops = gsap.utils.toArray('.band__track').map((track, i) => {
      const dir = i % 2 ? 1 : -1; // bone runs left, crimson runs right
      const tween = gsap.fromTo(track,
        { xPercent: dir < 0 ? 0 : -50 },
        { xPercent: dir < 0 ? -50 : 0, duration: i % 2 ? 42 : 50, ease: 'none', repeat: -1 });
      // Start deep into the repeats so a negative timeScale can run backwards indefinitely
      tween.totalTime(tween.duration() * 1000);
      return tween;
    });

    ScrollTrigger.create({
      trigger: root.current, start: 'top bottom', end: 'bottom top',
      onUpdate(self) {
        const dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 8);
        loops.forEach((t) => {
          gsap.to(t, {
            timeScale: dir * boost, duration: 0.3, ease: 'power2.out', overwrite: true,
            onComplete: () => gsap.to(t, { timeScale: dir, duration: 1.4, ease: 'power2.out', overwrite: true }),
          });
        });
      },
    });

    // The two bands scissor slightly as they pass
    const scrub = () => ({ trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true });
    gsap.to('.band--bone', { rotation: '+=2', ease: 'none', scrollTrigger: scrub() });
    gsap.to('.band--blood', { rotation: '-=2', ease: 'none', scrollTrigger: scrub() });
  }, { scope: root, dependencies: [ready] });

  return (
    <div className="bands" aria-hidden="true" ref={root}>
      <div className="band band--bone"><Track items={BANDS.bone} /></div>
      <div className="band band--blood"><Track items={BANDS.blood} /></div>
    </div>
  );
}
