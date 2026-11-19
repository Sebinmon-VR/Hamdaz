// Shared parts for the services' live pictures: helpers, materials, textures, a camera lens, server racks, and BUILD,
// the list of objects. Each kinds-*.js file adds its objects to BUILD; assets/js/svc-live.js draws them on the What We
// Do cards (the design option pages in docs/ draw them too, with docs/live2/live2.js).
import * as THREE from '../../vendor/three.module.min.js';
export { THREE };
export const BUILD = {};
// what each picture shows and does on hover, in a sentence or two (shown under it on docs/all-pictures.html)
export const DESCRIBE = {};
export const CYAN = '#30c1f8';
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const rng = (seed) => { let s = (seed * 2654435761 + 7) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
export const U = { time: { value: 0 } };
export const V2 = THREE.Vector2, V3 = THREE.Vector3;

/* ------------------------------------------------------------------ textures drawn on a canvas */
export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
export let T = null;
export function textures() {
  if (T) return T;
  const ear = (x, w, h) => { x.fillStyle = '#1a1d22'; x.fillRect(0, 0, 22, h); x.fillRect(w - 22, 0, 22, h); x.fillStyle = '#353a42'; x.fillRect(7, h * 0.22, 6, h * 0.56); x.fillRect(w - 13, h * 0.22, 6, h * 0.56); };
  const sheen = (x, w) => { x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, w, 2); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, w, 1); };
  T = {
    radial: canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(0.4, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }, false),
    // 1U server: perforated front, a small status panel on the right
    u1: canvasTex(576, 64, (x, w, h) => {
      x.fillStyle = '#2b3037'; x.fillRect(0, 0, w, h); ear(x, w, h);
      x.fillStyle = '#0b0d10'; for (let r = 0; r < 6; r++) for (let c = 0; c < 52; c++) { x.beginPath(); x.arc(52 + c * 8 + (r % 2) * 4, 12 + r * 8, 2.6, 0, 7); x.fill(); }
      x.fillStyle = '#15181c'; x.fillRect(476, 12, 70, 40); sheen(x, w);
    }),
    // 2U server: twelve drive caddies
    u2: canvasTex(576, 128, (x, w, h) => {
      x.fillStyle = '#23272d'; x.fillRect(0, 0, w, h); ear(x, w, h);
      for (let i = 0; i < 12; i++) { const cx = 34 + i * 42; x.fillStyle = '#16191d'; x.fillRect(cx, 8, 38, 112); x.fillStyle = '#2f343b'; x.fillRect(cx + 2, 10, 34, 72); x.fillStyle = '#0c0e11'; for (let k = 0; k < 9; k++) x.fillRect(cx + 6, 15 + k * 7, 26, 3); x.fillStyle = '#3d434c'; x.fillRect(cx + 3, 90, 32, 26); }
      sheen(x, w);
    }),
    // switch: two rows of ports
    sw: canvasTex(576, 64, (x, w, h) => {
      x.fillStyle = '#1e2227'; x.fillRect(0, 0, w, h); ear(x, w, h);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 24; c++) { const px = 40 + c * 19 + Math.floor(c / 6) * 6, py = 11 + r * 23; x.fillStyle = '#060708'; x.fillRect(px, py, 15, 15); x.fillStyle = '#3a3f46'; x.fillRect(px, py, 15, 2); }
      x.fillStyle = '#0d0f12'; x.fillRect(522, 14, 28, 36); sheen(x, w);
    }),
    blank: canvasTex(576, 64, (x, w, h) => { x.fillStyle = '#1c2026'; x.fillRect(0, 0, w, h); x.fillStyle = '#111317'; for (let c = 0; c < 28; c++) x.fillRect(64 + c * 16, 24, 9, 16); sheen(x, w); }),
  };
  return T;
}

/* ------------------------------------------------------------------ geometry helpers */
// a box with rounded edges and corners (an extruded rounded rectangle with a bevel), smooth-shaded
export function rbox(w, h, d, r = 0.01) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const ax = w / 2 - r, az = d / 2 - r, c = Math.max(1e-4, Math.min(r * 0.6, ax, az) * 0.999);
  const s = new THREE.Shape();
  s.moveTo(-ax + c, -az); s.lineTo(ax - c, -az); s.quadraticCurveTo(ax, -az, ax, -az + c); s.lineTo(ax, az - c); s.quadraticCurveTo(ax, az, ax - c, az);
  s.lineTo(-ax + c, az); s.quadraticCurveTo(-ax, az, -ax, az - c); s.lineTo(-ax, -az + c); s.quadraticCurveTo(-ax, -az, -ax + c, -az);
  const depth = Math.max(1e-4, h - 2 * r);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 5 });
  g.rotateX(-Math.PI / 2); g.translate(0, -depth / 2, 0);
  return smoothed(g);
}
export function smoothed(geo) {
  const pos = geo.attributes.position, map = new Map(), idx = [], verts = [];
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 1e5)},${Math.round(pos.getY(i) * 1e5)},${Math.round(pos.getZ(i) * 1e5)}`;
    let j = map.get(k); if (j === undefined) { j = verts.length / 3; map.set(k, j); verts.push(pos.getX(i), pos.getY(i), pos.getZ(i)); } idx.push(j);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// a disc with a rounded outer edge (lathe profile), sitting on y = 0
export function puck(R, H, rr, inset) {
  const p = [new V2(0, 0), new V2(R - rr, 0)];
  for (let i = 1; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2); p.push(new V2(R - rr + Math.cos(a) * rr, rr + Math.sin(a) * rr)); }
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); p.push(new V2(R - rr + Math.cos(a) * rr, H - rr + Math.sin(a) * rr)); }
  p.push(new V2(inset, H), new V2(inset, H - 0.006), new V2(0, H - 0.006));
  return new THREE.LatheGeometry(p, 96);
}
export const glowMat = (hex, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
export const VS_UV = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// a camera lens facing +z: barrel, metal trim ring, coated glass, a faint ring of light inside
export function lensGroup(r) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r * 1.32, r * 1.38, r * 0.5, 64).rotateX(Math.PI / 2), M.dark));
  g.add(mesh(new THREE.TorusGeometry(r * 1.2, r * 0.09, 16, 72), M.alu, 0, 0, r * 0.25));
  g.add(mesh(new THREE.CircleGeometry(r * 1.12, 64), M.gloss, 0, 0, r * 0.252));
  g.add(mesh(new THREE.TorusGeometry(r * 0.98, r * 0.03, 8, 64), M.dark, 0, 0, r * 0.26));
  g.add(mesh(new THREE.TorusGeometry(r * 0.42, r * 0.025, 8, 48), glowMat(CYAN, 0.7), 0, 0, r * 0.27, { tone: 1 }));
  const R = (r * 0.92) / Math.sin(0.55);
  g.add(mesh(new THREE.SphereGeometry(R, 64, 12, 0, Math.PI * 2, 0, 0.55).rotateX(Math.PI / 2), M.lens, 0, 0, r * 0.255 - R * Math.cos(0.55)));
  return g;
}
// the touch panel's screen: room name, time, a join button and the next meeting
export let PANEL = null;
export function panelTex() {
  if (PANEL) return PANEL;
  const F = '"Segoe UI", system-ui, sans-serif';
  PANEL = canvasTex(640, 420, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#10263b'); g.addColorStop(1, '#06121f'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = `600 30px ${F}`; x.fillText('Board Room', 34, 58);
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `500 26px ${F}`; x.textAlign = 'right'; x.fillText('10:28', w - 34, 58);
    x.textAlign = 'center'; x.fillStyle = '#30c1f8'; x.beginPath(); x.arc(w / 2, 205, 74, 0, 7); x.fill();
    x.fillStyle = '#04213a'; x.font = `700 32px ${F}`; x.fillText('Join', w / 2, 216);
    x.fillStyle = 'rgba(255,255,255,0.88)'; x.font = `600 25px ${F}`; x.fillText('Project review', w / 2, 326);
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.font = `500 20px ${F}`; x.fillText('10:30 – 11:00  ·  6 people', w / 2, 358);
    x.fillStyle = 'rgba(255,255,255,0.1)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.roundRect(w / 2 - 110 + i * 80, 380, 60, 26, 13); x.fill(); }
  });
  return PANEL;
}
export const mesh = (geo, mat, x = 0, y = 0, z = 0, ud) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (ud) Object.assign(m.userData, ud); return m; };

/* ------------------------------------------------------------------ materials (shared by every studio scene) */
export let M = null;
export function materials() {
  if (M) return M;
  const P = (o) => new THREE.MeshPhysicalMaterial(o);
  M = {
    alu: P({ color: 0xd6dbe1, metalness: 1, roughness: 0.28 }),
    dark: P({ color: 0x1a1e24, metalness: 0.7, roughness: 0.4 }),
    paint: P({ color: 0x252a31, metalness: 0.35, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    oak: P({ color: 0x9c7856, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    gloss: P({ color: 0x030406, metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03 }),
    glass: P({ color: 0xd8f1ff, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.26, clearcoat: 1, envMapIntensity: 2.4, depthWrite: false }),
    smoke: P({ color: 0x0b1016, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.3, clearcoat: 1, envMapIntensity: 2.2, depthWrite: false }),
    fabric: P({ color: 0x1c2025, roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color(0x3d434b), sheenRoughness: 0.6 }),
    lens: P({ color: 0x0b0e16, metalness: 0, roughness: 0.03, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [250, 650], envMapIntensity: 2.6, transparent: true, opacity: 0.85 }),
    stone: P({ color: 0xe7e2da, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.45 }),
    walnut: P({ color: 0x5a3e2b, roughness: 0.55, clearcoat: 0.15 }),
    felt: new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 1 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.95, transparent: true }),
  };
  const tx = textures();
  M.bezel = Object.fromEntries(['u1', 'u2', 'sw', 'blank'].map((k) => [k, new THREE.MeshStandardMaterial({ map: tx[k], metalness: 0.5, roughness: 0.42 })]));
  M.carpet.alphaMap = tx.radial;
  // fabric with a fine knit, for the video bars and the speaker
  const knit = canvasTex(128, 128, (x) => { x.fillStyle = '#808080'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#5a5a5a'; for (let r = 0; r < 32; r++) for (let c = 0; c < 32; c++) { x.beginPath(); x.arc(c * 4 + (r % 2) * 2 + 2, r * 4 + 2, 1.15, 0, 7); x.fill(); } }, false);
  knit.wrapS = knit.wrapT = THREE.RepeatWrapping; knit.repeat.set(10, 6);
  M.knit = M.fabric.clone(); M.knit.bumpMap = knit; M.knit.bumpScale = 0.6;
  return M;
}

/* ------------------------------------------------------------------ the objects */
export const U1 = 0.062, LED_GEO = new THREE.BoxGeometry(0.013, 0.008, 0.004);
export function ledMats() {
  const cols = ['#30c1f8', '#30c1f8', '#5ef2c4', '#30c1f8', '#a6e9ff', '#5ef2c4', '#ffb547', '#30c1f8', '#5ef2c4', '#30c1f8'];
  return cols.map((c, i) => { const m = new THREE.MeshBasicMaterial({ color: c }); m.userData = { base: new THREE.Color(c), rate: 0.6 + hash(i + 1) * 4, ph: hash(i + 9) * 10, duty: c === '#ffb547' ? 0.8 : 0.35 }; return m; });
}
export function blink(leds, t) { for (const m of leds) { const u = m.userData, k = Math.floor(t * u.rate + u.ph); m.color.copy(u.base).multiplyScalar(hash(k * 1.37 + u.ph) > u.duty ? 2.6 : 0.12); } }

export function unit(type, wi, di, leds, rand) {
  const g = new THREE.Group(), n = type === 'u2' ? 2 : 1, h = U1 * n - 0.004, fw = wi + 0.03;
  g.add(mesh(new THREE.BoxGeometry(wi, h, di), M.dark, 0, 0, -di / 2, { w: 0.04, e: 0.1 }));
  g.add(mesh(new THREE.PlaneGeometry(fw, h), M.bezel[type], 0, 0, 0.001, { e: 0.6 }));
  const L = (px, y) => g.add(mesh(LED_GEO, leds[Math.floor(rand() * leds.length)], (px / 576 - 0.5) * fw, y, 0.004, { tone: 1, w: 10, e: 0 }));
  if (type === 'u2') for (let i = 0; i < 12; i++) L(34 + i * 42 + 19, (0.5 - 86 / 128) * h);
  else if (type === 'sw') for (let c = 0; c < 24; c++) L(40 + c * 19 + Math.floor(c / 6) * 6 + 7, h * 0.47 - 0.004);
  else if (type === 'u1') { L(492, 0.006); L(508, 0.006); L(524, 0.006); }
  g.userData.h = U1 * n;
  return g;
}
export function rack(leds, seed, hero) {
  const W = 0.6, H = 1.42, D = 0.8, wi = 0.5, di = D - 0.18, front = D / 2 - 0.07;
  const g = new THREE.Group(), rand = rng(seed);
  for (const s of [-1, 1]) g.add(mesh(rbox(0.024, H - 0.04, D, 0.008), M.paint, s * (W / 2 - 0.012), (H - 0.04) / 2, 0));
  g.add(mesh(rbox(W, 0.04, D, 0.012), M.paint, 0, H - 0.02, 0));
  g.add(mesh(new THREE.BoxGeometry(W - 0.03, 0.07, D - 0.05), M.dark, 0, 0.035, 0));
  g.add(mesh(new THREE.BoxGeometry(W - 0.04, H - 0.1, 0.012), M.paint, 0, H / 2, -D / 2 + 0.01, { w: 0.1, e: 0.2 }));
  for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.018, H - 0.16, 0.02), M.dark, s * (wi / 2 + 0.02), H / 2, front - 0.012));
  g.add(mesh(new THREE.BoxGeometry(W - 0.14, 0.005, 0.005), glowMat(CYAN, 2.4), 0, H - 0.05, D / 2 + 0.002, { tone: 1 }));
  const plan = hero ? ['u2', 'u2', 'u2', 'u1', 'u1', 'blank', 'u2', 'u1', 'u1', 'u2', 'u1', 'u1', 'blank', 'sw'] : [];
  if (!hero) { let y = 0; while (y < 18) { const r = rand(), t = r < 0.42 ? 'u2' : r < 0.8 ? 'u1' : r < 0.9 ? 'blank' : 'sw'; const n = t === 'u2' ? 2 : 1; if (y + n > 19) break; plan.push(t); y += n; } }
  let y = 0.09, slide = null;
  for (const type of plan) {
    const u = unit(type, wi, di, leds, rand); u.position.set(0, y + u.userData.h / 2, front); g.add(u);
    if (hero && !slide && type === 'u2' && y > 0.55) slide = u;
    y += u.userData.h;
  }
  // a glass door on a hinge at its left edge
  const door = new THREE.Group(); door.position.set(-W / 2 + 0.008, 0, D / 2); g.add(door);
  const fw = W - 0.016, fh = H - 0.11, y0 = 0.075;
  const bar = (w, h, x, yy) => door.add(mesh(rbox(w, h, 0.02, 0.006), M.paint, x, yy, 0.01));
  bar(0.036, fh, 0.018, y0 + fh / 2); bar(0.036, fh, fw - 0.018, y0 + fh / 2); bar(fw, 0.04, fw / 2, y0 + 0.02); bar(fw, 0.04, fw / 2, y0 + fh - 0.02);
  door.add(mesh(new THREE.PlaneGeometry(fw - 0.07, fh - 0.08), M.smoke, fw / 2, y0 + fh / 2, 0.01, { w: 0.05, e: 0 }));
  door.add(mesh(rbox(0.012, 0.24, 0.022, 0.005), M.alu, fw - 0.05, y0 + fh * 0.55, 0.03));
  return { g, door, slide };
}

