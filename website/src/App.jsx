import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger, animate, lenis } from './lib/motion';
import useMagnetic from './lib/useMagnetic';
import useDrift from './lib/useDrift';
import { SvgDefs } from './components/Svg';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Bands from './components/Bands';
import Sheet from './components/Sheet';
import Tails from './components/Tails';
import Work from './components/Work';
import Summon from './components/Summon';

/* Phases: loading → ready (sections build their animations) → opening (loader
   splits, hero intro plays) → done. Without motion we jump straight to done. */
export default function App() {
  const [phase, setPhase] = useState(animate ? 'loading' : 'done');
  const [intro, setIntro] = useState(false);
  const ready = animate && phase !== 'loading';

  useMagnetic(ready);
  useDrift(ready);

  // Runs after every section's layout effect has created its ScrollTriggers
  useEffect(() => {
    if (phase === 'ready') {
      // Sections are created top to bottom, so Work (above the pin) is measured first and
      // About / Contact (below it) pick up the pinned tails track's spacer on refresh
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      setPhase('opening');
    }
    if (phase === 'done' && animate) {
      // …unless a project panel or the menu was opened while the loader was still parting
      if (!document.body.matches('.panel-open, .menu-open')) lenis?.start();
      ScrollTrigger.refresh();
    }
  }, [phase]);

  const onReady = useCallback(() => setPhase('ready'), []);
  // The page is usable as soon as the loader panels start to part
  const onIntro = useCallback(() => { setIntro(true); lenis?.start(); }, []);
  const onDone = useCallback(() => setPhase('done'), []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {animate && phase !== 'done' && (
        <Loader open={phase === 'opening'} onReady={onReady} onIntro={onIntro} onDone={onDone} />
      )}
      <SvgDefs />
      <Nav ready={ready} />
      <main id="main">
        <Hero ready={ready} intro={intro} />
        <Bands ready={ready} />
        <Work ready={ready} />
        <Tails ready={ready} />
        <Sheet ready={ready} />
        <Summon ready={ready} />
      </main>
    </>
  );
}
