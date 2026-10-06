import { useCallback, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, onView, scramble, inkReveal, clearInk, asset } from '../lib/motion';
import { flowSteps } from '../lib/graph';
import { FEATURE, PROJECTS, ML_PROJECTS, GITHUB } from '../data';
import { Arrow } from './Svg';
import SectionHead from './SectionHead';
import Pic from './Pic';
import ProjectPanel from './ProjectPanel';
import { Flow, Tags, CardLinks, DemoVideo } from './Project';

const METHOD = [
  ['dataset', 'Data'],
  ['queries', 'Queries'],
  ['k', 'k'],
  ['judge', 'Scored with'],
  ['baseline', 'Baseline'],
];

// The whole card is the click target (the button's ::after covers it); links sit above it
function OpenButton({ project, onOpen }) {
  return (
    <button className="project__open" type="button" aria-haspopup="dialog" onClick={(e) => onOpen(project, e)}>
      View project<span className="sr-only">: {project.title}</span> <Arrow />
    </button>
  );
}

function Thumb({ project }) {
  if (!project.thumb) return null;
  return (
    <div className="project__thumb">
      <img src={asset(project.thumb)} alt={`${project.title} — screenshot`} loading="lazy" />
    </div>
  );
}

function Card({ project, onOpen }) {
  return (
    <article className="project" data-reveal="">
      <Thumb project={project} />
      <p className="project__meta">
        <span className="project__no">{project.no}</span>
        {project.status && <span className="status">{project.status}</span>}
      </p>
      <h3 className="project__title">{project.title}</h3>
      <p className="project__desc">{project.desc}</p>
      <Flow steps={flowSteps(project)} />
      <Tags tags={project.tags} />
      <div className="project__foot">
        <OpenButton project={project} onOpen={onOpen} />
        <CardLinks links={project.links} />
      </div>
    </article>
  );
}

export default function Work({ ready }) {
  const root = useRef(null);
  const metricTo = useRef(null);
  const [active, setActive] = useState(null);
  const opener = useRef(null); // the card's button, which gets focus back on close

  const onOpen = useCallback((project, e) => {
    opener.current = e.currentTarget;
    const r = e.currentTarget.closest('.project').getBoundingClientRect();
    setActive({ project, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  }, []);

  const onClose = useCallback(() => {
    setActive(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

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

    // Thumbnails wipe up from the bottom, the image settling as it lands
    q('.project__thumb').forEach((thumb) => {
      gsap.timeline({ scrollTrigger: onView(thumb, 'top 88%') })
        .fromTo(thumb, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0)
        .fromTo(thumb.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0.2);
    });

    // Agent graphs play one handoff when they arrive: each node lights up as the arrow
    // reaches it, and the run settles on the crimson human step
    q('.flow').forEach((flow) => {
      const nodes = Array.from(flow.querySelectorAll('li'));
      const human = flow.querySelector('.flow__human');
      const step = 0.3;
      const t0 = 0.55;
      gsap.set(nodes.slice(1), { '--link': 0 });
      const tl = gsap.timeline({ scrollTrigger: onView(flow, 'top 90%'), delay: 0.2 })
        .fromTo(nodes, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0);
      nodes.forEach((node, i) => {
        const at = t0 + i * step;
        if (i > 0) tl.to(node, { '--link': 1, duration: step * 0.8, ease: 'power2.inOut' }, at - step * 0.8);
        tl.add(() => node.classList.add('is-lit'), at);
        if (node !== human) tl.add(() => node.classList.remove('is-lit'), at + step * 1.3);
      });
      if (human) {
        tl.fromTo(human, { scale: 1 }, { scale: 1.14, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }, t0 + nodes.indexOf(human) * step)
          .add(() => human.classList.remove('is-lit'), t0 + nodes.length * step + 0.4);
      }
    });

    gsap.fromTo('.link-more', { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, duration: 1, ease: 'expo.out', scrollTrigger: onView(q('.link-more')[0], 'top 95%'),
    });

    return () => clearInk(section);
  }, { scope: root, dependencies: [ready] });

  const { metric, methodology = {} } = FEATURE;
  const methodRows = METHOD.filter(([key]) => methodology[key]);

  return (
    <section className="section paper work" id="work" ref={root}>
      <div className="wrap">
        <SectionHead
          ready={ready} kanji="作" tag="01 — Selected work" lines={['Models and systems', 'with many tails.']}
          intro="From classical models to graphs of agents. Each diagram shows how the work flows — red marks where a human steps in."
        />

        <article className="project project--feature" data-reveal="">
          <div className="project__body">
            <Thumb project={FEATURE} />
            <p className="project__meta">
              <span className="project__no">{FEATURE.no}</span>
              {FEATURE.status && (
                <span className="status">{FEATURE.status === 'In progress' && <span className="live" aria-hidden="true" />}{FEATURE.status}</span>
              )}
            </p>
            <h3 className="project__title">{FEATURE.title}</h3>
            <p className="project__desc">{FEATURE.desc}</p>
            <ul className="points">{FEATURE.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <Flow steps={flowSteps(FEATURE)} />
            <Tags tags={FEATURE.tags} />
            <div className="project__foot">
              <OpenButton project={FEATURE} onOpen={onOpen} />
              <CardLinks links={FEATURE.links} />
            </div>
          </div>

          <div className="project__aside">
            <figure className="project__art" data-ink="" data-drift="18">
              <Pic
                src="assets/view-top.jpg" width="637" height="658" loading="lazy"
                alt="Top-down view of the nine-tailed fox with its tails fanned out in a circle"
              />
            </figure>
            <DemoVideo project={FEATURE} className="demo--card" />
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
              {/* Opening it changes the page height above the pinned tails track, so re-measure */}
              <details className="method" onToggle={() => ScrollTrigger.refresh()}>
                <summary>How this was measured</summary>
                {methodRows.length
                  ? <dl>{methodRows.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{methodology[key]}</dd></div>)}</dl>
                  : <p>Methodology write-up coming soon.</p>}
              </details>
            </div>
          </div>
        </article>

        <h3 className="work__label">Agentic systems</h3>
        <div className="work__grid">
          {PROJECTS.map((p) => <Card project={p} onOpen={onOpen} key={p.no} />)}
        </div>

        <h3 className="work__label">Machine learning</h3>
        <div className="work__grid work__grid--two">
          {ML_PROJECTS.map((p) => <Card project={p} onOpen={onOpen} key={p.no} />)}
        </div>

        <a className="link-more" href={GITHUB} target="_blank" rel="noopener noreferrer">
          More on GitHub <Arrow dir="out" />
        </a>
      </div>

      {active && <ProjectPanel project={active.project} origin={active.origin} onClose={onClose} />}
    </section>
  );
}
