// Hamdaz home page: the 3D story told as you scroll.
// The hero is one of (data-element on the stage, set in src/pages/home.mjs):
//   'scan'  the scan horizon artwork (scan.js, SVG in the hero); the particles pour out of its orb
//   'chip'  the AI chip on its circuit board (heroes/chip.js), with its labels
//   'bloom' the x-ray flower (heroes/bloom.js), annotated like an AI scan on a 2D layer
//   'glass' a glass tech object over two dissolving photos (heroes/glass.js); the particles leave the object
// Two layers share one camera: the dark stage behind the page draws the hero's 3D element and the galaxy in
// the dark section before Contact; a transparent layer above the page draws the particles and the people
// network beside "Who we are" on the white sheet.
//   1. As the white sheet rises over the hero, the hero's element breaks up into particles that stream
//      down onto the sheet and settle as the network beside "Who we are" ([data-art]).
//   2. As the dark section before Contact ([data-galaxy]) scrolls in, the network's particles stream down
//      into it and swirl into a spiral galaxy.
// Both follow the scroll (smoothed), so scrolling back up sends the particles back again.
// Three.js r160 (MIT).
import * as THREE from '../vendor/three.module.min.js';
import { heroFramings } from './heroes/framings.js';
import { elementPoints } from './heroes/points.js';
import { build as buildBloom } from './heroes/bloom.js';
import { build as buildChip } from './heroes/chip.js';
import { build as buildGlass } from './heroes/glass.js';
import { drawScan, orbOnScreen } from './scan.js';
import { build as buildInknet } from './heroes/inknet.js';
import { build as buildGalaxy, galaxyPoints } from './heroes/galaxy.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const api = (window.HamdazEarth = window.HamdazEarth || { progress: 0 });
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const mix = (a, b, t) => a + (b - a) * t;
const PARTICLES = 3200;
// how quickly a stream catches up with the scroll (per second): a quick flick still plays out over about
// a second, a slow scroll plays it at the scroll's own pace, and scrolling up plays it back
const STREAM_FOLLOW = 2.4;
const HALF_H = 6 * Math.tan((15 * Math.PI) / 180);

// particles: from one element (A) to the next (B), coloured to read on both the navy hero and white paper.
// Each particle sweeps along a curve (out to one side, then in), accelerating and then settling; the ones
// bound for the middle of the next element leave first, so it assembles from its core outwards.
const particleVertex = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec3 aSeed; // random, phase, size
  attribute float aOrder; // 0 = lands in the middle of the next element, 1 = at its edge
  uniform mat4 uMA;
  uniform mat4 uMB;
  uniform float uK;
  uniform float uPixel;
  varying float vA;
  varying float vTone;
  void main() {
    vec3 a = (uMA * vec4(aA, 1.0)).xyz;
    vec3 b = (uMB * vec4(aB, 1.0)).xyz;
    float delay = aOrder * 0.32 + aSeed.x * 0.14;
    float k0 = clamp((uK - delay) / 0.52, 0.0, 1.0);
    float k = k0;
    k = k < 0.5 ? 4.0 * k * k * k : 1.0 - pow(-2.0 * k + 2.0, 3.0) / 2.0; // ease in and out
    // a quadratic curve: the control point sits off to one side of the straight path, lifted towards us
    vec3 d = b - a;
    float len = length(d);
    vec3 side = normalize(vec3(-d.y, d.x, 0.0) + 1e-5);
    float bend = (aSeed.y < 0.5 ? -1.0 : 1.0) * (0.18 + 0.32 * fract(aSeed.y * 7.31)) * len;
    vec3 c = (a + b) * 0.5 + side * bend + vec3(0.0, 0.0, 0.25 * len);
    vec3 p = mix(mix(a, c, k), mix(c, b, k), k);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float flight = sin(k * 3.14159);
    gl_PointSize = aSeed.z * (1.0 + flight * 0.7) * uPixel * (6.0 / -mv.z);
    // a particle only shows once it has left the element (so the element's outline is never drawn in
    // particles on the next section) and stays on its landing spot until the real element takes over
    vA = smoothstep(0.0, 0.1, k0) * (1.0 - smoothstep(0.9, 1.0, uK)) * (0.75 + 0.25 * flight);
    vTone = fract(aSeed.y * 9.7);
  }
`;
const particleFragment = /* glsl */ `
  varying float vA;
  varying float vTone;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.25, d);
    vec3 c = vTone > 0.85 ? vec3(0.82, 0.13, 0.44) : vTone > 0.35 ? vec3(0.04, 0.64, 0.86) : vec3(0.19, 0.76, 0.97);
    gl_FragColor = vec4(c, a * vA);
  }
`;

// 0..1 for each landing point: its distance from the middle of the element, relative to the furthest
function orderOf(pts) {
  const n = pts.length / 3;
  const out = new Float32Array(n);
  let max = 1e-6;
  for (let i = 0; i < n; i++) { out[i] = Math.hypot(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]); max = Math.max(max, out[i]); }
  for (let i = 0; i < n; i++) out[i] /= max;
  return out;
}

function makeRenderer(canvas, alpha) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance', stencil: false });
  r.setClearColor(0x061423, alpha ? 0 : 1);
  return r;
}

async function init(host) {
  const darkCanvas = host.querySelector('canvas');
  const lightCanvas = document.querySelector('[data-stage-light]');
  const art = document.querySelector('[data-art]');
  const galaxySec = document.querySelector('[data-galaxy]');
  const hero = document.querySelector('[data-hero]');
  const kind = host.dataset.element || 'chip';
  const scanSvg = document.querySelector('[data-scan]');
  if (kind === 'scan' && scanSvg) drawScan(scanSvg); // drawn even without WebGL
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return fail();

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  let dark;
  let light = null;
  try {
    dark = makeRenderer(darkCanvas, false);
    if (lightCanvas && art) light = makeRenderer(lightCanvas, true);
  } catch (e) {
    return fail();
  }
  const hud = document.createElement('canvas');
  hud.className = 'stage-hud';
  hud.setAttribute('aria-hidden', 'true');
  host.appendChild(hud);
  const hudCtx = hud.getContext('2d');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 6);
  const U = { uTime: { value: 0 }, uPixel: { value: dpr }, uIntro: { value: 0 } };
  const darkScene = new THREE.Scene();
  const lightScene = new THREE.Scene();

  // the hero's 3D element (dark layer) and the network on the white sheet (light layer)
  const heroRoot = new THREE.Group();
  heroRoot.rotation.order = 'XYZ';
  darkScene.add(heroRoot);
  const netRoot = new THREE.Group();
  netRoot.rotation.order = 'XYZ';
  lightScene.add(netRoot);
  const galRoot = new THREE.Group();
  galRoot.rotation.order = 'XYZ';
  darkScene.add(galRoot);
  let el3d = null; // the hero's 3D element ('scan' has none)
  let net;
  let galaxy = null;
  try {
    if (kind === 'chip') el3d = await buildChip({ root: heroRoot, scene: darkScene, camera, renderer: dark, U, host, mode: 'hero', reduceMotion });
    else if (kind === 'bloom') el3d = buildBloom({ root: heroRoot, U, reduceMotion });
    else if (kind === 'glass') el3d = await buildGlass({ root: heroRoot, scene: darkScene, renderer: dark, reduceMotion });
    net = light ? await buildInknet({ root: netRoot, U, reduceMotion }) : null;
    if (galaxySec) galaxy = await buildGalaxy({ root: galRoot, U, reduceMotion });
  } catch (e) {
    console.error(e);
    return fail();
  }
  const framing = kind === 'bloom' ? 'bloom' : 'chip';
  let F = heroFramings(framing, 1.6);
  const labels = Object.entries(el3d?.anchors || {}).map(([id, a]) => ({ ...a, id, el: host.querySelector(`[data-earth-label="${id}"]`) })).filter((l) => l.el);
  host.querySelectorAll('[data-earth-label]').forEach((el) => { el.style.opacity = '0'; });
  // the glass hero's service panels, one per frame (src/pages/home.mjs)
  const framePanels = [...document.querySelectorAll('[data-frame-panel]')].map((el) => ({ el, n: Number(el.dataset.framePanel), key: '', on: null }));
  // The glass hero plays its frames on its own, like a short film: each one holds for a few seconds, then
  // glides to the next, and it loops. The rail jumps to
  // any frame, and its button pauses the film (WCAG 2.2.2). Only pointing at the rail holds the frame (and
  // keyboard focus in the details or the rail), so the film never looks stuck while the pointer rests on
  // the page. One scroll leaves the hero for the content.
  const heroA = document.querySelector('[data-hero-a]');
  const rail = [...document.querySelectorAll('[data-rail]')];
  const playBtn = document.querySelector('[data-hero-play]');
  const HOLD = [5.5, 4.8, 4.8, 4.8, 4.8, 4.8];
  const film = { f: 0, from: 0, to: 0, k: 1, dur: 1.6, hold: 0, paused: false, held: false, on: -1, heroA: -1 };
  const easeFilm = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const filmGo = (n) => {
    const L = el3d?.frames || 6;
    let to = film.to - (((film.to % L) + L) % L) + n;
    if (to - film.to > L / 2) to -= L;
    if (film.to - to > L / 2) to += L;
    if (to === film.to && film.k >= 1) return;
    film.from = film.f; film.to = to; film.k = 0; film.hold = 0;
    film.dur = Math.min(2.2, 1.4 + Math.abs(to - film.f) * 0.2);
  };
  rail.forEach((b) => b.addEventListener('click', () => filmGo(Number(b.dataset.rail))));
  if (playBtn) playBtn.addEventListener('click', () => {
    film.paused = !film.paused;
    playBtn.setAttribute('aria-pressed', String(film.paused));
    playBtn.setAttribute('aria-label', film.paused ? 'Play the hero' : 'Pause the hero');
    playBtn.classList.toggle('is-paused', film.paused);
  });
  // gallery controls: previous / next buttons, a sideways drag or swipe on the hero, a sideways trackpad
  // scroll, and the left / right arrow keys while the hero is in view (an upward or downward scroll still
  // leaves for the content)
  const heroSec = document.querySelector('[data-hero]');
  const heroInView = () => { const r = heroSec.getBoundingClientRect(); return r.bottom > innerHeight * 0.5 && r.top < innerHeight * 0.5; };
  const filmStep = (dir) => { const L = el3d?.frames || 6; const cur = film.on < 0 ? 0 : film.on; filmGo((cur + dir + L) % L); };
  document.querySelectorAll('[data-hero-step]').forEach((b) => b.addEventListener('click', () => filmStep(Number(b.dataset.heroStep))));
  if (heroSec && kind === 'glass') {
    let down = null;
    heroSec.addEventListener('pointerdown', (e) => { if (e.button === 0 && !e.target.closest('a, button')) down = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('pointerup', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) filmStep(dx < 0 ? 1 : -1);
    });
    let wheelUntil = 0;
    heroSec.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) < 25 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelUntil) { wheelUntil = now + 250; return; }
      wheelUntil = now + 700;
      filmStep(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.target.closest('input, textarea, select, [contenteditable]') || !heroInView()) return;
      filmStep(e.key === 'ArrowRight' ? 1 : -1);
    });
  }
  const heroFrames = document.querySelector('.hero-frames');
  const heroRail = document.querySelector('.hero-rail');
  let lastExit = -1;
  const holdOn = (el, hover) => {
    if (!el) return;
    if (hover) { el.addEventListener('pointerenter', () => (film.held = true)); el.addEventListener('pointerleave', () => (film.held = false)); }
    el.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) film.held = true; });
    el.addEventListener('focusout', () => (film.held = false));
  };
  framePanels.forEach((fp) => holdOn(fp.el, false));
  holdOn(document.querySelector('.hero-rail'), true);

  // particles (light layer)
  const seeds = new Float32Array(PARTICLES * 3);
  for (let i = 0; i < PARTICLES; i++) seeds.set([Math.random(), Math.random(), 2.2 + Math.random() * 2.2], i * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3));
  // every stream starts on the shape of the element it leaves, so that element breaks up into them
  const ball = () => { const out = new Float32Array(PARTICLES * 3); const v = new THREE.Vector3(); for (let i = 0; i < PARTICLES; i++) v.randomDirection().multiplyScalar(Math.cbrt(Math.random())).toArray(out, i * 3); return out; };
  const source = kind === 'bloom' || kind === 'glass' ? el3d.points(PARTICLES) : kind === 'chip' ? elementPoints('chip', PARTICLES) : ball(); // the scan: a ball of light at its orb
  pg.setAttribute('aA', new THREE.BufferAttribute(source, 3));
  pg.setAttribute('aB', new THREE.BufferAttribute(elementPoints('network', PARTICLES), 3));
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  pg.setAttribute('aOrder', new THREE.BufferAttribute(orderOf(pg.attributes.aB.array), 1));
  const PU = { uMA: { value: new THREE.Matrix4() }, uMB: { value: new THREE.Matrix4() }, uK: { value: 0 }, uTime: U.uTime, uPixel: U.uPixel };
  const particles = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: PU, vertexShader: particleVertex, fragmentShader: particleFragment, transparent: true, depthWrite: false }));
  particles.frustumCulled = false;
  lightScene.add(particles);
  if (kind === 'glass') el3d.onSwap = () => { if (k1 === 0) { pg.attributes.aA.array.set(el3d.points(PARTICLES)); pg.attributes.aA.needsUpdate = true; } };
  // the second stream: from the network down into the galaxy
  const pg2 = new THREE.BufferGeometry();
  pg2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3));
  pg2.setAttribute('aA', new THREE.BufferAttribute(elementPoints('network', PARTICLES), 3));
  pg2.setAttribute('aB', new THREE.BufferAttribute(galaxyPoints(PARTICLES, 911), 3));
  pg2.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  pg2.setAttribute('aOrder', new THREE.BufferAttribute(orderOf(pg2.attributes.aB.array), 1));
  const PU2 = { uMA: { value: new THREE.Matrix4() }, uMB: { value: new THREE.Matrix4() }, uK: { value: 0 }, uTime: U.uTime, uPixel: U.uPixel };
  const particles2 = new THREE.Points(pg2, new THREE.ShaderMaterial({ uniforms: PU2, vertexShader: particleVertex, fragmentShader: particleFragment, transparent: true, depthWrite: false }));
  particles2.frustumCulled = false;
  particles2.visible = false;
  lightScene.add(particles2);

  let W = 1;
  let H = 1;
  let aspect = 1.6;
  const resize = () => {
    W = innerWidth;
    H = innerHeight;
    for (const r of [dark, light]) {
      if (!r) continue;
      r.setPixelRatio(dpr);
      r.setSize(W, H, false);
    }
    camera.aspect = aspect = W / H;
    camera.updateProjectionMatrix();
    F = heroFramings(framing, aspect);
    hud.width = Math.round(W * dpr);
    hud.height = Math.round(H * dpr);
    hudCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  // (pointer effects follow the visitor's own mouse, so they run with reduced motion too)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', (ev) => {
      pointer.tx = (ev.clientX / innerWidth) * 2 - 1;
      pointer.ty = -((ev.clientY / innerHeight) * 2 - 1);
    });
  }

  // screen box -> world placement for the network (fits the box's smaller side)
  const placeInBox = (rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const unit = (2 * HALF_H) / H; // world units per pixel at the element's depth
    return { x: ((2 * cx) / W - 1) * HALF_H * aspect, y: (1 - (2 * cy) / H) * HALF_H, s: (Math.min(rect.width, rect.height) * unit * 0.4) / 2.05 };
  };

  let intro = 0;
  let time = 0;
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const centre = new THREE.Vector3();
  // world point -> screen point, for the annotations
  const shot = { x: 0, y: 0 };
  const project = (v) => { v.project(camera); shot.x = (v.x * 0.5 + 0.5) * W; shot.y = (-v.y * 0.5 + 0.5) * H; return { x: shot.x, y: shot.y }; };
  let hudOn = false;
  const sheets = [...document.querySelectorAll('.content')];

  // the two particle streams: where they are (0..1); each eases towards where the scroll says it should be
  let k1 = 0;
  let k2s = 0;
  let first = true;
  // (the streams play for everyone, including visitors who ask for reduced motion: they are the page's
  // main story and only move when the visitor scrolls)
  const follow = (v, to, dt) => (first || Math.abs(to - v) < 1e-4 ? to : v + (to - v) * (1 - Math.exp(-dt * STREAM_FOLLOW)));
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reduceMotion) time += dt;
    intro = reduceMotion ? 1 : Math.min(1, intro + dt * 0.45);
    const e = ease(intro);
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 7));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 7));
    U.uTime.value = reduceMotion ? 2.4 : time;
    U.uIntro.value = e;
    const t = reduceMotion ? 2.4 : time;
    const drift = reduceMotion ? 0 : Math.sin(time * 0.1) * 0.05;

    // the hero (its element follows the hero scroll)
    const hr = hero.getBoundingClientRect();
    const heroProg = clamp01(-hr.top / Math.max(1, hr.height - H));
    api.progress = heroProg;

    // stream 1 runs while the white sheet rises over the hero (from its first appearance until it covers
    // two thirds of the screen), so the hero's element is still in sight as it breaks up
    const ar = art ? art.getBoundingClientRect() : null;
    const st = sheets[0] ? sheets[0].getBoundingClientRect().top : H;
    // (the glass hero is one screen, so its stream follows how far the page has scrolled)
    k1 = follow(k1, ar && light ? (kind === 'glass' ? clamp01(-hr.top / (H * 0.62)) : clamp01((H * 0.97 - st) / (H * 0.62))) : 0, dt);
    const k = k1;
    const outK = 1 - smooth(0.02, 0.42, k);
    const inK = smooth(0.62, 1, k);

    // the hero's element, framed by the hero scroll; it fades as it breaks up into particles
    const ht = ease(heroProg);
    const p = {};
    for (const key of Object.keys(F.start)) p[key] = mix(F.start[key], F.end[key] ?? F.start[key], ht);
    p.labels = Math.max(0, (ht - 0.55) / 0.45) * (F.end.labels ?? 0);
    if (kind === 'scan') {
      // the particles pour out of the scan's orb, wherever it is on screen
      const o = scanSvg && orbOnScreen(scanSvg);
      if (o) heroRoot.position.set(((2 * o.x) / W - 1) * HALF_H * aspect, (1 - (2 * o.y) / H) * HALF_H, 0);
      heroRoot.rotation.set(0, 0, 0);
      heroRoot.scale.setScalar(0.32);
      heroRoot.updateMatrixWorld();
      PU.uMA.value.copy(heroRoot.matrixWorld);
      heroRoot.visible = false;
    } else if (kind === 'glass') {
      // the glass object places itself along the hero story and changes as it goes
      // the film: glide when asked to, otherwise hold the frame and move on when its time is up (not while
      // held, paused, off screen or breaking up into particles)
      const L = el3d.frames;
      if (film.k < 1) { film.k = Math.min(1, film.k + dt / film.dur); film.f = film.from + (film.to - film.from) * easeFilm(film.k); }
      else if (!film.paused && !film.held && k < 0.001 && hr.bottom > H * 0.5) {
        film.hold += dt;
        if (film.hold >= HOLD[((film.to % L) + L) % L]) filmGo((((film.to % L) + L) % L + 1) % L);
      }
      const onFrame = (((Math.round(film.to) % L) + L) % L);
      if (onFrame !== film.on) { film.on = onFrame; rail.forEach((b, i) => { b.classList.toggle('is-on', i === onFrame); if (i === onFrame) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); }
      if (rail[onFrame]) rail[onFrame].style.setProperty('--prog', (film.k < 1 ? 0 : Math.min(1, film.hold / HOLD[onFrame])).toFixed(3));
      // leaving the hero: as the page scrolls away the words drift up and fade, and the object rises and grows
      // as it breaks up into the particles
      const exit = clamp01(-hr.top / (H * 0.7));
      el3d.update({ f: film.f, t, dt, outK, frozen: k > 0.001, pointer, aspect, halfH: HALF_H, camera, exit });
      // the headline belongs to the first frame
      if (heroA) {
        const d0 = Math.min(el3d.frame, L - el3d.frame), a = 1 - smooth(0.18, 0.5, d0);
        const key = a * 10 + exit;
        if (Math.abs(key - film.heroA) > 0.002) {
          film.heroA = key;
          const o = a * (1 - smooth(0, 0.7, exit));
          heroA.style.opacity = o.toFixed(3);
          heroA.style.visibility = o < 0.01 ? 'hidden' : '';
          heroA.style.transform = `translate3d(0, ${((1 - a) * -40 - exit * 140).toFixed(1)}px, 0)`;
        }
      }
      if (Math.abs(exit - lastExit) > 0.001) {
        lastExit = exit;
        if (heroFrames) { heroFrames.style.opacity = (1 - smooth(0, 0.7, exit)).toFixed(3); heroFrames.style.transform = `translate3d(0, ${(-exit * 120).toFixed(1)}px, 0)`; }
        if (heroRail) heroRail.style.opacity = (1 - smooth(0, 0.4, exit)).toFixed(3);
      }
      host.classList.toggle('is-hover', el3d.hover > 0.5);
      // each service panel shows around its own frame and glides with the scroll (style.css .hero-frame)
      for (const fp of framePanels) {
        let d = el3d.frame - fp.n;
        if (d > L / 2) d -= L;
        if (d < -L / 2) d += L;
        const v = 1 - smooth(0.24, 0.5, Math.abs(d));
        const key = `${v.toFixed(3)}|${d.toFixed(3)}`;
        if (key === fp.key) continue;
        fp.key = key;
        fp.el.style.setProperty('--v', v.toFixed(3));
        fp.el.style.setProperty('--d', Math.max(-0.5, Math.min(0.5, d)).toFixed(3));
        const on = v > 0.01;
        if (on !== fp.on) { fp.on = on; fp.el.classList.toggle('is-on', on); fp.el.setAttribute('aria-hidden', String(!on)); }
      }
      el3d.background(hr.bottom > 0, 0);
      p.labels = el3d.labels;
      heroRoot.visible = outK > 0.01 && hr.bottom > -H;
      heroRoot.updateMatrixWorld();
      PU.uMA.value.copy(heroRoot.matrixWorld); // the first stream pours out of the glass object
    } else {
      heroRoot.position.set(p.x, p.y - (1 - e) * 0.25, 0);
      heroRoot.rotation.set(p.rx - pointer.y * 0.05, p.ry + drift + pointer.x * 0.08, 0);
      heroRoot.scale.setScalar(p.s);
      if (kind === 'bloom') {
        el3d.update({ t, dt, e, p });
        heroRoot.updateMatrixWorld();
        PU.uMA.value.copy(el3d.frame.matrixWorld); // the first stream pours out of the flower
        el3d.fade(outK);
      } else {
        heroRoot.updateMatrixWorld();
        PU.uMA.value.copy(heroRoot.matrixWorld); // the first stream pours out of the chip
        heroRoot.scale.setScalar(p.s * (0.8 + 0.2 * outK));
      }
      heroRoot.visible = outK > 0.01 && hr.bottom > -H;
      if (heroRoot.visible && kind === 'chip') el3d.update({ t, dt, e, p, pointer, camera, W, H });
      heroRoot.updateMatrixWorld();
    }
    const hudAlpha = heroRoot.visible && el3d?.drawHud ? e * outK * (1 - smooth(0.35, 0.8, heroProg) * 0.35) : 0;

    // its labels, if it has any, at the end of the hero
    centre.set(0, 0, 0).applyMatrix4(heroRoot.matrixWorld).project(camera);
    const cx = (centre.x * 0.5 + 0.5) * W;
    const showLabels = k === 0 ? p.labels : 0;
    for (const l of labels) {
      if (showLabels <= 0.001) { if (l.lastOpacity !== '0') l.el.style.opacity = l.lastOpacity = '0'; continue; }
      l.obj.getWorldPosition(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W;
      const y = (-tmp.y * 0.5 + 0.5) * H;
      const side = l.side || (x < cx || x > W - 230 ? 'left' : 'right');
      if (side !== l.lastSide) { if (side === 'left') l.el.dataset.side = 'left'; else delete l.el.dataset.side; l.lastSide = side; }
      const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (transform !== l.lastTransform) l.el.style.transform = l.lastTransform = transform;
      const opacity = (showLabels * (el3d?.lit && l.id !== el3d.lit ? 0.4 : 1)).toFixed(2);
      if (opacity !== l.lastOpacity) l.el.style.opacity = l.lastOpacity = opacity;
    }


    // the galaxy in the dark section before Contact (dark layer), and how far that section has come in
    const gr = galaxySec ? galaxySec.getBoundingClientRect() : null;
    k2s = follow(k2s, gr && light ? clamp01((H * 0.97 - gr.top) / (H * 0.62)) : 0, dt);
    const k2 = k2s;
    first = false;
    const galIn = smooth(0.62, 1, k2);
    if (galaxy) {
      const narrow = aspect < 0.9;
      const unit = (2 * HALF_H) / H;
      const cy = gr.top + gr.height * (narrow ? 0.6 : 0.5);
      galRoot.position.set(narrow ? 0 : HALF_H * aspect * 0.32, (1 - (2 * cy) / H) * HALF_H, 0);
      galRoot.rotation.set(1.05 - pointer.y * 0.06, pointer.x * 0.1, -0.35);
      galRoot.scale.setScalar(((Math.min(gr.height, narrow ? gr.width : gr.height) * unit * 0.4) / 2.4) * (0.85 + 0.15 * galIn));
      galRoot.visible = galIn > 0.01 && gr.bottom > 0 && gr.top < H;
      if (galRoot.visible) { galaxy.update({ t }); galaxy.fade(galIn); }
      galRoot.updateMatrixWorld();
    }

    // the network beside "Who we are", and the particles flying to it (and on from it to the galaxy)
    if (light) {
      const onScreen = ar.bottom > -H * 0.2 && ar.top < H * 1.2;
      const stream1 = k > 0 && k < 1;
      const stream2 = k2 > 0 && k2 < 1;
      const b = placeInBox(ar);
      netRoot.position.set(b.x, b.y, 0);
      netRoot.scale.setScalar(b.s);
      net.update({ t, dt, e, pointer });
      net.fade(inK * (1 - smooth(0.02, 0.42, k2)));
      netRoot.visible = onScreen && inK > 0.01;
      netRoot.updateMatrixWorld();
      PU.uMB.value.copy(net.frame.matrixWorld);
      PU.uK.value = k;
      particles.visible = stream1;
      // the second stream leaves the network; by then it has scrolled away above, so it leaves from
      // where the network would sit at the top of the screen (its particles only show once moving)
      netRoot.position.y = Math.min(b.y, HALF_H * 0.75);
      netRoot.updateMatrixWorld();
      PU2.uMA.value.copy(net.frame.matrixWorld);
      netRoot.position.y = b.y;
      netRoot.updateMatrixWorld();
      if (galaxy) PU2.uMB.value.copy(galaxy.frame.matrixWorld);
      PU2.uK.value = k2;
      particles2.visible = stream2 && !!galaxy;
      if (onScreen || stream1 || stream2) {
        light.render(lightScene, camera);
        lightCanvas.classList.add('is-on');
      } else if (lightCanvas.classList.contains('is-on')) {
        light.clear();
        lightCanvas.classList.remove('is-on');
      }
    }

    // nothing to draw on the dark layer once the white sheet covers the screen
    const covered = sheets.some((el) => { const r = el.getBoundingClientRect(); return r.top <= 0 && r.bottom >= H; });
    if (!covered) dark.render(darkScene, camera);
    // the flower's scan annotations, drawn right after it (their crops are read from the frame)
    if (el3d?.drawHud && (hudAlpha > 0.01 || hudOn)) {
      el3d.drawHud({ ctx: hudCtx, project, W, H, alpha: hudAlpha, t, source: darkCanvas, dpr });
      hudOn = hudAlpha > 0.01;
    }
  }

  const ticker = window.gsap && window.gsap.ticker;
  let running = false;
  let raf = 0;
  const loop = () => { frame(); if (!ticker && running) raf = requestAnimationFrame(loop); };
  const play = () => { if (running) return; running = true; clock.getDelta(); if (ticker) ticker.add(loop); else raf = requestAnimationFrame(loop); };
  const pause = () => { running = false; if (ticker) ticker.remove(loop); else cancelAnimationFrame(raf); };

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  resize();
  // compile every shader now, during the loading screen
  dark.compile(darkScene, camera);
  galRoot.visible = true;
  dark.compile(darkScene, camera);
  if (light) { particles.visible = true; particles2.visible = true; netRoot.visible = true; light.compile(lightScene, camera); }
  frame();
  host.classList.add('is-ready');
  api.ready = true;
  api.host = host;
  emit('earth:progress', 1);
  emit('earth:ready', { ok: true });
  play();
}

function fail() {
  document.documentElement.classList.add('no-webgl');
  emit('earth:progress', 1);
  emit('earth:ready', { ok: false });
}

const host = document.querySelector('[data-stage]');
if (host) init(host);
else emit('earth:ready', { ok: false });
