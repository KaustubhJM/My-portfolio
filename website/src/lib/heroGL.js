import { gsap } from './motion';

/* WebGL fox, used only for the opening ink-bleed reveal: blots of ink spread out
   from the fox's face with a crimson rim. Nothing reacts to the pointer or scroll.
   Returns { state, destroy } — GSAP tweens `state.reveal` / `state.zoom` — or null
   when WebGL isn't available, in which case the plain <img> is used. */

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uImg, uPos;
uniform float uReveal, uZoom;
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
  vec3 col = texture2D(uTex, cover((vUv - .5) / uZoom + .5)).rgb;

  // Ink-bleed reveal: blots spread out from the fox's face, rimmed in crimson
  float n = snoise(vec3(vUv * 3.2, 1.7)) * .5 + snoise(vec3(vUv * 9., 3.1)) * .2;
  float r = uReveal * 2. - distance(vUv * asp, vec2(.55, .7) * asp) * 1.25 + n * .45;
  float a = smoothstep(0., .12, r);
  float rim = smoothstep(0., .04, r) * (1. - smoothstep(.04, .22, r));
  col = mix(col, vec3(.78, .08, .11), rim * .9);
  gl_FragColor = vec4(col * a, a);
}`;

export function createHeroGL({ canvas, img }) {
  if (!canvas || !img?.naturalWidth) return null;
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

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
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } catch (err) {
    console.warn('Hero WebGL disabled:', err);
    return null;
  }

  const U = {};
  ['uRes', 'uImg', 'uPos', 'uReveal', 'uZoom'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform2f(U.uImg, img.naturalWidth, img.naturalHeight);

  const state = { reveal: 0, zoom: 1.12 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    // Mirror the CSS object-position of the <img> (it differs on mobile)
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    gl.uniform2f(U.uPos, px, 1 - py);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const render = () => {
    gl.uniform1f(U.uReveal, state.reveal);
    gl.uniform1f(U.uZoom, state.zoom);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  gsap.ticker.add(render);

  const art = canvas.parentElement;
  art.classList.add('is-gl');

  // Hands the hero back to the plain <img> (called once the reveal has finished)
  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    gsap.ticker.remove(render);
    ro.disconnect();
    gsap.killTweensOf(state);
    gsap.set(img, { opacity: 1, scale: 1 });
    art.classList.remove('is-gl');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  return { state, destroy };
}
