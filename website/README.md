# Kitsune — portfolio of Kaustubh Jeet Mishra

React + Vite single-page site. Animation runs on GSAP (ScrollTrigger, SplitText,
ScrambleText), Lenis smooth scrolling and a small WebGL shader for the hero fox.

```
npm install      # uses the registry in .npmrc
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

## Layout

- `src/App.jsx` — page shell and the loading phases (loading → ready → opening → done)
- `src/components/` — one component per section, each owning its animations via `useGSAP`
- `src/lib/motion.js` — GSAP plugin registration, the Lenis instance, shared helpers
- `src/lib/heroGL.js` — WebGL ink-bleed / ripple shader for the hero image
- `src/lib/usePageFx.js` — `data-magnetic`, `data-tilt` and `data-skew` behaviours
- `src/data.js` — all page copy (projects, disciplines, links)
- `public/assets/` — artwork and the résumé PDF, served as-is

`base: './'` in `vite.config.js` makes the build work from a sub-path such as GitHub Pages.
