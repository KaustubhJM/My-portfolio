import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, lenis, finePointer, glideTo, scramble, asset } from '../lib/motion';
import { NAV, RESUME } from '../data';
import { Arrow, Mark } from './Svg';

export default function Nav({ ready }) {
  const root = useRef(null);
  const bar = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menu: lock the page, close on Escape or when the viewport grows past the mobile layout
  const wasOpen = useRef(false);
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    // Only hand scrolling back if the menu took it (the loader owns it before that)
    if (lenis && open !== wasOpen.current) open ? lenis.stop() : lenis.start();
    wasOpen.current = open;
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const mq = window.matchMedia('(min-width: 821px)');
    const onMq = (e) => e.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  useGSAP(() => {
    if (!open || !lenis) return;
    gsap.fromTo('.nav__menu a', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.15, clearProps: 'all',
    });
  }, { scope: root, dependencies: [open] });

  // Reading progress, hide on scroll down, current section
  useGSAP(() => {
    if (!ready) return;
    const nav = root.current;
    let hidden = false;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        gsap.set(bar.current, { scaleX: self.progress });
        if (openRef.current) return;
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.7;
        if (hide === hidden) return;
        hidden = hide;
        // clearProps on show: a transformed nav would trap the fixed mobile menu inside it
        gsap.to(nav, hide
          ? { yPercent: -100, duration: 0.5, ease: 'power3.in' }
          : { yPercent: 0, duration: 0.6, ease: 'expo.out', clearProps: 'transform' });
      },
    });
    NAV.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: 'top 50%', end: 'bottom 50%',
        onToggle: (self) => setActive((cur) => (self.isActive ? href : cur === href ? null : cur)),
      });
    });
  }, { scope: root, dependencies: [ready] });

  const go = (e, href) => {
    setOpen(false);
    glideTo(e, href);
  };

  const cls = ['nav', scrolled && 'is-scrolled', open && 'is-open'].filter(Boolean).join(' ');

  return (
    <header className={cls} ref={root}>
      <a className="nav__brand" href="#top" aria-label="Kaustubh Jeet Mishra — home" data-magnetic="" onClick={(e) => go(e, '#top')}>
        <Mark className="nav__mark" />
        <span>Kaustubh<em>.</em></span>
      </a>
      <button
        className="nav__toggle" type="button" aria-expanded={open} aria-controls="nav-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav__toggle-bar" /><span className="nav__toggle-bar" />
        <span className="sr-only">Menu</span>
      </button>
      <nav className="nav__menu" id="nav-menu" aria-label="Primary">
        {NAV.map(({ href, num, label }) => (
          <a
            key={href} href={href} className={active === href ? 'is-active' : undefined}
            onClick={(e) => go(e, href)}
            onPointerEnter={(e) => finePointer && lenis && scramble(e.currentTarget.lastChild, 0.6)}
          >
            <span className="nav__num">{num}</span><span>{label}</span>
          </a>
        ))}
        <a className="nav__cta" href={asset(RESUME)} download data-magnetic="">Résumé <Arrow dir="down" /></a>
      </nav>
      <span className="nav__progress" aria-hidden="true" ref={bar} />
    </header>
  );
}
