// Home page pictures (the managed services panel and the AI products for each industry), built like the hero:
// a small object for each card standing on a dark honeycomb floor, with rings of light rippling out through the
// tiles, data rising off the object and fine dust in the air. Each element with data-card3d="<kind>" gets one.
// The four parallax movements work together:
//   tilt      the view swings round the object after the pointer
//   scroll    the object rises as the card passes up the screen
//   focus     on hover the floor dims back and the object steps forward
//   break-out on hover the object rises out over the top edge of the card
// and on hover the tiles under the pointer light up, with small rings spreading from it. On touch screens the
// hover follows how near the card is to the middle of the screen.
// One WebGL canvas draws every card (a fixed layer over the page, cut to each card), so the cards cost one
// context. Each card's scene is only built as it comes near the screen. Without WebGL the photo stays.
// The options page it came from is docs/card-circuit.html.
import * as THREE from '../vendor/three.module.min.js';
import { rng } from './circuit.js';

const CYAN = new THREE.Color('#30c1f8'), PINK = new THREE.Color('#eb4b96'), BODY = 0x0a1b2c;
const U = { uTime: { value: 0 }, uPixel: { value: 1 } };
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const pointsGeo = (pos, sz, col) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.Float32BufferAttribute(sz, 1)); g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 4)); return g; };

/* ------------------------------------------------------------------ the floor under each object */
// a honeycomb of dark tiles, a few lit, with two rings of light rippling out through it from the object;
// the tiles near the pointer light up (not dimmed by the focus) and small rings spread from it
function makeFloor(uOp) {
  const grp = new THREE.Group();
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false }));
  spill.rotation.x = -Math.PI / 2; grp.add(spill);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uOp, uMouse: { value: new THREE.Vector2(9, 9) }, uMH: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime, uOp, uMH; uniform vec2 uMouse; varying vec2 vP;
      const vec3 cyan = vec3(0.19, 0.76, 0.97), pink = vec3(0.92, 0.29, 0.59);
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec4 hexCell(vec2 p) { vec2 r = vec2(1.0, 1.7320508), h = r * 0.5; vec2 a = mod(p, r) - h, b = mod(p - h, r) - h; vec2 g = dot(a, a) < dot(b, b) ? a : b; return vec4(g, p - g); }
      void main() {
        float r = length(vP), f = 1.0 - smoothstep(0.7, 3.1, r); f *= f * uOp;
        vec4 h = hexCell(vP / 0.26);
        float hx = max(abs(h.x) * 0.866 + abs(h.y) * 0.5, abs(h.y));
        float edge = 1.0 - smoothstep(0.36, 0.40, hx), rim = smoothstep(0.30, 0.37, hx) * edge;
        vec2 c = h.zw * 0.26; float id = hash(floor(h.zw * 2.0 + 0.5)), cr = length(c);
        float lit = pow(0.5 + 0.5 * sin(uTime * (0.5 + id * 1.2) + id * 30.0), 28.0);
        float k1 = fract(uTime * 0.2) * 4.2, k2 = fract(uTime * 0.2 + 0.5) * 4.2;
        float wave = (exp(-pow((cr - k1) * 3.2, 2.0)) + exp(-pow((cr - k2) * 3.2, 2.0))) * (1.0 - smoothstep(0.4, 3.6, cr) * 0.7);
        float ring = exp(-pow((r - k1) * 16.0, 2.0)) + exp(-pow((r - k2) * 16.0, 2.0));
        vec3 col = edge * (vec3(0.025, 0.06, 0.09) + mix(cyan, pink, step(0.94, id)) * lit * 0.28 + cyan * wave * 0.5) + cyan * ring * 0.09 + cyan * exp(-r * r * 1.6) * 0.1;
        float g = 1.0 - smoothstep(0.7, 3.4, r); g *= g;
        float md = length(c - uMouse), near = uMH * (1.0 - smoothstep(0.0, 0.8, md));
        float mk = fract(uTime * 0.9), mr = uMH * exp(-pow((length(vP - uMouse) - mk * 1.1) * 18.0, 2.0)) * (1.0 - mk);
        vec3 hov = edge * cyan * near * near * 0.9 + rim * cyan * near * 1.2 + cyan * mr * 0.55;
        gl_FragColor = vec4(col * f + hov * g, 1.0);
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), mat); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.002; grp.add(floor);
  return { grp, spill, mat };
}

/* ------------------------------------------------------------------ object parts (dark bodies, glowing edges, lit faces) */
const body = () => new THREE.MeshBasicMaterial({ color: BODY, transparent: true });
const edgeMat = (op = 0.9, c = CYAN) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
const solid = (geo, g, edges = true, thr = 25) => { const m = new THREE.Mesh(geo, body()); g.add(m); if (edges) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, thr), edgeMat())); return m; };
const face = (w, h, frag) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uAspect: { value: w / h } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uTime, uAspect; varying vec2 vUv;
    const vec3 cyan = vec3(0.19, 0.76, 0.97), pink = vec3(0.92, 0.29, 0.59);
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() { vec3 col = vec3(0.0); ${frag} gl_FragColor = vec4(col, 1.0); }`,
}));
const glowLine = (pts, c = CYAN, op = 0.9) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat(op, c));
const pins = (g, half, n, gap, len = 0.13) => {
  const pin = new THREE.InstancedMesh(new THREE.BoxGeometry(len, 0.014, 0.03), new THREE.MeshBasicMaterial({ color: 0x8fd3f0, transparent: true }), n * 4);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1); let i = 0;
  for (const a of [0, Math.PI, -Math.PI / 2, Math.PI / 2]) { q.setFromAxisAngle(up, a); for (let k = 0; k < n; k++) pin.setMatrixAt(i++, m.compose(new THREE.Vector3(half + len / 2, 0.007, (k - (n - 1) / 2) * gap).applyQuaternion(q), q, one)); }
  g.add(pin);
};
const gearShape = (r, teeth, depth = 0.06, hole = 0.3) => {
  const s = new THREE.Shape(), n = teeth * 4;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = i % 4, rr = k === 1 || k === 2 ? r : r - depth; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
  s.closePath(); const h = new THREE.Path(); h.absarc(0, 0, r * hole, 0, Math.PI * 2, true); s.holes.push(h); return s;
};
const dotSet = (n, color = 0xc8f2ff, r = 0.022) => { const grp = new THREE.Group(), geo = new THREE.SphereGeometry(r, 12, 8), mat = new THREE.MeshBasicMaterial({ color });
  const glowM = new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < n; i++) { const d = new THREE.Group(); d.add(new THREE.Mesh(geo, mat)); const sp = new THREE.Sprite(glowM); sp.scale.setScalar(r * 9); d.add(sp); grp.add(d); }
  grp.place = (pts) => grp.children.forEach((d, i) => { if (pts[i]) { d.visible = true; d.position.copy(pts[i]); } else d.visible = false; }); return grp; };
const ringPts = (r, n = 48, y = 0) => Array.from({ length: n + 1 }, (_, i) => new THREE.Vector3(Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r));

/* ------------------------------------------------------------------ one object per card */
const BUILD = {
  // Generative AI: the hero's processor (compute cells round a glowing core)
  core() {
    const g = new THREE.Group(), H = 0.19;
    solid(new THREE.BoxGeometry(0.86, 0.14, 0.86).translate(0, 0.12, 0), g);
    const top = face(0.8, 0.8, `
      vec2 c = vUv - 0.5; float box = max(abs(c.x), abs(c.y)); col = vec3(0.03, 0.08, 0.14);
      vec2 gg = vUv * 8.0, id = floor(gg), f = fract(gg);
      float cell = smoothstep(0.1, 0.16, f.x) * smoothstep(0.9, 0.84, f.x) * smoothstep(0.1, 0.16, f.y) * smoothstep(0.9, 0.84, f.y);
      float h = hash(id), act = pow(0.5 + 0.5 * sin(uTime * (0.7 + h * 1.8) + h * 40.0), 10.0);
      col += cell * step(0.25, box) * (0.14 + act * 0.85) * mix(cyan, pink, step(0.82, h));
      float core = 1.0 - smoothstep(0.235, 0.24, box), beat = 0.5 + 0.5 * sin(uTime * 2.1);
      col += core * mix(vec3(0.03, 0.17, 0.27), vec3(0.06, 0.32, 0.48), 1.0 - box / 0.24) * (0.8 + 0.25 * beat);
      float r = length(c); col += core * cyan * (exp(-r * r * 260.0) * (1.2 + 0.5 * beat) + exp(-pow((r - 0.06 - beat * 0.1) * 60.0, 2.0)) * 0.5);
      col += cyan * (smoothstep(0.228, 0.236, box) - smoothstep(0.24, 0.248, box)) * 1.4;
      float sd = (vUv.x + vUv.y) * 0.5 - fract(uTime * 0.16) * 1.4 + 0.2; col += cyan * exp(-sd * sd * 1400.0) * 0.45;
      col += cyan * smoothstep(0.47, 0.5, box) * 0.7;`);
    top.material.blending = THREE.NormalBlending; top.material.depthWrite = true; top.rotation.x = -Math.PI / 2; top.position.y = H + 0.001; g.add(top);
    pins(g, 0.43, 10, 0.075, 0.1);
    return { g, base: H, spread: 0.42, h: 0.3 };
  },
  // Data analytics: five bars breathing, a trend line over their tops, and its forecast on past the last bar
  bars() {
    const g = new THREE.Group(), N = 5, base = [0.28, 0.42, 0.36, 0.58, 0.76], xs = [], bars = [];
    for (let i = 0; i < N; i++) {
      const x = -0.36 + i * 0.18; xs.push(x);
      const b = new THREE.Group(); b.position.set(x, 0.05, 0.05);
      solid(new THREE.BoxGeometry(0.12, 1, 0.12).translate(0, 0.5, 0), b);
      const cap = face(0.11, 0.11, `float d = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); col = cyan * (0.5 + 0.5 * smoothstep(0.5, 0.0, d)) * ${i === N - 1 ? '1.4' : '0.8'};`);
      cap.rotation.x = -Math.PI / 2; cap.position.y = 1.001; b.add(cap);
      g.add(b); bars.push(b);
    }
    const trendGeo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: N }, () => new THREE.Vector3()));
    const trend = new THREE.Line(trendGeo, edgeMat(1)); g.add(trend);
    const fcGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const fc = new THREE.Line(fcGeo, edgeMat(0.95, PINK)); g.add(fc);
    const dots = dotSet(N + 1); g.add(dots);
    const anim = (t) => {
      const tops = [];
      bars.forEach((b, i) => { const hgt = base[i] * (0.86 + 0.14 * Math.sin(t * 0.9 + i * 1.3)); b.scale.y = hgt; tops.push(new THREE.Vector3(xs[i], 0.05 + hgt + 0.03, 0.05)); });
      trendGeo.setFromPoints(tops);
      const last = tops[N - 1], prev = tops[N - 2], next = new THREE.Vector3(last.x + 0.2, last.y + (last.y - prev.y) * 0.9 + 0.06, 0.05);
      fcGeo.setFromPoints([last, next]);
      dots.place([...tops, next]); dots.children[N].children[0].material = dots.pinkMat || (dots.pinkMat = new THREE.MeshBasicMaterial({ color: PINK }));
    };
    return { g, base: 0.9, spread: 0.3, h: 0.95, anim };
  },
  // Automation: three gears turning each other
  gears() {
    const g = new THREE.Group();
    const mk = (r, teeth, x, y, z) => {
      const holder = new THREE.Group(); holder.position.set(x, y, z);
      const spin = new THREE.Group(); holder.add(spin);
      solid(new THREE.ExtrudeGeometry(gearShape(r, teeth), { depth: 0.08, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, -0.04), spin, true, 30);
      const ring = glowLine(ringPts(r * 0.55, 40).map((v) => new THREE.Vector3(v.x, v.z, 0.042)), CYAN, 0.55); spin.add(ring);
      const hub = new THREE.Mesh(new THREE.CircleGeometry(r * 0.3, 24), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })); hub.position.z = 0.043; spin.add(hub);
      g.add(holder); return spin;
    };
    const R1 = 0.34, R2 = 0.21, R3 = 0.17, T1 = 16, T2 = 10, T3 = 8;
    const a = mk(R1, T1, -0.05, 0.42, 0);
    const b = mk(R2, T2, -0.05 + (R1 + R2 - 0.05) * Math.cos(-0.5), 0.42 + (R1 + R2 - 0.05) * Math.sin(-0.5), 0);
    const c = mk(R3, T3, -0.05 + (R1 + R3 - 0.05) * Math.cos(2.5), 0.42 + (R1 + R3 - 0.05) * Math.sin(2.5), 0);
    // a stand under the big gear
    solid(new THREE.BoxGeometry(0.08, 0.37, 0.08).translate(-0.05, 0.235, -0.09), g);
    const anim = (t) => { const w = t * 0.5; a.rotation.z = w; b.rotation.z = -w * (T1 / T2) + 0.16; c.rotation.z = -w * (T1 / T3) + 0.2; };
    return { g, base: 0.8, spread: 0.35, h: 0.85, anim };
  },
  // Data center: the hero's short rack of server blades
  server() {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const y = 0.13 + i * 0.15; solid(new THREE.BoxGeometry(0.82, 0.12, 0.66).translate(0, y, 0), g);
      const f = face(0.78, 0.09, `
        float bays = step(0.08, fract(vUv.x * 10.0)) * step(fract(vUv.x * 10.0), 0.92) * step(0.25, vUv.y) * step(vUv.y, 0.75) * step(vUv.x, 0.6);
        col = vec3(0.12, 0.3, 0.42) * bays * 0.5;
        vec2 id = floor(vec2(vUv.x * 10.0, 0.0)); float h = hash(id + ${i}.0); float blink = step(0.55, fract(uTime * (0.6 + h * 2.0) + h * 9.0));
        float led = smoothstep(0.35, 0.0, length(vec2(fract(vUv.x * 10.0) - 0.5, (vUv.y - 0.5) * 0.9))) * step(vUv.x, 0.6);
        col += mix(cyan, pink, step(0.85, h)) * led * blink * 0.9;
        col += cyan * smoothstep(0.02, 0.0, abs(vUv.x - 0.8)) * 0.6 * (0.6 + 0.4 * sin(uTime * 2.0 + ${i}.0));`);
      f.position.set(0, y, 0.331); g.add(f);
    }
    return { g, base: 0.72, spread: 0.5, h: 0.75 };
  },
  // Cloud: the hero's cloud of glowing data points over a beam
  cloud() {
    const g = new THREE.Group();
    const S = [[-0.32, 0.0, 0.0, 0.26], [0.0, 0.12, 0.0, 0.34], [0.32, 0.0, 0.0, 0.27], [0.15, -0.08, 0.1, 0.24], [-0.15, -0.08, -0.08, 0.24]];
    const rand = rng(9), pos = [], seed = [];
    while (pos.length < 3400 * 3) { const p = [rand() * 1.4 - 0.7, rand() * 0.9 - 0.4, rand() * 0.8 - 0.4]; if (p[1] < -0.16) continue; let inside = false, edge = 1;
      for (const [x, y, z, r] of S) { const d = Math.hypot(p[0] - x, (p[1] - y) * 1.1, (p[2] - z) * 1.4) - r; if (d < 0) inside = true; edge = Math.min(edge, Math.abs(d)); }
      if (inside && (edge < 0.05 || rand() < 0.08)) { pos.push(p[0], p[1] + 0.62, p[2]); seed.push(rand()); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    g.add(new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uPixel: U.uPixel }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float aSeed; uniform float uTime, uPixel; varying float vA, vP; void main() { vec3 p = position; p.y += sin(uTime * 0.8 + aSeed * 20.0) * 0.01; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (3.0 + aSeed * 3.5) * uPixel * (6.0 / -mv.z); vA = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 50.0), 3.0); vP = step(0.9, aSeed); }',
      fragmentShader: 'varying float vA, vP; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(0.5, 0.88, 1.0), vec3(0.92, 0.29, 0.59), vP), a * a * vA); }' })));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.2, 0.42, 32, 1, true).translate(0, 0.27, 0), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
    return { g, base: 0.1, spread: 0, h: 1.0 };
  },
  // Partners: four platforms wired to one hub, data running both ways
  partner() {
    const g = new THREE.Group();
    solid(new THREE.BoxGeometry(0.3, 0.3, 0.3).translate(0, 0.2, 0), g);
    const top = face(0.27, 0.27, 'vec2 c = vUv - 0.5; float r = length(c); float beat = 0.5 + 0.5 * sin(uTime * 2.0); col = cyan * (exp(-r * r * 40.0) * (0.9 + 0.4 * beat) + (smoothstep(0.44, 0.46, max(abs(c.x), abs(c.y))) * 0.8));');
    top.rotation.x = -Math.PI / 2; top.position.y = 0.351; g.add(top);
    const nodes = [[0.82, 0.0], [0.0, 0.82], [-0.82, 0.0], [0.0, -0.82]], links = [];
    nodes.forEach(([x, z], i) => {
      const n = new THREE.Group(); n.position.set(x, 0, z); g.add(n);
      solid(new THREE.BoxGeometry(0.34, 0.03, 0.34).translate(0, 0.015, 0), n);
      solid(new THREE.BoxGeometry(0.2, 0.2, 0.2).translate(0, 0.13, 0), n);
      const f = face(0.18, 0.18, `vec2 c = vUv - 0.5; col = ${i === 1 ? 'pink' : 'cyan'} * (smoothstep(0.42, 0.44, max(abs(c.x), abs(c.y))) + exp(-dot(c, c) * 50.0) * 0.6);`);
      f.rotation.x = -Math.PI / 2; f.position.y = 0.231; n.add(f);
      const a = new THREE.Vector3(x * 0.2, 0.06, z * 0.2), b = new THREE.Vector3(x * 0.82, 0.06, z * 0.82);
      g.add(glowLine([a, b], CYAN, 0.7));
      links.push({ a, b, i });
    });
    const pk = dotSet(8, 0xc8f2ff, 0.02); g.add(pk);
    const anim = (t) => { const pts = []; links.forEach(({ a, b, i }) => { const k1 = (t * 0.45 + i * 0.25) % 1, k2 = 1 - ((t * 0.38 + i * 0.4) % 1); pts.push(a.clone().lerp(b, k1), a.clone().lerp(b, k2)); }); pk.place(pts); };
    return { g, base: 0.36, spread: 0.18, h: 0.4, anim };
  },
  // Oil and gas: a pumpjack nodding over its well
  pumpjack() {
    const g = new THREE.Group(); g.position.x = -0.05;
    solid(new THREE.BoxGeometry(1.15, 0.05, 0.3).translate(0, 0.025, 0), g);
    for (const z of [-0.09, 0.09]) { const leg = new THREE.Group(); leg.position.set(0.08, 0.05, z); leg.rotation.x = z > 0 ? -0.14 : 0.14; solid(new THREE.BoxGeometry(0.05, 0.6, 0.04).translate(0, 0.3, 0), leg); g.add(leg); }
    const beam = new THREE.Group(); beam.position.set(0.08, 0.66, 0); g.add(beam);
    solid(new THREE.BoxGeometry(1.0, 0.05, 0.07).translate(0.05, 0, 0), beam);
    const hs = new THREE.Shape(); hs.moveTo(0, 0.14); hs.quadraticCurveTo(0.13, 0, 0, -0.17); hs.lineTo(-0.05, -0.13); hs.lineTo(-0.05, 0.11); hs.closePath();
    const head = new THREE.Group(); head.position.set(0.56, -0.02, 0); beam.add(head);
    solid(new THREE.ExtrudeGeometry(hs, { depth: 0.09, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -0.045), head, true, 30);
    const crank = new THREE.Group(); crank.position.set(-0.36, 0.22, 0); g.add(crank);
    solid(new THREE.BoxGeometry(0.08, 0.17, 0.14).translate(-0.36, 0.135, 0), g);
    const arm = new THREE.Group(); crank.add(arm);
    for (const z of [-0.085, 0.085]) solid(new THREE.BoxGeometry(0.3, 0.06, 0.03).translate(0.08, 0, z), arm);
    const weight = new THREE.Group(); arm.add(weight);
    for (const z of [-0.085, 0.085]) { const w = solid(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2).translate(0, 0, z), weight); }
    weight.position.x = -0.1;
    solid(new THREE.BoxGeometry(0.18, 0.12, 0.16).translate(-0.47, 0.11, 0), g);
    solid(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16).translate(0.64, 0.09, 0), g);
    const rodGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    g.add(new THREE.Line(rodGeo, edgeMat(0.95)));
    const pitGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    g.add(new THREE.Line(pitGeo, edgeMat(0.8)));
    const v = new THREE.Vector3();
    const anim = (t) => {
      const th = t * 1.3; arm.rotation.z = -th; const tilt = Math.sin(th) * 0.2; beam.rotation.z = tilt;
      v.set(0.56, -0.19, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt).add(beam.position);
      rodGeo.setFromPoints([new THREE.Vector3(v.x, v.y, 0), new THREE.Vector3(0.64, 0.13, 0)]);
      const crankPin = new THREE.Vector3(Math.cos(-th + Math.PI) * 0.16, Math.sin(-th + Math.PI) * 0.16, 0).add(crank.position);
      const tail = new THREE.Vector3(-0.45, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt).add(beam.position);
      pitGeo.setFromPoints([crankPin, tail]);
    };
    return { g, base: 0.75, spread: 0.2, h: 0.85, anim };
  },
  // SMEs: an office whose windows light up through the day
  building() {
    const g = new THREE.Group();
    const win = (cols, rows, seed) => `vec2 gg = vec2(vUv.x * ${cols}.0, vUv.y * ${rows}.0), id = floor(gg), f = fract(gg);
      float w = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.78);
      float h = hash(id + ${seed}.0); float on = step(0.45, fract(h * 3.0 + uTime * (0.05 + h * 0.12)));
      col = w * (vec3(0.05, 0.13, 0.2) + on * mix(cyan, pink, step(0.93, h)) * (0.55 + 0.25 * h));`;
    solid(new THREE.BoxGeometry(0.46, 0.92, 0.42).translate(0.12, 0.46 + 0.05, 0), g);
    const f1 = face(0.42, 0.84, win(4, 8, 1)); f1.position.set(0.12, 0.51, 0.211); g.add(f1);
    const f2 = face(0.38, 0.84, win(4, 8, 2)); f2.rotation.y = Math.PI / 2; f2.position.set(0.351, 0.51, 0); g.add(f2);
    solid(new THREE.BoxGeometry(0.36, 0.46, 0.46).translate(-0.32, 0.23 + 0.05, 0.02), g);
    const f3 = face(0.32, 0.38, win(3, 4, 3)); f3.position.set(-0.32, 0.28, 0.251); g.add(f3);
    solid(new THREE.BoxGeometry(0.12, 0.08, 0.12).translate(0.2, 1.01, -0.05), g);
    return { g, base: 1.05, spread: 0.2, h: 1.0 };
  },
  // Schools: a graduation cap resting over a stack of books
  school() {
    const g = new THREE.Group();
    const pages = 'float s = fract(vUv.y * 9.0); col = vec3(0.35, 0.55, 0.7) * smoothstep(0.5, 0.0, abs(s - 0.5)) * 0.35;';
    const book = (w, d, y, ry) => { const b = new THREE.Group(); b.position.y = y; b.rotation.y = ry; solid(new THREE.BoxGeometry(w, 0.1, d), b); const p = face(d * 0.94, 0.08, pages); p.rotation.y = Math.PI / 2; p.position.x = w / 2 + 0.001; b.add(p); g.add(b); };
    book(0.82, 0.58, 0.1, 0.0); book(0.74, 0.52, 0.2, 0.14); book(0.66, 0.46, 0.3, -0.08);
    const cap = new THREE.Group(); cap.position.y = 0.42; g.add(cap);
    solid(new THREE.CylinderGeometry(0.19, 0.21, 0.13, 32, 1, true), cap, true, 40);
    const board = new THREE.Group(); board.position.y = 0.075; board.rotation.y = Math.PI / 4; cap.add(board);
    solid(new THREE.BoxGeometry(0.62, 0.022, 0.62), board);
    const topF = face(0.58, 0.58, 'vec2 c = vUv - 0.5; col = cyan * (smoothstep(0.46, 0.48, max(abs(c.x), abs(c.y))) * 0.6 + exp(-dot(c, c) * 80.0) * 0.35);');
    topF.rotation.x = -Math.PI / 2; topF.position.y = 0.012; board.add(topF);
    const tGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    const tassel = new THREE.Line(tGeo, edgeMat(1, PINK)); cap.add(tassel);
    const end = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.08, 10), new THREE.MeshBasicMaterial({ color: PINK })); cap.add(end);
    const anim = (t) => {
      cap.position.y = 0.43 + Math.sin(t * 1.1) * 0.02; cap.rotation.y = Math.sin(t * 0.4) * 0.12;
      const corner = new THREE.Vector3(0.31 * Math.SQRT2 * 0.98, 0.09, 0), sw = Math.sin(t * 1.6) * 0.03;
      const tip = new THREE.Vector3(corner.x + 0.02 + sw, -0.1, sw);
      tGeo.setFromPoints([new THREE.Vector3(0, 0.1, 0), corner, tip]); end.position.copy(tip).add(new THREE.Vector3(0, -0.03, 0));
    };
    return { g, base: 0.55, spread: 0.3, h: 0.62, anim };
  },
  // Online education: a laptop playing a lesson
  laptop() {
    const g = new THREE.Group(); g.rotation.y = -0.15;
    solid(new THREE.BoxGeometry(0.92, 0.035, 0.6).translate(0, 0.07, 0.04), g);
    const keys = face(0.8, 0.34, 'vec2 gg = vec2(vUv.x * 14.0, vUv.y * 5.0), f = fract(gg); col = vec3(0.12, 0.3, 0.42) * step(0.14, f.x) * step(f.x, 0.86) * step(0.18, f.y) * step(f.y, 0.82) * 0.5;');
    keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.0885, -0.03); g.add(keys);
    const hinge = new THREE.Group(); hinge.position.set(0, 0.09, -0.24); hinge.rotation.x = -0.2; g.add(hinge);
    solid(new THREE.BoxGeometry(0.92, 0.58, 0.025).translate(0, 0.29, 0), hinge);
    const screen = face(0.86, 0.52, `
      vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.55); col = vec3(0.05, 0.14, 0.22);
      col += cyan * 0.22 * smoothstep(0.7, 0.0, length(p));
      vec2 q = p * 6.0; float tri = step(q.x, 0.9) * step(-0.55, q.x) * step(abs(q.y), (0.9 - q.x) * 0.62);
      float ring = smoothstep(0.012, 0.0, abs(length(p) - 0.15));
      float beat = 0.6 + 0.4 * sin(uTime * 2.0); col += cyan * (tri * 1.4 + ring * 1.0) * beat;
      float bar = step(abs(vUv.y - 0.12), 0.012) * step(0.06, vUv.x) * step(vUv.x, 0.94); float prog = fract(uTime * 0.06) * 0.88 + 0.06;
      col += bar * mix(vec3(0.15, 0.3, 0.42), pink, step(vUv.x, prog)) * 0.9;
      col += pink * smoothstep(0.02, 0.0, length(vec2((vUv.x - prog) * uAspect, vUv.y - 0.12))) * 1.2;`);
    screen.position.set(0, 0.3, 0.0135); hinge.add(screen);
    return { g, base: 0.7, spread: 0.3, h: 0.7 };
  },
  // Sports: a ball spinning and bouncing on the board
  ball() {
    const g = new THREE.Group();
    const hold = new THREE.Group(); g.add(hold);
    const geo = new THREE.IcosahedronGeometry(0.33, 1);
    solid(geo, hold, true, 5);
    const ring = glowLine(ringPts(0.3, 48, 0.055), CYAN, 0.6); g.add(ring);
    const anim = (t) => { const k = Math.abs(Math.sin(t * 2.0)); hold.position.y = 0.39 + k * 0.22; hold.rotation.y = t * 0.8; hold.rotation.x = t * 0.5; const sq = 1 - Math.max(0, 0.12 - k) * 1.2; hold.scale.set(1 / sq, sq, 1 / sq); ring.scale.setScalar(1.15 - k * 0.35); ring.material.opacity = 0.3 + (1 - k) * 0.5; };
    return { g, base: 0.85, spread: 0.25, h: 0.95, anim };
  },
};

/* ------------------------------------------------------------------ one scene per card */
const STREAM = 120;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function makeScene(card) {
  const idx = card.idx, uOp = { value: 1 };
  const boardScene = new THREE.Scene(), objScene = new THREE.Scene();
  const floor = makeFloor(uOp); boardScene.add(floor.grp);
  const obj = BUILD[card.kind](); const lift = new THREE.Group(); lift.add(obj.g); objScene.add(lift);
  // data rising off the object
  const uBase = { value: obj.base }, uSpread = { value: obj.spread };
  { const rand = rng(4 + idx), seeds = new Float32Array(STREAM * 4); for (let i = 0; i < STREAM; i++) seeds.set([rand() - 0.5, rand() - 0.5, rand(), 0.12 + rand() * 0.2], i * 4);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAM * 3), 3)); sg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const s = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uPixel: U.uPixel, uBase, uSpread }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 aSeed; uniform float uTime, uPixel, uBase, uSpread; varying float vA, vPink;
        void main() { float k = fract(aSeed.z + uTime * aSeed.w); vec3 p = vec3(aSeed.x * uSpread * (1.0 - k * 0.55), uBase + k * 1.3, aSeed.y * uSpread * (1.0 - k * 0.55));
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (2.0 + 3.0 * (1.0 - k)) * uPixel * (6.0 / -mv.z);
          vA = smoothstep(0.0, 0.06, k) * pow(1.0 - k, 1.6) * step(0.01, uSpread); vPink = step(0.8, fract(aSeed.z * 7.13)); }`,
      fragmentShader: 'varying float vA, vPink; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(0.45, 0.85, 1.0), vec3(0.92, 0.29, 0.59), vPink), a * a * vA * 0.9); }' }));
    s.frustumCulled = false; boardScene.add(s); }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(2.2); boardScene.add(halo);
  // fine dust in the air between the camera and the floor
  { const rand = rng(90 + idx), pos = [], sz = [], col = [];
    for (let i = 0; i < 90; i++) { pos.push(rand() * 5 - 2.5, 0.2 + rand() * 1.6, rand() * 4 - 1.5); sz.push(2 + rand() * 4); const c = rand() > 0.85 ? PINK : new THREE.Color(0.75, 0.92, 1); col.push(c.r, c.g, c.b, 0.25 + rand() * 0.4); }
    const air = new THREE.Points(pointsGeo(pos, sz, col), new THREE.ShaderMaterial({ uniforms: { uPixel: U.uPixel, uTime: U.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float aSize; attribute vec4 aColor; uniform float uPixel, uTime; varying vec4 vC; void main() { vec3 p = position; p.y += sin(uTime * 0.3 + position.x * 3.0) * 0.06; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixel * (6.0 / -mv.z); vC = aColor * (0.6 + 0.4 * sin(uTime * 1.3 + position.z * 9.0)); }',
      fragmentShader: 'varying vec4 vC; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC.rgb, vC.a * a * a); }' }));
    air.frustumCulled = false; boardScene.add(air); }
  return { boardScene, objScene, floor, obj, lift, uBase, halo, uOp, cam: new THREE.PerspectiveCamera(30, 2, 0.1, 60) };
}

/* ------------------------------------------------------------------ the page's cards */
function start() {
  const els = [...document.querySelectorAll('[data-card3d]')].filter((el) => BUILD[el.dataset.card3d]);
  if (!els.length) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'cards-gl';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return; } // no WebGL: the photos stay
  document.body.appendChild(canvas);
  const DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.autoClear = false;
  let W = 0, H = 0;
  const fit = () => { const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight; if (w !== W || h !== H) { W = w; H = h; renderer.setSize(W, H); } };

  // last pass for each card: rounds its corners to match the page and fades it with the page (the reveal on
  // scroll, the services panel switching), by scaling what is drawn by the card's opacity
  const maskMat = new THREE.ShaderMaterial({
    uniforms: { uRect: { value: new THREE.Vector4() }, uRad: { value: new THREE.Vector4() }, uOp: { value: 1 } },
    vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform vec4 uRect, uRad; uniform float uOp;
      void main() { vec2 p = gl_FragCoord.xy - uRect.xy; float a = uOp;
        if (p.y < uRect.w) { vec2 hs = uRect.zw * 0.5, q = p - hs;
          float r = q.x < 0.0 ? (q.y > 0.0 ? uRad.x : uRad.w) : (q.y > 0.0 ? uRad.y : uRad.z);
          vec2 d = abs(q) - hs + r; float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
          a *= 1.0 - smoothstep(-0.5, 0.5, sd); }
        gl_FragColor = vec4(0.0, 0.0, 0.0, a); }`,
    transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.SrcAlphaFactor,
  });
  const maskScene = new THREE.Scene(), maskCam = new THREE.Camera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), maskMat); quad.frustumCulled = false; maskScene.add(quad);

  const cards = els.map((el, idx) => {
    const panel = el.closest('.svx-panel');
    const card = { el, idx, kind: el.dataset.card3d, panel, fade: [el.closest('[data-reveal]'), panel].filter(Boolean), sc: null, rad: [0, 0, 0, 0],
      st: { x: 0, y: 0, tx: 0, ty: 0, hover: 0, th: 0, mx: 0, my: 0, mh: 0, t0: idx * 1.7 } };
    el.classList.add('is-3d');
    el.querySelectorAll('img').forEach((im) => im.remove());
    const radii = () => { const cs = getComputedStyle(el); card.rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map((v) => parseFloat(v) || 0); };
    radii(); addEventListener('resize', radii);
    // the pointer, over the whole card (its picture and its title)
    const st = card.st, hit = el.closest('a, .svx-panel') || el;
    hit.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; const r = el.getBoundingClientRect(); st.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); st.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1); });
    hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') st.th = 1; });
    hit.addEventListener('pointerleave', () => { st.tx = 0; st.ty = 0; st.th = 0; });
    return card;
  });

  const target = new THREE.Vector3(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  const clock = new THREE.Clock();
  let shown = true;
  function frame() {
    fit();
    const t = reduce ? 4 : clock.getElapsedTime();
    U.uTime.value = t;
    let built = false, cleared = false;
    for (const c of cards) {
      const r = c.el.getBoundingClientRect();
      if (r.width < 2) continue;
      // build each scene as its card comes near the screen, one a frame
      if (!c.sc) { if (!built && r.top < H * 2 && r.bottom > -H) { c.sc = makeScene(c); built = true; } continue; }
      const m = Math.round(r.height * 0.6);
      if (r.bottom < 0 || r.top - m > H || r.right < 0 || r.left > W) continue;
      if (c.panel && !c.panel.classList.contains('is-on')) continue;
      let op = 1; for (const f of c.fade) op *= parseFloat(getComputedStyle(f).opacity);
      if (!(op > 0.01)) continue;
      if (!cleared) {
        cleared = true;
        if (!shown) { shown = true; canvas.style.visibility = ''; }
        renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); renderer.setScissorTest(true);
      }
      const s = c.st, sc = c.sc;
      // 1 entering at the bottom, 0 in the middle of the screen, -1 leaving at the top
      const p = clamp(((r.top + r.height / 2) - H / 2) / (H / 2 + r.height / 2), -1.2, 1.2);
      if (!fine) { s.tx = Math.sin(t * 0.35 + s.t0) * 0.6; s.ty = Math.cos(t * 0.28 + s.t0) * 0.35; s.th = Math.max(0, 1 - Math.abs(p) * 2.4); }
      s.x = lerp(s.x, s.tx, 0.07); s.y = lerp(s.y, s.ty, 0.07); s.hover = lerp(s.hover, s.th, 0.06);
      const h = s.hover;
      if (sc.obj.anim) sc.obj.anim(t);
      // focus: the floor dims back while the object steps forward
      sc.uOp.value = 1 - h * 0.25;
      sc.floor.spill.material.opacity = 0.26 + h * 0.12;
      // break-out + scroll: the object rises with the scroll and out over the top on hover
      const bob = Math.sin(t * 0.9 + s.t0) * 0.02;
      sc.lift.position.y = bob - p * 0.12 + h * 0.5;
      sc.lift.scale.setScalar(1 + h * 0.2);
      sc.uBase.value = sc.obj.base * (1 + h * 0.2) + sc.lift.position.y;
      sc.halo.position.y = sc.uBase.value + 0.1; sc.halo.material.opacity = 0.18 + h * 0.14;
      // tilt + scroll: the camera swings round after the pointer and drifts with the page
      const aspect = r.width / r.height;
      const R = (aspect > 1.6 ? 3.25 : 3.7) * (1 - h * 0.07);
      const az = 0.62 + s.x * 0.2 + Math.sin(t * 0.12 + s.t0) * 0.05, el = 0.5 - s.y * 0.08 + p * 0.1;
      target.set(0, sc.obj.h * 0.42 + h * 0.03, 0);
      sc.cam.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R + target.y, Math.cos(az) * Math.cos(el) * R);
      sc.cam.lookAt(target);
      U.uPixel.value = DPR * (r.height / 640);
      const x = r.left, y = H - r.bottom, w = r.width, hh = r.height;
      sc.cam.aspect = aspect; sc.cam.clearViewOffset(); sc.cam.updateProjectionMatrix();
      // the tiles under the pointer
      s.mx = lerp(s.mx, s.tx, 0.25); s.my = lerp(s.my, s.ty, 0.25); s.mh = lerp(s.mh, s.th && fine ? 1 : 0, 0.08);
      ray.setFromCamera(ndc.set(s.mx, -s.my), sc.cam);
      if (ray.ray.intersectPlane(ground, hitP)) sc.floor.mat.uniforms.uMouse.value.set(hitP.x, -hitP.z);
      sc.floor.mat.uniforms.uMH.value = s.mh;
      // the floor, cut to the card
      renderer.setViewport(x, y, w, hh); renderer.setScissor(x, y, w, hh);
      renderer.setClearColor(0x061423, 1); renderer.clear(true, true, true);
      renderer.render(sc.boardScene, sc.cam);
      // the object, free to rise above the card's top edge
      renderer.setViewport(x, y, w, hh + m); renderer.setScissor(x, y, w, hh + m);
      renderer.clearDepth();
      sc.cam.setViewOffset(w, hh, 0, -m, w, hh + m); sc.cam.updateProjectionMatrix();
      renderer.render(sc.objScene, sc.cam);
      // round the corners and fade with the page
      maskMat.uniforms.uRect.value.set(x * DPR, y * DPR, w * DPR, hh * DPR);
      maskMat.uniforms.uRad.value.set(...c.rad.map((v) => v * DPR));
      maskMat.uniforms.uOp.value = Math.min(1, op);
      renderer.render(maskScene, maskCam);
    }
    // nothing on screen: clear once and hide the layer
    if (!cleared && shown) { shown = false; renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); canvas.style.visibility = 'hidden'; }
  }
  // drawn on the GSAP ticker when there is one, after the smooth scroll, so the pictures stay with the page
  const ticker = window.gsap && window.gsap.ticker;
  if (ticker) ticker.add(frame);
  else { const loop = () => { frame(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
}

start();
