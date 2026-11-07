// Hamdaz: 3D runtime for each page's element (see heroes/framings.js).
// Builds the element the page asks for (data-element, assets/js/heroes/*.js), then drives it: the renderer,
// the scroll-linked framing, pointer parallax and the floating labels.
// (The file keeps its old name, and the data-earth / .earth hooks, so the rest of the site is unchanged.)
// Three.js r160 (MIT).
import * as THREE from '../vendor/three.module.min.js';
import { heroFramings } from './heroes/framings.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const api = (window.HamdazEarth = window.HamdazEarth || { progress: 0 });
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;

async function init(host) {
  const canvas = host.querySelector('canvas');
  const mode = host.dataset.earth || 'page';
  const name = host.dataset.element || 'chip';
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return fail();

  // Resolution: capped, and lowered automatically if frames run slow (see adapt()).
  const DPR_MAX = Math.min(window.devicePixelRatio || 1, 1.25);
  let dpr = DPR_MAX;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    return fail();
  }
  renderer.setClearColor(0x061423, 1);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 6);

  const U = { uTime: { value: 0 }, uPixel: { value: dpr }, uIntro: { value: 0 } };
  const root = new THREE.Group();
  root.rotation.order = 'XYZ';
  scene.add(root);

  let hero;
  try {
    const mod = await import(`./heroes/${name}.js`);
    hero = await mod.build({ root, scene, camera, renderer, U, host, mode, reduceMotion });
  } catch (e) {
    console.error(e);
    return fail();
  }

  // floating labels, anchored to points the hero provides
  const labels = Object.entries(hero.anchors || {}).map(([id, a]) => ({ ...a, el: host.querySelector(`[data-earth-label="${id}"]`) })).filter((l) => l.el);
  host.querySelectorAll('[data-earth-label]').forEach((el) => { el.style.opacity = '0'; });

  // State
  let F = heroFramings(name, 1.6);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true;
  let running = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const centre = new THREE.Vector3();
  let W = 1;
  let H = 1;
  let prog = api.progress || 0; // smoothed scroll progress, so the camera never steps
  let dirty = true; // forces a redraw (resize, first frame)

  function resize() {
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    U.uPixel.value = dpr;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    F = heroFramings(name, camera.aspect);
    hero.resize?.({ W, H, aspect: camera.aspect });
    dirty = true;
    if (!running) frame();
  }

  // Adaptive resolution: drop pixel ratio on slow devices (only ever steps down).
  let acc = 0;
  let frames = 0;
  let slow = 0;
  function adapt(dt) {
    acc += dt;
    frames++;
    if (acc < 1) return;
    const avg = acc / frames;
    acc = 0;
    frames = 0;
    if (avg > 0.024 && dpr > 0.75) {
      if (++slow >= 2) {
        dpr = Math.max(0.75, dpr - 0.25);
        slow = 0;
        resize();
      }
    } else slow = 0;
  }

  function pose() {
    if (mode !== 'hero') return F.page;
    const t = ease(Math.min(1, Math.max(0, prog)));
    const out = {};
    for (const k of Object.keys(F.start)) out[k] = mix(F.start[k], F.end[k] ?? F.start[k], t);
    out.labels = Math.max(0, (t - 0.55) / 0.45) * (F.end.labels ?? 0);
    out.prog = t;
    out.raw = Math.min(1, Math.max(0, prog)); // linear scroll progress, for heroes that pace their own motion
    return out;
  }

  let intro = mode === 'hero' ? 0 : 0.4;
  let time = 0;
  const damp = (dt, rate) => 1 - Math.exp(-dt * rate);
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const target = api.progress || 0;
    // With reduced motion nothing moves on its own, so skip redraws once the camera has settled.
    if (reduceMotion && running && !dirty && intro >= 1 && Math.abs(target - prog) < 0.0002) return;
    dirty = false;
    if (!reduceMotion) time += dt;
    prog += (target - prog) * (running ? damp(dt, 9) : 1);
    const p = pose();
    intro = reduceMotion ? 1 : Math.min(1, intro + dt * 0.45);
    const e = ease(intro);
    const drift = reduceMotion ? 0 : Math.sin(time * 0.1) * 0.05;

    pointer.x += (pointer.tx - pointer.x) * damp(dt, 3);
    pointer.y += (pointer.ty - pointer.y) * damp(dt, 3);

    root.position.set(p.x, p.y - (1 - e) * 0.25, 0);
    root.scale.setScalar(p.s);
    root.rotation.set(p.rx - pointer.y * 0.05 - (1 - e) * 0.12, p.ry + drift + pointer.x * 0.08, 0);
    camera.position.set(pointer.x * 0.12, pointer.y * 0.08, 6);
    camera.lookAt(0, 0, 0);

    U.uTime.value = reduceMotion ? 2.4 : time;
    U.uIntro.value = e;
    hero.update({ t: reduceMotion ? 2.4 : time, dt, e, p, pointer, camera, W, H });
    root.updateMatrixWorld();

    // labels: on the left of their anchor when it is left of the object, or near the right edge
    centre.set(0, 0, 0).applyMatrix4(root.matrixWorld).project(camera);
    const cx = (centre.x * 0.5 + 0.5) * W;
    for (const l of labels) {
      if (p.labels <= 0.001) {
        if (l.lastOpacity !== '0') l.el.style.opacity = l.lastOpacity = '0';
        continue;
      }
      l.obj.getWorldPosition(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W;
      const y = (-tmp.y * 0.5 + 0.5) * H;
      const side = l.side || (x < cx || x > W - 230 ? 'left' : 'right');
      if (side !== l.lastSide) { if (side === 'left') l.el.dataset.side = 'left'; else delete l.el.dataset.side; l.lastSide = side; }
      const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const opacity = (p.labels * (l.visible ? l.visible() : 1)).toFixed(2);
      if (transform !== l.lastTransform) l.el.style.transform = l.lastTransform = transform;
      if (opacity !== l.lastOpacity) l.el.style.opacity = l.lastOpacity = opacity;
    }

    renderer.render(scene, camera);
    api.drawn = prog; // camera progress actually on screen (used by the smoothness test)
    if (running) adapt(dt);
  }

  // Render in the same tick as GSAP/Lenis when available, so scroll and 3D never drift apart.
  const ticker = window.gsap && window.gsap.ticker;
  const loop = () => {
    frame();
    if (!ticker && running) raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (running) return;
    running = true;
    clock.getDelta();
    if (ticker) ticker.add(loop);
    else raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    if (ticker) ticker.remove(loop);
    else cancelAnimationFrame(raf);
  };

  window.addEventListener('resize', resize);
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : visible && play()));
  // (pointer effects follow the visitor's own mouse, so they run with reduced motion too)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', (ev) => {
      pointer.tx = (ev.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((ev.clientY / window.innerHeight) * 2 - 1);
    });
  }

  resize();
  // Compile every shader now, during the loading screen, instead of mid-scroll
  // (on Windows/Direct3D a first-time compile can freeze the page for over a second).
  root.visible = true;
  renderer.compile(scene, camera);
  frame();
  host.classList.add('is-ready');
  api.ready = true;
  api.host = host;
  api.hero = name;
  emit('earth:progress', 1);
  emit('earth:ready', { ok: true });
  if (visible) play();
}

function fail() {
  document.documentElement.classList.add('no-webgl');
  emit('earth:progress', 1);
  emit('earth:ready', { ok: false });
}

const host = document.querySelector('[data-earth]');
if (host) init(host);
else emit('earth:ready', { ok: false });
