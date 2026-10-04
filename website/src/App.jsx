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
import Cursor from './components/Cursor';

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
      ScrollTrigger.sort(); // the pinned tails track must be measured before what follows it
      ScrollTrigger.refresh();
      setPhase('opening');
    }
    if (phase === 'done' && animate) {
      lenis?.start();
      ScrollTrigger.refresh();
    }
  }, [phase]);

  const onReady = useCallback(() => setPhase('ready'), []);
  const onIntro = useCallback(() => setIntro(true), []);
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
        <Sheet ready={ready} />
        <Tails ready={ready} />
        <Work ready={ready} />
        <Summon ready={ready} />
      </main>
      <Cursor ready={ready} />
    </>
  );
}
