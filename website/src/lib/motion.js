import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
// Everything animated is gated on this; reduced-motion visitors get the static page.
export const animate = !reduceMotion;

export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/* ---------- Smooth scroll: one Lenis instance driven by the GSAP ticker ---------- */
export const lenis = animate ? new Lenis({ lerp: 0.1 }) : null;
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // the loader starts it once the page is open

  // Always open on the hero so the loader → hero hand-off is what you see
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
}

// In-page links glide with Lenis instead of jumping
export function glideTo(e, href) {
  if (!lenis) return;
  const target = href === '#top' ? 0 : document.querySelector(href);
  if (target === null) return;
  e.preventDefault();
  lenis.scrollTo(target, { duration: 1.6 });
  history.pushState(null, '', href);
}

/* ---------- Shared animation helpers ---------- */

export const onView = (trigger, start = 'top 82%') => ({ trigger, start, toggleActions: 'play none none none' });

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Decode-style text swap, used on labels and tags
export function scramble(el, duration = 1) {
  if (!el) return gsap.to({}, { duration: 0 });
  const text = el.dataset.text || (el.dataset.text = el.textContent);
  return gsap.to(el, { duration, ease: 'none', scrambleText: { text, chars: SCRAMBLE, speed: 0.5, revealDelay: duration * 0.3 } });
}

// Ink-bleed: the picture arrives warped like wet ink, then settles.
// Each element gets its own throwaway SVG displacement filter in <defs id="ink-live">.
const NS = 'http://www.w3.org/2000/svg';
let inkId = 0;
export function inkSettle(el, { scale = 160, duration = 2 } = {}) {
  const id = `ink-settle-${inkId++}`;
  const make = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  };
  const filter = make('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%' });
  const disp = make('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale, xChannelSelector: 'R', yChannelSelector: 'G' });
  filter.append(make('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.012, numOctaves: 3, seed: inkId * 7, result: 'n' }), disp);
  document.getElementById('ink-live').append(filter);
  el.style.filter = `url(#${id})`;
  el.dataset.inkFilter = id;
  return gsap.fromTo(disp, { attr: { scale } }, {
    attr: { scale: 0 }, duration, ease: 'power3.out',
    onComplete: () => clearInk(el),
  });
}

// Drop any ink filters still attached inside `root` (used by component cleanups)
export function clearInk(root) {
  const els = root.dataset?.inkFilter ? [root] : Array.from(root.querySelectorAll('[data-ink-filter]'));
  els.forEach((el) => {
    document.getElementById(el.dataset.inkFilter)?.remove();
    el.style.filter = '';
    delete el.dataset.inkFilter;
  });
}

// Circular ink-blot reveal for the round artworks, with the bleed settling inside
export function inkReveal(figure) {
  const img = figure.querySelector('img');
  gsap.timeline({ scrollTrigger: onView(figure, 'top 80%') })
    .fromTo(img, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.8, ease: 'power3.inOut' }, 0)
    .add(inkSettle(img, { scale: 220, duration: 2.4 }), 0);
}

// Generic rise-in for [data-reveal] blocks
export function rise(targets, opts = {}) {
  ScrollTrigger.batch(targets, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, ...opts,
    }),
  });
}

// Collects event listeners so an effect can remove them all in its cleanup
export function listeners() {
  const offs = [];
  const on = (el, type, fn, opts) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  return [on, () => offs.splice(0).forEach((off) => off())];
}
