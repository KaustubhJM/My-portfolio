(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const animate = !reduceMotion && !!(window.gsap && window.ScrollTrigger && window.SplitText);
  window.inkReady = true; // tells the <head> fallback that JS loaded

  // No motion (reduced-motion, or the libraries failed to load): drop the hidden start states.
  if (!animate) root.classList.remove('js');

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Smooth scroll (Lenis, driven by the GSAP ticker) ---------- */
  let lenis = null;
  if (animate) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Nav ---------- */
  const nav = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && animate) {
      gsap.fromTo($$('.nav__menu a'), { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.15, clearProps: 'all',
      });
    }
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('.nav__menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });
  window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // In-page links glide with Lenis instead of jumping
  if (lenis) {
    $$('a[href^="#"]:not(.skip)').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
      history.pushState(null, '', id);
    }));
  }

  /* ---------- Footer year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Embers: crimson motes and petals drifting up the hero ---------- */
  const canvas = $('[data-embers]');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const COLORS = ['200,20,28', '255,77,82', '243,241,237'];
    let w = 0, h = 0, particles = [], raf = 0, inView = true, running = false;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20,
      r: Math.random() * 2.2 + 0.6,
      vy: Math.random() * 0.45 + 0.15,
      sway: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.55 + 0.25,
      color: COLORS[Math.random() < 0.85 ? Math.round(Math.random()) : 2],
      petal: Math.random() < 0.35,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.round(Math.min(64, w / 24)) }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.vy;
        p.phase += 0.01;
        p.rot += p.spin;
        if (p.y < -20) Object.assign(p, spawn(false));
        const x = p.x + Math.sin(p.phase) * p.sway * 12;
        ctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, p.y / (h * 0.35)));
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        if (p.petal) ctx.ellipse(x, p.y, p.r * 2.2, p.r, p.rot, 0, Math.PI * 2);
        else ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun && !running) { running = true; raf = requestAnimationFrame(tick); }
      if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
    };

    let resizeTimer;
    resize();
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  if (!animate) return;

  /* ==========================================================================
     Everything below is GSAP.
     ========================================================================== */
  const heroImg = $('.hero__art img');
  const loader = $('[data-loader]');
  const onView = (trigger, start = 'top 82%') => ({ trigger, start, toggleActions: 'play none none none' });
  const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Always open on the hero so the loader → hero hand-off is what you see
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------- Loader: count up while the fox and fonts load, then split open ---------- */
  lenis?.stop();
  document.body.style.overflow = 'hidden';

  const count = $('[data-loader-count]');
  const bar = $('[data-loader-bar]');
  const progress = { p: 0 };
  const paint = () => {
    count.textContent = String(Math.round(progress.p)).padStart(3, '0');
    gsap.set(bar, { scaleX: progress.p / 100 });
  };
  // Split by hand: the brush font may not be in yet, and these are single glyphs anyway
  const kanjiEl = $('.loader__kanji');
  kanjiEl.innerHTML = [...kanjiEl.textContent].map((c) => `<span style="display:inline-block">${c}</span>`).join('');
  const kanji = Array.from(kanjiEl.children);
  gsap.timeline()
    .fromTo('.loader__mark', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 0)
    .from(kanji, { opacity: 0, yPercent: 60, filter: 'blur(8px)', duration: 0.9, ease: 'expo.out', stagger: 0.12 }, 0.25)
    .from('.loader__foot', { opacity: 0, duration: 0.6 }, 0.4);
  // Creep to 86% on a timer; the last stretch waits for the real assets
  const creep = gsap.to(progress, { p: 86, duration: 1.7, ease: 'power2.inOut', onUpdate: paint });

  const imgReady = new Promise((resolve) => {
    if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) return resolve();
    heroImg.addEventListener('load', resolve, { once: true });
    heroImg.addEventListener('error', resolve, { once: true });
  });
  const assets = Promise.race([Promise.all([imgReady, document.fonts.ready]), new Promise((r) => setTimeout(r, 4000))]);
  const minTime = new Promise((r) => creep.eventCallback('onComplete', r));

  Promise.all([assets, minTime]).then(() => {
    gsap.to(progress, {
      p: 100, duration: 0.5, ease: 'power2.out', onUpdate: paint,
      onComplete: () => {
        let intro;
        try {
          intro = init();
        } catch (err) {
          // Never leave the page stuck behind the loader
          console.error(err);
          root.classList.remove('js');
          loader.remove();
          document.body.style.overflow = '';
          lenis?.start();
          return;
        }
        openLoader(intro);
      },
    });
  });

  function openLoader(intro) {
    gsap.timeline({
      onComplete: () => {
        loader.remove();
        document.body.style.overflow = '';
        lenis?.start();
        ScrollTrigger.refresh();
      },
    })
      .to('.loader__inner', { yPercent: -40, opacity: 0, duration: 0.6, ease: 'power3.in' })
      .to('.loader__panel--top', { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, '-=0.15')
      .to('.loader__panel--bottom', { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, '<')
      .add(() => intro.play(), '<0.35');
  }

  function init() {
    const intro = heroIntro();
    tails(); // pinned track first, so every later trigger accounts for its pin spacing
    navScroll();
    marquees();
    sectionHeads();
    about();
    work();
    summon();
    scrambleHovers();
    velocitySkew();
    pointerFx();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return intro;
  }

  /* ---------- Helpers ---------- */

  // Decode-style text swap, used on labels and tags
  function scramble(el, duration = 1) {
    if (!window.ScrambleTextPlugin || !el) return gsap.to({}, { duration: 0 });
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    return gsap.to(el, { duration, ease: 'none', scrambleText: { text, chars: SCRAMBLE, speed: 0.5, revealDelay: duration * 0.3 } });
  }

  // Ink-bleed: the picture arrives warped like wet ink, then settles.
  // Each element gets its own throwaway SVG displacement filter.
  let inkId = 0;
  const NS = 'http://www.w3.org/2000/svg';
  function inkSettle(el, { scale = 160, duration = 2 } = {}) {
    const id = `ink-settle-${inkId++}`;
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    ['x', 'y'].forEach((a) => filter.setAttribute(a, '-20%'));
    ['width', 'height'].forEach((a) => filter.setAttribute(a, '140%'));
    const turb = document.createElementNS(NS, 'feTurbulence');
    Object.entries({ type: 'fractalNoise', baseFrequency: '0.012', numOctaves: '3', seed: String(inkId * 7), result: 'n' })
      .forEach(([k, v]) => turb.setAttribute(k, v));
    const disp = document.createElementNS(NS, 'feDisplacementMap');
    Object.entries({ in: 'SourceGraphic', in2: 'n', scale: String(scale), xChannelSelector: 'R', yChannelSelector: 'G' })
      .forEach(([k, v]) => disp.setAttribute(k, v));
    filter.append(turb, disp);
    $('.defs defs').append(filter);
    el.style.filter = `url(#${id})`;
    return gsap.fromTo(disp, { attr: { scale } }, {
      attr: { scale: 0 }, duration, ease: 'power3.out',
      onComplete: () => { el.style.filter = ''; filter.remove(); },
    });
  }

  /* Generic rise-in for anything still marked [data-reveal] that no section handles */
  function rise(targets, opts = {}) {
    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, ...opts,
      }),
    });
  }

  /* Circular ink-blot reveal for the round artworks, with the bleed settling inside */
  function inkReveal(figure) {
    const img = $('img', figure);
    gsap.timeline({ scrollTrigger: onView(figure, 'top 80%') })
      .fromTo(img, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.8, ease: 'power3.inOut' }, 0)
      .add(inkSettle(img, { scale: 220, duration: 2.4 }), 0);
  }

  /* ---------- WebGL fox: ink-bleed intro, liquid ripple under the cursor, RGB split on fast scroll ---------- */
  function heroGL() {
    const cvs = $('[data-gl]');
    if (!cvs || !heroImg?.naturalWidth) return null;
    const gl = cvs.getContext('webgl', { premultipliedAlpha: true, antialias: false });
    if (!gl) return null;

    const vert = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
    const frag = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uImg, uPos, uMouse;
uniform float uHover, uTime, uReveal, uZoom, uVel;
varying vec2 vUv;

vec3 mod289(vec3 x){ return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(vec4 x){ return x - floor(x * (1. / 289.)) * 289.; }
vec4 permute(vec4 x){ return mod289(((x * 34.) + 1.) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - .85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1. / 6., 1. / 3.); const vec4 D = vec4(0., .5, 1., 2.);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1. - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
  float n_ = .142857142857; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49. * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7. * x_);
  vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2. + 1.; vec4 s1 = floor(b1) * 2. + 1.; vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.); m = m * m;
  return 42. * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// object-fit: cover + object-position, in texture space
vec2 cover(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.) : vec2(1., ri / rs);
  return uv * s + (1. - s) * uPos;
}

void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.);
  vec2 uv = (vUv - .5) / uZoom + .5;

  // Liquid lens + ripple rings around the cursor, and a slow ambient breath
  float d = distance(uv * asp, uMouse * asp);
  float m = smoothstep(.42, 0., d) * uHover;
  vec2 dir = normalize(uv - uMouse + 1e-4);
  uv += snoise(vec3(uv * 2.2, uTime * .12)) * .0035;
  uv += dir * sin(d * 34. - uTime * 3.2) * .009 * m;
  uv -= dir * .028 * m * m;

  // Chromatic split from the pointer and from scroll speed
  float shift = .005 * m + uVel * .018;
  vec3 col = vec3(
    texture2D(uTex, cover(uv + vec2(shift, shift * .4))).r,
    texture2D(uTex, cover(uv)).g,
    texture2D(uTex, cover(uv - vec2(shift, shift * .4))).b
  );

  // Ink-bleed reveal: blots spread out from the fox's face, rimmed in crimson
  float a = 1.;
  if (uReveal < 1.) {
    float n = snoise(vec3(vUv * 3.2, 1.7)) * .5 + snoise(vec3(vUv * 9., 3.1)) * .2;
    float r = uReveal * 2. - distance(vUv * asp, vec2(.55, .7) * asp) * 1.25 + n * .45;
    a = smoothstep(0., .12, r);
    float rim = smoothstep(0., .04, r) * (1. - smoothstep(.04, .22, r));
    col = mix(col, vec3(.78, .08, .11), rim * .9);
  }
  gl_FragColor = vec4(col * a, a);
}`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heroImg);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } catch (err) {
      console.warn('Hero WebGL disabled:', err);
      return null; // the plain <img> takes over
    }

    const U = {};
    ['uRes', 'uImg', 'uPos', 'uMouse', 'uHover', 'uTime', 'uReveal', 'uZoom', 'uVel']
      .forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform2f(U.uImg, heroImg.naturalWidth, heroImg.naturalHeight);

    // Animatable state (GSAP tweens these) + smoothed pointer
    const state = { reveal: 0, zoom: 1.12, hover: 0, vel: 0 };
    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    const art = cvs.parentElement;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
      gl.viewport(0, 0, cvs.width, cvs.height);
      gl.uniform2f(U.uRes, cvs.width, cvs.height);
      // Mirror the CSS object-position of the <img> (it differs on mobile)
      const [px, py] = getComputedStyle(heroImg).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      gl.uniform2f(U.uPos, px, 1 - py);
    };
    resize();
    new ResizeObserver(resize).observe(cvs);

    const hero = $('.hero');
    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        const r = cvs.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width;
        mouse.ty = 1 - (e.clientY - r.top) / r.height;
      });
      hero.addEventListener('pointerenter', () => gsap.to(state, { hover: 1, duration: 0.8 }));
      hero.addEventListener('pointerleave', () => gsap.to(state, { hover: 0, duration: 1.2 }));
    }

    const render = (time) => {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const v = Math.min(Math.abs(lenis?.velocity || 0) / 40, 1);
      state.vel += (v - state.vel) * 0.1;
      gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.uniform1f(U.uHover, state.hover);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uReveal, state.reveal);
      gl.uniform1f(U.uZoom, state.zoom);
      gl.uniform1f(U.uVel, state.vel);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // Only draw while the hero is on screen
    let running = false;
    const sync = (on) => {
      if (on && !running) gsap.ticker.add(render);
      if (!on && running) gsap.ticker.remove(render);
      running = on;
    };
    new IntersectionObserver(([e]) => sync(e.isIntersecting && !document.hidden)).observe(hero);
    document.addEventListener('visibilitychange', () => sync(!document.hidden));
    sync(true);

    art.classList.add('is-gl');
    return state;
  }

  /* ---------- Hero: opening sequence (played by the loader) + scroll-out ---------- */
  function heroIntro() {
    const hero = $('.hero');
    const art = $('[data-parallax]');
    const glState = heroGL();
    const split = SplitText.create('[data-chars]', { type: 'words,chars', wordsClass: 'word', charsClass: 'char' });
    gsap.set('.hero__line > span', { y: 0 });

    // Wrap the eyebrow text so it can decode in without touching its rule
    const eyebrow = $('.hero__eyebrow');
    const eyebrowText = document.createElement('span');
    eyebrowText.textContent = eyebrow.lastChild.textContent;
    eyebrow.lastChild.replaceWith(eyebrowText);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    if (glState) {
      tl.to(glState, { reveal: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
        .to(glState, { zoom: 1, duration: 3.4, ease: 'expo.out' }, 0);
    } else {
      tl.fromTo(heroImg, { opacity: 0, scale: 1.12 }, { opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
        .to(heroImg, { scale: 1, duration: 3.2, ease: 'expo.out' }, 0);
    }
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 1.2 }, 0.3)
      .add(scramble(eyebrowText, 1.4), 0.3)
      .from('.hero__eyebrow .eyebrow__line', { scaleX: 0, transformOrigin: 'left', duration: 1.2 }, 0.4)
      .from(split.chars, { yPercent: 115, rotate: 10, duration: 1.3, stagger: 0.032 }, 0.45)
      .fromTo('.hero__brush', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 1.25)
      .to('.hero__lede', { opacity: 1, y: 0, duration: 1.3 }, 0.95)
      .to('.hero__ctas', { opacity: 1, y: 0, duration: 1.3 }, 1.1)
      .from('.hero__ctas .btn', { y: 18, opacity: 0, duration: 1.1, stagger: 0.1 }, 1.1)
      .to('.hero__meta', { opacity: 1, y: 0, duration: 1.3 }, 1.35)
      .add(() => $$('.hero__meta .label').forEach((l) => scramble(l, 1)), 1.35)
      .to('.hero__embers', { opacity: 1, duration: 2.4, ease: 'power1.out' }, 0.6)
      .fromTo('.hero__vertical', { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power2.inOut' }, 1.4);

    // Letters bob when the pointer brushes over them
    if (finePointer) {
      split.chars.forEach((c) => c.addEventListener('pointerenter', () => {
        if (tl.isActive()) return;
        gsap.timeline()
          .to(c, { y: '-0.14em', rotate: gsap.utils.random(-8, 8), duration: 0.25, ease: 'power2.out' })
          .to(c, { y: 0, rotate: 0, duration: 0.9, ease: 'elastic.out(1, .35)' });
      }));
    }

    // Leaving the hero: copy drifts up and fades, the fox sinks slower than the page
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__inner', { yPercent: -16, opacity: 0.1, ease: 'none' }, 0)
      .to(art, { yPercent: 16, ease: 'none' }, 0)
      .to('.hero__vertical', { yPercent: -60, ease: 'none' }, 0);

    // Pointer parallax on the fox (x/y stack on top of the scroll yPercent)
    if (finePointer && art) {
      const xTo = gsap.quickTo(art, 'x', { duration: 1.2, ease: 'power3.out' });
      const yTo = gsap.quickTo(art, 'y', { duration: 1.2, ease: 'power3.out' });
      hero.addEventListener('pointermove', (e) => {
        xTo((e.clientX / window.innerWidth - 0.5) * -24);
        yTo((e.clientY / window.innerHeight - 0.5) * -16);
      });
    }
    return tl;
  }

  /* ---------- Nav: reading progress, hide on scroll down, active section ---------- */
  function navScroll() {
    const bar = $('[data-progress]');
    let hidden = false;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        gsap.set(bar, { scaleX: self.progress });
        if (nav.classList.contains('is-open')) return;
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.7;
        if (hide === hidden) return;
        hidden = hide;
        // clearProps on show: a transformed nav would trap the fixed mobile menu inside it
        gsap.to(nav, hide
          ? { yPercent: -100, duration: 0.5, ease: 'power3.in' }
          : { yPercent: 0, duration: 0.6, ease: 'expo.out', clearProps: 'transform' });
      },
    });

    $$('.nav__menu a[href^="#"]').forEach((link) => {
      const section = $(link.getAttribute('href'));
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: 'top 50%', end: 'bottom 50%',
        onToggle: (self) => link.classList.toggle('is-active', self.isActive),
      });
    });
  }

  /* ---------- Crossed bands: endless marquee that speeds up and flips with the scroll ---------- */
  function marquees() {
    const loops = $$('[data-marquee]').map((track, i) => {
      const base = track.innerHTML;
      const bandWidth = track.parentElement.offsetWidth;
      let html = base;
      for (let n = 0; n < 6 && track.scrollWidth < bandWidth; n++) {
        html += base;
        track.innerHTML = html;
      }
      track.innerHTML = html + html;
      const dir = i % 2 ? 1 : -1; // bone runs left, crimson runs right
      const tween = gsap.fromTo(track,
        { xPercent: dir < 0 ? 0 : -50 },
        { xPercent: dir < 0 ? -50 : 0, duration: i % 2 ? 42 : 50, ease: 'none', repeat: -1 });
      // Start deep into the repeats so a negative timeScale can run backwards indefinitely
      tween.totalTime(tween.duration() * 1000);
      return tween;
    });

    ScrollTrigger.create({
      trigger: '.bands', start: 'top bottom', end: 'bottom top',
      onUpdate(self) {
        const dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 8);
        loops.forEach((t) => {
          gsap.to(t, {
            timeScale: dir * boost, duration: 0.3, ease: 'power2.out', overwrite: true,
            onComplete: () => gsap.to(t, { timeScale: dir, duration: 1.4, ease: 'power2.out', overwrite: true }),
          });
        });
      },
    });

    // The two bands scissor slightly as they pass
    const bandsST = { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.to('.band--bone', { rotation: '+=2', ease: 'none', scrollTrigger: bandsST });
    gsap.to('.band--blood', { rotation: '-=2', ease: 'none', scrollTrigger: { ...bandsST } });
  }

  /* ---------- Section headings: brush kanji, decoding tag, masked line rise ---------- */
  function sectionHeads() {
    $$('.section-head').forEach((head) => {
      const kanji = $('.kanji', head);
      const tag = $('.section-tag', head);
      const h2 = $('h2', head);
      const intro = $('.section-intro', head);

      const tl = gsap.timeline({ scrollTrigger: onView(head, 'top 85%') })
        .fromTo(kanji, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.25, rotate: -12 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, rotate: 0, duration: 1.4, ease: 'expo.out' }, 0)
        .fromTo(tag, { opacity: 0, x: -14, '--line': 0 }, { opacity: 1, x: 0, '--line': 1, duration: 1, ease: 'power3.out' }, 0.15)
        .add(scramble(tag, 1.2), 0.15);
      if (intro) tl.fromTo(intro, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.5);

      SplitText.create(h2, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, rotate: 4, transformOrigin: '0% 100%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.2,
          scrollTrigger: onView(head, 'top 85%'),
        }),
      });

      // Kanji drifts a little against the scroll
      gsap.to(kanji, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: head, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.set(head, { opacity: 1 });
    });
  }

  /* ---------- 01 Reference sheet ---------- */
  function about() {
    const figure = $('.sheet__figure');
    gsap.set(figure, { opacity: 1 });
    inkReveal(figure);
    gsap.fromTo($('img', figure), { yPercent: 6 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.timeline({ scrollTrigger: onView(figure, 'top 80%'), delay: 0.8 })
      .fromTo($('.fig', figure), { opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.24em', duration: 1.6, ease: 'expo.out' }, 0)
      .add(scramble($('.fig', figure), 1.2), 0);

    // The lede "inks in" word by word as you read down
    const lede = $('.sheet__lede');
    const words = SplitText.create(lede, { type: 'words' }).words;
    gsap.set(lede, { opacity: 1 });
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: lede, start: 'top 85%', end: 'bottom 50%', scrub: true },
    });

    rise($$('.sheet__text [data-reveal]:not(.sheet__lede)'));
    ScrollTrigger.create({
      trigger: '.facts', start: 'top 88%', once: true,
      onEnter: () => $$('.facts dt').forEach((dt, i) => gsap.delayedCall(i * 0.12 + 0.3, () => scramble(dt, 0.9))),
    });

    // Detail plates wipe up from the bottom, the ink settling as they land
    const details = $$('.detail');
    gsap.set(details, { opacity: 1 });
    const tl = gsap.timeline({ scrollTrigger: onView('.details', 'top 85%') })
      .fromTo(details.map((d) => $('.detail__img', d)), { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', stagger: 0.12 }, 0)
      .fromTo(details.map((d) => $('.detail__img img', d)), { scale: 1.35 },
        { scale: 1, duration: 1.8, ease: 'expo.out', stagger: 0.12, clearProps: 'transform' }, 0.2)
      .fromTo(details.flatMap((d) => [$('.fig', d), $('p', d)]), { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.06 }, 0.7);
    details.forEach((d, i) => {
      tl.add(inkSettle($('.detail__img img', d), { scale: 90, duration: 1.8 }), i * 0.12);
      tl.add(scramble($('.fig', d), 1), 0.7 + i * 0.12);
    });
  }

  /* ---------- 02 Nine tails: pinned horizontal track on desktop, cascade on smaller screens ---------- */
  function tails() {
    const section = $('.tails');
    const grid = $('.tails__grid');
    const cards = $$('.tail');

    gsap.fromTo('.tails__watermark', { yPercent: -12, rotate: -8 }, {
      yPercent: 14, rotate: 24, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const cardIn = (batch) => gsap.timeline()
      .fromTo(batch, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0)
      // numerals are brushed on top-to-bottom (clip only — their hover tilt is a CSS transform)
      .fromTo(batch.map((t) => $('.tail__num', t)), { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut', stagger: 0.08 }, 0.25)
      .fromTo(batch.flatMap((t) => $$('.tags li', t)), { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.025 }, 0.5)
      .add(() => batch.forEach((t) => scramble($('.tail__count', t), 0.8)), 0.3);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', () => {
      section.classList.add('is-horizontal');
      const wrap = grid.parentElement;
      const distance = () => {
        const cs = getComputedStyle(wrap);
        return grid.scrollWidth - (wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      };
      const countEl = $('[data-tail-count]');
      const barEl = $('[data-tail-bar]');

      const track = gsap.to(grid, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(barEl, { scaleX: self.progress });
            countEl.textContent = String(1 + Math.round(self.progress * 8)).padStart(2, '0');
          },
        },
      });

      // All cards cascade in once the section arrives…
      ScrollTrigger.create({ trigger: section, start: 'top 70%', once: true, onEnter: () => cardIn(cards) });

      // …then each one swings open in 3D as it slides in from the right edge
      cards.forEach((card) => {
        gsap.fromTo(card, { rotationY: -32, transformPerspective: 1100, transformOrigin: '0% 50%' }, {
          rotationY: 0, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: track, start: 'left 100%', end: 'left 55%', scrub: true },
        });
      });

      return () => section.classList.remove('is-horizontal');
    });

    mm.add('(max-width: 1024px)', () => {
      ScrollTrigger.batch(cards, { start: 'top 90%', once: true, onEnter: cardIn });
    });
  }

  /* ---------- 03 Work ---------- */
  function work() {
    const feature = $('.project--feature');
    gsap.fromTo(feature, { opacity: 0, y: 80, rotationX: 8, transformPerspective: 1400, transformOrigin: '50% 0%' }, {
      opacity: 1, y: 0, rotationX: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: onView(feature, 'top 85%'),
    });
    gsap.from($$('.project__body > *', feature), {
      opacity: 0, y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.2,
      scrollTrigger: onView(feature, 'top 85%'),
    });

    // The fanned-tail artwork turns slowly as it passes
    const art = $('.project__art');
    inkReveal(art);
    gsap.fromTo($('img', art), { rotate: -14 }, {
      rotate: 14, ease: 'none',
      scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // Ranking precision counts up and the bars fill
    const metric = $('[data-metric]');
    const to = $('.metric__to', metric);
    const value = { v: 0.68 };
    to.textContent = value.v.toFixed(2);
    ScrollTrigger.create({
      trigger: metric, start: 'top 88%', once: true,
      onEnter: () => {
        feature.classList.add('is-in');
        scramble($('.metric__label', metric), 1);
        gsap.to(value, { v: 0.9, duration: 1.8, ease: 'power3.out', delay: 0.4, onUpdate: () => { to.textContent = value.v.toFixed(2); } });
      },
    });

    // Smaller cards flip up from the table one after another
    ScrollTrigger.batch($$('.work__grid .project'), {
      start: 'top 88%', once: true,
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 70, rotationX: 22, transformPerspective: 1000, transformOrigin: '50% 100%' },
        { opacity: 1, y: 0, rotationX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.14 }),
    });

    // Agent graphs: nodes hand off one after another, then a pulse of work keeps travelling through them
    $$('.flow').forEach((flow) => {
      const nodes = $$('li', flow);
      const human = $('.flow__human', flow);
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
      opacity: 1, x: 0, duration: 1, ease: 'expo.out', scrollTrigger: onView('.link-more', 'top 95%'),
    });
  }

  /* ---------- 04 Summon ---------- */
  function summon() {
    const section = $('.summon');
    // The blood moon rises as the section scrolls up
    gsap.fromTo('.summon__sky', { yPercent: 22, scale: 0.88 }, {
      yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: true },
    });

    const inner = $('.summon__inner');
    const title = $('.summon__title');
    const words = SplitText.create(title, { type: 'words', wordsClass: 'word' }).words;
    gsap.set(title, { opacity: 1 });

    gsap.timeline({ scrollTrigger: onView(inner, 'top 75%') })
      .fromTo($('.kanji', inner), { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.25 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
      .fromTo($('.section-tag', inner), { opacity: 0, '--line': 0 }, { opacity: 1, '--line': 1, duration: 1 }, 0.15)
      .add(scramble($('.section-tag', inner), 1.2), 0.15)
      .fromTo(words, { opacity: 0, yPercent: 60, rotateX: -50 },
        { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045 }, 0.3)
      .fromTo('.summon__note', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0.9)
      .fromTo('.summon__mail', { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
        { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 1)
      .fromTo('.socials', { opacity: 0 }, { opacity: 1, duration: 0.01 }, 1.4)
      .from('.socials li', { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 1.4);

    // The moon leans toward the pointer
    if (finePointer) {
      const mx = gsap.quickTo('.summon__sky', 'x', { duration: 1.6, ease: 'power3.out' });
      const my = gsap.quickTo('.summon__sky', 'y', { duration: 1.6, ease: 'power3.out' });
      section.addEventListener('pointermove', (e) => {
        mx((e.clientX / window.innerWidth - 0.5) * 50);
        my((e.clientY / window.innerHeight - 0.5) * 30);
      });
    }

    gsap.from('.footer > *', {
      opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: onView('.footer', 'top 98%'),
    });
  }

  /* ---------- Nav labels decode on hover ---------- */
  function scrambleHovers() {
    if (!finePointer) return;
    // Nav labels sit after their number span; wrap them so only the word decodes
    $$('.nav__menu a:not(.nav__cta)').forEach((a) => {
      const span = document.createElement('span');
      span.textContent = a.lastChild.textContent;
      a.lastChild.replaceWith(span);
      a.addEventListener('pointerenter', () => scramble(span, 0.6));
    });
  }

  /* ---------- Scroll-speed skew: images and cards lean into fast scrolling ---------- */
  function velocitySkew() {
    if (!lenis) return;
    const groups = [
      { els: $$('.sheet__figure, .detail, .project__art, .work__grid .project'), prop: 'skewY', k: 0.18, max: 5 },
    ];
    groups.forEach((g) => { g.to = g.els.map((el) => gsap.quickTo(el, g.prop, { duration: 0.6, ease: 'power3.out' })); });

    // In the horizontal tails the cards shear sideways instead
    const horizontal = () => $('.tails.is-horizontal');
    const tailTo = $$('.tail').map((el) => gsap.quickTo(el, 'skewX', { duration: 0.6, ease: 'power3.out' }));

    let last = 0;
    gsap.ticker.add(() => {
      const v = lenis.velocity || 0;
      if (Math.abs(v - last) < 0.01) return;
      last = v;
      groups.forEach((g) => {
        const s = gsap.utils.clamp(-g.max, g.max, v * g.k);
        g.to.forEach((fn) => fn(s));
      });
      if (horizontal()) {
        const s = gsap.utils.clamp(-6, 6, v * -0.22);
        tailTo.forEach((fn) => fn(s));
      }
    });
  }

  /* ---------- Pointer-only flourishes: cursor ring with labels, magnetic buttons, tilt, spotlight ---------- */
  function pointerFx() {
    if (!finePointer) return;

    // What the cursor says over each kind of target
    [
      ['.summon__mail', 'Write'],
      ['a[download]:not(.nav__cta)', 'Save'],
      ['a[target="_blank"]', 'Open'],
      ['.btn--blood', 'View'],
    ].forEach(([sel, text]) => $$(sel).forEach((el) => { el.dataset.cursorText = text; }));
    $$('.tail').forEach((el) => { el.dataset.cursorText = 'Scroll'; });

    const cursor = $('[data-cursor]');
    const label = $('[data-cursor-label]');
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      cx(e.clientX); cy(e.clientY);
      cursor.classList.add('is-visible');
      let labelled = e.target.closest('[data-cursor-text]');
      // "Scroll" only makes sense while the tails track is horizontal
      if (labelled?.classList.contains('tail') && !$('.tails.is-horizontal')) labelled = null;
      cursor.classList.toggle('has-label', !!labelled);
      if (labelled) label.textContent = labelled.dataset.cursorText;
      cursor.classList.toggle('is-link', !labelled && !!e.target.closest('a, button'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    // Buttons lean toward the pointer, then spring back
    $$('.btn, .nav__cta, .socials a, .nav__brand').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' });
      });
    });

    // Plates and artworks tilt in 3D under the pointer
    const tilt = (el, amount) => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * amount);
        rx(((e.clientY - r.top) / r.height - 0.5) * -amount);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    };
    $$('.detail__img').forEach((el) => tilt(el, 16));
    tilt($('.sheet__figure img'), 10);

    // Crimson glow follows the pointer across each tail card
    $$('.tail').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }
})();
