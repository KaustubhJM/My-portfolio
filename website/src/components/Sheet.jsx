import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP, onView, scramble, inkReveal, clearInk, rise } from '../lib/motion';
import { FACTS } from '../data';
import SectionHead from './SectionHead';
import Pic from './Pic';

export default function Sheet({ ready }) {
  const root = useRef(null);

  useGSAP(() => {
    if (!ready) return undefined;
    const section = root.current;
    const q = gsap.utils.selector(section);

    // Front view: ink-blot reveal, slow parallax, caption letter-spacing settle
    const [figure] = q('.sheet__figure');
    gsap.set(figure, { opacity: 1 });
    inkReveal(figure);
    gsap.fromTo(q('.sheet__figure img'), { yPercent: 6 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const [cap] = q('.sheet__figure .fig');
    gsap.timeline({ scrollTrigger: onView(figure, 'top 80%'), delay: 0.8 })
      .fromTo(cap, { opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.24em', duration: 1.6, ease: 'expo.out' }, 0)
      .add(scramble(cap, 1.2), 0);

    // The lede "inks in" word by word as you read down
    const [lede] = q('.sheet__lede');
    const { words } = SplitText.create(lede, { type: 'words' });
    gsap.set(lede, { opacity: 1 });
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: lede, start: 'top 85%', end: 'bottom 50%', scrub: true },
    });

    rise(q('.sheet__text [data-reveal]:not(.sheet__lede)'));
    ScrollTrigger.create({
      trigger: q('.facts')[0], start: 'top 88%', once: true,
      onEnter: () => q('.facts dt').forEach((dt, i) => gsap.delayedCall(i * 0.12 + 0.3, () => scramble(dt, 0.9))),
    });

    return () => clearInk(section);
  }, { scope: root, dependencies: [ready] });

  return (
    <section className="section paper sheet" id="sheet" ref={root}>
      <div className="wrap">
        <SectionHead ready={ready} kanji="姿" tag="03 — About" lines={['A study of the fox', 'behind the code.']} />

        <div className="sheet__grid">
          <figure className="sheet__figure" data-reveal="" data-ink="" data-drift="18">
            <Pic
              src="assets/view-front.jpg" width="658" height="658" loading="lazy"
              alt="Front view of a white nine-tailed fox with crimson-tipped tails, seated before a red sun and a torii gate"
            />
            <figcaption className="fig">Front view</figcaption>
          </figure>

          <div className="sheet__text">
            <p className="sheet__lede" data-reveal="">
              In Japanese folklore, a kitsune earns a new tail for every century of wisdom. At nine, it sees all things at once.
            </p>
            <p data-reveal="">
              I’m Kaustubh, a B.Tech student in Artificial Intelligence and Machine Learning at JSS Academy of Technical
              Education, Noida. I work on both sides of the field: classical models such as XGBoost and Random Forests,
              and LLM systems built with LangGraph, retrieval and tool calling.
            </p>
            <p data-reveal="">
              The fox is a fair picture of how I learn. A kitsune doesn’t get its tails all at once — it earns them one
              at a time. I pick up skills the same way: one discipline learned properly, then the next, from regression
              and feature engineering to neural networks, retrieval and agents.
            </p>
            <p data-reveal="">
              It’s also how I like to build. Nine tails move as one body, and my systems work the same way: small,
              focused parts — a model, an agent, a tool, a human checkpoint — that each do one job well and hand off
              cleanly, instead of one piece trying to do everything.
            </p>
            <dl className="facts" data-reveal="">
              {FACTS.map(({ term, detail }) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
