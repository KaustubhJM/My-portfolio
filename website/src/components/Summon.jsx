import { useRef } from 'react';
import { gsap, SplitText, useGSAP, onView, scramble, finePointer, glideTo, listeners, asset } from '../lib/motion';
import { EMAIL, GITHUB, LINKEDIN, RESUME } from '../data';
import { Arrow, Mark } from './Svg';

export default function Summon({ ready }) {
  const root = useRef(null);

  useGSAP(() => {
    if (!ready) return undefined;
    const section = root.current;
    const q = gsap.utils.selector(section);
    const [on, off] = listeners();

    // The blood moon rises as the section scrolls up
    gsap.fromTo('.summon__sky', { yPercent: 22, scale: 0.88 }, {
      yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: true },
    });

    const [title] = q('.summon__title');
    const { words } = SplitText.create(title, { type: 'words', wordsClass: 'word' });
    gsap.set(title, { opacity: 1 });
    const [tag] = q('.summon__inner .section-tag');

    gsap.timeline({ scrollTrigger: onView(q('.summon__inner')[0], 'top 75%') })
      .fromTo('.summon__inner .kanji', { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.25 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
      .fromTo(tag, { opacity: 0, '--line': 0 }, { opacity: 1, '--line': 1, duration: 1 }, 0.15)
      .add(scramble(tag, 1.2), 0.15)
      .fromTo(words, { opacity: 0, yPercent: 60, rotateX: -50 },
        { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045 }, 0.3)
      .fromTo('.summon__note', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0.9)
      .fromTo('.summon__mail', { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
        { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 1)
      .fromTo('.socials', { opacity: 0 }, { opacity: 1, duration: 0.01 }, 1.4)
      .from('.socials li', { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 1.4);

    // The moon leans toward the pointer
    if (finePointer) {
      const mx = gsap.quickTo('.summon__sky', 'x', { duration: 1.6, ease: 'power3.out' });
      const my = gsap.quickTo('.summon__sky', 'y', { duration: 1.6, ease: 'power3.out' });
      on(section, 'pointermove', (e) => {
        mx((e.clientX / window.innerWidth - 0.5) * 50);
        my((e.clientY / window.innerHeight - 0.5) * 30);
      });
    }

    gsap.from('.footer > *', {
      opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: onView(q('.footer')[0], 'top 98%'),
    });

    return off;
  }, { scope: root, dependencies: [ready] });

  return (
    <section className="section ink summon" id="summon" ref={root}>
      <div className="summon__sky" aria-hidden="true"><div className="summon__moon" /></div>
      <div className="wrap summon__inner">
        <span className="kanji" aria-hidden="true">呼</span>
        <p className="section-tag">04 — Summon</p>
        <h2 className="summon__title" data-reveal="">
          Got a problem with too many moving parts?<span> Let’s give it nine tails.</span>
        </h2>
        <p className="summon__note" data-reveal="">Open to internships, research collaborations and interesting agentic-AI problems.</p>
        <a className="summon__mail" href={`mailto:${EMAIL}`} data-reveal="" data-cursor-text="Write">{EMAIL}</a>
        <ul className="socials" data-reveal="">
          <li><a href={LINKEDIN} target="_blank" rel="noopener" data-magnetic="" data-cursor-text="Open">LinkedIn <Arrow dir="out" /></a></li>
          <li><a href={GITHUB} target="_blank" rel="noopener" data-magnetic="" data-cursor-text="Open">GitHub <Arrow dir="out" /></a></li>
          <li><a href={asset(RESUME)} download data-magnetic="" data-cursor-text="Save">Résumé <Arrow dir="down" /></a></li>
        </ul>
      </div>

      <footer className="footer wrap">
        <span>© {new Date().getFullYear()} Kaustubh Jeet Mishra</span>
        <span className="footer__mid"><Mark />Made with ink &amp; intent</span>
        <a href="#top" onClick={(e) => glideTo(e, '#top')}>Back to top <Arrow dir="up" /></a>
      </footer>
    </section>
  );
}
