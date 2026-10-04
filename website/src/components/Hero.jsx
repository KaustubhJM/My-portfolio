import { useEffect, useRef } from 'react';
import { gsap, SplitText, useGSAP, glideTo, scramble, asset } from '../lib/motion';
import { createHeroGL } from '../lib/heroGL';
import { RESUME } from '../data';
import { Arrow } from './Svg';
import Embers from './Embers';

/* Opening sequence (built once `ready`, played on `intro` by the loader) + scroll-out */
export default function Hero({ ready, intro }) {
  const root = useRef(null);
  const tl = useRef(null);

  useGSAP(() => {
    if (!ready) return undefined;
    const hero = root.current;
    const img = hero.querySelector('.hero__art img');
    const art = hero.querySelector('.hero__art');

    const gl = createHeroGL({ canvas: hero.querySelector('.hero__gl'), img });
    const split = SplitText.create('[data-chars]', { type: 'words,chars', wordsClass: 'word', charsClass: 'char' });
    gsap.set('.hero__line > span', { y: 0 });

    const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    if (gl) {
      intro.to(gl.state, { reveal: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
        .to(gl.state, { zoom: 1, duration: 3.4, ease: 'expo.out' }, 0)
        // reveal done: swap back to the plain image so nothing keeps rendering
        .add(() => gl.destroy(), 3.4);
    } else {
      intro.fromTo(img, { opacity: 0, scale: 1.12 }, { opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
        .to(img, { scale: 1, duration: 3.2, ease: 'expo.out' }, 0);
    }
    intro.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1.2 }, 0.3)
      .add(scramble(hero.querySelector('.hero__eyebrow-text'), 1.4), 0.3)
      .from('.hero__eyebrow .eyebrow__line', { scaleX: 0, transformOrigin: 'left', duration: 1.2 }, 0.4)
      .from(split.chars, { yPercent: 115, rotate: 10, duration: 1.3, stagger: 0.032 }, 0.45)
      .fromTo('.hero__brush', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 1.25)
      .to('.hero__lede', { opacity: 1, y: 0, duration: 1.3 }, 0.95)
      .to('.hero__ctas', { opacity: 1, y: 0, duration: 1.3 }, 1.1)
      .from('.hero__ctas .btn', { y: 18, opacity: 0, duration: 1.1, stagger: 0.1 }, 1.1)
      .to('.hero__meta', { opacity: 1, y: 0, duration: 1.3 }, 1.35)
      .add(() => hero.querySelectorAll('.hero__meta .label').forEach((l) => scramble(l, 1)), 1.35)
      .to('.hero__embers', { opacity: 1, duration: 2.4, ease: 'power1.out' }, 0.6)
      .fromTo('.hero__vertical', { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power2.inOut' }, 1.4);
    tl.current = intro;

    // Leaving the hero: copy drifts up and fades, the fox sinks slower than the page
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__inner', { yPercent: -16, opacity: 0.1, ease: 'none' }, 0)
      .to(art, { yPercent: 16, ease: 'none' }, 0)
      .to('.hero__vertical', { yPercent: -60, ease: 'none' }, 0);

    return () => gl?.destroy();
  }, { scope: root, dependencies: [ready] });

  useEffect(() => { if (intro) tl.current?.play(); }, [intro]);

  return (
    <section className="hero" id="top" ref={root} data-drift-area="">
      <div className="hero__art" aria-hidden="true" data-drift="24">
        <img src={asset('assets/kitsune-hero.jpg')} alt="" width="1024" height="1536" fetchPriority="high" />
        <canvas className="hero__gl" />
      </div>
      <Embers />
      <p className="hero__vertical" aria-hidden="true">九尾の狐</p>

      <div className="hero__inner wrap">
        <p className="eyebrow hero__eyebrow">
          <span className="eyebrow__line" />
          <span className="hero__eyebrow-text">AI Engineer — Agentic systems · RAG · LLMs</span>
        </p>
        <h1 className="hero__title">
          <span className="hero__line"><span><span data-chars="">Nine tails.</span></span></span>
          <span className="hero__line">
            <span className="hero__accent">
              <span data-chars="">One mind.</span>
              <svg className="hero__brush" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 15C58 7 141 3 297 9l-3 7C180 12 92 16 6 21Z" />
              </svg>
            </span>
          </span>
        </h1>
        <p className="hero__lede">
          I’m <strong>Kaustubh Jeet Mishra</strong>. I build agentic AI where many specialised agents move as one — planning,
          retrieving, calling tools, and pausing for a human when it matters.
        </p>
        <div className="hero__ctas">
          <a className="btn btn--blood" href="#work" data-magnetic="" data-cursor-text="View" onClick={(e) => glideTo(e, '#work')}>
            See the work <Arrow />
          </a>
          <a className="btn btn--ghost" href={asset(RESUME)} download data-magnetic="" data-cursor-text="Save">Download résumé</a>
        </div>
      </div>

      <div className="hero__meta wrap">
        <div className="hero__meta-item"><span className="label">Studying</span>B.Tech AI &amp; ML · JSSATE Noida · 2028</div>
        <div className="hero__meta-item">
          <span className="label">Now building</span><span className="live" aria-hidden="true" />Teacher–Student AI Classroom
        </div>
        <a className="hero__scroll" href="#sheet" onClick={(e) => glideTo(e, '#sheet')}>Scroll <Arrow dir="down" /></a>
      </div>
    </section>
  );
}
