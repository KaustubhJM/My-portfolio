import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, animate, lenis } from '../lib/motion';
import { flowSteps } from '../lib/graph';
import { Flow, Tags, PanelLinks, Media } from './Project';

const FOCUSABLE = 'a[href], button:not([disabled]), summary, video[controls], [tabindex]:not([tabindex="-1"])';

// Circle radius that covers the whole sheet from (x, y)
const cover = (x, y, w, h) => Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 2;

/* Project detail sheet. Ink wipes open from the card that was clicked (a growing circle,
   like the mobile menu); the rest of the page goes inert and Lenis pauses until it closes. */
export default function ProjectPanel({ project, origin, onClose }) {
  const root = useRef(null);
  const sheet = useRef(null);
  const closing = useRef(false);
  const lenisWasRunning = useRef(false);
  const titleId = `panel-title-${project.no}`;
  const steps = flowSteps(project);
  const isFeature = Boolean(project.evaluation);

  const clipAt = () => {
    const r = sheet.current.getBoundingClientRect();
    const x = origin.x - r.left;
    const y = origin.y - r.top;
    return { at: `${x}px ${y}px`, r: cover(x, y, r.width, r.height) };
  };

  // Hand the page back: undo inert, scroll lock and Lenis pause (safe to call twice)
  const release = useCallback(() => {
    ['main', '.nav', '.skip'].forEach((sel) => { const el = document.querySelector(sel); if (el) el.inert = false; });
    document.body.classList.remove('panel-open');
    if (lenisWasRunning.current) { lenis?.start(); lenisWasRunning.current = false; }
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const done = () => { release(); onClose(); };
    if (!animate) { done(); return; }
    const { at } = clipAt();
    gsap.timeline({ onComplete: done })
      .to(sheet.current.querySelectorAll('.panel__body > *'), { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in', stagger: 0.02 }, 0)
      .to(sheet.current, { clipPath: `circle(0px at ${at})`, duration: 0.6, ease: 'expo.in' }, 0.05)
      .to(root.current.querySelector('.panel__veil'), { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.3);
  }, [release, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open: lock the page behind, focus the close button, play the wipe
  useLayoutEffect(() => {
    ['main', '.nav', '.skip'].forEach((sel) => { const el = document.querySelector(sel); if (el) el.inert = true; });
    document.body.classList.add('panel-open');
    lenisWasRunning.current = Boolean(lenis && !lenis.isStopped);
    lenis?.stop();
    root.current.querySelector('.panel__close').focus({ preventScroll: true });

    if (!animate) return release;
    const { at, r } = clipAt();
    const tl = gsap.timeline()
      .fromTo(root.current.querySelector('.panel__veil'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo(sheet.current, { clipPath: `circle(0px at ${at})` }, { clipPath: `circle(${r}px at ${at})`, duration: 0.9, ease: 'expo.inOut' }, 0)
      .set(sheet.current, { clipPath: 'none' })
      .fromTo(sheet.current.querySelectorAll('.panel__body > *'), { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, 0.35);
    return () => { tl.kill(); release(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc closes; Tab stays inside the sheet
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(root.current.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !root.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !root.current.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const meta = [project.status, project.year].filter(Boolean);

  return createPortal(
    <div className="panel" ref={root}>
      <div className="panel__veil" onClick={close} aria-hidden="true" />
      <div className="panel__sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={sheet} data-lenis-prevent="">
        <div className="panel__bar">
          <span className="panel__no">{project.no}</span>
          <button className="panel__close" type="button" onClick={close}>
            Close <span className="panel__x" aria-hidden="true" />
          </button>
        </div>

        <div className="panel__body">
          <header className="panel__head">
            {meta.length > 0 && (
              <p className="panel__meta">
                {project.status && <span className="status">{project.status === 'In progress' && <span className="live" aria-hidden="true" />}{project.status}</span>}
                {project.year && <span className="panel__year">{project.year}</span>}
              </p>
            )}
            <h2 className="panel__title" id={titleId}>{project.title}</h2>
            <p className="panel__desc">{project.desc}</p>
          </header>

          <Media project={project} />

          {project.problem && (
            <section className="panel__part">
              <h3 className="panel__label">Problem</h3>
              <p>{project.problem}</p>
            </section>
          )}

          <section className="panel__part">
            <h3 className="panel__label">{project.graph ? 'Agent graph' : 'Flow'}</h3>
            <Flow steps={steps} />
          </section>

          {project.architecture && (
            <section className="panel__part">
              <h3 className="panel__label">Architecture</h3>
              <p>{project.architecture}</p>
            </section>
          )}

          {(project.results?.length > 0 || project.points?.length > 0) && (
            <section className="panel__part">
              <h3 className="panel__label">Results</h3>
              <ul className="points">{(project.results?.length ? project.results : project.points).map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
          )}

          {isFeature && (
            <section className="panel__part">
              <h3 className="panel__label">Evaluation</h3>
              <div className="evalwrap">
                <table className="eval">
                  <caption className="sr-only">Retrieval evaluation: baseline ranking compared with best-first ranking</caption>
                  <thead>
                    <tr><th scope="col">Metric</th><th scope="col">Baseline</th><th scope="col">Best-first</th></tr>
                  </thead>
                  <tbody>
                    {project.evaluation.map((row) => (
                      <tr key={row.metric}>
                        <th scope="row">{row.metric}</th>
                        <td>{row.baseline || <span className="eval__tbd" aria-label="not yet published">—</span>}</td>
                        <td>{row.best || <span className="eval__tbd" aria-label="not yet published">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="panel__part">
            <h3 className="panel__label">Stack</h3>
            <Tags tags={project.tags} ink={false} />
          </section>

          <section className="panel__part">
            <h3 className="panel__label">Links</h3>
            <PanelLinks links={project.links} />
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
