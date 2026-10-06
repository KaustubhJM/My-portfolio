import { useEffect, useRef, useState } from 'react';
import { animate, asset } from '../lib/motion';
import { Arrow, Mark } from './Svg';

// Pipeline graph: nodes joined by ink arrows; crimson marks the human step
export function Flow({ steps }) {
  return (
    <ol className="flow" aria-label="Pipeline">
      {steps.map((s) => (typeof s === 'string'
        ? <li key={s}>{s}</li>
        : <li key={s.human} className="flow__human">{s.human}</li>))}
    </ol>
  );
}

export const Tags = ({ tags, ink = true }) => (
  <ul className={`tags${ink ? ' tags--ink' : ''}`}>{tags.map((t) => <li key={t}>{t}</li>)}</ul>
);

const LINKS = [
  ['github', 'GitHub'],
  ['demo', 'Live demo'],
  ['video', 'Video'],
  ['caseStudy', 'Case study'],
];

const external = { target: '_blank', rel: 'noopener noreferrer' };

// Detail panel: every link is shown; an empty one reads "… — coming soon" and goes nowhere
export function PanelLinks({ links = {} }) {
  return (
    <ul className="plinks">
      {LINKS.map(([key, label]) => (
        <li key={key}>
          {links[key]
            ? <a className="plink" href={links[key]} {...external}>{label} <Arrow dir="out" /></a>
            : <a className="plink is-off" role="link" aria-disabled="true">{label} — coming soon</a>}
        </li>
      ))}
    </ul>
  );
}

// Cards: only the GitHub / demo links that exist (they sit above the card's open button)
export function CardLinks({ links = {} }) {
  const set = LINKS.slice(0, 2).filter(([key]) => links[key]);
  if (!set.length) return null;
  return (
    <ul className="clinks">
      {set.map(([key, label]) => (
        <li key={key}><a className="clink" href={links[key]} {...external}>{label === 'Live demo' ? 'Demo' : label} <Arrow dir="out" /></a></li>
      ))}
    </ul>
  );
}

// `demo` may be one path or several (e.g. ['media/x.webm', 'media/x.mp4']); the browser picks the first it can play
export const demoSources = (project) => [].concat(project.demo || []).filter(Boolean);

/* Muted looping clip that only plays while on screen. With reduced motion it waits on its
   poster behind a play button instead of autoplaying. */
export function DemoVideo({ project, className = '' }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const sources = demoSources(project);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (animate) video.play().catch(() => {});
    }, { threshold: 0.2 });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (!sources.length) return null;
  const toggle = () => (ref.current.paused ? ref.current.play().catch(() => {}) : ref.current.pause());

  return (
    <div className={`demo ${className}`}>
      <video
        ref={ref} muted loop playsInline preload={animate ? 'metadata' : 'none'}
        poster={project.poster ? asset(project.poster) : undefined}
        aria-label={`${project.title} — demo clip`}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      >
        {sources.map((src) => <source key={src} src={asset(src)} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />)}
      </video>
      {!animate && (
        <button className={`demo__play${playing ? ' is-playing' : ''}`} type="button" onClick={toggle}>
          <span className="sr-only">{playing ? 'Pause' : 'Play'} demo</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M7 5h3v14H7zM14 5h3v14h-3z" /> : <path d="M8 5v14l11-7z" />}</svg>
        </button>
      )}
    </div>
  );
}

// Panel media: demo clip, else the thumbnail, else a quiet placeholder
export function Media({ project }) {
  if (demoSources(project).length) return <DemoVideo project={project} className="demo--panel" />;
  if (project.thumb) {
    return <figure className="panel__thumb"><img src={asset(project.thumb)} alt={`${project.title} — screenshot`} /></figure>;
  }
  return (
    <div className="panel__soon">
      <Mark />
      <span>Demo coming soon</span>
    </div>
  );
}
