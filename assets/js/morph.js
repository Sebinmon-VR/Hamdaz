// Hamdaz: page-switch transition, drawn as a circuit board.
// Leaving a page, its 3D object (the Earth, the people network, the service blocks or the AI core) and its
// title break into contact pads. Traces route from every pad across the screen, with a signal pulse at
// each head, and the pulses arrive as the pads that form the next page's object and title. The state is
// handed to the next page, so the circuit keeps running through the page load, then melts into the real page.
// Three.js r160 (MIT).
import * as THREE from '../vendor/three.module.min.js';

const N = 2600; // contact pads for the 3D object
const N_TEXT = 4000; // contact pads for the page title
const TOTAL = N + N_TEXT;
const GRID = '0.32'; // circuit routing channels, in world units (GLSL float literal)
const DEG = Math.PI / 180;
const FOV = 35; // same camera as scenes.js
const CAM_Z = 10;
const HALF_H = CAM_Z * Math.tan((FOV / 2) * DEG);
const EARTH_HALF_H = 6 * Math.tan(15 * DEG); // earth.js camera: fov 30, z 6
const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');

// which object each page shows
const PAGE_KIND = { '': 'home', 'index.html': 'home', 'about.html': 'network', 'services.html': 'blocks', 'solutions.html': 'neural', 'contact.html': 'earth', '404.html': 'earth' };
const kindOf = (pathname) => PAGE_KIND[pathname.split('/').pop()] || 'earth';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- shapes, in each object's own units */
const v3 = () => new THREE.Vector3();

function sphereShape() {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    out.push(new THREE.Vector3(Math.cos(golden * i) * r, y, Math.sin(golden * i) * r));
  }
  return out;
}

// same nodes and links as the Who We Are scene (scenes.js, seed 7)
function networkShape() {
  const rand = rng(7);
  const NODES = 150;
  const R = 2.05;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  for (let i = 0; i < NODES; i++) {
    const y = 1 - (i / (NODES - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = R * (0.84 + rand() * 0.3);
    nodes.push(new THREE.Vector3(Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k));
  }
  const pairs = [];
  const seen = new Set();
  nodes.forEach((a, i) => {
    nodes.map((b, j) => [a.distanceToSquared(b), j]).filter(([, j]) => j !== i).sort((p, q) => p[0] - q[0]).slice(0, 3)
      .forEach(([, j]) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) { seen.add(key); pairs.push([i, j]); }
      });
  });
  const pick = rng(21);
  const out = [];
  for (let i = 0; i < N; i++) {
    if (i < NODES * 3) { out.push(nodes[i % NODES].clone()); continue; } // people: three particles each
    const [a, b] = pairs[Math.floor(pick() * pairs.length)];
    out.push(v3().lerpVectors(nodes[a], nodes[b], pick())); // the links between them
  }
  return out;
}

// the 20 service blocks (scenes.js layout) sampled along their glowing edges
function blocksShape(t = 0) {
  const COLS = 5;
  const ROWS = 4;
  const GAP = 0.92;
  const FOOT = 0.7;
  const pick = rng(5);
  const boxes = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const h = 0.32 + 0.95 * (0.5 + 0.5 * Math.sin(t * 0.9 + c * 0.75 + r * 1.15));
    boxes.push({ x: (c - (COLS - 1) / 2) * GAP, z: (r - (ROWS - 1) / 2) * GAP, h });
  }
  const out = [];
  for (let i = 0; i < N; i++) {
    const b = boxes[i % boxes.length];
    const hw = FOOT / 2;
    // one of the 12 edges of the box
    const e = Math.floor(pick() * 12);
    const u = pick() * 2 - 1;
    const sx = e & 1 ? 1 : -1;
    const sy = e & 2 ? 1 : -1;
    let p;
    if (e < 4) p = new THREE.Vector3(u * hw, b.h / 2 + (sy * b.h) / 2, sx * hw); // along x
    else if (e < 8) p = new THREE.Vector3(sx * hw, b.h / 2 + (sy * b.h) / 2, u * hw); // along z
    else p = new THREE.Vector3(sx * hw, b.h / 2 + (u * b.h) / 2, sy * hw); // vertical
    out.push(p.add(new THREE.Vector3(b.x, 0, b.z)));
  }
  return out;
}

// the AI core (scenes.js): two icosahedron wireframes
function neuralShape() {
  const pick = rng(9);
  const edgesOf = (r, detail) => {
    const g = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r, detail));
    const p = g.getAttribute('position');
    const list = [];
    for (let i = 0; i < p.count; i += 2) list.push([new THREE.Vector3().fromBufferAttribute(p, i), new THREE.Vector3().fromBufferAttribute(p, i + 1)]);
    return list;
  };
  const outer = edgesOf(1.15, 1);
  const inner = edgesOf(0.62, 0);
  const out = [];
  for (let i = 0; i < N; i++) {
    const list = i % 5 === 0 ? inner : outer;
    const [a, b] = list[Math.floor(pick() * list.length)];
    out.push(v3().lerpVectors(a, b, pick()));
  }
  return out;
}

const cache = {};
const shape = (kind, t) => {
  if (kind === 'blocks' && t) return blocksShape(t);
  if (!cache[kind]) {
    cache[kind] = kind === 'network' ? networkShape() : kind === 'blocks' ? blocksShape(0) : kind === 'neural' ? neuralShape() : sphereShape();
  }
  return cache[kind];
};

/* ---------------------------------------------------------------- where each page shows its object */
// Placement of a page's object when the page is at the top, in that page's camera units
// (mirrors earth.js presets() and the scenes.js place() functions).
function targetPlacement(kind, aspect) {
  const narrow = aspect < 0.9;
  if (kind === 'home' || kind === 'earth') {
    const halfH = EARTH_HALF_H;
    const halfW = halfH * aspect;
    if (kind === 'home') {
      const limbR = narrow ? halfW * 1.9 : Math.max(2.7, halfW * 1.08);
      return { cam: halfH, x: 0, y: (narrow ? 0.05 : 0.2) - limbR, s: limbR, rx: 0, ry: 0 };
    }
    return narrow ? { cam: halfH, x: 0.35, y: -halfH * 0.95, s: 1.25, rx: 0, ry: 0 } : { cam: halfH, x: halfW * 0.62, y: -0.15, s: 1.35, rx: 0, ry: 0 };
  }
  const halfW = HALF_H * aspect;
  if (kind === 'network') return narrow ? { cam: HALF_H, x: 0, y: HALF_H * 0.36, s: 0.74, rx: 0.28, ry: 0 } : { cam: HALF_H, x: halfW * 0.52, y: 0.25, s: 0.9, rx: 0.28, ry: 0 };
  if (kind === 'blocks') return narrow ? { cam: HALF_H, x: 0, y: HALF_H * 0.4, s: 0.4, rx: 0.58, ry: -0.72 } : { cam: HALF_H, x: halfW * 0.5, y: 0.05, s: 0.74, rx: 0.58, ry: -0.72 };
  return narrow ? { cam: HALF_H, x: 0, y: HALF_H * 0.38, s: 0.72, rx: 0, ry: 0 } : { cam: HALF_H, x: halfW * 0.5, y: 0.55, s: 1, rx: 0, ry: 0 };
}

// A placement inside a canvas (rect on screen, camera half-height) converted to this overlay's world units.
function toOverlay(p, rect, camHalfH) {
  const aspect = rect.width / rect.height;
  const ndcX = p.x / (camHalfH * aspect);
  const ndcY = p.y / camHalfH;
  const px = rect.left + ((ndcX + 1) / 2) * rect.width;
  const py = rect.top + ((1 - ndcY) / 2) * rect.height;
  const vw = innerWidth;
  const vh = innerHeight;
  return {
    x: ((px / vw) * 2 - 1) * HALF_H * (vw / vh),
    y: (1 - (py / vh) * 2) * HALF_H,
    s: p.s * (rect.height / vh) * (HALF_H / camHalfH),
    rx: p.rx || 0,
    ry: p.ry || 0,
  };
}

const viewport = () => ({ left: 0, top: 0, width: innerWidth, height: innerHeight, bottom: innerHeight });

function place(points, pl, out) {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pl.rx, pl.ry, 0));
  const v = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    v.copy(points[i]).applyMatrix4(m).multiplyScalar(pl.s);
    out[i * 3] = v.x + pl.x;
    out[i * 3 + 1] = v.y + pl.y;
    out[i * 3 + 2] = v.z;
  }
  return out;
}

// screen pixel -> overlay world units (on the z = 0 plane)
const pxToWorld = (px, py) => [((px / innerWidth) * 2 - 1) * HALF_H * (innerWidth / innerHeight), (1 - (py / innerHeight) * 2) * HALF_H];

// a tight cloud of particles at a screen point (used when there is nothing on screen to dissolve)
function burst(out, offset, count, at) {
  const [bx, by] = at ? pxToWorld(at.x, at.y) : pxToWorld(innerWidth / 2, innerHeight / 2);
  const pick = rng(3 + offset);
  for (let i = 0; i < count; i++) {
    const k = (offset + i) * 3;
    out[k] = bx + (pick() - 0.5) * 0.3;
    out[k + 1] = by + (pick() - 0.5) * 0.3;
    out[k + 2] = (pick() - 0.5) * 0.3;
  }
}

/* ---- the page title, as particles ---- */
// The hero title of this page, if it is on screen and visible.
function titleEl() {
  const el = document.querySelector('.hero h1[data-split], .page-hero h1[data-split]');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return null;
  const faded = el.closest('[data-hero-a]');
  if (faded && Number(getComputedStyle(faded).opacity) < 0.4) return null; // home title already scrolled away
  return el;
}

// Draws the title's words (as laid out on the page) onto a small canvas and samples the ink into particles.
// every word of an element with its on-screen box and style (works whether or not main.js split it)
function wordBoxes(el) {
  const out = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const re = /\S+/g;
    let m;
    while ((m = re.exec(node.textContent))) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getBoundingClientRect();
      if (r.width) out.push({ text: m[0], r, cs: getComputedStyle(node.parentElement) });
    }
  }
  return out;
}

function textPoints(el, out, offset, count) {
  const words = wordBoxes(el);
  if (!words.length) return false;
  // only the title's own box is drawn and sampled (fast)
  const bx = Math.floor(Math.min(...words.map((w) => w.r.left))) - 8;
  const by = Math.floor(Math.min(...words.map((w) => w.r.top))) - 8;
  const bw = Math.ceil(Math.max(...words.map((w) => w.r.right))) + 8 - bx;
  const bh = Math.ceil(Math.max(...words.map((w) => w.r.bottom))) + 8 - by;
  const S = 0.5; // sample at half resolution
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.ceil(bw * S));
  cv.height = Math.max(1, Math.ceil(bh * S));
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  for (const { text: raw, r, cs } of words) {
    const text = cs.textTransform === 'uppercase' ? raw.toUpperCase() : raw;
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    const m = ctx.measureText(text);
    if (!m.width) continue;
    // stretch to the word's real width, centre on its real line box
    ctx.save();
    ctx.scale(S, S);
    ctx.translate(r.left - bx, r.top - by + r.height / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    ctx.scale(r.width / m.width, 1);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  const { data, width, height } = ctx.getImageData(0, 0, cv.width, cv.height);
  const ink = [];
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) if (data[(y * width + x) * 4 + 3] > 120) ink.push(x, y);
  const total = ink.length / 2;
  if (!total) return false;
  const pick = rng(17);
  for (let i = 0; i < count; i++) {
    const j = Math.floor(pick() * total) * 2;
    const [wx, wy] = pxToWorld(bx + (ink[j] + pick()) / S, by + (ink[j + 1] + pick()) / S);
    const k = (offset + i) * 3;
    out[k] = wx;
    out[k + 1] = wy;
    out[k + 2] = 0;
  }
  return true;
}

// The object currently on screen (or a burst from the pointer if it has scrolled away), plus the title.
function sourcePoints(burstAt) {
  const sceneApi = window.HamdazScene;
  const earthApi = window.HamdazEarth;
  const live = sceneApi?.live ? { kind: sceneApi.kind, host: sceneApi.host, cam: HALF_H, ...sceneApi.live() } : earthApi?.live ? { kind: 'earth', host: earthApi.host, cam: EARTH_HALF_H, ...earthApi.live() } : null;
  const out = new Float32Array(TOTAL * 3);
  const rect = live?.host?.getBoundingClientRect();
  if (live && rect && rect.bottom > innerHeight * 0.25 && rect.top < innerHeight * 0.75) place(shape(live.kind, live.t), toOverlay(live, rect, live.cam), out);
  else burst(out, 0, N, burstAt);
  const title = titleEl();
  if (!(title && textPoints(title, out, N, N_TEXT))) burst(out, N, N_TEXT, burstAt);
  return { points: out, title };
}

// The next page's object; its title particles are filled in on arrival, once that page has laid it out.
function targetPoints(kind, holdText) {
  const p = targetPlacement(kind, innerWidth / innerHeight);
  const out = new Float32Array(TOTAL * 3);
  place(shape(kind), toOverlay(p, viewport(), p.cam), out);
  if (holdText) out.set(holdText.subarray(N * 3), N * 3);
  return out;
}

/* ---------------------------------------------------------------- overlay renderer */
let gl = null;
function setup() {
  if (gl) return gl;
  const canvas = document.createElement('canvas');
  canvas.className = 'morph';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    canvas.remove();
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  // Circuit look: every point is a contact pad. Leaving, a trace runs from each pad along a circuit
  // route (across to a routing channel, along it, then across to the target) with a bright signal
  // pulse at its head; the pulses arrive as the pads that form the next page's object and title.
  const rand = rng(13);
  const delay = new Float32Array(TOTAL);
  const split = new Float32Array(TOTAL);
  const color = new Float32Array(TOTAL * 3);
  const isText = new Float32Array(TOTAL);
  const TEXT = new THREE.Color('#eef6fb');
  for (let i = 0; i < TOTAL; i++) {
    const text = i >= N;
    isText[i] = text ? 1 : 0;
    delay[i] = rand();
    split[i] = 0.12 + rand() * 0.76; // where along the way the trace turns into its channel
    (text ? (rand() < 0.15 ? CYAN : TEXT) : rand() < 0.2 ? PINK : CYAN).toArray(color, i * 3);
  }
  const from = new THREE.InstancedBufferAttribute(new Float32Array(TOTAL * 3), 3);
  const to = new THREE.InstancedBufferAttribute(new Float32Array(TOTAL * 3), 3);
  const perTrace = {
    aFrom: from,
    aTo: to,
    aDelay: new THREE.InstancedBufferAttribute(delay, 1),
    aSplit: new THREE.InstancedBufferAttribute(split, 1),
    aColor: new THREE.InstancedBufferAttribute(color, 3),
    aText: new THREE.InstancedBufferAttribute(isText, 1),
  };
  const uniforms = { uMix: { value: 0 }, uAlpha: { value: 1 }, uPixel: { value: dpr } };

  // shared GLSL: the route of each trace and how far its signal has travelled
  const ROUTE = /* glsl */ `
    attribute vec3 aFrom;
    attribute vec3 aTo;
    attribute float aDelay;
    attribute float aSplit;
    attribute vec3 aColor;
    attribute float aText;
    uniform float uMix;
    uniform float uPixel;
    float headOf() {
      float t = clamp((uMix - aDelay * 0.45) / 0.55, 0.0, 1.0);
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }
    // across to a routing channel (snapped to a ${GRID} grid), along the channel, across to the target
    void route(out vec3 p0, out vec3 p1, out vec3 p2, out vec3 p3) {
      p0 = aFrom;
      p3 = aTo;
      float x = floor(mix(aFrom.x, aTo.x, aSplit) / ${GRID} + 0.5) * ${GRID};
      p1 = vec3(x, aFrom.y, mix(aFrom.z, aTo.z, 0.33));
      p2 = vec3(x, aTo.y, mix(aFrom.z, aTo.z, 0.66));
    }
    vec3 along(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float f) {
      float l1 = length(p1 - p0);
      float l2 = length(p2 - p1);
      float l3 = length(p3 - p2);
      float s = f * (l1 + l2 + l3);
      if (s <= l1) return mix(p0, p1, l1 > 0.0 ? s / l1 : 1.0);
      s -= l1;
      if (s <= l2) return mix(p1, p2, l2 > 0.0 ? s / l2 : 1.0);
      s -= l2;
      return mix(p2, p3, l3 > 0.0 ? s / l3 : 1.0);
    }`;

  // the traces: 3 segments each, drawn up to the signal's head
  const traceGeo = new THREE.InstancedBufferGeometry();
  traceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
  traceGeo.setAttribute('aCorner', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 2, 2, 3]), 1));
  Object.entries(perTrace).forEach(([k, a]) => traceGeo.setAttribute(k, a));
  traceGeo.instanceCount = TOTAL;
  const traces = new THREE.LineSegments(
    traceGeo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        ${ROUTE}
        attribute float aCorner;
        varying float vF;
        varying float vHead;
        varying vec3 vColor;
        varying float vText;
        void main() {
          vec3 p0, p1, p2, p3;
          route(p0, p1, p2, p3);
          float l1 = length(p1 - p0);
          float l2 = length(p2 - p1);
          float L = max(l1 + l2 + length(p3 - p2), 1e-5);
          vec3 p = aCorner < 0.5 ? p0 : aCorner < 1.5 ? p1 : aCorner < 2.5 ? p2 : p3;
          vF = aCorner < 0.5 ? 0.0 : aCorner < 1.5 ? l1 / L : aCorner < 2.5 ? (l1 + l2) / L : 1.0;
          vHead = headOf();
          vColor = aColor;
          vText = aText;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        varying float vF;
        varying float vHead;
        varying vec3 vColor;
        varying float vText;
        void main() {
          if (vF > vHead) discard;
          // bright just behind the signal, a faint trace left on the board, gone once it lands
          float a = 0.16 + 0.84 * smoothstep(vHead - 0.22, vHead, vF);
          a *= 1.0 - smoothstep(0.78, 1.0, vHead);
          gl_FragColor = vec4(vColor, a * uAlpha * mix(0.6, 0.32, vText));
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  traces.frustumCulled = false;

  // the signal pulses: contact pads at the start, travelling heads, then the pads of the new shape
  const headGeo = new THREE.InstancedBufferGeometry();
  headGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
  Object.entries(perTrace).forEach(([k, a]) => headGeo.setAttribute(k, a));
  headGeo.instanceCount = TOTAL;
  const heads = new THREE.Points(
    headGeo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        ${ROUTE}
        varying vec3 vColor;
        varying float vGlow;
        varying float vFade;
        void main() {
          vec3 p0, p1, p2, p3;
          route(p0, p1, p2, p3);
          float h = headOf();
          vec4 mv = modelViewMatrix * vec4(along(p0, p1, p2, p3, h), 1.0);
          gl_Position = projectionMatrix * mv;
          float moving = sin(h * 3.14159); // brightest and largest mid-flight
          float size = mix(2.5 + 2.2 * moving, 1.9 + 1.2 * moving, aText);
          gl_PointSize = size * uPixel * (${CAM_Z.toFixed(1)} / max(0.5, -mv.z));
          vColor = mix(aColor, vec3(1.0), 0.45 * moving);
          vGlow = moving;
          vFade = smoothstep(${(CAM_Z + 7).toFixed(1)}, ${(CAM_Z - 3).toFixed(1)}, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        varying vec3 vColor;
        varying float vGlow;
        varying float vFade;
        void main() {
          // square-ish pads at rest, round glowing pulses while moving
          vec2 c = abs(gl_PointCoord - 0.5);
          float pad = 1.0 - smoothstep(0.32, 0.48, max(c.x, c.y));
          float dot = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
          float a = mix(pad, dot * dot, vGlow);
          gl_FragColor = vec4(vColor, a * vFade * uAlpha);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  heads.frustumCulled = false;
  scene.add(traces, heads);

  const size = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  size();
  window.addEventListener('resize', size);
  renderer.compile(scene, camera);
  const render = () => renderer.render(scene, camera);
  gl = { canvas, from, to, uniforms, render };
  return gl;
}


/* ---------------------------------------------------------------- the morph, carried across the page load */
// Progress is based on the clock, so the next page continues from exactly where this one was.
const MORPH_MS = 1600;
const KEY = 'hz-morph-state';
const clockNow = () => Date.now();

// Float32Array <-> base64, to hand the starting shape to the next page
const pack = (arr) => {
  const bytes = new Uint8Array(arr.buffer);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const unpack = (b64) => {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return new Float32Array(bytes.buffer);
};

let loop = 0;
function animate(start, onDone) {
  const id = ++loop;
  const tick = () => {
    if (id !== loop) return;
    const k = Math.min(1, (clockNow() - start) / MORPH_MS);
    gl.uniforms.uMix.value = k;
    gl.render();
    if (k < 1) requestAnimationFrame(tick);
    else if (onDone) onDone();
  };
  tick();
}

function fadeOut(ms) {
  const id = ++loop;
  const t0 = performance.now();
  const tick = (t) => {
    if (id !== loop) return;
    const k = Math.min(1, (t - t0) / ms);
    gl.uniforms.uAlpha.value = 1 - k * k;
    gl.render();
    if (k < 1) requestAnimationFrame(tick);
    else gl.canvas.classList.remove('is-on');
  };
  requestAnimationFrame(tick);
}

// resolves once the page's real 3D object has drawn its first frame
function whenReady() {
  return new Promise((resolve) => {
    const host = document.querySelector('[data-earth], [data-scene]');
    if (!host || host.classList.contains('is-ready')) return resolve();
    window.addEventListener('earth:ready', () => resolve(), { once: true });
    window.addEventListener('scene:ready', () => resolve(), { once: true });
    setTimeout(resolve, 1500);
  });
}

// Leaving: the object and title on screen turn into contact pads, held still. All the motion happens on
// the next page, so it never starts and stops across the page load.
function leave(url, burstAt) {
  if (!setup()) return false;
  const kind = kindOf(new URL(url, location.href).pathname);
  const { points: from, title } = sourcePoints(burstAt);
  gl.from.array.set(from);
  gl.to.array.set(targetPoints(kind, from)); // title pads hold until the next page knows its title
  gl.from.needsUpdate = true;
  gl.to.needsUpdate = true;
  gl.uniforms.uAlpha.value = 1;
  gl.uniforms.uMix.value = 0;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ from: pack(from), kind, w: innerWidth, h: innerHeight }));
  } catch (e) {
    return false;
  }
  // swap the real object and the title for their pads in the same frame
  document.querySelectorAll('.earth').forEach((el) => { el.style.transition = 'none'; el.style.opacity = '0'; });
  if (title) { title.style.transition = 'none'; title.style.opacity = '0'; }
  loop++;
  gl.render();
  gl.canvas.classList.add('is-on');
  return true;
}

const nextFrames = (n, fn) => (n > 0 ? requestAnimationFrame(() => nextFrames(n - 1, fn)) : fn());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Arriving: the pads appear exactly as the last page left them, then the circuit runs (once the
// browser's page transition is under way), lands as this page's object and title, and melts into them.
function arrive() {
  let state = null;
  try {
    state = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    sessionStorage.removeItem(KEY);
  } catch (e) { /* storage blocked */ }
  const finish = () => document.documentElement.classList.remove('morphing');
  if (!state || !setup()) return finish();
  const kind = kindOf(location.pathname);
  const same = state.kind === kind && state.w === innerWidth && state.h === innerHeight;
  const from = same ? unpack(state.from) : null;
  const to = targetPoints(kind, from);
  gl.from.array.set(from || to);
  gl.to.array.set(to);
  gl.from.needsUpdate = true;
  gl.to.needsUpdate = true;
  gl.uniforms.uAlpha.value = 1;
  gl.uniforms.uMix.value = same ? 0 : 1;
  gl.render(); // first paint shows the pads where the previous page left them
  gl.canvas.classList.add('is-on');

  // this page's title, as pads: the old title's pads route into it
  const title = document.querySelector('.hero h1[data-split], .page-hero h1[data-split]');
  const aimText = () => {
    if (!title || !textPoints(title, gl.to.array, N, N_TEXT)) {
      // no title to form: the title pads join the 3D object instead
      for (let i = 0; i < N_TEXT * 3; i++) gl.to.array[N * 3 + i] = gl.to.array[i % (N * 3)];
    }
    if (!from) gl.from.array.set(gl.to.array.subarray(N * 3), N * 3);
    gl.to.needsUpdate = true;
    gl.from.needsUpdate = true;
    gl.render();
  };
  const textReady = document.fonts && document.fonts.status !== 'loaded' ? Promise.race([document.fonts.ready, wait(400)]).then(aimText) : Promise.resolve(aimText());

  // start once the page transition has begun and its heavy first frames are past
  const transitionReady = new Promise((resolve) => {
    window.addEventListener('pagereveal', (e) => {
      if (e.viewTransition) e.viewTransition.ready.then(resolve, resolve);
      else resolve();
    }, { once: true });
    setTimeout(resolve, 700);
  });
  let started = false;
  Promise.all([textReady, transitionReady]).then(() => nextFrames(3, () => {
    if (started) return;
    started = true;
    animate(clockNow() - (same ? 0 : MORPH_MS), () => {
      // pads have landed: now the page may build its real 3D object (earth.js / scenes.js wait for this)
      window.__hzSettled = true;
      window.dispatchEvent(new Event('hz:morph-settle'));
      whenReady().then(() => {
        finish(); // the real object and title fade in (CSS) while the pads fade out
        fadeOut(900);
      });
    });
  }));
}

window.HamdazMorph = { leave };
if (document.documentElement.classList.contains('morphing')) arrive();
// otherwise warm up the renderer when idle, so the first click never stalls on shader compiling
else (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => setup());
window.addEventListener('pageshow', (e) => {
  if (!e.persisted || !gl) return;
  loop++;
  gl.canvas.classList.remove('is-on');
  document.querySelectorAll('.earth, .hero h1[data-split], .page-hero h1[data-split]').forEach((el) => { el.style.opacity = ''; el.style.transition = ''; });
});
