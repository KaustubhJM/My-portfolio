# Kitsune — portfolio of Kaustubh Jeet Mishra

React + Vite single-page site. Animation runs on GSAP (ScrollTrigger, SplitText,
ScrambleText), Lenis smooth scrolling and a small WebGL shader for the hero fox.

```
npm install      # uses the registry in .npmrc
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

Set `VITE_SITE_URL` (for example in `website/.env.production`) to the deployed URL. It is
used for the absolute `og:image` / `twitter:image` links; without it they point at a placeholder.

## Layout

Page order: Hero → Bands → Work → Nine tails → About → Contact.

- `src/App.jsx` — page shell and the loading phases (loading → ready → opening → done)
- `src/components/` — one component per section, each owning its animations via `useGSAP`
  - `Work.jsx` — project cards; clicking a card (or Enter / Space on "View project") opens the panel
  - `ProjectPanel.jsx` — the project detail dialog: ink clip-path wipe, focus trap, Esc to close,
    focus returns to the card, Lenis paused while open, full-screen on phones
  - `Project.jsx` — pieces shared by cards and the panel: `Flow`, `Tags`, link buttons, `DemoVideo`
  - `Pic.jsx` — `<picture>` with a WebP source and JPG fallback
- `src/lib/motion.js` — GSAP plugin registration, the Lenis instance, shared helpers, the
  `lowPower` flag (≤ 4 cores or a coarse pointer skips the SVG displacement filters)
- `src/lib/graph.js` — reads a Mermaid export of a LangGraph into flow steps
- `src/lib/heroGL.js` — WebGL ink-bleed shader for the hero image
- `src/lib/useMagnetic.js`, `src/lib/useDrift.js` — `data-magnetic` and `data-drift` pointer effects
- `src/data.js` — all page copy (projects, disciplines, proof line, links)
- `public/assets/` — artwork (WebP + JPG fallback) and the résumé PDF, served as-is

`base: './'` in `vite.config.js` makes the build work from a sub-path such as GitHub Pages.

## Project data

`FEATURE`, `PROJECTS` and `ML_PROJECTS` in `src/data.js` share these fields. Empty values are
safe: links show "… — coming soon", media slots are hidden or show a placeholder.

| Field | What it does |
| --- | --- |
| `links` | `{ github, demo, video, caseStudy }`. Set URLs open in a new tab. GitHub / Demo also appear on the card. |
| `thumb` | Image, GIF or WebP shown at the top of the card and in the panel. |
| `demo`, `poster` | Flagship only: looping clip under the fox art, plus its poster. `demo` can be one path or a list, e.g. `['media/classroom.webm', 'media/classroom.mp4']`. |
| `problem`, `architecture` | Paragraphs in the panel (hidden while empty). |
| `results` | List of measured outcomes in the panel. The flagship falls back to its `points`. |
| `year`, `status` | Shown in the panel; `status` also shows on the card. |
| `graph` | Optional Mermaid export of the real LangGraph (`graph.get_graph().draw_mermaid()`). Its nodes, in order from `__start__`, replace the hand-written `flow`. A node whose name matches the flow's human step, or contains human / review / approve / interrupt, is drawn in crimson. |
| `methodology` | Flagship only: the "How this was measured" note under the 0.68 → 0.90 metric. |
| `evaluation` | Flagship only: the baseline vs. best-first table in the panel. |

Also in `data.js`: `PROOF` (the hero proof line), `TAILS[].proof` (optional "Shown in" line naming
the project that shows each skill) and a commented-out demand-forecasting project.

## Project media

Put media in `public/media/` and reference it without a leading slash, e.g. `thumb: 'media/blog-agent.webp'`.

- Thumbnails: WebP (or GIF for motion), about 1200 × 750 (16:10).
- Demo clip: under 2 MB, 8–15 s, no audio track. Export WebM (VP9) and MP4 (H.264) and list
  both in `demo`, WebM first. Add a WebP `poster` from the first frame.
