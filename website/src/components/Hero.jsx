import { useEffect, useRef } from 'react';
import { gsap, SplitText, useGSAP, glideTo, scramble, asset, finePointer, listeners } from '../lib/motion';
import { createHeroGL } from '../lib/heroGL';
import { RESUME, PROOF } from '../data';
import { Arrow } from './Svg';
import Embers from './Embers';
import Pic from './Pic';

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
      .fromTo('.hero__vertical', { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power2.inOut' }, 1.4)
      // Letters have landed: unmask the title lines so the hover hop isn't clipped
      .add(() => hero.classList.add('is-settled'), 2.5);
    tl.current = intro;

    // Hover hop: each letter of the title jumps when the pointer reaches it and springs back down
    const [on, off] = listeners();
    if (finePointer) {
      split.chars.forEach((char) => {
        let hop = null;
        on(char, 'pointerenter', () => {
          if (!hero.classList.contains('is-settled') || hop?.isActive()) return;
          hop = gsap.timeline()
            .to(char, { yPercent: -24, duration: 0.26, ease: 'power2.out' })
            .to(char, { yPercent: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
        });
      });
    }

    // Leaving the hero: copy drifts up and fades, the fox sinks slower than the page
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__inner', { yPercent: -16, opacity: 0.1, ease: 'none' }, 0)
      .to(art, { yPercent: 16, ease: 'none' }, 0)
      .to('.hero__vertical', { yPercent: -60, ease: 'none' }, 0);

    return () => { off(); gl?.destroy(); };
  }, { scope: root, dependencies: [ready] });

  useEffect(() => { if (intro) tl.current?.play(); }, [intro]);

  return (
    <section className="hero" id="top" ref={root} data-drift-area="">
      <div className="hero__art" aria-hidden="true" data-drift="24">
        <Pic
          src="assets/kitsune-hero.jpg" width="1024" height="1536" fetchPriority="high"
          srcSet={`${asset('assets/kitsune-hero-640.webp')} 640w, ${asset('assets/kitsune-hero.webp')} 1024w`}
          sizes="(max-width: 820px) 100vw, min(60vw, 880px)"
        />
        <canvas className="hero__gl" />
      </div>
      <Embers />
      <p className="hero__vertical" aria-hidden="true">九尾の狐</p>

      <div className="hero__inner wrap">
        <p className="eyebrow hero__eyebrow">
          <span className="eyebrow__line" />
          <span className="hero__eyebrow-text">AI / ML Engineer — Machine learning · Deep learning · Agentic AI</span>
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
          I’m <strong>Kaustubh Jeet Mishra</strong>. I build across the AI stack — from XGBoost models and neural networks
          to agentic systems where many specialised agents move as one, retrieving, calling tools and pausing for a human when it matters.
        </p>
        <div className="hero__ctas">
          <a className="btn btn--blood" href="#work" data-magnetic="" onClick={(e) => glideTo(e, '#work')}>
            See the work <Arrow />
          </a>
          <a className="btn btn--ghost" href={asset(RESUME)} download data-magnetic="">Download résumé</a>
        </div>
      </div>

      <div className="hero__meta wrap">
        <div className="hero__meta-item">
          <span className="label">Proof</span>
          <p className="proof">{PROOF.map((item) => <span key={item}>{item}</span>)}</p>
        </div>
        <div className="hero__meta-item">
          <span className="label">Now building</span><span className="live" aria-hidden="true" />Teacher–Student AI Classroom
        </div>
        <a className="hero__scroll" href="#work" onClick={(e) => glideTo(e, '#work')}>Scroll <Arrow dir="down" /></a>
      </div>
    </section>
  );
}
