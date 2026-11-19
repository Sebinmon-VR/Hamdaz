// Industry Solutions and Staffing & Outsourcing: live pictures (style A) for docs/all-pictures.html
//   education    a desk globe with glowing dot continents, on a stack of books
//   health       a patient monitor on a rolling stand: ECG, pulse oximetry and breathing traces
//   retail       a card payment terminal on a swivel stand, with a card that taps on it
//   farming      a crop-spraying drone hovering over a patch of crop rows
//   staffing     an engineer's hard hat with a headlamp, on a closed laptop, with an ID badge on a lanyard
//   outsourcing  a 24-hour desk clock with a ring that fills round the day
import { THREE, BUILD, DESCRIBE, M, CYAN, U, VS_UV, mesh, rbox, puck, glowMat, lensGroup, canvasTex, textures, lerp, smooth, V2, V3 } from './kit.js';

const PINK = '#eb4b96';
const lathe = (pts, seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new V2(r, y)), seg);
const arc = (cx, cy, r, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const glowSprite = (col, s, op) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.setScalar(s); return m; };
const pool = (sx, sz, col, op) => { const m = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: textures().radial, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0, 0, { noDust: true }); m.scale.set(sx, 1, sz); return m; };
const raw = (r, g, b) => new THREE.Color().setRGB(r, g, b);

// a soft cone of light: bright at its tip, fading to the far end and at the edges (apex at the origin, along -y)
function beam(r, len, col) {
  const geo = new THREE.ConeGeometry(r, len, 48, 1, true).translate(0, -len / 2, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uCol: { value: col }, uOp: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying vec3 vN, vV; void main() { float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uCol, pow(vUv.y, 1.5) * f * f * uOp); }',
  });
  return mesh(geo, mat, 0, 0, 0, { noDust: true });
}

// extra materials for these objects, made on first use
let X = null;
function mats() {
  if (X) return X;
  const P = (o) => new THREE.MeshPhysicalMaterial(o);
  X = {
    white: P({ color: 0xf2f3f4, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.1 }),
    medical: P({ color: 0xe3e7eb, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    ocean: P({ color: 0x0b1828, metalness: 0.25, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }),
    cloth1: P({ color: 0x1b2d47, roughness: 0.75, sheen: 0.5, sheenColor: new THREE.Color(0x4a6488) }),
    cloth2: P({ color: 0x1f4a4f, roughness: 0.75, sheen: 0.5, sheenColor: new THREE.Color(0x5f9aa0) }),
    paper: P({ color: 0xece6da, roughness: 0.92 }),
    gold: P({ color: 0xc9a45c, metalness: 1, roughness: 0.32 }),
    term: P({ color: 0x1d2127, metalness: 0.2, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    key: P({ color: 0x2c3139, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    keyR: P({ color: 0xb34848, roughness: 0.38, clearcoat: 0.6 }),
    keyY: P({ color: 0xc89a3a, roughness: 0.38, clearcoat: 0.6 }),
    keyG: P({ color: 0x3a9762, roughness: 0.38, clearcoat: 0.6 }),
    card: P({ color: 0x0d2236, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x2a2019, roughness: 1 }),
    soilDark: new THREE.MeshStandardMaterial({ color: 0x1f1813, roughness: 1 }),
    carbon: P({ color: 0x15181c, metalness: 0.25, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
    strap: P({ color: 0x173452, roughness: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0x3f78a8) }),
  };
  return X;
}

/* ------------------------------------------------------------------ education: the globe's land mask */
// assets/img/earth/earth-water.png: an equirectangular map, land dark, water light
let LAND = null; const LAND_CB = [];
function onLand(cb) {
  if (LAND) { cb(LAND); return; }
  LAND_CB.push(cb); if (LAND_CB.length > 1) return;
  const img = new Image();
  img.onload = () => {
    const w = 360, h = 180, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data;
    LAND = (lat, lon) => { const u = Math.floor(((lon + Math.PI) / (2 * Math.PI)) * w) % w, v = Math.min(h - 1, Math.max(0, Math.floor(((Math.PI / 2 - lat) / Math.PI) * h))); return d[(v * w + u) * 4] < 128; };
    LAND_CB.splice(0).forEach((f) => f(LAND));
  };
  img.src = new URL('../../assets/img/earth/earth-water.png', import.meta.url).href;
}
// latitude/longitude to a point on the unit sphere (east to the right when seen from outside)
const geo3 = (lat, lon) => new V3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));

/* ------------------------------------------------------------------ health: the monitor's screen */
let MON = null;
function monitorTex() {
  if (MON) return MON;
  const F = '"Segoe UI", system-ui, sans-serif';
  MON = canvasTex(760, 500, (x, w, h) => {
    x.fillStyle = '#03080d'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0d1b26'; x.fillRect(530, 18, 2, h - 36); x.fillRect(546, 178, w - 566, 2); x.fillRect(546, 328, w - 566, 2);
    x.font = `600 20px ${F}`; x.fillStyle = '#3dff8c'; x.fillText('II', 18, 34); x.fillStyle = '#30c1f8'; x.fillText('Pleth', 18, 196); x.fillStyle = '#c9d1da'; x.fillText('Resp', 18, 356);
    x.fillStyle = '#3dff8c'; x.font = `600 22px ${F}`; x.fillText('HR', 560, 50); x.font = `600 96px ${F}`; x.fillText('72', 560, 150);
    // the heart, at 706..734 x 28..54
    x.beginPath(); x.moveTo(720, 54); x.bezierCurveTo(700, 40, 700, 26, 711, 27); x.bezierCurveTo(716, 27, 719, 31, 720, 34); x.bezierCurveTo(721, 31, 724, 27, 729, 27); x.bezierCurveTo(740, 26, 740, 40, 720, 54); x.fill();
    x.fillStyle = '#30c1f8'; x.font = `600 22px ${F}`; x.fillText('SpO₂', 560, 212); x.font = `600 80px ${F}`; x.fillText('98', 560, 298); x.font = `600 26px ${F}`; x.fillText('%', 660, 298);
    x.fillStyle = '#c9d1da'; x.font = `600 20px ${F}`; x.fillText('NIBP', 560, 362); x.font = `500 46px ${F}`; x.fillText('120/80', 560, 420);
  }, false);
  return MON;
}
const ECG = `uniform float uTime, uWake, uRate, uBeat; uniform sampler2D uMap; varying vec2 vUv;
  const float X0 = 0.03, X1 = 0.685, SW = 4.0, ASP = 1.52;
  float ecg(float p) { return 0.10 * exp(-pow((p - 0.16) / 0.028, 2.0)) - 0.12 * exp(-pow((p - 0.275) / 0.009, 2.0)) + 1.0 * exp(-pow((p - 0.29) / 0.009, 2.0)) - 0.26 * exp(-pow((p - 0.307) / 0.01, 2.0)) + 0.24 * exp(-pow((p - 0.5) / 0.05, 2.0)); }
  float plet(float p) { return exp(-pow((p - 0.36) / 0.075, 2.0)) + 0.32 * exp(-pow((p - 0.58) / 0.06, 2.0)) - 0.45; }
  float wave(int k, float tt) { if (k == 0) return ecg(fract(tt * uRate)); if (k == 1) return plet(fract(tt * uRate - 0.12)); return sin(fract(tt * 0.27) * 6.2832); }
  vec3 trace(int k, float y0, float amp, vec3 col) {
    float w = X1 - X0, xs = (vUv.x - X0) / w;
    if (xs < 0.0 || xs > 1.0) return vec3(0.0);
    float a = fract(uTime / SW) - xs; if (a < 0.0) a += 1.0;
    if (a < 0.03) return vec3(0.0);
    float tt = uTime - a * SW, e = 0.003;
    float v = y0 + amp * wave(k, tt), v1 = y0 + amp * wave(k, tt + e * SW), v0 = y0 + amp * wave(k, tt - e * SW);
    float sl = (v1 - v0) / (2.0 * e * w * ASP), d = abs(vUv.y - v) / sqrt(1.0 + sl * sl);
    return col * (smoothstep(0.0045, 0.0012, d) + 0.22 * exp(-d * d / 0.00012)) * (0.55 + 0.45 * (1.0 - a));
  }
  void main() {
    vec3 col = texture2D(uMap, vUv).rgb;
    if (vUv.x > 0.92 && vUv.x < 0.975 && vUv.y > 0.885 && vUv.y < 0.95) col *= 0.25 + uBeat * 1.3;
    col += trace(0, 0.74, 0.16, vec3(0.24, 1.0, 0.55));
    col += trace(1, 0.45, 0.11, vec3(0.19, 0.76, 0.97));
    col += trace(2, 0.155, 0.045, vec3(0.8, 0.84, 0.88));
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

/* ------------------------------------------------------------------ retail: the terminal's screen and the card */
let POS = null, CARD = null;
function posTex() {
  if (POS) return POS;
  const F = '"Segoe UI", system-ui, sans-serif';
  POS = canvasTex(768, 288, (x) => {
    for (const ox of [0, 384]) { const g = x.createLinearGradient(0, 0, 0, 288); g.addColorStop(0, '#0e2235'); g.addColorStop(1, '#06111c'); x.fillStyle = g; x.fillRect(ox, 0, 384, 288); }
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `500 22px ${F}`; x.fillText('Total', 30, 50);
    x.fillStyle = '#ffffff'; x.font = `600 50px ${F}`; x.fillText('AED 248.00', 30, 108);
    x.strokeStyle = '#30c1f8'; x.lineCap = 'round'; x.lineWidth = 7;
    for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(162 + i * 2, 192, 14 + i * 14, -0.75, 0.75); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `500 21px ${F}`; x.textAlign = 'center'; x.fillText('Tap card', 192, 262);
    x.fillStyle = '#30c1f8'; x.beginPath(); x.arc(576, 118, 58, 0, 7); x.fill();
    x.strokeStyle = '#04213a'; x.lineWidth = 12; x.lineJoin = 'round'; x.beginPath(); x.moveTo(550, 120); x.lineTo(569, 140); x.lineTo(604, 99); x.stroke();
    x.fillStyle = '#ffffff'; x.font = `600 32px ${F}`; x.fillText('Approved', 576, 228);
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `500 20px ${F}`; x.fillText('AED 248.00', 576, 262);
  }, false);
  return POS;
}
function cardTex() {
  if (CARD) return CARD;
  CARD = canvasTex(512, 324, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0c2238'); g.addColorStop(0.65, '#14476a'); g.addColorStop(1, '#2a8fbf'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.05)'; x.beginPath(); x.arc(w * 0.92, h * 0.1, 220, 0, 7); x.fill();
    const c = x.createLinearGradient(56, 104, 130, 160); c.addColorStop(0, '#e9d39a'); c.addColorStop(1, '#a8873f'); x.fillStyle = c; x.beginPath(); x.roundRect(56, 104, 74, 56, 9); x.fill();
    x.strokeStyle = 'rgba(80,60,20,0.55)'; x.lineWidth = 2; x.beginPath(); x.moveTo(56, 132); x.lineTo(130, 132); x.moveTo(93, 104); x.lineTo(93, 160); x.moveTo(74, 118); x.lineTo(112, 118); x.moveTo(74, 146); x.lineTo(112, 146); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 4; x.lineCap = 'round'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(160, 132, 10 + i * 9, -0.7, 0.7); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = '500 30px "Segoe UI", system-ui, sans-serif'; x.fillText('••••   ••••   ••••   4821', 56, 250);
  });
  return CARD;
}

/* ------------------------------------------------------------------ farming: a seedling texture */
let LEAF = null;
function leafTex() {
  if (LEAF) return LEAF;
  LEAF = canvasTex(128, 128, (x) => {
    x.clearRect(0, 0, 128, 128);
    const leaf = (ang, len, wid, c0, c1) => {
      x.save(); x.translate(64, 126); x.rotate(ang);
      const g = x.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g;
      x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(wid, -len * 0.5, 0, -len); x.quadraticCurveTo(-wid, -len * 0.5, 0, 0); x.fill();
      x.strokeStyle = 'rgba(20,50,20,0.45)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len * 0.92); x.stroke(); x.restore();
    };
    leaf(-0.95, 70, 20, '#2f6b33', '#7cc472'); leaf(0.9, 74, 21, '#2f6b33', '#86cf78'); leaf(-0.45, 102, 24, '#2a6230', '#6fbf67');
    leaf(0.4, 106, 25, '#2a6230', '#79c86f'); leaf(0.02, 118, 23, '#285d2d', '#8ad77d'); leaf(-1.3, 50, 15, '#2f6b33', '#6ab463'); leaf(1.3, 52, 15, '#2f6b33', '#6ab463');
  });
  return LEAF;
}

/* ------------------------------------------------------------------ staffing: the ID badge */
let BADGE = null;
function badgeTex() {
  if (BADGE) return BADGE;
  const F = '"Segoe UI", system-ui, sans-serif';
  BADGE = canvasTex(256, 370, (x, w, h) => {
    x.fillStyle = '#f4f6f8'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#30c1f8'; x.fillRect(0, 0, w, 92);
    x.fillStyle = '#c7ced6'; x.beginPath(); x.roundRect(98, 16, 60, 14, 7); x.fill();
    x.fillStyle = '#ffffff'; x.font = `700 24px ${F}`; x.textAlign = 'center'; x.fillText('RESIDENT', w / 2, 62);
    x.fillStyle = '#0c2a46'; x.font = `700 30px ${F}`; x.fillText('ENGINEER', w / 2, 140);
    x.fillStyle = '#cfd6dd'; x.fillRect(48, 166, 160, 12); x.fillRect(72, 190, 112, 10);
    const r = (s) => { const v = Math.sin(s * 91.7) * 43758.5; return v - Math.floor(v); };
    x.fillStyle = '#0c2a46'; for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) if (r(i * 13 + j * 7) > 0.5 || (i < 3 && j < 3) || (i > 7 && j < 3) || (i < 3 && j > 7)) x.fillRect(73 + i * 10, 228 + j * 10, 10, 10);
  });
  return BADGE;
}

/* ------------------------------------------------------------------ outsourcing: the 24-hour dial */
let DIAL = null;
function dialTex() {
  if (DIAL) return DIAL;
  const F = '"Segoe UI", system-ui, sans-serif';
  DIAL = canvasTex(1024, 1024, (x, w) => {
    const c = w / 2, g = x.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, '#13293f'); g.addColorStop(1, '#060f1a'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.save(); x.translate(c, c);
    for (let i = 0; i < 96; i++) { const a = (i / 96) * Math.PI * 2, major = i % 4 === 0, big = i % 24 === 0; x.save(); x.rotate(a);
      x.fillStyle = big ? '#ffffff' : major ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'; const l = big ? 30 : major ? 22 : 10, wd = big ? 7 : major ? 4 : 2; x.fillRect(-wd / 2, -c * 0.985, wd, l); x.restore(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let hr = 0; hr < 24; hr += 3) { const a = (hr / 24) * Math.PI * 2, big = hr % 6 === 0; x.fillStyle = big ? '#ffffff' : 'rgba(255,255,255,0.45)'; x.font = `${big ? 600 : 500} ${big ? 74 : 46}px ${F}`;
      x.fillText(String(hr === 0 ? 24 : hr), Math.sin(a) * c * 0.66, -Math.cos(a) * c * 0.66); }
    x.fillStyle = '#30c1f8'; x.font = `600 44px ${F}`; x.fillText('24/7', 0, -c * 0.3);
    x.restore();
  });
  return DIAL;
}
const RING = `uniform float uFill, uGlow, uTime; varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5; float a = fract(atan(p.x, p.y) / 6.2832 + 1.0);
    float on = 1.0 - smoothstep(uFill - 0.002, uFill + 0.002, a);
    float head = exp(-pow((a - uFill) * 60.0, 2.0)) * step(uFill, 0.999);
    vec3 c = vec3(0.19, 0.76, 0.97);
    gl_FragColor = vec4(c * (0.07 + on * (0.75 + uGlow * 0.6) + head * 1.4), 1.0);
  }`;

Object.assign(BUILD, {
  // Education Services: a desk globe on a stack of books; the continents are dots of light, Abu Dhabi in pink
  education() {
    const x = mats(), g = new THREE.Group();
    const book = (w, h, d, cover, y, ry, dx) => {
      const b = new THREE.Group(); b.position.set(dx, y, 0); b.rotation.y = ry; g.add(b);
      b.add(mesh(rbox(w, 0.009, d, 0.003), cover, 0, h / 2 - 0.0045, 0));
      b.add(mesh(rbox(w, 0.009, d, 0.003), cover, 0, -h / 2 + 0.0045, 0));
      b.add(mesh(rbox(0.016, h, d, 0.006), cover, -w / 2 + 0.008, 0, 0));
      b.add(mesh(new THREE.BoxGeometry(w - 0.024, h - 0.016, d - 0.016), x.paper, 0.006, 0, 0));
      for (const s of [-1, 1]) b.add(mesh(new THREE.BoxGeometry(0.003, h * 0.8, 0.012), x.gold, -w / 2 - 0.0005, 0, s * d * 0.3));
    };
    book(0.68, 0.075, 0.47, x.cloth1, 0.0375, 0.1, 0);
    book(0.58, 0.062, 0.41, x.cloth2, 0.106, -0.16, 0.02);
    const y0 = 0.137, R = 0.3, Rm = R + 0.034, cY = y0 + 0.03 + 0.075 + Rm;
    g.add(mesh(puck(0.15, 0.03, 0.012, 0.0), M.alu, 0, y0, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.08, 32), M.alu, 0, y0 + 0.03 + 0.04, 0));
    const gl = new THREE.Group(); gl.position.y = cY; gl.rotation.y = -0.55; g.add(gl);
    gl.add(mesh(new THREE.TorusGeometry(Rm, 0.009, 16, 180), M.alu));
    const tilt = new THREE.Group(); tilt.rotation.z = 0.41; gl.add(tilt);
    for (const s of [-1, 1]) tilt.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 16), M.alu, 0, s * (R + 0.017), 0));
    const spin = new THREE.Group(); tilt.add(spin);
    spin.add(mesh(new THREE.SphereGeometry(R, 96, 64), x.ocean));
    const dotM = glowMat(CYAN, 1.1);
    onLand((land) => {
      const N = 12000, pts = [];
      for (let i = 0; i < N; i++) { const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), ph = i * 2.399963; const px = Math.cos(ph) * r, pz = Math.sin(ph) * r; if (land(Math.asin(y), Math.atan2(-pz, px))) pts.push(new V3(px, y, pz)); }
      const im = new THREE.InstancedMesh(new THREE.CircleGeometry(0.0042, 10), dotM, pts.length), o = new THREE.Object3D();
      pts.forEach((p, i) => { o.position.copy(p).multiplyScalar(R * 1.003); o.lookAt(p.x * 2 * R, p.y * 2 * R, p.z * 2 * R); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
      im.userData.tone = 1; spin.add(im);
    });
    const home = geo3(24.45 * Math.PI / 180, 54.37 * Math.PI / 180);
    const beaconM = glowMat(PINK, 2.2), beacon = mesh(new THREE.CircleGeometry(0.009, 20), beaconM, 0, 0, 0, { tone: 2 });
    beacon.position.copy(home).multiplyScalar(R * 1.005); beacon.lookAt(home.clone().multiplyScalar(2 * R)); spin.add(beacon);
    const bGlow = glowSprite(PINK, 0.08, 0.6); bGlow.position.copy(home).multiplyScalar(R * 1.02); spin.add(bGlow);
    const halo = glowSprite(CYAN, R * 2.9, 0.16); gl.add(halo);
    let ang = 1.15;
    return {
      g, frame: { target: [0, 0.47, 0], dist: 2.85, az: 0.35, el: 0.14 }, top: 0.95, dustN: 16000,
      shadows: [[0, 0, 1.2, 0.95, 0.85], [0, 0, 0.5, 0.5, 0.3]],
      anim(t, h, dt) {
        ang += (dt || 0) * lerp(0.09, 0.7, h); spin.rotation.y = ang;
        dotM.color.set(CYAN).multiplyScalar(1.0 + h * 1.5);
        const p = 0.5 + 0.5 * Math.sin(t * 3);
        bGlow.material.opacity = 0.35 + p * 0.45; beaconM.color.set(PINK).multiplyScalar(1.6 + p * 1.2);
        halo.material.opacity = 0.14 + h * 0.14;
      },
    };
  },

  // Healthcare Services: a patient monitor on a rolling stand; the traces sweep across, the alarm light and the
  // heart beat in time; on hover the screen wakes and the beat comes through stronger
  health() {
    const x = mats(), g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.35, c = Math.cos(a), s = -Math.sin(a);
      const leg = mesh(rbox(0.3, 0.028, 0.05, 0.012), M.dark, c * 0.15, 0.062, s * 0.15); leg.rotation.y = a; g.add(leg);
      g.add(mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 28).rotateZ(Math.PI / 2), M.gloss, c * 0.285, 0.026, s * 0.285));
      g.add(mesh(rbox(0.016, 0.03, 0.03, 0.005), M.alu, c * 0.285, 0.05, s * 0.285));
    }
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.06, 32), M.dark, 0, 0.065, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.86, 32), M.alu, 0, 0.52, 0));
    const mon = new THREE.Group(); mon.position.set(0, 1.08, 0.065); g.add(mon);
    mon.add(mesh(rbox(0.09, 0.11, 0.07, 0.015), M.dark, 0, -0.06, -0.06));
    mon.add(mesh(rbox(0.7, 0.52, 0.085, 0.036), x.medical));
    mon.add(mesh(rbox(0.63, 0.425, 0.012, 0.02), M.gloss, 0, -0.015, 0.0405));
    const uWake = { value: 0.8 }, uBeat = { value: 0 }, uRate = { value: 1.2 };
    mon.add(mesh(new THREE.PlaneGeometry(0.6, 0.395), new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uWake, uBeat, uRate, uMap: { value: monitorTex() } }, vertexShader: VS_UV, fragmentShader: ECG }), 0, -0.015, 0.0472, { tone: 3 }));
    mon.add(mesh(new THREE.PlaneGeometry(0.6, 0.395), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, transparent: true, opacity: 0.1, clearcoat: 1, depthWrite: false }), 0, -0.015, 0.048, { noDust: true }));
    mon.add(mesh(new THREE.TorusGeometry(0.1, 0.014, 16, 48, Math.PI), x.medical, 0, 0.25, -0.005));
    const alarmM = glowMat(CYAN, 0.8); mon.add(mesh(rbox(0.12, 0.014, 0.03, 0.006), alarmM, 0.22, 0.262, 0.012, { tone: 1 }));
    mon.add(mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 32).rotateZ(Math.PI / 2), M.dark, 0.355, -0.12, 0.0));
    const glow = glowSprite(CYAN, 0.32, 0); glow.position.set(0.22, 0.27, 0.03); mon.add(glow);
    return {
      g, frame: { target: [0, 0.74, 0], dist: 3.35, az: 0.42, el: 0.1 }, top: 1.35, dustN: 15000,
      shadows: [[0, 0, 0.85, 0.85, 0.9]],
      anim(t, h) {
        uRate.value = 1.2 + h * 0.15;
        const ph = (t * uRate.value) % 1, beat = Math.exp(-Math.pow((ph - 0.3) / 0.06, 2));
        uBeat.value = beat; uWake.value = 0.78 + h * 0.3;
        alarmM.color.set(CYAN).multiplyScalar(0.7 + beat * (0.8 + h * 2.2));
        glow.material.opacity = beat * (0.15 + h * 0.5);
      },
    };
  },

  // Retail Implementation Services: a card payment terminal on a swivel stand and a card floating over it; on hover
  // the card comes in to tap, the four contactless lights fill and the screen shows "Approved"
  retail() {
    const x = mats(), g = new THREE.Group();
    g.add(mesh(puck(0.17, 0.026, 0.01, 0.0), M.alu));
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 40), M.alu, 0, 0.066, 0));
    g.add(mesh(new THREE.SphereGeometry(0.034, 32, 16), M.alu, 0, 0.108, 0));
    const term = new THREE.Group(); term.position.set(0, 0.11, 0.0); term.rotation.x = -0.92; g.add(term);
    term.add(mesh(rbox(0.16, 0.2, 0.022, 0.01), M.dark, 0, 0.16, -0.036));
    term.add(mesh(rbox(0.2, 0.34, 0.05, 0.022), x.term, 0, 0.16, 0));
    term.add(mesh(rbox(0.172, 0.135, 0.006, 0.01), M.gloss, 0, 0.245, 0.0255));
    const uDone = { value: 0 }, uWake = { value: 0.9 };
    term.add(mesh(new THREE.PlaneGeometry(0.156, 0.117), new THREE.ShaderMaterial({ uniforms: { uMap: { value: posTex() }, uDone, uWake, uTime: U.time }, vertexShader: VS_UV,
      fragmentShader: `uniform sampler2D uMap; uniform float uDone, uWake, uTime; varying vec2 vUv;
        void main() { vec3 a = texture2D(uMap, vec2(vUv.x * 0.5, vUv.y)).rgb, b = texture2D(uMap, vec2(0.5 + vUv.x * 0.5, vUv.y)).rgb;
          vec3 col = mix(a, b, uDone); vec2 p = (vUv - vec2(0.5, 0.55)) * vec2(1.333, 1.0); float r = length(p), k = fract(uTime * 0.9);
          col += vec3(0.19, 0.76, 0.97) * exp(-pow((r - k * 0.7) * 22.0, 2.0)) * (1.0 - k) * uDone * 0.55;
          gl_FragColor = vec4(col * uWake, 1.0); }` }), 0, 0.245, 0.0292, { tone: 3 }));
    const ledMs = [0, 1, 2, 3].map(() => glowMat('#5ef2c4', 0.15));
    ledMs.forEach((m, i) => term.add(mesh(new THREE.SphereGeometry(0.0045, 12, 8), m, -0.03 + i * 0.02, 0.322, 0.026, { tone: 1 })));
    const keyMs = [x.key, x.key, x.key, x.key, x.key, x.key, x.key, x.key, x.key, x.keyR, x.key, x.keyG];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) term.add(mesh(rbox(0.046, 0.027, 0.012, 0.006), keyMs[r * 3 + c], (c - 1) * 0.056, 0.152 - r * 0.034, 0.027));
    term.add(mesh(rbox(0.046, 0.016, 0.01, 0.006), x.keyY, 0.056, 0.025, 0.026));
    term.add(mesh(new THREE.BoxGeometry(0.12, 0.004, 0.02), M.gloss, 0, 0.0, 0.0));
    const card = new THREE.Group(); term.add(card);
    card.add(mesh(rbox(0.171, 0.108, 0.004, 0.008), x.card));
    card.add(mesh(new THREE.PlaneGeometry(0.165, 0.102), new THREE.MeshPhysicalMaterial({ map: cardTex(), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }), 0, 0, 0.0021));
    return {
      g, frame: { target: [0, 0.2, 0.04], dist: 1.45, az: 0.5, el: 0.32 }, top: 0.45, dustN: 12000,
      shadows: [[0, 0, 0.55, 0.55, 0.9], [0, 0.12, 0.45, 0.4, 0.35]],
      anim(t, h) {
        const near = smooth(0, 0.6, h), done = smooth(0.72, 0.95, h);
        card.position.set(0.012 + Math.sin(t * 0.7) * 0.004 * (1 - near), 0.25 + Math.sin(t * 0.9) * 0.006 * (1 - near), lerp(0.14, 0.036, near));
        card.rotation.set(lerp(0.05, 0, near), lerp(-0.25, 0, near), lerp(0.12 + Math.sin(t * 0.5) * 0.03, 0.04, near));
        uDone.value = done; uWake.value = 0.88 + h * 0.2;
        ledMs.forEach((m, i) => m.color.set('#5ef2c4').multiplyScalar(0.15 + smooth(0.6 + i * 0.08, 0.68 + i * 0.08, h) * 2.4));
      },
    };
  },

  // Smart Farming: a crop-spraying drone hovering over rows of seedlings, its scan light on the crop; on hover it
  // flies towards the pointer and the scan sweeps the rows, lighting the plants it reads
  farming() {
    const x = mats(), g = new THREE.Group();
    g.add(mesh(rbox(1.74, 0.09, 1.08, 0.024), x.soil, 0, 0.045, 0));
    const ROWS = 7, PER = 17, rowZ = (r) => -0.42 + r * 0.14;
    for (let r = 0; r < ROWS; r++) g.add(mesh(rbox(1.62, 0.028, 0.075, 0.013), x.soilDark, 0, 0.098, rowZ(r)));
    const leafM = new THREE.MeshStandardMaterial({ map: leafTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.6 });
    const plane = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), n = ROWS * PER;
    const ims = [plane, plane.clone().rotateY(Math.PI / 2)].map((geo) => { const im = new THREE.InstancedMesh(geo, leafM, n); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3); g.add(im); return im; });
    const plants = [], o = new THREE.Object3D();
    for (let r = 0; r < ROWS; r++) for (let i = 0; i < PER; i++) {
      const k = r * PER + i, px = -0.76 + i * 0.095 + Math.sin(k * 3.1) * 0.01, pz = rowZ(r) + Math.sin(k * 7.3) * 0.008, s = 0.085 + 0.03 * (0.5 + 0.5 * Math.sin(k * 1.7));
      o.position.set(px, 0.11, pz); o.rotation.set(0, k * 1.3, 0); o.scale.set(s, s, s); o.updateMatrix();
      ims.forEach((im) => im.setMatrixAt(k, o.matrix)); plants.push([px, pz]);
    }
    // the drone
    const drone = new THREE.Group(); g.add(drone);
    drone.add(mesh(rbox(0.27, 0.07, 0.21, 0.03), x.carbon));
    drone.add(mesh(new THREE.SphereGeometry(0.12, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.05, 0.42, 0.84), x.white, 0, 0.03, 0));
    drone.add(mesh(new THREE.CapsuleGeometry(0.052, 0.13, 8, 24).rotateZ(Math.PI / 2), x.white, 0, -0.075, 0));
    const props = [], blurM = new THREE.MeshBasicMaterial({ map: textures().radial, color: 0xbfd6e6, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
    [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((a, i) => {
      const arm = new THREE.Group(); arm.rotation.y = a; drone.add(arm);
      arm.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 16).rotateZ(Math.PI / 2), x.carbon, 0.2, 0.012, 0));
      arm.add(mesh(new THREE.CylinderGeometry(0.03, 0.028, 0.04, 32), M.alu, 0.33, 0.03, 0));
      arm.add(mesh(new THREE.SphereGeometry(0.008, 12, 8), glowMat(i < 2 ? CYAN : PINK, 2.2), 0.33, 0.0, 0, { tone: i < 2 ? 1 : 2 }));
      const p = new THREE.Group(); p.position.set(0.33, 0.056, 0); arm.add(p);
      p.add(mesh(rbox(0.36, 0.005, 0.03, 0.0025), M.dark)); p.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 16), M.alu));
      arm.add(mesh(new THREE.CircleGeometry(0.18, 48).rotateX(-Math.PI / 2), blurM, 0.33, 0.058, 0, { noDust: true }));
      props.push(p);
    });
    for (const s of [-1, 1]) {
      drone.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 16).rotateX(Math.PI / 2), x.carbon, s * 0.11, -0.15, 0));
      for (const z of [-0.07, 0.07]) { const st = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.13, 12), x.carbon, s * 0.09, -0.09, z); st.rotation.z = s * 0.35; drone.add(st); }
    }
    const pod = new THREE.Group(); pod.position.set(0, -0.06, 0.11); pod.rotation.x = 1.25; drone.add(pod);
    pod.add(mesh(new THREE.SphereGeometry(0.026, 32, 16), M.gloss)); const ln = lensGroup(0.013); ln.position.z = 0.02; pod.add(ln);
    const sense = beam(1, 1, raw(0.19, 0.76, 0.97)); g.add(sense);
    const scan = mesh(new THREE.PlaneGeometry(1, 0.012).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.125, 0, { noDust: true }); g.add(scan);
    const spot = pool(1, 1, CYAN, 0); spot.position.y = 0.122; g.add(spot);
    const shadow = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: textures().radial, transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.093, 0, { noDust: true }); shadow.scale.set(0.7, 1, 0.55); g.add(shadow);
    const pos = new V3(), col = new THREE.Color();
    return {
      g, frame: { target: [0, 0.34, 0], dist: 3.05, az: 0.5, el: 0.34 }, top: 0.85, dustN: 15000,
      shadows: [[0, 0, 2.2, 1.5, 0.85]],
      anim(t, h, dt, st) {
        const fx = st ? st.x : 0, fy = st ? st.y : 0;
        const tx = lerp(Math.sin(t * 0.25) * 0.18, fx * 0.5, h), tz = lerp(Math.sin(t * 0.19) * 0.08, fy * 0.3, h);
        const vx = tx - pos.x, vz = tz - pos.z; pos.x += vx * 0.04; pos.z += vz * 0.04;
        drone.position.set(pos.x, 0.74 + Math.sin(t * 1.4) * 0.012, pos.z);
        drone.rotation.set(vz * 0.9, Math.sin(t * 0.2) * 0.1, -vx * 0.9);
        for (const p of props) p.rotation.y += (dt || 0.016) * 38;
        const hgt = drone.position.y - 0.06 - 0.12, rad = 0.2 + h * 0.06;
        sense.position.set(pos.x, drone.position.y - 0.08, pos.z + 0.04); sense.scale.set(rad, hgt, rad); sense.material.uniforms.uOp.value = 0.1 + h * 0.32;
        spot.position.x = pos.x; spot.position.z = pos.z + 0.04; spot.scale.set(rad * 2.6, 1, rad * 2.6); spot.material.opacity = 0.12 + h * 0.3;
        shadow.position.x = pos.x; shadow.position.z = pos.z;
        const sz = pos.z + 0.04 + Math.sin(t * lerp(1.2, 3.2, h)) * rad * 0.9;
        scan.position.set(pos.x, 0.126, sz); scan.scale.set(rad * 1.9, 1, 1); scan.material.opacity = 0.15 + h * 0.6;
        for (let k = 0; k < plants.length; k++) {
          const [px, pz] = plants[k], d = Math.hypot(px - pos.x, pz - pos.z - 0.04), inBeam = 1 - smooth(rad * 0.8, rad * 1.15, d), onLine = Math.exp(-Math.pow((pz - sz) / 0.05, 2)) * inBeam;
          col.setRGB(1 + inBeam * 0.15 - onLine * 0.2, 1 + inBeam * 0.25 + onLine * (0.5 + h), 1 + inBeam * 0.35 + onLine * (1.4 + h * 1.5));
          ims[0].setColorAt(k, col); ims[1].setColorAt(k, col);
        }
        ims[0].instanceColor.needsUpdate = true; ims[1].instanceColor.needsUpdate = true;
      },
    };
  },

  // IT Staffing & Resident Engineers: an engineer's white hard hat with a headlamp, resting on a closed laptop, and
  // an ID badge on its lanyard; on hover the headlamp switches on
  staffing() {
    const x = mats(), g = new THREE.Group();
    for (const [fx, fz] of [[-0.29, -0.19], [0.29, -0.19], [-0.29, 0.19], [0.29, 0.19]]) g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 16), M.dark, fx, 0.002, fz));
    g.add(mesh(rbox(0.66, 0.017, 0.46, 0.008), M.alu, 0, 0.0125, 0));
    g.add(mesh(new THREE.BoxGeometry(0.652, 0.0015, 0.452), M.dark, 0, 0.0218, 0));
    g.add(mesh(rbox(0.66, 0.012, 0.46, 0.006), M.alu, 0, 0.0285, 0));
    const top = 0.0345;
    // the hard hat
    const hat = new THREE.Group(); hat.position.set(-0.07, top, -0.02); hat.rotation.y = 0.55; g.add(hat);
    const Rr = 0.15, Hc = 0.165, SZ = 1.18, prof = [];
    for (let i = 0; i <= 28; i++) { const a = (i / 28) * (Math.PI / 2); prof.push([Rr * Math.sin(a), 0.03 + Hc * Math.cos(a)]); }
    prof.push([Rr + 0.002, 0.022], [0.0, 0.022]);
    const shellM = x.white.clone(); shellM.side = THREE.DoubleSide; // the profile runs top to bottom, so draw both sides
    const shell = mesh(lathe(prof, 128), shellM); shell.scale.set(1, 1, SZ); hat.add(shell);
    const brim = mesh(puck(0.178, 0.011, 0.0045, 0.0), x.white, 0, 0.014, 0.045); brim.scale.set(1, 1, 1.3); hat.add(brim);
    for (const phi of [0, -0.42, 0.42]) {
      const pts = []; for (let i = 0; i <= 24; i++) { const a = -0.82 * (Math.PI / 2) + (i / 24) * 1.64 * (Math.PI / 2), r = Rr * Math.sin(a) * 1.02; pts.push(new V3(r * Math.sin(phi), 0.03 + Hc * Math.cos(a) * 1.02, r * Math.cos(phi) * SZ)); }
      hat.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, phi ? 0.0075 : 0.011, 12), x.white));
    }
    const la = 0.98, lamp = new THREE.Group(); lamp.position.set(0, 0.03 + Hc * Math.cos(la) + 0.004, Rr * Math.sin(la) * SZ + 0.012); lamp.rotation.x = 0.28; hat.add(lamp);
    lamp.add(mesh(rbox(0.075, 0.042, 0.034, 0.013), M.dark));
    lamp.add(mesh(new THREE.TorusGeometry(0.016, 0.003, 12, 40), M.alu, 0, 0, 0.0175));
    const lensM = glowMat('#fff6e6', 0.15); lamp.add(mesh(new THREE.CircleGeometry(0.0145, 32), lensM, 0, 0, 0.0172, { tone: 1 }));
    const standby = glowMat(CYAN, 0.6); lamp.add(mesh(new THREE.SphereGeometry(0.0035, 10, 8), standby, 0.026, 0.012, 0.017, { tone: 1 }));
    lamp.add(mesh(rbox(0.05, 0.012, 0.03, 0.004), M.dark, 0, 0.026, -0.006));
    const ray = beam(1, 1, raw(1.0, 0.96, 0.88)); ray.geometry.rotateX(-Math.PI / 2); ray.scale.set(0.26, 0.26, 1.1); ray.position.z = 0.018; lamp.add(ray);
    const lit = pool(0.55, 0.9, '#fff3dd', 0); lit.position.set(0, -top + 0.001, 0.72); hat.add(lit);
    const lensGlow = glowSprite('#fff3dd', 0.12, 0); lensGlow.position.z = 0.03; lamp.add(lensGlow);
    // the ID badge and its lanyard
    const badge = new THREE.Group(); badge.position.set(0.2, top + 0.002, 0.11); badge.rotation.y = -0.4; g.add(badge);
    badge.add(mesh(rbox(0.09, 0.003, 0.13, 0.008), x.white));
    badge.add(mesh(new THREE.PlaneGeometry(0.086, 0.126).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: badgeTex(), roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }), 0, 0.0016, 0));
    badge.add(mesh(rbox(0.022, 0.006, 0.02, 0.004), M.alu, 0, 0.003, -0.074));
    const loop = [[0, -0.08], [-0.02, -0.15], [-0.09, -0.24], [-0.04, -0.33], [0.07, -0.31], [0.12, -0.2], [0.05, -0.12], [0.004, -0.08]].map(([lx, lz]) => new V3(lx, 0.006, lz));
    badge.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop), 80, 0.0055, 8).scale(1, 0.45, 1), x.strap));
    return {
      g, frame: { target: [0.03, 0.1, 0.02], dist: 1.55, az: 0.55, el: 0.42 }, top: 0.24, dustN: 12000,
      shadows: [[0, 0, 0.95, 0.72, 0.85]],
      anim(t, h) {
        const on = smooth(0.05, 0.6, h);
        lensM.color.set('#fff6e6').multiplyScalar(0.15 + on * 3.2);
        ray.material.uniforms.uOp.value = on * 0.3; lit.material.opacity = on * 0.42; lensGlow.material.opacity = on * 0.8;
        standby.color.set(CYAN).multiplyScalar((1 - on) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2))));
      },
    };
  },

  // IT Outsourcing & Managed Operations: a 24-hour desk clock; the cyan ring fills round the day; on hover the time
  // runs fast and the ring closes into a full circle, meaning running 24/7
  outsourcing() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.42, 0.03, 0.22, 0.012), M.alu, 0, 0.015, 0));
    const strip = glowMat(CYAN, 1); g.add(mesh(new THREE.BoxGeometry(0.26, 0.004, 0.004), strip, 0, 0.016, 0.111, { tone: 1 }));
    const cl = new THREE.Group(); cl.position.set(0, 0.385, 0); cl.rotation.x = -0.1; g.add(cl);
    g.add(mesh(rbox(0.14, 0.05, 0.1, 0.012), M.alu, 0, 0.045, -0.02));
    const pts = [[0.304, 0.052], [0.33, 0.052], ...arc(0.33, 0.036, 0.016, Math.PI / 2, 0), [0.346, -0.036], ...arc(0.33, -0.036, 0.016, 0, -Math.PI / 2), [0.0, -0.052]];
    cl.add(mesh(lathe(pts, 160).rotateX(Math.PI / 2), M.alu));
    cl.add(mesh(new THREE.CylinderGeometry(0.304, 0.3, 0.02, 160, 1, true).rotateX(Math.PI / 2), M.dark, 0, 0, 0.04));
    cl.add(mesh(new THREE.CircleGeometry(0.302, 160), new THREE.MeshBasicMaterial({ map: dialTex() }), 0, 0, 0.03, { tone: 3 }));
    const uFill = { value: 0.4 }, uGlow = { value: 0 };
    cl.add(mesh(new THREE.RingGeometry(0.262, 0.279, 192), new THREE.ShaderMaterial({ uniforms: { uFill, uGlow, uTime: U.time }, vertexShader: VS_UV, fragmentShader: RING }), 0, 0, 0.0305, { tone: 1 }));
    const hand = (len, w, back, mat, z) => { const m = mesh(rbox(w, len + back, 0.003, Math.min(w / 2.2, 0.004)).translate(0, (len - back) / 2, 0), mat, 0, 0, z); cl.add(m); return m; };
    const hh = hand(0.15, 0.016, 0.03, M.alu, 0.034), mh = hand(0.215, 0.011, 0.035, M.alu, 0.038), sm = glowMat(CYAN, 1.6), sh = hand(0.235, 0.004, 0.06, sm, 0.042);
    sh.userData.tone = 1;
    cl.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 32).rotateX(Math.PI / 2), M.alu, 0, 0, 0.042));
    cl.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 24).rotateX(Math.PI / 2), sm, 0, 0, 0.049, { tone: 1 }));
    const Rg = 0.9, th = Math.asin(0.306 / Rg);
    cl.add(mesh(new THREE.SphereGeometry(Rg, 96, 8, 0, Math.PI * 2, 0, th).rotateX(Math.PI / 2), M.glass, 0, 0, 0.05 - Rg * Math.cos(th), { noDust: true }));
    let T = 9.2, sec = 0;
    return {
      g, frame: { target: [0, 0.36, 0], dist: 1.95, az: 0.32, el: 0.12 }, top: 0.75, dustN: 12000,
      shadows: [[0, 0, 0.8, 0.45, 0.85]],
      anim(t, h, dt) {
        const d = dt || 0;
        T = (T + d * lerp(0.03, 1.6, h)) % 24; sec += d * lerp(0.7, 5, h);
        hh.rotation.z = -(T / 24) * Math.PI * 2; mh.rotation.z = -((T % 1)) * Math.PI * 2; sh.rotation.z = -sec;
        uFill.value = lerp(T / 24, 1.0, smooth(0.15, 0.9, h)); uGlow.value = h;
        strip.color.set(CYAN).multiplyScalar(0.6 + h * 1.8);
      },
    };
  },
});

Object.assign(DESCRIBE, {
  education: 'A desk globe on a stack of books, its continents drawn in dots of light, with Abu Dhabi in pink. Hover: it spins faster and the continents light up.',
  health: 'A patient monitor on a rolling stand, its ECG, pulse and breathing traces sweeping across. Hover: the screen wakes and the alarm light beats with the heart.',
  retail: 'A card payment terminal on a swivel stand with a card floating over it. Hover: the card taps, the contactless lights fill and the screen shows "Approved".',
  farming: 'A crop-spraying drone hovering over rows of seedlings, its scan light on the crop. Hover: it flies towards your pointer and the scan sweeps the rows, lighting the plants it reads.',
  staffing: 'An engineer\'s white hard hat with a headlamp, resting on a closed laptop next to an ID badge on its lanyard. Hover: the headlamp switches on.',
  outsourcing: 'A 24-hour desk clock whose cyan ring fills round the day. Hover: the hands race through the day and the ring closes into a full circle, meaning running 24/7.',
});
