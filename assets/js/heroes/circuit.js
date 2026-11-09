// Element "circuit" (home page hero): the AI chip hero's circuit board, with a part standing on a glowing base
// at each of six stops round the board, one per frame (the headline, then each service area). The part
// showing breaks up into data that flies along the board to the next base and rebuilds there as the next part,
// and the view follows it; between the stops, buses of traces carry data pulses on to the next part. The board
// leans after the mouse. Built for stage.js like heroes/glass.js: the stage plays the frames (update({ f }))
// and the page shows each frame's service panel. The options page it came from is docs/hero-circuit.html.
import * as THREE from '../../vendor/three.module.min.js';
import { circuit, along, rng } from '../circuit.js';

const CYAN = new THREE.Color('#30c1f8'), PINK = new THREE.Color('#eb4b96'), BODY = 0x0a1b2c;
// the parts, in frame order: the headline, AI, cloud, data, infrastructure, security
const ITEMS = [{ key: 'switch' }, { key: 'core' }, { key: 'cloud' }, { key: 'storage' }, { key: 'server' }, { key: 'shield' }];
// where each stands on the board (x, z); the view travels round them in a loop
const TRAVEL = [[0, 0], [2.9, -1.3], [3.4, 1.9], [0.5, 3.4], [-2.7, 1.7], [-2.5, -1.7]];
const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;

export async function build({ scene, root, reduceMotion, U }) {
  // the whole board lives in its own group; root (whose matrix the stage's particle stream leaves from)
  // copies its placement every frame
  const world = new THREE.Group();
  world.rotation.order = 'XYZ';
  scene.add(world);
  /* ---------------------------------------------------------------- the board: one large circuit with every object on it */
  const uFocus = { value: new THREE.Vector2() };
  // the board fades out round the part in view (it moves with the camera, so the board never seems to end)
  const BOARD_FADE = `uniform vec2 uFocus; float boardFade(vec3 p, float viewZ) { float f = 1.0 - smoothstep(2.4, 6.6, length(p.xz - uFocus)); return f * f * smoothstep(0.8, 2.6, viewZ); }`;
  const traceMat = (color, opacity) => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uOpacity: { value: opacity }, uFocus },
    vertexShader: `${BOARD_FADE} varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = boardFade(position, -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vA; void main() { gl_FragColor = vec4(uColor, uOpacity * vA); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const spriteMat = ({ ring = false, opacity = 1 } = {}) => new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel, uOpacity: { value: opacity }, uFocus },
    vertexShader: `${BOARD_FADE} attribute float aSize; attribute vec4 aColor; uniform float uPixel; varying vec4 vColor;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixel * (6.0 / -mv.z); vColor = vec4(aColor.rgb, aColor.a * boardFade(position, -mv.z)); }`,
    fragmentShader: `uniform float uOpacity; varying vec4 vColor; void main() { float d = length(gl_PointCoord - 0.5);
      ${ring ? 'float a = smoothstep(0.5, 0.42, d) * smoothstep(0.2, 0.3, d) + smoothstep(0.16, 0.05, d) * 0.6;' : 'float a = smoothstep(0.5, 0.0, d); a *= a;'}
      gl_FragColor = vec4(vColor.rgb, vColor.a * a * uOpacity); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pointsGeo = (pos, size, col) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1)); g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 4)); return g; };
  const withLen = (pts) => { const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, len, total: len[len.length - 1] }; };
  let SPOTS = [[0, 0]];
  const nearSpot = (p, r) => SPOTS.some(([x, z]) => Math.max(Math.abs(p[0] - x), Math.abs(p[1] - z)) < r);

  // each object's own fan-out from its pins, like a chip on a real board (the processor keeps the original one)
  function fanOut([cx, cz], seed, half = 0.5) {
    const rand = rng(seed), out = [], pinsN = 10, gap = 0.082, o0 = half + 0.13;
    const SIDES = [(o, l) => [o, l], (o, l) => [-o, -l], (o, l) => [-l, o], (o, l) => [l, -o]];
    for (const map of SIDES) for (let k = 0; k < pinsN; k++) {
      if (rand() < 0.3) continue;
      const l0 = (k - (pinsN - 1) / 2) * gap, dir = Math.sign(l0) || 1;
      const o1 = o0 + 0.06 + rand() * 0.3, fan = Math.abs(l0) * (1 + rand() * 1.6) + rand() * 0.25, o2 = o1 + fan, l2 = l0 + dir * fan, o3 = o2 + 0.15 + rand() * 1.2;
      out.push({ ...withLen([[o0, l0], [o1, l0], [o2, l2], [o3, l2]].map(([o, l]) => { const [x, z] = map(o, l); return [x + cx, z + cz]; })), seed: rand(), pink: rand() < 0.2 });
    }
    return out;
  }
  // a bus of parallel traces from one object to the next, routed at 0° and 45° like a PCB
  function bus(a, b, n = 4, spacing = 0.075) {
    const dx = b[0] - a[0], dz = b[1] - a[1], ax = Math.abs(dx), az = Math.abs(dz), sx = Math.sign(dx), sz = Math.sign(dz);
    const L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L;
    let p1, p2;
    if (ax >= az) { const s = (ax - az) / 2; p1 = [a[0] + sx * s, a[1]]; p2 = [p1[0] + sx * az, b[1]]; } else { const s = (az - ax) / 2; p1 = [a[0], a[1] + sz * s]; p2 = [b[0], p1[1] + sz * ax]; }
    const out = [];
    for (let k = 0; k < n; k++) { const o = (k - (n - 1) / 2) * spacing; out.push({ ...withLen([a, p1, p2, b].map(([x, z]) => [x + nx * o, z + nz * o])), seed: k / n, pink: k === n - 1 }); }
    return out;
  }
  // a whole board for a set of spots (one spot: everything happens in place; several: the hero travels between them)
  function makeBoard(spots) {
    SPOTS = spots; const N = spots.length, grp = new THREE.Group(), add = (x) => grp.add(x);
  const fans = [...circuit().chip, ...SPOTS.slice(1).flatMap((s, i) => fanOut(s, 21 + i))];
  const buses = N > 1 ? SPOTS.flatMap((s, i) => bus(s, SPOTS[(i + 1) % N])) : [];
  // loose traces filling the rest of the board
  const field = [];
  {
    const rand = rng(31), DIRS = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]];
    let guard = 0;
    while (field.length < 260 && guard++ < 6000) {
      const p0 = [rand() * 19 - 8.5, rand() * 19 - 8.5], d = Math.floor(rand() * 8), turn = (d + (rand() < 0.5 ? 1 : 7)) % 8, l1 = 0.3 + rand() * 1.2, l2 = 0.3 + rand() * 1.4;
      const p1 = [p0[0] + DIRS[d][0] * l1, p0[1] + DIRS[d][1] * l1], p2 = [p1[0] + DIRS[turn][0] * l2, p1[1] + DIRS[turn][1] * l2];
      if ([p0, p1, p2].some((p) => nearSpot(p, 1.25))) continue;
      field.push({ ...withLen([p0, p1, p2]), seed: rand() });
    }
  }
  {
    const pos = [], size = [], col = [];
    for (let x = -9; x <= 9; x += 0.24) for (let z = -9; z <= 9; z += 0.24) if (!nearSpot([x, z], 0.62)) { pos.push(x, 0, z); size.push(2.2); col.push(0.45, 0.62, 0.8, 0.55); }
    add(new THREE.Points(pointsGeo(pos, size, col), spriteMat()));
    const segs = (list) => { const p = []; for (const t of list) for (let i = 1; i < t.pts.length; i++) p.push(t.pts[i - 1][0], 0.001, t.pts[i - 1][1], t.pts[i][0], 0.001, t.pts[i][1]); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return g; };
    add(new THREE.LineSegments(segs(fans), traceMat(CYAN, 0.6)));
    add(new THREE.LineSegments(segs(buses), traceMat(CYAN, 0.75)));
    add(new THREE.LineSegments(segs(field), traceMat(new THREE.Color('#5d8fb8'), 0.34)));
    const vp = [], vs = [], vc = [];
    const via = (p, c, s) => { vp.push(p[0], 0.002, p[1]); vs.push(s); vc.push(c.r, c.g, c.b, 0.9); };
    for (const t of fans) via(t.pts[t.pts.length - 1], t.pink ? PINK : CYAN, 9);
    for (const t of field) { via(t.pts[0], CYAN, 6); via(t.pts[t.pts.length - 1], CYAN, 6); }
    add(new THREE.Points(pointsGeo(vp, vs, vc), spriteMat({ ring: true, opacity: 0.85 })));
  }
  // data pulses: into each object along its fan-out, and along the buses on to the next object
  const TAIL = 4;
  const pulses = [
    ...fans.map((t, i) => ({ t, speed: 0.55 + t.seed * 0.7, phase: (i * 0.618) % 1, inward: true })),
    ...buses.flatMap((t, i) => [0, 0.34, 0.67].map((o) => ({ t, speed: 0.8 + (i % 4) * 0.08, phase: (t.seed * 0.5 + o) % 1, inward: false }))),
  ];
  const pulsePos = new Float32Array(pulses.length * TAIL * 3), pulseCol = new Float32Array(pulses.length * TAIL * 4), pulseSize = new Float32Array(pulses.length * TAIL);
  pulses.forEach((p, i) => { const c = p.t.pink ? PINK : new THREE.Color(0.7, 0.93, 1); for (let k = 0; k < TAIL; k++) { const j = i * TAIL + k; pulseSize[j] = k === 0 ? 13 : 9 - k * 1.6; pulseCol.set([c.r, c.g, c.b, 0], j * 4); } });
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3)); pulseGeo.setAttribute('aSize', new THREE.BufferAttribute(pulseSize, 1)); pulseGeo.setAttribute('aColor', new THREE.BufferAttribute(pulseCol, 4));
  const pulsePts = new THREE.Points(pulseGeo, spriteMat()); pulsePts.frustumCulled = false; add(pulsePts);
  function updatePulses(time) {
    pulses.forEach((p, i) => {
      const total = p.t.total, k = (p.phase + (time * p.speed) / total) % 1, d = p.inward ? total * (1 - k) : total * k;
      const fade = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.06), step = p.inward ? 0.045 : -0.05;
      for (let n = 0; n < TAIL; n++) {
        const j = i * TAIL + n, dd = d + n * step, [x, z] = along(p.t, dd);
        pulsePos[j * 3] = x; pulsePos[j * 3 + 1] = 0.004; pulsePos[j * 3 + 2] = z;
        pulseCol[j * 4 + 3] = fade * (1 - n / TAIL) * (dd >= 0 && dd <= total ? 1 : 0);
      }
    });
    pulseGeo.attributes.position.needsUpdate = true; pulseGeo.attributes.aColor.needsUpdate = true;
  }
  const spills = SPOTS.map(([x, z]) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.set(x, 0, z); add(s); return s; });
    return { grp, spills, updatePulses };
  }
  // a glow and rising data over the object in view
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const beacon = new THREE.Group(); world.add(beacon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(2.4); beacon.add(halo);
  const STREAM = 240, streamBase = { value: 0.1 }, streamSpread = { value: 0.42 };
  {
    const rand = rng(4), seeds = new Float32Array(STREAM * 4);
    for (let i = 0; i < STREAM; i++) seeds.set([rand() - 0.5, rand() - 0.5, rand(), 0.12 + rand() * 0.2], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAM * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const m = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uPixel: U.uPixel, uBase: streamBase, uSpread: streamSpread }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 aSeed; uniform float uTime, uPixel, uBase, uSpread; varying float vA, vPink;
        void main() { float k = fract(aSeed.z + uTime * aSeed.w); vec3 p = vec3(aSeed.x * uSpread * (1.0 - k * 0.55), uBase + k * 1.5, aSeed.y * uSpread * (1.0 - k * 0.55));
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (2.0 + 3.0 * (1.0 - k)) * uPixel * (6.0 / -mv.z);
          vA = smoothstep(0.0, 0.06, k) * pow(1.0 - k, 1.6) * step(0.01, uSpread); vPink = step(0.8, fract(aSeed.z * 7.13)); }`,
      fragmentShader: 'varying float vA, vPink; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(0.45, 0.85, 1.0), vec3(0.92, 0.29, 0.59), vPink), a * a * vA * 0.9); }' });
    const s = new THREE.Points(g, m); s.frustumCulled = false; beacon.add(s);
  }

  /* ---------------------------------------------------------------- the objects (dark bodies, glowing edges, lit faces) */
  const body = () => new THREE.MeshBasicMaterial({ color: BODY, transparent: true });
  const edgeMat = () => new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const solid = (geo, g, edges = true) => { const m = new THREE.Mesh(geo, body()); g.add(m); if (edges) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat())); return m; };
  const face = (w, h, frag, extra = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uAspect: { value: w / h }, uFade: { value: 1 }, ...extra }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime, uAspect, uFade; varying vec2 vUv;
      const vec3 cyan = vec3(0.19, 0.76, 0.97), pink = vec3(0.92, 0.29, 0.59);
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() { vec3 col = vec3(0.0); float a = 1.0; ${frag} gl_FragColor = vec4(col * uFade, uFade); }`,
  }));
  const pins = (g, half, n, gap, len = 0.13) => {
    const pin = new THREE.InstancedMesh(new THREE.BoxGeometry(len, 0.014, 0.03), new THREE.MeshBasicMaterial({ color: 0x8fd3f0, transparent: true }), n * 4);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1); let i = 0;
    for (const a of [0, Math.PI, -Math.PI / 2, Math.PI / 2]) { q.setFromAxisAngle(up, a); for (let k = 0; k < n; k++) pin.setMatrixAt(i++, m.compose(new THREE.Vector3(half + len / 2, 0.007, (k - (n - 1) / 2) * gap).applyQuaternion(q), q, one)); }
    g.add(pin);
  };
  // a low base pad the bigger objects stand on (keeps the traces running into something)
  const pad = (g, w = 1, d = 1) => { solid(new THREE.BoxGeometry(w, 0.05, d).translate(0, 0.025, 0), g); pins(g, w / 2, 10, 0.082); const f = face(w * 0.9, d * 0.9, `vec2 c = vUv - 0.5; float b = max(abs(c.x), abs(c.y)); col = cyan * (smoothstep(0.43, 0.45, b) - smoothstep(0.45, 0.47, b)) * 0.8; float r = length(c); col += cyan * exp(-pow((r - fract(uTime * 0.35) * 0.5) * 30.0, 2.0)) * 0.35 * (1.0 - r * 2.0);`); f.rotation.x = -Math.PI / 2; f.position.y = 0.051; g.add(f); };

  const BUILD = {
    // the processor, now without lettering: compute cells round a glowing core with a slow pulse
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
      return { g, base: H, spread: 0.42 };
    },
    // a cloud of glowing data points hovering over a pad, drifting and twinkling
    cloud() {
      const g = new THREE.Group();
      const S = [[-0.32, 0.0, 0.0, 0.26], [0.0, 0.12, 0.0, 0.34], [0.32, 0.0, 0.0, 0.27], [0.15, -0.08, 0.1, 0.24], [-0.15, -0.08, -0.08, 0.24]];
      const rand = rng(9), pos = [], seed = [];
      while (pos.length < 3400 * 3) { const p = [rand() * 1.4 - 0.7, rand() * 0.9 - 0.4, rand() * 0.8 - 0.4]; if (p[1] < -0.16) continue; let inside = false, edge = 1;
        for (const [x, y, z, r] of S) { const d = Math.hypot(p[0] - x, (p[1] - y) * 1.1, (p[2] - z) * 1.4) - r; if (d < 0) inside = true; edge = Math.min(edge, Math.abs(d)); }
        if (inside && (edge < 0.05 || rand() < 0.08)) { pos.push(p[0], p[1] + 0.62, p[2]); seed.push(rand()); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uPixel: U.uPixel, uOp: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: 'attribute float aSeed; uniform float uTime, uPixel; varying float vA, vP; void main() { vec3 p = position; p.y += sin(uTime * 0.8 + aSeed * 20.0) * 0.01; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (3.0 + aSeed * 3.5) * uPixel * (6.0 / -mv.z); vA = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 50.0), 3.0); vP = step(0.9, aSeed); }',
        fragmentShader: 'uniform float uOp; varying float vA, vP; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(0.5, 0.88, 1.0), vec3(0.92, 0.29, 0.59), vP), a * a * vA * uOp); }' });
      g.add(new THREE.Points(geo, m));
      // a beam linking the pad to the cloud
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.2, 0.42, 32, 1, true).translate(0, 0.27, 0), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      g.add(beam);
      return { g, base: 0.1, spread: 0.3, noStream: true };
    },
    // three storage discs stacked over a pad, light running round their rims
    storage() {
      const g = new THREE.Group();
      [0.16, 0.36, 0.56].forEach((y, i) => {
        const c = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 96, 1).translate(0, y, 0); solid(c, g);
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.423, 0.423, 0.04, 96, 1, true).translate(0, y, 0), new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uI: { value: i }, uFade: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
          vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'uniform float uTime, uI, uFade; varying vec2 vUv; void main() { float x = fract(vUv.x - uTime * (0.12 + uI * 0.05)); float a = 0.12 + pow(x, 6.0) * 0.9; vec3 c = mix(vec3(0.19, 0.76, 0.97), vec3(0.92, 0.29, 0.59), step(1.5, uI) * step(0.92, x)); gl_FragColor = vec4(c, a * uFade); }' }));
        g.add(band);
        for (let k = 0; k < 3; k++) { const led = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 8), new THREE.MeshBasicMaterial({ color: k === 2 && i === 1 ? PINK : CYAN })); led.position.set(0.1 + k * 0.06, y, 0.42); g.add(led); }
      });
      return { g, base: 0.66, spread: 0.5 };
    },
    // a short rack of server blades, each front with drive bays and blinking lights
    server() {
      const g = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const y = 0.13 + i * 0.15; solid(new THREE.BoxGeometry(0.82, 0.12, 0.66).translate(0, y, 0), g);
        const f = face(0.78, 0.09, `
          vec2 p = vec2(vUv.x * uAspect, vUv.y); float bays = step(0.08, fract(vUv.x * 10.0)) * step(fract(vUv.x * 10.0), 0.92) * step(0.25, vUv.y) * step(vUv.y, 0.75) * step(vUv.x, 0.6);
          col = vec3(0.12, 0.3, 0.42) * bays * 0.5;
          vec2 id = floor(vec2(vUv.x * 10.0, 0.0)); float h = hash(id + ${i}.0); float blink = step(0.55, fract(uTime * (0.6 + h * 2.0) + h * 9.0));
          float led = smoothstep(0.35, 0.0, length(vec2(fract(vUv.x * 10.0) - 0.5, (vUv.y - 0.5) * 0.9))) * step(vUv.x, 0.6);
          col += mix(cyan, pink, step(0.85, h)) * led * blink * 0.9;
          col += cyan * smoothstep(0.02, 0.0, abs(vUv.x - 0.8)) * 0.6 * (0.6 + 0.4 * sin(uTime * 2.0 + ${i}.0));`);
        f.position.set(0, y, 0.331); g.add(f);
      }
      return { g, base: 0.72, spread: 0.5 };
    },
    // an upright shield with a soft scan rising through it, on a pad
    shield() {
      const g = new THREE.Group();
      const s = new THREE.Shape(); s.moveTo(0, 1.1); s.bezierCurveTo(0.45, 0.96, 0.78, 0.9, 0.95, 0.84); s.lineTo(0.95, 0.1); s.bezierCurveTo(0.95, -0.55, 0.42, -0.95, 0, -1.15); s.bezierCurveTo(-0.42, -0.95, -0.95, -0.55, -0.95, 0.1); s.lineTo(-0.95, 0.84); s.bezierCurveTo(-0.78, 0.9, -0.45, 0.96, 0, 1.1);
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 28 }).translate(0, 0, -0.08).scale(0.34, 0.34, 1);
      const holder = new THREE.Group(); holder.position.y = 0.48; g.add(holder);
      holder.add(new THREE.Mesh(geo, body()));
      // glowing outline round the front and back faces
      const ring = s.getPoints(48).map((p) => new THREE.Vector3(p.x * 0.34, p.y * 0.34, 0));
      for (const z of [0.111, -0.111]) { const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring.map((v) => v.clone().setZ(z))), edgeMat()); holder.add(l); }
      const inner = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring.map((v) => v.clone().multiplyScalar(0.78).setZ(0.112))), edgeMat()); inner.material.opacity = 0.45; holder.add(inner);
      const f = face(0.7, 0.8, `
        vec2 c = vec2((vUv.x - 0.5) * 0.7, (vUv.y - 0.5) * 0.8);
        float sy = fract(uTime * 0.28) * 1.0 - 0.5; float line = exp(-pow((vUv.y - 0.5 - sy) * 40.0, 2.0));
        float kh = smoothstep(0.075, 0.06, length(c - vec2(0.0, 0.07))) + step(abs(c.x), 0.028) * step(-0.12, c.y) * step(c.y, 0.07);
        col = cyan * line * 0.35 + mix(cyan, pink, 0.6) * kh * (0.7 + 0.3 * sin(uTime * 2.0));`);
      f.position.z = 0.111; holder.add(f);
      return { g, base: 0.95, spread: 0.3 };
    },
    // a long low switch with a row of ports lighting in sequence
    switch() {
      const g = new THREE.Group();
      solid(new THREE.BoxGeometry(1.25, 0.14, 0.6).translate(0, 0.12, 0), g);
      const f = face(1.2, 0.1, `
        float cellx = fract(vUv.x * 24.0), row = step(0.5, vUv.y); vec2 id = vec2(floor(vUv.x * 24.0), row);
        float port = step(0.15, cellx) * step(cellx, 0.85) * (step(0.12, vUv.y) * step(vUv.y, 0.44) + step(0.56, vUv.y) * step(vUv.y, 0.88));
        col = vec3(0.1, 0.25, 0.36) * port * 0.5;
        float h = hash(id); float on = step(0.4, fract(uTime * (0.5 + h * 3.0) + h * 7.0)) * step(0.25, h);
        float led = smoothstep(0.06, 0.0, abs(cellx - 0.5) * 0.3 + abs(vUv.y - (row > 0.5 ? 0.94 : 0.06)) * 0.4);
        col += mix(cyan, pink, step(0.9, h)) * on * (port * 0.25 + led);`);
      f.position.set(0, 0.12, 0.301); g.add(f);
      // fibre leads running from the ports down to the board
      for (let k = 0; k < 8; k++) { const x = -0.5 + k * 0.14; const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.12, 0.31), new THREE.Vector3(x * 1.1, 0.06, 0.5), new THREE.Vector3(x * 1.3, 0.004, 0.75)]);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.006, 6), new THREE.MeshBasicMaterial({ color: k % 4 === 3 ? PINK : CYAN, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }))); }
      const w = new THREE.Group(); g.scale.set(0.76, 1, 0.76); w.add(g);
      return { g: w, base: 0.2, spread: 0.5 };
    },
  };
  /* ---------------------------------------------------------------- the board, the bases and the parts */
  const NI = ITEMS.length;
  const board = makeBoard(TRAVEL);
  world.add(board.grp);
  for (const [x, z] of TRAVEL) { const g = new THREE.Group(); pad(g); g.position.set(x, 0, z); world.add(g); }
  const objs = ITEMS.map((it, i) => { const o = BUILD[it.key](); o.g.position.set(TRAVEL[i][0], 0, TRAVEL[i][1]); world.add(o.g); return o; });
  function setFade(o, v) {
    o.g.visible = v > 0.002;
    o.g.traverse((x) => {
      const mt = x.material; if (!mt) return;
      if (mt.uniforms && mt.uniforms.uFade) mt.uniforms.uFade.value = v;
      else if (mt.uniforms && mt.uniforms.uOp) mt.uniforms.uOp.value = v;
      else if ('opacity' in mt) { mt.userData.op ??= mt.opacity; mt.opacity = mt.userData.op * v; }
    });
  }

  /* ---------------------------------------------------------------- the change: a part flies as data to the next base */
  const NP = 5200;
  function samples(o) {
    const tris = [], cloudPts = []; let total = 0;
    const keep = o.g.position.clone();
    o.g.position.set(0, 0, 0); o.g.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(o.g.matrixWorld).invert();
    o.g.traverse((x) => {
      if (x.isPoints) { const p = x.geometry.attributes.position; for (let i = 0; i < p.count; i++) cloudPts.push(new THREE.Vector3().fromBufferAttribute(p, i)); return; }
      if (!x.isMesh || x.isInstancedMesh || !x.geometry.attributes.position) return;
      const M = new THREE.Matrix4().multiplyMatrices(inv, x.matrixWorld);
      const g = x.geometry.index ? x.geometry.toNonIndexed() : x.geometry, p = g.attributes.position;
      for (let i = 0; i + 2 < p.count; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(M), b = new THREE.Vector3().fromBufferAttribute(p, i + 1).applyMatrix4(M), c = new THREE.Vector3().fromBufferAttribute(p, i + 2).applyMatrix4(M);
        const area = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).length() / 2;
        if (area > 1e-7) { total += area; tris.push([a, b, c, total]); }
      }
    });
    o.g.position.copy(keep);
    const rand = rng(77), out = new Float32Array(NP * 3);
    for (let i = 0; i < NP; i++) {
      let v;
      if (cloudPts.length && (i % 3 !== 0 || !tris.length)) v = cloudPts[Math.floor(rand() * cloudPts.length)];
      else {
        const x = rand() * total; let lo = 0, hi = tris.length - 1;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid][3] < x) lo = mid + 1; else hi = mid; }
        const [a, b, c] = tris[lo]; let u = rand(), w = rand(); if (u + w > 1) { u = 1 - u; w = 1 - w; }
        v = new THREE.Vector3().copy(a).addScaledVector(new THREE.Vector3().subVectors(b, a), u).addScaledVector(new THREE.Vector3().subVectors(c, a), w);
      }
      out.set([v.x, v.y, v.z], i * 3);
    }
    return out;
  }
  const SAMPLES = objs.map(samples);
  const morphGeo = new THREE.BufferGeometry();
  morphGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  morphGeo.setAttribute('aFrom', new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  morphGeo.setAttribute('aTo', new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  { const rand = rng(5), r = new Float32Array(NP * 2); for (let i = 0; i < NP * 2; i++) r[i] = rand(); morphGeo.setAttribute('aRnd', new THREE.BufferAttribute(r, 2)); }
  const MU = { uK: { value: 0 }, uTime: U.uTime, uPixel: U.uPixel, uOffA: { value: new THREE.Vector3() }, uOffB: { value: new THREE.Vector3() } };
  const morph = new THREE.Points(morphGeo, new THREE.ShaderMaterial({
    uniforms: MU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aFrom, aTo; attribute vec2 aRnd; uniform float uK, uTime, uPixel; uniform vec3 uOffA, uOffB; varying float vA, vPink;
      void main() {
        float k = clamp((uK - aRnd.x * 0.35) / 0.65, 0.0, 1.0), e = k * k * (3.0 - 2.0 * k), lift = sin(3.14159 * e);
        vec3 q = mix(aFrom, aTo, e) * (1.0 - lift * 0.45); // the swarm draws together while it travels
        float ang = lift * (0.9 + aRnd.y * 1.2) * (aRnd.x > 0.5 ? 1.0 : -1.0), cs = cos(ang), sn = sin(ang);
        q.xz = vec2(cs * q.x - sn * q.z, sn * q.x + cs * q.z);
        vec3 p = mix(uOffA, uOffB, e) + q;
        p.y += lift * (0.55 + aRnd.y * 0.45);
        p += lift * 0.05 * vec3(sin(uTime * 3.0 + aRnd.x * 40.0), cos(uTime * 2.0 + aRnd.y * 30.0), sin(uTime * 2.5 + aRnd.y * 20.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + 2.2 * lift + aRnd.y * 1.4) * uPixel * (6.0 / -mv.z);
        vA = smoothstep(0.0, 0.1, uK) * (1.0 - smoothstep(0.88, 1.0, uK)) * (0.55 + 0.45 * lift);
        vPink = step(0.86, aRnd.y);
      }`,
    fragmentShader: 'varying float vA, vPink; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(0.55, 0.9, 1.0), vec3(0.95, 0.35, 0.65), vPink), a * a * vA); }',
  }));
  morph.frustumCulled = false; morph.visible = false; world.add(morph);
  let pair = '';
  const setPair = (a, b) => { const key = `${a}>${b}`; if (key === pair) return; pair = key; morphGeo.attributes.aFrom.array.set(SAMPLES[a]); morphGeo.attributes.aTo.array.set(SAMPLES[b]); morphGeo.attributes.aFrom.needsUpdate = morphGeo.attributes.aTo.needsUpdate = true; };

  /* ---------------------------------------------------------------- what the stage drives */
  const m = { x: 0, y: 0 }, v = new THREE.Vector3();
  let showing = -1;
  const api = {
    anchors: {},
    labels: 0,
    hover: 0,
    onSwap: null,
    frames: NI,
    frame: 0,
    glide: 2.8, // seconds the stage takes to go from one frame to the next (the flight)
    showing: () => showing,
    // the part in view, as points in board space (the stage's particle stream starts from them)
    points(n) {
      const s = SAMPLES[Math.max(0, showing)], [ox, oz] = TRAVEL[Math.max(0, showing)], out = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const j = (i * 7919) % NP; out[i * 3] = s[j * 3] + ox; out[i * 3 + 1] = s[j * 3 + 1]; out[i * 3 + 2] = s[j * 3 + 2] + oz; }
      return out;
    },
    update({ f: fIn, t, dt, outK = 1, pointer, aspect, halfH, exit = 0 }) {
      m.x += (pointer.x - m.x) * Math.min(1, dt * 3); m.y += (pointer.y - m.y) * Math.min(1, dt * 3);
      const fl = Math.floor(fIn), u0 = fIn - fl, a = ((fl % NI) + NI) % NI, b = (a + 1) % NI;
      api.frame = a + u0;
      const u = u0 > 0.0005 && u0 < 0.9995 ? u0 : -1;
      objs.forEach((o, i) => { if (i !== a && i !== b) setFade(o, 0); });
      if (u < 0) { setFade(objs[u0 >= 0.9995 ? b : a], outK); setFade(objs[u0 >= 0.9995 ? a : b], 0); morph.visible = false; }
      else {
        setPair(a, b); morph.visible = true; MU.uK.value = u;
        MU.uOffA.value.set(TRAVEL[a][0], 0, TRAVEL[a][1]); MU.uOffB.value.set(TRAVEL[b][0], 0, TRAVEL[b][1]);
        setFade(objs[a], (1 - smooth(u / 0.16)) * outK); setFade(objs[b], smooth((u - 0.82) / 0.18) * outK);
      }
      const idx = u < 0 ? (u0 >= 0.9995 ? b : a) : u > 0.5 ? b : a;
      if (idx !== showing) { showing = idx; if (api.onSwap) api.onSwap(showing); }

      // the view follows the swarm along the board, pulling back a little mid-flight
      const kk = u < 0 ? (u0 >= 0.9995 ? 1 : 0) : smooth((u - 0.12) / 0.76), ch = u < 0 ? 0 : Math.sin(Math.PI * u);
      const focus = [lerp(TRAVEL[a][0], TRAVEL[b][0], kk), lerp(TRAVEL[a][1], TRAVEL[b][1], kk)];
      uFocus.value.set(focus[0], focus[1]);
      beacon.position.set(focus[0], 0, focus[1]);
      const oa = objs[a], ob = objs[b];
      streamBase.value = lerp(oa.base, ob.base, kk);
      streamSpread.value = (kk < 0.5 ? (oa.noStream ? 0 : oa.spread) : (ob.noStream ? 0 : ob.spread)) * (1 - ch) * outK;
      halo.position.y = streamBase.value + 0.15; halo.material.opacity = (0.3 + 0.15 * ch) * outK;
      board.spills.forEach((sp, i) => { sp.material.opacity = 0.12 + 0.18 * Math.max(0, 1 - Math.hypot(TRAVEL[i][0] - focus[0], TRAVEL[i][1] - focus[1]) / 2); });

      // the board, tilted towards the camera with the part in view right of the headline (above it on a phone)
      const narrow = aspect < 0.9, halfW = halfH * aspect, pull = Math.sin(Math.PI * kk);
      const s = (narrow ? 0.78 : 1.12) * (1 - 0.16 * pull) * (1 + 0.2 * exit);
      world.rotation.set(0.5 - m.y * 0.06 + pull * 0.08, -0.62 + m.x * 0.16 + Math.sin(t * 0.12) * 0.05, 0);
      world.scale.setScalar(s);
      v.set(focus[0], 0, focus[1]).applyEuler(world.rotation).multiplyScalar(s);
      const ax = narrow ? 0 : halfW * 0.42 + m.x * 0.08, ay = (narrow ? halfH * 0.42 : -0.42 + m.y * 0.05) + exit * halfH * 0.35;
      world.position.set(ax - v.x, ay - v.y, -v.z);
      root.position.copy(world.position); root.rotation.copy(world.rotation); root.scale.copy(world.scale);
      board.updatePulses(reduceMotion ? 1 : t);
    },
    // the board shows while the hero is on screen
    background(visible) { world.visible = visible; },
  };
  return api;
}
