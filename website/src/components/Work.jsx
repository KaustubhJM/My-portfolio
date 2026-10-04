import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, onView, scramble, inkReveal, clearInk, asset } from '../lib/motion';
import { FEATURE, PROJECTS, GITHUB } from '../data';
import { Arrow } from './Svg';
import SectionHead from './SectionHead';

// Agent graph: nodes joined by ink arrows; crimson marks the human step
function Flow({ steps }) {
  return (
    <ol className="flow" aria-label="Agent graph">
      {steps.map((s) => (typeof s === 'string'
        ? <li key={s}>{s}</li>
        : <li key={s.human} className="flow__human">{s.human}</li>))}
    </ol>
  );
}

const Tags = ({ tags }) => <ul className="tags tags--ink">{tags.map((t) => <li key={t}>{t}</li>)}</ul>;

export default function Work({ ready }) {
  const root = useRef(null);
  const metricTo = useRef(null);

  useGSAP(() => {
    if (!ready) return undefined;
    const section = root.current;
    const q = gsap.utils.selector(section);
    const [feature] = q('.project--feature');

    gsap.fromTo(feature, { opacity: 0, y: 80, rotationX: 8, transformPerspective: 1400, transformOrigin: '50% 0%' }, {
      opacity: 1, y: 0, rotationX: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: onView(feature, 'top 85%'),
    });
    gsap.from(q('.project--feature .project__body > *'), {
      opacity: 0, y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.2,
      scrollTrigger: onView(feature, 'top 85%'),
    });

    // The fanned-tail artwork turns slowly as it passes
    const [art] = q('.project__art');
    inkReveal(art);
    gsap.fromTo(q('.project__art img'), { rotate: -14 }, {
      rotate: 14, ease: 'none',
      scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // Ranking precision counts up and the bars fill
    const [metric] = q('.metric');
    const value = { v: FEATURE.metric.from };
    metricTo.current.textContent = value.v.toFixed(2);
    ScrollTrigger.create({
      trigger: metric, start: 'top 88%', once: true,
      onEnter: () => {
        feature.classList.add('is-in');
        scramble(metric.querySelector('.metric__label'), 1);
        gsap.to(value, {
          v: FEATURE.metric.to, duration: 1.8, ease: 'power3.out', delay: 0.4,
          onUpdate: () => { metricTo.current.textContent = value.v.toFixed(2); },
        });
      },
    });

    // Smaller cards flip up from the table one after another
    ScrollTrigger.batch(q('.work__grid .project'), {
      start: 'top 88%', once: true,
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 70, rotationX: 22, transformPerspective: 1000, transformOrigin: '50% 100%' },
        { opacity: 1, y: 0, rotationX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.14 }),
    });

    // Agent graphs: nodes hand off one after another, then a pulse of work keeps travelling through them
    q('.flow').forEach((flow) => {
      const nodes = Array.from(flow.querySelectorAll('li'));
      const human = flow.querySelector('.flow__human');
      const tl = gsap.timeline({ scrollTrigger: onView(flow, 'top 92%'), delay: 0.3 })
        .fromTo(nodes, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 });
      if (human) tl.fromTo(human, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, nodes.indexOf(human) * 0.12 + 0.2);

      const step = 0.38;
      const pulse = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true, delay: 1.4 });
      nodes.forEach((n, i) => {
        pulse.call(() => n.classList.add('is-pulse'), null, i * step)
          .call(() => n.classList.remove('is-pulse'), null, i * step + step * 1.4);
      });
      if (human) {
        pulse.to(human, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, nodes.indexOf(human) * step);
      }
      ScrollTrigger.create({
        trigger: flow, start: 'top 90%', end: 'bottom 10%',
        onToggle: (self) => (self.isActive ? pulse.play() : pulse.pause()),
      });
    });

    gsap.fromTo('.link-more', { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, duration: 1, ease: 'expo.out', scrollTrigger: onView(q('.link-more')[0], 'top 95%'),
    });

    return () => clearInk(section);
  }, { scope: root, dependencies: [ready] });

  const { metric } = FEATURE;

  return (
    <section className="section paper work" id="work" ref={root}>
      <div className="wrap">
        <SectionHead
          ready={ready} kanji="作" tag="03 — Selected work" lines={['Systems with', 'many tails.']}
          intro="Each project is a graph of agents. The diagrams show how they hand off work — red marks where a human steps in."
        />

        <article className="project project--feature" data-reveal="">
          <div className="project__body">
            <p className="project__meta">
              <span className="project__no">{FEATURE.no}</span>
              <span className="status"><span className="live" aria-hidden="true" />In progress</span>
            </p>
            <h3 className="project__title">{FEATURE.title}</h3>
            <p className="project__desc">{FEATURE.desc}</p>
            <ul className="points">{FEATURE.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <Flow steps={FEATURE.flow} />
            <Tags tags={FEATURE.tags} />
          </div>

          <div className="project__aside">
            <figure className="project__art" data-ink="" data-drift="18">
              <img
                src={asset('assets/view-top.jpg')} width="637" height="658" loading="lazy"
                alt="Top-down view of the nine-tailed fox with its tails fanned out in a circle"
              />
            </figure>
            <div className="metric">
              <p className="metric__label">{metric.label}</p>
              <p className="metric__vals">
                <span className="metric__from">{metric.from.toFixed(2)}</span>
                <Arrow className="metric__arrow" />
                <span className="metric__to" ref={metricTo}>{metric.to.toFixed(2)}</span>
              </p>
              <div className="metric__bars" aria-hidden="true">
                <span style={{ '--v': metric.from }} />
                <span style={{ '--v': metric.to }} />
              </div>
              <p className="metric__note">{metric.note}</p>
            </div>
          </div>
        </article>

        <div className="work__grid">
          {PROJECTS.map((p) => (
            <article className="project" data-reveal="" key={p.no}>
              <p className="project__meta"><span className="project__no">{p.no}</span></p>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__desc">{p.desc}</p>
              <Flow steps={p.flow} />
              <Tags tags={p.tags} />
            </article>
          ))}
        </div>

        <a className="link-more" href={GITHUB} target="_blank" rel="noopener" data-cursor-text="Open">
          More on GitHub <Arrow dir="out" />
        </a>
      </div>
    </section>
  );
}
