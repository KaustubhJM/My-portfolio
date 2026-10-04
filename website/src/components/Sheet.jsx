import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP, onView, scramble, inkSettle, inkReveal, clearInk, rise, asset } from '../lib/motion';
import { DETAILS, FACTS } from '../data';
import SectionHead from './SectionHead';

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

    // Detail plates wipe up from the bottom, the ink settling as they land
    const details = q('.detail');
    gsap.set(details, { opacity: 1 });
    const tl = gsap.timeline({ scrollTrigger: onView(q('.details')[0], 'top 85%') })
      .fromTo(q('.detail__img'), { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', stagger: 0.12 }, 0)
      .fromTo(q('.detail__img img'), { scale: 1.35 },
        { scale: 1, duration: 1.8, ease: 'expo.out', stagger: 0.12, clearProps: 'transform' }, 0.2)
      .fromTo(details.flatMap((d) => [d.querySelector('.fig'), d.querySelector('p')]), { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.06 }, 0.7);
    details.forEach((d, i) => {
      tl.add(inkSettle(d.querySelector('.detail__img img'), { scale: 90, duration: 1.8 }), i * 0.12);
      tl.add(scramble(d.querySelector('.fig'), 1), 0.7 + i * 0.12);
    });

    return () => clearInk(section);
  }, { scope: root, dependencies: [ready] });

  return (
    <section className="section paper sheet" id="sheet" ref={root}>
      <div className="wrap">
        <SectionHead ready={ready} kanji="姿" tag="01 — Reference sheet" lines={['A study of the fox', 'behind the code.']} />

        <div className="sheet__grid">
          <figure className="sheet__figure" data-reveal="" data-ink="" data-drift="18">
            <img
              src={asset('assets/view-front.jpg')} width="658" height="658" loading="lazy"
              alt="Front view of a white nine-tailed fox with crimson-tipped tails, seated before a red sun and a torii gate"
            />
            <figcaption className="fig">Front view</figcaption>
          </figure>

          <div className="sheet__text">
            <p className="sheet__lede" data-reveal="">
              In Japanese folklore, a kitsune earns a new tail for every century of wisdom. At nine, it sees all things at once.
            </p>
            <p data-reveal="">
              My work follows the same idea. Each tail is an agent with a single job — a planner, a retriever, an explainer,
              a critic — and LangGraph is the spine that lets them move as one body.
            </p>
            <p data-reveal="">
              I’m a third-year B.Tech student in Artificial Intelligence and Machine Learning, working across the whole LLM
              application stack: prompts and embeddings, retrieval pipelines, tool calling and human-in-the-loop workflows.
              I care about AI systems that are reliable enough to ship.
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

        <div className="details">
          {DETAILS.map((d) => (
            <figure className="detail" data-reveal="" key={d.caption}>
              <div className="detail__img">
                <img src={asset(d.src)} alt={d.alt} width={d.w} height="292" loading="lazy" />
              </div>
              <figcaption className="fig">{d.caption}</figcaption>
              <p><strong>{d.trait}</strong> {d.text}</p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
