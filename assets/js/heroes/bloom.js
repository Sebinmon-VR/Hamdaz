// Element "bloom" (home page hero): AI seeing something alive. A large open flower, peony-like, rendered as
// an x-ray: translucent petals with glowing edges and fine veins, a curved stem and a leaf, turning slowly
// while its petals breathe. One box of the scan sees it as it is ("not.xray": real pink petals), and the
// scan's annotations (boxed labels locked onto the flower, live coordinates, fine lines between them,
// faint circles) are drawn by drawHud() on a 2D layer over the stage.
// points(n) gives points on the petals, where the home page's particles start.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const xrayVertex = /* glsl */ `
  uniform float uTime;
  uniform float uBreath;
  attribute float aPhase;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const xrayFragment = /* glsl */ `
  uniform vec4 uBox;   // the "not.xray" box on screen, in device pixels: x, y (from the bottom), w, h
  uniform float uIntro;
  uniform float uFade;
  uniform float uVeins;
  uniform vec3 uTint;  // its real colour, seen in the box
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    float facing = abs(dot(normalize(vN), normalize(vV)));
    float rim = pow(1.0 - facing, 1.7);
    // fine veins running along the petal, fanning out from its base
    float fan = (vUv.x - 0.5) / max(0.12, vUv.y + 0.15);
    float vein = smoothstep(0.06, 0.0, abs(fract(fan * 3.2 + 0.5) - 0.5)) * smoothstep(0.0, 0.25, vUv.y) * (1.0 - vUv.y * 0.6);
    float mid = smoothstep(0.035, 0.0, abs(vUv.x - 0.5)) * (1.0 - vUv.y);
    // dim on its own: the petals overlap many times over, and their light adds up
    vec3 xray = vec3(0.7, 0.85, 1.0) * (0.012 + rim * 0.2 + (vein * 0.05 + mid * 0.07) * uVeins);
    vec2 q = gl_FragCoord.xy - uBox.xy;
    bool inBox = q.x > 0.0 && q.y > 0.0 && q.x < uBox.z && q.y < uBox.w;
    vec3 col = xray;
    float a = 1.0;
    if (inBox) {
      // seen as it is: soft pink petals, lighter at their edges, deeper at the base
      col = (mix(uTint * 0.45, uTint * 1.1 + 0.05, rim + vUv.y * 0.35) * (0.5 + 0.5 * facing) + vec3(0.25, 0.1, 0.15) * vein * 0.4) * 0.16;
    }
    gl_FragColor = vec4(col * uIntro * uFade, a);
  }
`;

// a petal: u across, v along; cupped across, curling back at the tip
function petalGeometry(len, wid, cup, curl) {
  const g = new THREE.PlaneGeometry(1, 1, 18, 26);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5;
    const v = p.getY(i) + 0.5;
    // wide almost to the tip, then rounded off, as a peony's petal is
    const w = wid * Math.pow(v, 0.45) * Math.sqrt(Math.max(0, 1 - Math.pow(v, 5))) + 0.01;
    const x = (u - 0.5) * w;
    // a little ruffle along the edge, as a peony has
    const ruffle = Math.sin(u * Math.PI * 7 + v * 3) * 0.018 * v * v;
    const z = x * x * cup - v * v * curl * len + ruffle; // cupped towards the heart, the tip curling away
    p.setXYZ(i, x, v * len, z);
  }
  g.computeVertexNormals();
  return g;
}

export function build({ root, U, reduceMotion }) {
  const rand = rng(515);
  const flower = new THREE.Group();
  root.add(flower);
  const uFade = { value: 1 };
  const uBox = { value: new THREE.Vector4(-10, -10, 0, 0) };
  const mats = [];
  const xray = (tint, veins = 1) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uIntro: U.uIntro, uFade, uBox, uBreath: { value: 0 }, uVeins: { value: veins }, uTint: { value: new THREE.Color(tint) } },
      vertexShader: xrayVertex,
      fragmentShader: xrayFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    mats.push(m);
    return m;
  };
  const petalMat = xray('#f3a3c3');
  const leafMat = xray('#7fae8a', 0.7);

  // the bloom: rings of petals, the inner ones small and upright, the outer ones large and open
  const head = new THREE.Group();
  head.position.y = 0.55;
  flower.add(head);
  const petals = [];
  const rings = [
    { n: 6, len: 0.36, wid: 0.34, open: 0.25, cup: 2.4, curl: 0.05, y: 0.08 },
    { n: 8, len: 0.5, wid: 0.46, open: 0.5, cup: 1.8, curl: 0.08, y: 0.05 },
    { n: 9, len: 0.66, wid: 0.58, open: 0.82, cup: 1.3, curl: 0.12, y: 0.02 },
    { n: 10, len: 0.82, wid: 0.7, open: 1.12, cup: 1.0, curl: 0.16, y: 0.0 },
    { n: 11, len: 0.92, wid: 0.78, open: 1.38, cup: 0.85, curl: 0.2, y: -0.03 },
  ];
  rings.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const geo = petalGeometry(r.len * (0.9 + rand() * 0.2), r.wid * (0.9 + rand() * 0.2), r.cup, r.curl);
      const m = new THREE.Mesh(geo, petalMat);
      const holder = new THREE.Group();
      holder.rotation.y = (i / r.n) * Math.PI * 2 + ri * 0.45 + rand() * 0.15;
      holder.position.y = r.y;
      m.rotation.x = -r.open + (rand() - 0.5) * 0.12; // leaning out from upright
      m.position.z = 0.03 * ri;
      holder.add(m);
      head.add(holder);
      petals.push({ m, base: m.rotation.x, phase: rand() * 6.28, ring: ri });
    }
  });
  // the stamens at its heart
  {
    const n = 220;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.12;
      p.set([Math.cos(a) * r, 0.1 + rand() * 0.08, Math.sin(a) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    head.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffe3b0', size: 0.016, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));
  }
  // the stem, curving down, and a leaf
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(0.05, 0.1, 0.02), new THREE.Vector3(0.18, -0.6, 0.05), new THREE.Vector3(0.36, -1.4, 0)]);
  flower.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 60, 0.03, 10, false), xray('#7fae8a', 0)));
  const leaf = new THREE.Mesh(petalGeometry(0.62, 0.3, 1.4, 0.18), leafMat);
  leaf.position.copy(stemCurve.getPoint(0.55));
  leaf.rotation.set(-0.5, 0.4, -1.05);
  flower.add(leaf);
  const leaf2 = new THREE.Mesh(petalGeometry(0.44, 0.22, 1.4, 0.15), leafMat);
  leaf2.position.copy(stemCurve.getPoint(0.72));
  leaf2.rotation.set(-0.4, -0.6, 1.0);
  flower.add(leaf2);

  // where the annotations lock on, in the flower's own space
  root.updateMatrixWorld(true);
  const local = (o, v) => flower.worldToLocal(o.localToWorld(v.clone()));
  const outer = petals.filter((p) => p.ring === 4);
  const marks = [
    { id: 'object.bloom', at: new THREE.Vector3(0, 0.75, 0), box: [-260, 0, 112, 24] },
    { id: '.xray', at: local(outer[1].m, new THREE.Vector3(0, 0.7, 0)), box: [-150, -60, 72, 24] },
    { id: 'petal_04.png', at: local(outer[6].m, new THREE.Vector3(0, 0.6, 0)), box: [80, -10, 112, 74], img: true },
    { id: 'stem.data', at: stemCurve.getPoint(0.7), box: [40, 10, 92, 24] },
    { id: 'xray.effect', at: local(outer[9].m, new THREE.Vector3(0, 0.45, 0)), box: [-210, 60, 104, 70], img: true },
    { id: 'leaf.node', at: leaf.localToWorld(new THREE.Vector3(0, 0.4, 0)).clone(), box: [60, 30, 92, 24] },
  ];
  marks[5].at = flower.worldToLocal(marks[5].at);
  const links = [[0, 1], [0, 2], [0, 4], [2, 3], [4, 3], [3, 5], [1, 4]];
  // the box that sees it as it is
  const real = { at: new THREE.Vector3(0, 0.62, 0), w: 0.55, h: 0.48 };

  // points on the petals, for the particles
  const samples = [];
  for (const p of petals) {
    const pos = p.m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 3) samples.push(local(p.m, new THREE.Vector3().fromBufferAttribute(pos, i)));
  }
  const points = (n) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const s = samples[Math.floor(Math.random() * samples.length)];
      out.set([s.x + (Math.random() - 0.5) * 0.01, s.y + (Math.random() - 0.5) * 0.01, s.z + (Math.random() - 0.5) * 0.01], i * 3);
    }
    return out;
  };

  // the scan's annotations, on a 2D layer: project(v) gives the screen point of a point in world space
  const crop = document.createElement('canvas');
  crop.width = 18;
  crop.height = 12;
  const cctx = crop.getContext('2d');
  const v3 = new THREE.Vector3();
  const box = { x: 0, y: 0, w: 0, h: 0 };
  function drawHud({ ctx, project, W, H, alpha, t, source, dpr }) {
    ctx.clearRect(0, 0, W, H);
    if (alpha <= 0.01) { uBox.value.set(-10, -10, 0, 0); return; }
    flower.updateMatrixWorld();
    const at = marks.map((m) => project(v3.copy(m.at).applyMatrix4(flower.matrixWorld)));
    const narrow = W < 760;
    ctx.save();
    ctx.globalAlpha = alpha;
    // the "not.xray" box: the flower's heart, seen as it is (the shader colours it); sized from the flower
    const c = project(v3.copy(real.at).applyMatrix4(flower.matrixWorld));
    const e1 = project(v3.set(real.w, real.at.y, 0).applyMatrix4(flower.matrixWorld));
    const half = Math.max(40, Math.abs(e1.x - c.x));
    box.w = half * 2;
    box.h = half * 2 * (real.h / real.w);
    box.x = c.x - half;
    box.y = c.y - box.h * 0.62;
    uBox.value.set(box.x * dpr, (H - box.y - box.h) * dpr, box.w * dpr, box.h * dpr);
    // faint circles and a line behind, around the flower
    ctx.strokeStyle = 'rgba(220,235,255,0.12)';
    ctx.lineWidth = 1;
    for (const r of [H * 0.3, H * 0.46]) { ctx.beginPath(); ctx.arc(c.x + H * 0.08, c.y + H * 0.05, r, 0, Math.PI * 2); ctx.stroke(); }
    // lines between the nodes
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    for (const [a, b] of links) { ctx.moveTo(at[a].x, at[a].y); ctx.lineTo(at[b].x, at[b].y); }
    ctx.stroke();
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'top';
    // the real-colour box, and its labels
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeRect(Math.round(box.x) + 0.5, Math.round(box.y) + 0.5, Math.round(box.w), Math.round(box.h));
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('flowers.jpeg', Math.round(box.x) + 7, Math.round(box.y) + 7);
    ctx.fillText('not.xray', Math.round(box.x + box.w) - 58, Math.round(box.y + box.h) - 16);
    marks.forEach((m, i) => {
      if (narrow && m.img) return;
      const p = at[i];
      const [dx, dy, w, h] = m.box;
      const x = Math.round(p.x + dx) + 0.5;
      const y = Math.round(p.y + dy) + 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(dx < 0 ? x + w : x, y + h / 2);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (m.img && source) {
        cctx.clearRect(0, 0, crop.width, crop.height);
        try { cctx.drawImage(source, (p.x - 34) * dpr, (p.y - 22) * dpr, 68 * dpr, 44 * dpr, 0, 0, crop.width, crop.height); } catch (e) { /* not ready */ }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(crop, x, y, w, h);
        ctx.fillStyle = 'rgba(48,193,248,0.1)';
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.fillStyle = 'rgba(6,20,35,0.55)';
        ctx.fillRect(x, y, w, h);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(m.id, x + 7, y + 7);
      if (m.img) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`${(m.at.x * 1000 + Math.sin(t * 0.7 + i) * 3).toFixed(3)}, ${(m.at.y * 1000 + Math.cos(t * 0.5 + i) * 3).toFixed(2)}`, x, y + h + 6);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const tt = project(v3.set(0.36, -1.45, 0).applyMatrix4(flower.matrixWorld));
    ctx.fillText('HAMDAZ / SENSE.SCAN 01', Math.round(tt.x + 14), Math.round(tt.y - 4));
    ctx.restore();
  }

  return {
    anchors: {},
    frame: flower, // the particles start in this group's space (it turns)
    points,
    drawHud,
    update({ t }) {
      flower.rotation.y = reduceMotion ? 0.2 : Math.sin(t * 0.12) * 0.35;
      // the petals breathe, opening and closing a touch
      if (!reduceMotion) for (const p of petals) p.m.rotation.x = p.base + Math.sin(t * 0.8 + p.phase) * 0.025 * (1 + p.ring * 0.3);
    },
    fade(k) { uFade.value = k; },
  };
}
