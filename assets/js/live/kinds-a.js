// AI, Data & Automation and Software Development: live pictures (style A, studio dark) for docs/all-pictures.html.
// Each kind builds one product-style object with a calm idle motion and its own hover action.
import { THREE, BUILD, DESCRIBE, M, CYAN, U, VS_UV, mesh, rbox, puck, glowMat, canvasTex, textures, smoothed, lerp, smooth, hash, rng, V2, V3 } from './kit.js';

const PINK = '#eb4b96', MINT = '#5ef2c4', AMBER = '#ffb547';
const P = (o) => new THREE.MeshPhysicalMaterial(o);
const ease = (k) => k * k * (3 - 2 * k);
const glowSprite = (color, scale, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(scale); return s; };
const floorGlow = (color, sx, sz, op, x = 0, z = 0) => { const m = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: textures().radial, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }), x, 0.004, z, { noDust: true }); m.scale.set(sx, 1, sz); return m; };
const frost = (color = 0xe6f6ff, op = 0.38) => P({ color, metalness: 0, roughness: 0.22, transparent: true, opacity: op, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 2.2, depthWrite: false });
const white = () => P({ color: 0xeef1f4, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 });

// shared bits for the screens (p = position on the screen, height 1, centred)
const SH = `const vec3 cyan = vec3(0.19, 0.76, 0.97), pink = vec3(0.92, 0.29, 0.59), navy = vec3(0.05, 0.16, 0.27);
  float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float aa(float d) { float w = max(fwidth(d), 1e-5); return 1.0 - smoothstep(-w, w, d); }
  float hsh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
  float tick(vec2 q, float s) { return min(seg(q, vec2(-0.5, 0.0) * s, vec2(-0.15, -0.35) * s), seg(q, vec2(-0.15, -0.35) * s, vec2(0.55, 0.4) * s)); }`;
function screen(w, h, frag, uni = {}) {
  const u = { uTime: U.time, uWake: { value: 1 }, uAsp: { value: w / h }, ...uni };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS_UV, fragmentShader: `uniform float uTime, uWake, uAsp; varying vec2 vUv;\n${SH}\n${frag}` }));
  m.userData.tone = 3; m.u = u; return m;
}
// a sheet of glass over a screen, for reflections
const glassOver = (w, h) => mesh(new THREE.PlaneGeometry(w, h), P({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false }), 0, 0, 0, { noDust: true });

/* ------------------------------------------------------------------ textures */
let TX = null;
function tex() {
  if (TX) return TX;
  TX = {};
  // perforated front of the AI computer: alpha (holes clear) for the metal sheet
  TX.holes = canvasTex(1024, 336, (x, w, h) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000';
    for (let r = 0; r < 12; r++) for (let c = 0; c < 38; c++) { x.beginPath(); x.arc(14 + c * 26.6 + (r % 2) * 13.3, 14 + r * 27.5, 8.2, 0, 7); x.fill(); }
  }, false);
  // laptop keyboard
  TX.keys = canvasTex(1024, 400, (x, w, h) => {
    x.fillStyle = '#16191d'; x.fillRect(0, 0, w, h);
    const key = (kx, ky, kw, kh) => { const g = x.createLinearGradient(0, ky, 0, ky + kh); g.addColorStop(0, '#2c3037'); g.addColorStop(1, '#1f2227'); x.fillStyle = g; x.beginPath(); x.roundRect(kx, ky, kw, kh, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(kx + 4, ky + 2, kw - 8, 2); };
    const pad = 14, kw = (w - pad * 2 - 13 * 8) / 14;
    for (let c = 0; c < 14; c++) key(pad + c * (kw + 8), 10, kw, 36);
    for (let r = 0; r < 4; r++) { let xx = pad + (r === 1 ? kw * 0.5 : r === 2 ? kw * 0.75 : r === 3 ? kw * 1.2 : 0); const n = 14 - (r ? 1 : 0); for (let c = 0; c < n; c++) { const ww = c === n - 1 && r ? w - pad - xx : kw; key(xx, 56 + r * 66, ww, 58); xx += ww + 8; } }
    let xx = pad; [1, 1, 1.3, 5.6, 1.3, 1, 1, 1].forEach((m) => { key(xx, 324, kw * m, 58); xx += kw * m + 8; });
  });
  // a contact card for the rolodex: a plain user icon (no face) and three lines; four variants stacked
  TX.card = canvasTex(256, 640, (x) => {
    for (let v = 0; v < 4; v++) {
      const y0 = v * 160; x.strokeStyle = 'rgba(48,193,248,0.95)'; x.lineWidth = 4; x.beginPath(); x.arc(52, y0 + 62, 26, 0, 7); x.stroke();
      x.fillStyle = 'rgba(48,193,248,0.9)'; x.beginPath(); x.arc(52, y0 + 55, 8, 0, 7); x.fill(); x.beginPath(); x.arc(52, y0 + 80, 14, Math.PI, 0); x.fill();
      const r = rng(v + 3); x.fillStyle = 'rgba(235,245,255,0.95)'; x.beginPath(); x.roundRect(96, y0 + 40, 70 + r() * 70, 14, 7); x.fill();
      x.fillStyle = 'rgba(150,190,220,0.7)'; x.beginPath(); x.roundRect(96, y0 + 66, 50 + r() * 80, 10, 5); x.fill(); x.beginPath(); x.roundRect(30, y0 + 112, 120 + r() * 90, 10, 5); x.fill();
    }
  });
  return TX;
}

/* ------------------------------------------------------------------ screens */
const CODE = `uniform float uS, uBuild;
  vec3 tok(float k) { return k < 0.28 ? cyan : k < 0.4 ? pink : k < 0.53 ? vec3(1.0, 0.78, 0.42) : vec3(0.74, 0.8, 0.88); }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAsp, 1.0); float X = p.x + uAsp * 0.5, top = 0.43;
    vec3 col = vec3(0.045, 0.065, 0.095);
    col = mix(col, vec3(0.07, 0.095, 0.13), step(top, p.y));
    for (int i = 0; i < 3; i++) { float fi = float(i); col = mix(col, i == 0 ? vec3(0.95, 0.36, 0.36) : i == 1 ? vec3(0.98, 0.75, 0.3) : vec3(0.35, 0.85, 0.5), aa(length(p - vec2(-uAsp * 0.5 + 0.035 + fi * 0.028, 0.465)) - 0.008)); }
    float ew = uAsp * (1.0 - 0.47 * uBuild);
    if (p.y < top && X < ew) {
      float lh = 0.05, nvis = 16.0, s = floor(uS) + smoothstep(0.82, 1.0, fract(uS));
      float yy = (top - 0.02 - p.y) / lh + s, li = floor(yy), fy = fract(yy), cur = floor(uS) + nvis - 1.0, typed = clamp(fract(uS) / 0.8, 0.0, 1.0);
      col = mix(col, vec3(0.032, 0.048, 0.072), step(X, 0.075));
      col = mix(col, vec3(0.28, 0.34, 0.42), step(0.4, fy) * step(fy, 0.6) * step(0.022, X) * step(X, 0.034 + hsh(vec2(li, 1.0)) * 0.018) * step(li, cur));
      float blank = step(hsh(vec2(li, 9.0)), 0.13), ind = floor(hsh(vec2(li, 3.0)) * 3.5) * 0.04, x = 0.1 + ind;
      float lim = li < cur ? 99.0 : (li > cur ? -1.0 : 0.1 + ind + typed * 0.7);
      for (int k = 0; k < 6; k++) { float fk = float(k), w = 0.025 + hsh(vec2(li, fk)) * 0.1;
        float on = step(fk, 1.0 + floor(hsh(vec2(li, 5.0)) * 5.0)) * step(x, X) * step(X, min(x + w, lim)) * step(0.3, fy) * step(fy, 0.7) * (1.0 - blank);
        col = mix(col, tok(hsh(vec2(li, fk + 40.0))), on * 0.92); x += w + 0.014; }
      float cy = top - 0.02 - (cur - s + 0.5) * lh;
      col = mix(col, cyan, step(abs(X - lim - 0.008), 0.003) * step(abs(p.y - cy), lh * 0.32) * step(0.45, fract(uTime * 1.6)));
    }
    if (uBuild > 0.01 && X > ew && p.y < top) {
      float pw = uAsp - ew, qx = X - ew;
      vec3 pc = vec3(0.94, 0.955, 0.97);
      pc = mix(pc, navy, step(0.37, p.y) * step(0.15, uBuild));
      pc = mix(pc, vec3(0.9), step(0.37, p.y) * step(0.15, uBuild) * aa(box(vec2(qx - 0.06, p.y - 0.4), vec2(0.03, 0.008), 0.004)));
      float hero = aa(box(vec2(qx - pw * 0.5, p.y - 0.2), vec2(pw * 0.5 - 0.03, 0.12), 0.012)) * smoothstep(0.35, 0.45, uBuild);
      pc = mix(pc, mix(cyan * 0.85, navy, clamp(qx / pw, 0.0, 1.0)), hero);
      pc = mix(pc, vec3(1.0), hero * aa(box(vec2(qx - 0.12, p.y - 0.25), vec2(0.08, 0.014), 0.007)));
      pc = mix(pc, vec3(0.85, 0.93, 1.0), hero * aa(box(vec2(qx - 0.1, p.y - 0.2), vec2(0.06, 0.008), 0.004)));
      for (int c = 0; c < 3; c++) { float fc = float(c), on = smoothstep(0.6 + fc * 0.08, 0.68 + fc * 0.08, uBuild);
        vec2 cq = vec2(qx - pw * (0.2 + fc * 0.3), p.y + 0.06); float cd = box(cq, vec2(pw * 0.12, 0.1), 0.01);
        pc = mix(pc, vec3(1.0), aa(cd) * on); pc = mix(pc, mix(cyan, pink, step(1.5, fc)), aa(cd) * step(0.08, cq.y) * on);
        pc = mix(pc, vec3(0.7, 0.74, 0.8), aa(box(cq - vec2(0.0, -0.03), vec2(pw * 0.08, 0.006), 0.003)) * on); }
      for (int r = 0; r < 3; r++) pc = mix(pc, vec3(0.78, 0.81, 0.85), aa(box(vec2(qx - pw * 0.42, p.y + 0.24 + float(r) * 0.04), vec2(pw * 0.38 - float(r) * 0.04, 0.007), 0.003)) * smoothstep(0.85, 0.95, uBuild));
      col = mix(pc, vec3(0.02), step(qx, 0.004));
    }
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

const RPA = `uniform float uChecked; uniform vec3 uTap;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAsp, 1.0);
    vec3 col = vec3(0.045, 0.07, 0.1);
    col = mix(col, vec3(0.065, 0.095, 0.135), step(0.4, p.y));
    col = mix(col, vec3(0.86, 0.9, 0.95), aa(box(p - vec2(-uAsp * 0.5 + 0.13, 0.45), vec2(0.08, 0.013), 0.006)));
    col = mix(col, cyan, aa(box(p - vec2(uAsp * 0.5 - 0.1, 0.45), vec2(0.05 * clamp(uChecked / 5.0, 0.0, 1.0) + 0.001, 0.009), 0.008)));
    col = mix(col, vec3(0.2, 0.26, 0.33), aa(abs(box(p - vec2(uAsp * 0.5 - 0.1, 0.45), vec2(0.05, 0.009), 0.008)) - 0.0015));
    for (int i = 0; i < 5; i++) {
      float fi = float(i), vy = 0.76 - fi * 0.14, c = clamp(uChecked - fi, 0.0, 1.0);
      vec2 rc = vec2((0.12 - 0.5) * uAsp, vy - 0.5), q = p - rc;
      col = mix(col, vec3(0.07, 0.1, 0.14), aa(box(p - vec2(0.0, vy - 0.5), vec2(uAsp * 0.46, 0.055), 0.014)));
      float bd = box(q, vec2(0.03), 0.008);
      col = mix(col, mix(vec3(0.35, 0.42, 0.5), cyan, c), aa(abs(bd) - 0.003));
      col = mix(col, cyan, aa(bd) * c);
      col = mix(col, vec3(0.02, 0.07, 0.11), aa(tick(q, 0.032) - 0.0045) * c);
      float tw = 0.18 + hsh(vec2(fi, 2.0)) * 0.24;
      col = mix(col, mix(vec3(0.72, 0.78, 0.86), vec3(0.42, 0.49, 0.57), c), aa(box(p - vec2(rc.x + 0.08 + tw * 0.5, vy - 0.5 + 0.013), vec2(tw * 0.5, 0.011), 0.008)));
      col = mix(col, vec3(0.28, 0.34, 0.42), aa(box(p - vec2(rc.x + 0.08 + tw * 0.33, vy - 0.5 - 0.022), vec2(tw * 0.33, 0.007), 0.005)));
    }
    vec2 tp = (uTap.xy - 0.5) * vec2(uAsp, 1.0); float age = uTap.z;
    col += cyan * aa(abs(length(p - tp) - age * 0.11) - 0.004) * (1.0 - smoothstep(0.0, 1.0, age)) * step(0.0, age) * step(age, 1.0);
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

const LMS = `uniform float uProg;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAsp, 1.0);
    vec3 col = vec3(0.045, 0.07, 0.1);
    col = mix(col, vec3(0.86, 0.9, 0.95), aa(box(p - vec2(-uAsp * 0.5 + 0.14, 0.44), vec2(0.09, 0.013), 0.006)));
    vec2 vq = p - vec2(-0.2, 0.08); float vd = box(vq, vec2(0.44, 0.25), 0.02);
    vec3 vid = mix(vec3(0.07, 0.2, 0.3), vec3(0.04, 0.09, 0.16), clamp(vq.x * 1.2 + 0.5, 0.0, 1.0));
    for (int b = 0; b < 4; b++) { float fb = float(b), hg = 0.06 + fb * 0.035 + sin(uTime * 0.8 + fb) * 0.01; vid = mix(vid, mix(cyan, vec3(0.8, 0.9, 1.0), step(2.5, fb)) * 0.9, aa(box(vq - vec2(0.12 + fb * 0.06, -0.16 + hg), vec2(0.018, hg), 0.004))); }
    vid = mix(vid, vec3(0.75, 0.82, 0.9), aa(box(vq - vec2(-0.26, 0.15), vec2(0.12, 0.014), 0.007)));
    vid = mix(vid, vec3(0.45, 0.55, 0.65), aa(box(vq - vec2(-0.3, 0.11), vec2(0.08, 0.009), 0.005)));
    float pl = length(vq - vec2(-0.18, -0.06));
    vid = mix(vid, vec3(1.0), aa(pl - 0.07) * 0.9);
    vec2 tq = vq - vec2(-0.172, -0.06); vid = mix(vid, navy, aa(max(max(-tq.x - 0.022, tq.x * 0.866 + abs(tq.y) * 0.5 - 0.018), 0.0)));
    float done = smoothstep(0.97, 1.0, uProg);
    vid = mix(vid, vid * 0.45, done);
    vid = mix(vid, cyan, aa(length(vq) - 0.09) * done);
    vid = mix(vid, navy, aa(tick(vq, 0.07) - 0.01) * done);
    col = mix(col, vid, aa(vd));
    col = mix(col, vec3(0.86, 0.9, 0.95), aa(box(p - vec2(-0.42, -0.24), vec2(0.22, 0.014), 0.007)));
    col = mix(col, vec3(0.38, 0.45, 0.53), aa(box(p - vec2(-0.48, -0.28), vec2(0.16, 0.009), 0.005)));
    for (int i = 0; i < 4; i++) {
      float fi = float(i), y = 0.28 - fi * 0.13, d = step(fi + 0.9, uProg * 4.0);
      vec2 q = p - vec2(0.36, y);
      col = mix(col, vec3(0.07, 0.1, 0.14), aa(box(p - vec2(0.5, y), vec2(0.19, 0.05), 0.012)));
      col = mix(col, mix(vec3(0.35, 0.42, 0.5), cyan, d), aa(abs(length(q) - 0.022) - 0.003));
      col = mix(col, cyan, aa(length(q) - 0.022) * d);
      col = mix(col, navy, aa(tick(q, 0.022) - 0.004) * d);
      col = mix(col, vec3(0.7, 0.76, 0.84), aa(box(p - vec2(0.5, y + 0.008), vec2(0.09 + hsh(vec2(fi, 4.0)) * 0.03, 0.009), 0.005)));
      col = mix(col, vec3(0.3, 0.36, 0.44), aa(box(p - vec2(0.47, y - 0.02), vec2(0.06, 0.006), 0.003)));
    }
    float tr = box(p - vec2(0.0, -0.39), vec2(uAsp * 0.47, 0.012), 0.012);
    col = mix(col, vec3(0.12, 0.16, 0.21), aa(tr));
    col = mix(col, cyan, aa(tr) * step(p.x, -uAsp * 0.47 + uProg * uAsp * 0.94));
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

const MOBILE = `uniform float uSlide, uScroll;
  vec3 pageA(vec2 p, vec3 col) {
    col = mix(col, vec3(0.9, 0.93, 0.97), aa(box(p - vec2(-0.1, 0.36), vec2(0.1, 0.014), 0.007)));
    col = mix(col, vec3(0.35, 0.42, 0.5), aa(box(p - vec2(-0.13, 0.33), vec2(0.07, 0.008), 0.004)));
    col = mix(col, vec3(0.2, 0.27, 0.35), aa(length(p - vec2(0.17, 0.35)) - 0.025));
    float hc = box(p - vec2(0.0, 0.2), vec2(0.2, 0.095), 0.025);
    col = mix(col, mix(cyan, pink, clamp(p.x * 1.6 + 0.5 - p.y, 0.0, 1.0)), aa(hc));
    col = mix(col, vec3(1.0), aa(box(p - vec2(-0.08, 0.24), vec2(0.09, 0.013), 0.007)));
    col = mix(col, vec3(0.92, 0.96, 1.0), aa(box(p - vec2(-0.1, 0.21), vec2(0.07, 0.008), 0.004)) * 0.9);
    col = mix(col, vec3(1.0), aa(box(p - vec2(-0.12, 0.14), vec2(0.05, 0.016), 0.016)) * 0.95);
    for (int i = 0; i < 6; i++) {
      float fi = float(i), y = 0.03 - fi * 0.105 + mod(uScroll, 0.105) ;
      if (y < -0.4 || y > 0.08) continue;
      vec2 q = p - vec2(0.0, y);
      float k = floor(uScroll / 0.105) - fi;
      col = mix(col, vec3(0.08, 0.11, 0.155), aa(box(q, vec2(0.205, 0.042), 0.016)));
      col = mix(col, hsh(vec2(k, 1.0)) < 0.5 ? cyan : (hsh(vec2(k, 2.0)) < 0.5 ? pink : vec3(1.0, 0.71, 0.28)), aa(box(q - vec2(-0.155, 0.0), vec2(0.026), 0.009)));
      col = mix(col, vec3(0.82, 0.87, 0.93), aa(box(q - vec2(-0.02, 0.012), vec2(0.08 + hsh(vec2(k, 3.0)) * 0.04, 0.009), 0.005)));
      col = mix(col, vec3(0.34, 0.41, 0.5), aa(box(q - vec2(-0.04, -0.014), vec2(0.06, 0.006), 0.003)));
    }
    return col;
  }
  vec3 pageB(vec2 p, vec3 col) {
    col = mix(col, vec3(0.9, 0.93, 0.97), aa(box(p - vec2(-0.12, 0.36), vec2(0.08, 0.014), 0.007)));
    for (int i = 0; i < 6; i++) { float fi = float(i); vec2 c = vec2(mod(fi, 2.0) < 0.5 ? -0.105 : 0.105, 0.22 - floor(fi / 2.0) * 0.17);
      float d = box(p - c, vec2(0.095, 0.075), 0.02);
      col = mix(col, vec3(0.08, 0.11, 0.155), aa(d));
      col = mix(col, fi < 0.5 ? cyan : fi < 1.5 ? pink : fi < 2.5 ? vec3(1.0, 0.71, 0.28) : fi < 3.5 ? vec3(0.37, 0.95, 0.77) : vec3(0.6, 0.7, 1.0), aa(length(p - c - vec2(-0.05, 0.035)) - 0.018));
      col = mix(col, vec3(0.8, 0.85, 0.92), aa(box(p - c - vec2(-0.01, -0.03), vec2(0.06, 0.008), 0.004))); }
    return col;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAsp, 1.0);
    vec3 col = vec3(0.035, 0.055, 0.085);
    float sw = uAsp;
    vec2 a = p + vec2(uSlide * sw, 0.0), b = p - vec2((1.0 - uSlide) * sw, 0.0);
    if (abs(a.x) < sw * 0.5) col = pageA(a, col);
    if (abs(b.x) < sw * 0.5) col = pageB(b, col);
    col = mix(col, vec3(0.05, 0.075, 0.11), step(p.y, -0.405));
    for (int k = 0; k < 4; k++) { float fk = float(k); float on = 1.0 - step(0.5, abs(fk - uSlide * 1.0 - 0.0)); col = mix(col, mix(vec3(0.35, 0.42, 0.5), cyan, on), aa(length(p - vec2(-0.15 + fk * 0.1, -0.445)) - 0.012)); }
    col = mix(col, vec3(0.75, 0.8, 0.86), aa(box(p - vec2(0.0, -0.488), vec2(0.06, 0.004), 0.004)));
    col = mix(col, vec3(0.85), aa(box(p - vec2(-0.17, 0.465), vec2(0.022, 0.008), 0.004)));
    col = mix(col, vec3(0.0), aa(box(p - vec2(0.0, 0.462), vec2(0.055, 0.016), 0.016)));
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

const VENT = `uniform float uI;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAsp, 1.0);
    float w1 = sin(p.x * 9.0 - uTime * 1.3) * 0.5 + 0.5, w2 = sin(p.x * 4.0 + p.y * 11.0 + uTime * 0.9) * 0.5 + 0.5;
    float cell = step(0.82, hsh(floor(vec2(p.x * 40.0, p.y * 14.0)) + floor(uTime * (2.0 + uI * 3.0))));
    float k = 0.25 + 0.5 * w1 * w2 + cell * 0.6;
    vec3 col = mix(cyan, vec3(0.75, 0.95, 1.0), cell * 0.6) * k * uI;
    col += pink * 0.25 * uI * smoothstep(0.7, 1.0, w2) * step(0.5, hsh(vec2(floor(p.x * 6.0), 2.0)));
    gl_FragColor = vec4(col, 1.0);
  }`;

/* ------------------------------------------------------------------ the objects */
Object.assign(BUILD, {
  // Generative AI: a compact AI computer in brushed aluminium; light moves behind its perforated front as it works
  genai() {
    const g = new THREE.Group(), W = 0.8, H = 0.38, D = 0.8, y0 = 0.035;
    g.add(mesh(rbox(W - 0.12, 0.04, D - 0.12, 0.012), M.dark, 0, 0.02, 0));
    g.add(mesh(rbox(W, H, D, 0.075), M.alu, 0, y0 + H / 2, 0));
    const vw = W - 0.17, vh = H - 0.16, cy = y0 + H / 2;
    const glow = screen(vw, vh, VENT, { uI: { value: 0.4 } }); glow.position.set(0, cy, D / 2 + 0.001); glow.userData.tone = 1; g.add(glow);
    const sheet = mesh(new THREE.PlaneGeometry(vw + 0.004, vh + 0.004), P({ color: 0xd6dbe1, metalness: 1, roughness: 0.3, alphaMap: tex().holes, transparent: true }), 0, cy, D / 2 + 0.0025, { w: 0.4 }); g.add(sheet);
    const side = screen(vw, vh, VENT, { uI: glow.u.uI }); side.rotation.y = Math.PI / 2; side.position.set(W / 2 + 0.001, cy, 0); g.add(side);
    const sheet2 = sheet.clone(); sheet2.rotation.y = Math.PI / 2; sheet2.position.set(W / 2 + 0.0025, cy, 0); g.add(sheet2);
    const led = glowMat(CYAN, 1.5); g.add(mesh(new THREE.CircleGeometry(0.008, 24), led, W / 2 - 0.07, y0 + 0.04, D / 2 + 0.001, { tone: 1 }));
    const under = floorGlow(CYAN, 1.3, 1.3, 0.25); g.add(under);
    const halo = glowSprite(CYAN, 1.1, 0); halo.position.set(0.15, cy, 0.5); g.add(halo);
    return {
      g, frame: { target: [0, 0.2, 0], dist: 2.45, az: 0.62, el: 0.3 }, top: 0.45, dustN: 12000,
      shadows: [[0, 0, 1.25, 1.25, 0.9]],
      anim(t, h) {
        const k = 0.42 + Math.sin(t * 1.1) * 0.1 + h * (1.3 + Math.sin(t * 7.3) * Math.sin(t * 3.1) * 0.35);
        glow.u.uI.value = k; under.material.opacity = 0.16 + h * 0.35; halo.material.opacity = h * 0.18;
        led.color.set(CYAN).multiplyScalar(0.8 + h * 2 + Math.sin(t * 2) * 0.3);
      },
    };
  },

  // Bot Services: a frosted glass chat bubble with three typing dots; on hover the reply pops up beside it
  bot() {
    const g = new THREE.Group();
    const bubbleGeo = (w, h, r, depth, side) => {
      const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
      s.moveTo(x0 + r, y0);
      if (side < 0) { s.lineTo(x0 + r + 0.02, y0); s.lineTo(x0 + 0.05, y0 - 0.13); s.lineTo(x0 + r + 0.16, y0); }
      if (side > 0) { s.lineTo(x1 - r - 0.16, y0); s.lineTo(x1 - 0.05, y0 - 0.12); s.lineTo(x1 - r - 0.02, y0); }
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
      s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.035, bevelSegments: 6, curveSegments: 20 });
      geo.translate(0, 0, -depth / 2); return smoothed(geo);
    };
    const bub = new THREE.Group(); bub.position.set(-0.15, 0.6, 0); g.add(bub);
    bub.add(mesh(bubbleGeo(0.9, 0.52, 0.22, 0.14, -1), frost(0xe6f6ff, 0.36), 0, 0, 0, { w: 0.6 }));
    const dotM = glowMat(CYAN, 2.2), dots = [-0.15, 0, 0.15].map((x) => { const d = mesh(new THREE.SphereGeometry(0.042, 32, 16), dotM, x, 0, 0, { tone: 1 }); bub.add(d); return d; });
    const inner = glowSprite(CYAN, 0.8, 0.28); bub.add(inner);
    const reply = new THREE.Group(); reply.position.set(0.42, 1.08, -0.3); g.add(reply);
    const rb = new THREE.Group(); reply.add(rb);
    rb.add(mesh(bubbleGeo(0.66, 0.34, 0.16, 0.1, 1), P({ color: 0x0b1016, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.72, clearcoat: 1, envMapIntensity: 2.2, depthWrite: false }), 0, 0, 0, { w: 0.5 }));
    const lineM = glowMat(CYAN, 1.3);
    [[0.42, 0.06], [0.3, -0.04]].forEach(([w, y], i) => rb.add(mesh(rbox(w, 0.032, 0.012, 0.016), i ? glowMat('#a6e9ff', 0.8) : lineM, -0.08 + (w - 0.42) / 2, y, 0.1, { tone: 1 })));
    const rglow = glowSprite(CYAN, 0.7, 0); rb.add(rglow);
    let pop = 0;
    return {
      g, frame: { target: [0.08, 0.72, 0], dist: 2.85, az: 0.32, el: 0.12 }, top: 1.3, dustN: 12000,
      shadows: [[-0.15, 0.05, 1.0, 0.45, 0.4], [0.42, -0.3, 0.6, 0.3, 0.2]],
      anim(t, h, dt, st) {
        const sx = st ? st.x : 0;
        bub.position.y = 0.6 + Math.sin(t * 0.8) * 0.02; bub.rotation.y = sx * 0.15 + Math.sin(t * 0.4) * 0.05;
        const sp = 5 + h * 3;
        dots.forEach((d, i) => { d.position.y = Math.max(0, Math.sin(t * sp - i * 0.9)) * 0.035; });
        dotM.color.set(CYAN).multiplyScalar(1.8 + h * 0.8);
        pop = lerp(pop, h > 0.5 ? 1 : 0, 0.08);
        const k = smooth(0, 1, pop), s = k + Math.sin(k * Math.PI) * 0.12;
        rb.scale.setScalar(Math.max(0.001, s)); rb.position.y = Math.sin(t * 0.9 + 1) * 0.015; rb.visible = s > 0.01;
        rglow.material.opacity = 0.25 * k;
      },
    };
  },

  // Data Analytics & Predictive Services: aluminium bars rising on a dark base, a glowing trend line running on into
  // glass forecast bars; on hover the bars grow and the forecast fills with light
  analytics() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.42, 0.07, 0.58, 0.024), M.paint, 0, 0.035, 0));
    g.add(mesh(new THREE.BoxGeometry(1.3, 0.005, 0.005), glowMat(CYAN, 1.4), 0, 0.05, 0.291, { tone: 1 }));
    const HS = [0.2, 0.28, 0.25, 0.37, 0.43, 0.52, 0.6, 0.69, 0.79], F = 3, bars = [];
    const fGlass = frost(0xbfeaff, 0.3);
    HS.forEach((hh, i) => {
      const x = -0.6 + i * 0.15, fc = i >= HS.length - F, b = new THREE.Group(); b.position.set(x, 0.07, 0); g.add(b);
      const geo = rbox(0.1, hh, 0.1, 0.014); geo.translate(0, hh / 2, 0);
      b.add(mesh(geo, fc ? fGlass : M.alu, 0, 0, 0, fc ? { w: 0.5 } : undefined));
      let core = null;
      if (fc) { const cg = new THREE.BoxGeometry(0.05, 1, 0.05); cg.translate(0, 0.5, 0); core = mesh(cg, glowMat(CYAN, 1.6), 0, 0.006, 0, { tone: 1 }); b.add(core); }
      bars.push({ b, hh, core, fc });
    });
    const tubeM = glowMat(CYAN, 2), dotM = glowMat('#dff6ff', 1.6);
    const dots = bars.map((o) => { const d = mesh(new THREE.SphereGeometry(0.016, 16, 10), dotM, 0, 0, 0, { tone: 1 }); g.add(d); return d; });
    let tube = null, last = -1;
    const rebuild = (grow) => {
      const pts = bars.map((o, i) => new V3(o.b.position.x, 0.07 + o.hh * (1 + grow * (0.12 + i * 0.02)) + 0.035, 0.0));
      pts.forEach((p, i) => dots[i].position.copy(p));
      if (tube) { g.remove(tube); tube.geometry.dispose(); }
      tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.0055, 8), tubeM, 0, 0, 0, { tone: 1 }); g.add(tube);
    };
    const halo = glowSprite(CYAN, 0.9, 0); halo.position.set(0.45, 0.75, 0); g.add(halo);
    return {
      g, frame: { target: [0, 0.46, 0], dist: 3.15, az: 0.48, el: 0.28 }, top: 1.0, dustN: 12000,
      shadows: [[0, 0, 1.75, 0.8, 0.85]],
      anim(t, h) {
        const grow = ease(h);
        bars.forEach((o, i) => { const k = 1 + grow * (0.12 + i * 0.02); o.b.scale.y = k; if (o.core) o.core.scale.y = (o.hh - 0.012) * lerp(0.18 + Math.sin(t * 1.2 + i) * 0.04, 1, grow); });
        if (Math.abs(grow - last) > 0.002) { rebuild(grow); last = grow; }
        tubeM.color.set(CYAN).multiplyScalar(1.6 + h * 1.4); halo.material.opacity = h * 0.22;
      },
    };
  },

  // Business Process Automation: task cubes run along a glass lane through three glowing checkpoints, turning cyan once
  // approved; on hover the flow speeds up and the cubes are approved sooner
  bpa() {
    const g = new THREE.Group(), L = 2.0;
    g.add(mesh(rbox(L, 0.05, 0.32, 0.02), M.paint, 0, 0.025, 0));
    g.add(mesh(rbox(L - 0.06, 0.022, 0.22, 0.01), frost(0xcfeeff, 0.3), 0, 0.061, 0, { w: 0.4 }));
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(L - 0.12, 0.004, 0.004), glowMat(CYAN, 0.8), 0, 0.073, s * 0.112, { tone: 1 }));
    const SX = [-0.5, 0.08, 0.66], stations = SX.map((x) => {
      const st = new THREE.Group(); st.position.x = x; g.add(st);
      for (const s of [-1, 1]) st.add(mesh(rbox(0.045, 0.34, 0.06, 0.014), M.alu, 0, 0.17 + 0.05, s * 0.17));
      st.add(mesh(rbox(0.06, 0.05, 0.42, 0.016), M.alu, 0, 0.415, 0));
      const m = glowMat(CYAN, 1.6); st.add(mesh(new THREE.BoxGeometry(0.012, 0.01, 0.3), m, 0, 0.386, 0, { tone: 1 }));
      const sheet = mesh(new THREE.PlaneGeometry(0.3, 0.3).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, 0.23, 0, { noDust: true }); st.add(sheet);
      return { m, sheet, flash: 0 };
    });
    const N = 7, cubes = [];
    const grey = new THREE.Color(0xb9c0c9), cy = new THREE.Color(CYAN);
    for (let i = 0; i < N; i++) {
      const m = P({ color: 0xb9c0c9, metalness: 0.6, roughness: 0.3, clearcoat: 0.6, emissive: new THREE.Color(CYAN), emissiveIntensity: 0 });
      const c = mesh(rbox(0.12, 0.12, 0.12, 0.024), m, 0, 0.073 + 0.06, 0); g.add(c); cubes.push({ c, m, i, prev: -9 });
    }
    let s = 0;
    return {
      g, frame: { target: [0.05, 0.18, 0], dist: 2.75, az: 0.42, el: 0.34 }, top: 0.5, dustN: 12000,
      shadows: [[0, 0, 2.3, 0.7, 0.85]],
      anim(t, h, dt) {
        s += (dt || 0) * lerp(0.07, 0.2, h);
        const need = h > 0.5 ? 1 : 3;
        for (const o of cubes) {
          const k = (s + o.i / N) % 1, x = -0.95 + k * 1.9; o.c.position.x = x;
          const sc = smooth(0, 0.05, k) * (1 - smooth(0.95, 1, k)); o.c.scale.setScalar(Math.max(0.001, sc));
          let passed = 0; SX.forEach((sx, j) => { if (x > sx) passed++; if (o.prev <= sx && x > sx) stations[j].flash = 1; }); o.prev = x;
          const a = clamp01(passed / need);
          o.m.color.copy(grey).lerp(cy, a * 0.85); o.m.emissiveIntensity = a * (0.35 + h * 0.3);
          o.c.rotation.y = Math.sin(t * 0.5 + o.i) * 0.04;
        }
        stations.forEach((st) => { st.flash = Math.max(0, st.flash - (dt || 0) * 2.5); st.m.color.set(CYAN).multiplyScalar(1.2 + st.flash * 2.5 + h * 0.6); st.sheet.material.opacity = 0.04 + st.flash * 0.12 + h * 0.03; });
      },
    };
  },

  // RPA: a small white precision arm taps through a task list on a tablet, ticking each item; faster on hover
  rpa() {
    const g = new THREE.Group(), WH = white();
    const L1 = 0.42, L2 = 0.38, L3 = 0.13, HS = 0.24, base = new V3(-0.56, 0, -0.26);
    // the tablet, lying flat
    const TC = new V3(0.12, 0, 0.12), TW = 0.64, TD = 0.46, SW = 0.6, SD = 0.42;
    g.add(mesh(rbox(TW, 0.022, TD, 0.022), M.dark, TC.x, 0.011, TC.z));
    const scr = screen(SW, SD, RPA, { uChecked: { value: 0 }, uTap: { value: new V3(0, 0, -1) } });
    scr.rotation.x = -Math.PI / 2; scr.position.set(TC.x, 0.0225, TC.z); g.add(scr);
    const gl = glassOver(SW, SD); gl.rotation.x = -Math.PI / 2; gl.position.set(TC.x, 0.0232, TC.z); g.add(gl);
    const rowPos = (i) => { const u = 0.12, v = 0.76 - i * 0.14; return new V3(TC.x + (u - 0.5) * SW, 0.024, TC.z - (v - 0.5) * SD); };
    // the arm
    const arm = new THREE.Group(); arm.position.copy(base); g.add(arm);
    arm.add(mesh(puck(0.16, 0.05, 0.018, 0.11), M.alu));
    const turret = new THREE.Group(); turret.position.y = 0.05; arm.add(turret);
    turret.add(mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.13, 48), WH, 0, 0.065, 0));
    turret.add(mesh(new THREE.TorusGeometry(0.096, 0.004, 8, 64).rotateX(Math.PI / 2), glowMat(CYAN, 1.2), 0, 0.132, 0, { tone: 1 }));
    const joint = (r, len, parent, ring = true) => { parent.add(mesh(new THREE.CylinderGeometry(r, r, len, 40).rotateX(Math.PI / 2), WH)); for (const s of [-1, 1]) parent.add(mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.006, 40).rotateX(Math.PI / 2), M.dark, 0, 0, s * len / 2)); if (ring) parent.add(mesh(new THREE.TorusGeometry(r * 0.83, 0.003, 8, 48), glowMat(CYAN, 1.3), 0, 0, len / 2 + 0.004, { tone: 1 })); };
    const shoulder = new THREE.Group(); shoulder.position.y = HS - 0.05; turret.add(shoulder);
    joint(0.072, 0.15, shoulder);
    shoulder.add(mesh(rbox(L1, 0.085, 0.085, 0.034), WH, L1 / 2, 0, 0));
    const elbow = new THREE.Group(); elbow.position.x = L1; shoulder.add(elbow);
    joint(0.058, 0.12, elbow);
    elbow.add(mesh(rbox(L2, 0.07, 0.07, 0.028), WH, L2 / 2, 0, 0));
    const wrist = new THREE.Group(); wrist.position.x = L2; elbow.add(wrist);
    joint(0.045, 0.1, wrist, false);
    const sty = new THREE.CylinderGeometry(0.011, 0.016, L3, 24); sty.rotateZ(-Math.PI / 2); sty.translate(L3 / 2, 0, 0);
    wrist.add(mesh(sty, M.alu));
    const tipM = glowMat(CYAN, 2.2); wrist.add(mesh(new THREE.SphereGeometry(0.012, 16, 10), tipM, L3, 0, 0, { tone: 1 }));
    const tipGlow = glowSprite(CYAN, 0.12, 0.5); tipGlow.position.x = L3; wrist.add(tipGlow);
    const reach = (tip) => {
      const dx = tip.x - base.x, dz = tip.z - base.z, d = Math.hypot(dx, dz);
      turret.rotation.y = Math.atan2(-dz, dx);
      const zd = tip.y + L3 - (base.y + 0.05 + HS - 0.05);
      const c2 = Math.min(1, Math.max(-1, (d * d + zd * zd - L1 * L1 - L2 * L2) / (2 * L1 * L2))), t2 = Math.acos(c2);
      const t1 = Math.atan2(zd, d) + Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
      shoulder.rotation.z = t1; elbow.rotation.z = -t2; wrist.rotation.z = -Math.PI / 2 - t1 + t2;
    };
    let ph = 0, from = rowPos(2).add(new V3(0, 0.14, 0)), lastRow = -1, tapAge = -1, checked = 0;
    const tip = new V3();
    return {
      g, frame: { target: [-0.06, 0.24, 0], dist: 1.8, az: 0.52, el: 0.5 }, top: 0.7, dustN: 14000,
      shadows: [[base.x, base.z, 0.55, 0.55, 0.9], [TC.x, TC.z, 0.85, 0.65, 0.85]],
      anim(t, h, dt) {
        const T = lerp(1.9, 0.75, h); ph += (dt || 0) / T;
        const row = Math.floor(ph) % 6, k = ph % 1;
        if (row !== lastRow) { from = tip.clone().lengthSq() ? tip.clone() : from; lastRow = row; if (row === 0) checked = 0; }
        const target = row < 5 ? rowPos(row) : rowPos(2).add(new V3(0.05, 0.16, 0.05));
        const above = target.clone().add(new V3(0, row < 5 ? 0.09 : 0, 0));
        if (k < 0.55) tip.copy(from).lerp(above, ease(k / 0.55)).add(new V3(0, Math.sin((k / 0.55) * Math.PI) * 0.05, 0));
        else if (row < 5 && k < 0.7) tip.copy(above).lerp(target, ease((k - 0.55) / 0.15));
        else if (row < 5) tip.copy(target).lerp(above, ease((k - 0.7) / 0.3));
        else tip.copy(above);
        if (row < 5 && k >= 0.66 && checked < row + 1) { checked = row + 1; tapAge = 0; scr.u.uTap.value.set(0.12, 0.76 - row * 0.14, 0); }
        reach(tip);
        tapAge = tapAge >= 0 ? tapAge + (dt || 0) * 1.6 : -1; scr.u.uTap.value.z = tapAge;
        scr.u.uChecked.value = lerp(scr.u.uChecked.value, row === 5 && k > 0.6 ? 0 : checked, 0.2);
        tipM.color.set(CYAN).multiplyScalar(1.6 + (tapAge >= 0 && tapAge < 0.4 ? 2 : 0) + h);
      },
    };
  },

  // Digital Twin: a motor-driven pump and, on a light pad beside it, its glowing wireframe twin; on hover the twin
  // falls exactly into step with the real one and data flows between them
  twin() {
    const g = new THREE.Group();
    const build = () => {
      const p = new THREE.Group();
      p.add(mesh(rbox(1.02, 0.05, 0.42, 0.012), M.dark, 0, 0.025, 0));
      for (const x of [-0.32, -0.05]) p.add(mesh(rbox(0.07, 0.1, 0.32, 0.01), M.dark, x, 0.1, 0));
      const motor = new THREE.Group(); motor.position.set(-0.19, 0.26, 0); p.add(motor);
      motor.add(mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.4, 48).rotateZ(Math.PI / 2), M.paint));
      for (let i = 0; i < 9; i++) motor.add(mesh(new THREE.TorusGeometry(0.147, 0.008, 6, 48).rotateY(Math.PI / 2), M.paint, -0.16 + i * 0.04, 0, 0));
      motor.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 48).rotateZ(Math.PI / 2), M.alu, -0.23, 0, 0));
      motor.add(mesh(rbox(0.12, 0.08, 0.1, 0.012), M.dark, 0.02, 0.17, 0));
      const rotor = new THREE.Group(); rotor.position.set(0.09, 0.26, 0); p.add(rotor);
      rotor.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 20).rotateZ(Math.PI / 2), M.alu));
      rotor.add(mesh(new THREE.TorusGeometry(0.085, 0.012, 10, 40).rotateY(Math.PI / 2), M.alu));
      for (let i = 0; i < 4; i++) { const s = mesh(new THREE.BoxGeometry(0.014, 0.16, 0.022), M.alu); s.rotation.x = (i * Math.PI) / 4; rotor.add(s); }
      const pump = new THREE.Group(); pump.position.set(0.3, 0.26, 0); p.add(pump);
      pump.add(mesh(new THREE.TorusGeometry(0.105, 0.055, 16, 48).rotateY(Math.PI / 2), M.paint));
      pump.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.11, 40).rotateZ(Math.PI / 2), M.paint));
      pump.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 24), M.alu, 0, 0.21, 0));
      pump.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.022, 32), M.dark, 0, 0.31, 0));
      pump.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 24).rotateZ(Math.PI / 2), M.alu, 0.14, 0, 0));
      pump.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.022, 32).rotateZ(Math.PI / 2), M.dark, 0.23, 0, 0));
      for (const z of [-0.12, 0.12]) pump.add(mesh(rbox(0.12, 0.2, 0.03, 0.008), M.dark, 0, -0.14, z * 0.6));
      return { p, rotor };
    };
    const real = build(); real.p.position.set(-0.42, 0, 0.3); real.p.rotation.y = 0.1; g.add(real.p);
    const tw = build(); tw.p.position.set(0.48, 0.07, -0.42); tw.p.rotation.y = 0.1; g.add(tw.p);
    const ghost = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false });
    const lineM = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const swap = []; tw.p.traverse((o) => { if (o.isMesh) swap.push(o); });
    for (const o of swap) { o.material = ghost; o.userData.tone = 1; o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 22), lineM)); }
    // the light pad under the twin and a scan line running through it
    g.add(mesh(new THREE.CylinderGeometry(0.62, 0.64, 0.035, 96), M.paint, 0.48, 0.0175, -0.42));
    g.add(mesh(new THREE.TorusGeometry(0.615, 0.004, 8, 160).rotateX(Math.PI / 2), glowMat(CYAN, 1.4), 0.48, 0.036, -0.42, { tone: 1 }));
    g.add(floorGlow(CYAN, 1.4, 1.4, 0.3, 0.48, -0.42));
    const scan = mesh(new THREE.PlaneGeometry(1.15, 0.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, map: textures().radial, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0.48, 0.2, -0.42, { noDust: true });
    scan.rotation.y = 0.1; g.add(scan);
    const bits = Array.from({ length: 6 }, () => { const s = glowSprite('#bdf0ff', 0.05, 0); g.add(s); return s; });
    const arc = new THREE.QuadraticBezierCurve3(new V3(-0.1, 0.45, 0.25), new V3(0.05, 0.85, -0.1), new V3(0.35, 0.5, -0.4));
    let a = 0, b = -0.9;
    return {
      g, frame: { target: [0.02, 0.26, -0.05], dist: 3.85, az: 0.36, el: 0.3 }, top: 0.6, dustN: 16000,
      shadows: [[-0.42, 0.3, 1.25, 0.6, 0.9]],
      anim(t, h, dt) {
        a += (dt || 0) * 5; real.rotor.rotation.x = a;
        b = lerp(b, lerp(a - 0.9 + Math.sin(t * 0.7) * 0.4, a, h), 0.15); tw.rotor.rotation.x = b;
        lineM.opacity = 0.42 + h * 0.4; ghost.opacity = 0.04 + h * 0.06;
        scan.position.y = 0.08 + (0.5 + 0.5 * Math.sin(t * 0.9)) * 0.42; scan.material.opacity = 0.12 + h * 0.12;
        bits.forEach((s, i) => { const k = (t * 0.45 + i / bits.length) % 1; arc.getPoint(k, s.position); s.material.opacity = Math.sin(k * Math.PI) * (0.15 + h * 0.75); });
      },
    };
  },

  // Custom Software & Web Development: an open laptop with code being written; on hover the typing speeds up and a
  // web page builds itself beside the code
  code() {
    const g = new THREE.Group(), W = 1.12, Dp = 0.76;
    g.add(mesh(rbox(W, 0.03, Dp, 0.02), M.alu, 0, 0.015, 0));
    g.add(mesh(new THREE.PlaneGeometry(W * 0.86, Dp * 0.4).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex().keys, metalness: 0.3, roughness: 0.55 }), 0, 0.0304, -0.075));
    g.add(mesh(rbox(0.36, 0.002, 0.21, 0.01), P({ color: 0xc9ced5, metalness: 1, roughness: 0.16 }), 0, 0.0305, 0.24));
    const lid = new THREE.Group(); lid.position.set(0, 0.03, -Dp / 2 + 0.012); lid.rotation.x = -0.3; g.add(lid);
    lid.add(mesh(rbox(W, 0.74, 0.016, 0.02), M.alu, 0, 0.37, -0.008));
    lid.add(mesh(new THREE.PlaneGeometry(W - 0.012, 0.728), M.gloss, 0, 0.37, 0.0005));
    const scr = screen(W - 0.07, 0.66, CODE, { uS: { value: 0 }, uBuild: { value: 0 } }); scr.position.set(0, 0.385, 0.001); lid.add(scr);
    const gl = glassOver(W - 0.012, 0.728); gl.position.set(0, 0.37, 0.0015); lid.add(gl);
    const halo = glowSprite(CYAN, 1.4, 0.06); halo.position.set(0, 0.38, 0.2); lid.add(halo);
    let s = 0, build = 0;
    return {
      g, frame: { target: [0, 0.32, -0.08], dist: 2.5, az: 0.45, el: 0.22 }, top: 0.8, dustN: 14000,
      shadows: [[0, 0, 1.4, 1.0, 0.9]],
      anim(t, h, dt) {
        s += (dt || 0) * lerp(0.55, 2.2, h); scr.u.uS.value = s;
        build = lerp(build, h > 0.5 ? 1 : 0, h > 0.5 ? 0.025 : 0.06); scr.u.uBuild.value = smooth(0, 1, build);
        scr.u.uWake.value = 0.92 + h * 0.12; halo.material.opacity = 0.06 + h * 0.08;
      },
    };
  },

  // ERP Implementation: four modules (finance, inventory, people, sales), each with its own colour and symbol, that
  // drift apart; on hover they slide together and lock into one system, with light running through the seams
  erp() {
    const g = new THREE.Group(), S = 0.36, Hb = 0.24, COL = [CYAN, PINK, AMBER, MINT], blocks = [];
    const glyph = (i, col, parent) => {
      const m = glowMat(col, 1.6), y = Hb + 0.012, ud = { tone: i === 1 ? 2 : 1 };
      if (i === 0) [0.04, 0.07, 0.1].forEach((hh, k) => parent.add(mesh(new THREE.BoxGeometry(0.03, 0.006, hh), m, -0.045 + k * 0.045, y, 0.05 - hh / 2, ud)));
      if (i === 1) for (let k = 0; k < 4; k++) parent.add(mesh(new THREE.BoxGeometry(0.045, 0.006, 0.045), m, (k % 2 ? 1 : -1) * 0.03, y, (k < 2 ? -1 : 1) * 0.03, ud));
      if (i === 2) { parent.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 24), m, 0, y, -0.03, ud)); parent.add(mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 32, Math.PI).rotateX(-Math.PI / 2), m, 0, y, 0.045, ud)); }
      if (i === 3) { const a = mesh(new THREE.BoxGeometry(0.11, 0.006, 0.02), m, 0, y, 0, ud); a.rotation.y = 0.6; parent.add(a); const b2 = mesh(new THREE.BoxGeometry(0.045, 0.006, 0.02), m, 0.04, y, -0.035, ud); parent.add(b2); const b3 = mesh(new THREE.BoxGeometry(0.02, 0.006, 0.045), m, 0.055, y, -0.02, ud); parent.add(b3); }
    };
    for (let i = 0; i < 4; i++) {
      const sx = i % 2 ? 1 : -1, sz = i < 2 ? -1 : 1, b = new THREE.Group(); g.add(b);
      b.add(mesh(rbox(S, Hb, S, 0.035), M.alu, 0, Hb / 2, 0));
      b.add(mesh(rbox(S * 0.66, 0.014, S * 0.66, 0.022), M.gloss, 0, Hb + 0.001, 0));
      b.add(mesh(new THREE.BoxGeometry(S * 0.5, 0.004, 0.004), glowMat(COL[i], 1.3), 0, 0.03, sz * (S / 2 + 0.001), { tone: 1 }));
      b.add(mesh(new THREE.BoxGeometry(0.004, 0.004, S * 0.5), glowMat(COL[i], 1.3), sx * (S / 2 + 0.001), 0.03, 0, { tone: 1 }));
      glyph(i, COL[i], b);
      blocks.push({ b, sx, sz, ph: i * 1.3 });
    }
    const seamM = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    g.add(mesh(new THREE.PlaneGeometry(S * 2, Hb * 0.9), seamM, 0, Hb * 0.48, 0, { noDust: true }));
    g.add(mesh(new THREE.PlaneGeometry(S * 2, Hb * 0.9).rotateY(Math.PI / 2), seamM, 0, Hb * 0.48, 0, { noDust: true }));
    const ringM = glowMat(CYAN, 1.6), ring = new THREE.Group(); g.add(ring);
    for (const [w, d, x, z] of [[S * 2 + 0.05, 0.006, 0, S + 0.025], [S * 2 + 0.05, 0.006, 0, -S - 0.025], [0.006, S * 2 + 0.05, S + 0.025, 0], [0.006, S * 2 + 0.05, -S - 0.025, 0]]) ring.add(mesh(new THREE.BoxGeometry(w, 0.004, d), ringM, x, 0.004, z, { tone: 1 }));
    const halo = glowSprite(CYAN, 1.3, 0); halo.position.y = Hb + 0.1; g.add(halo);
    let lock = 0;
    return {
      g, frame: { target: [0, 0.16, 0], dist: 2.45, az: 0.6, el: 0.5 }, top: 0.4, dustN: 12000,
      shadows: [[0, 0, 1.35, 1.35, 0.9]],
      anim(t, h) {
        lock = lerp(lock, h > 0.5 ? 1 : 0, 0.07); const k = ease(lock), gap = lerp(0.2, 0.006, k);
        for (const o of blocks) {
          const bob = Math.sin(t * 0.8 + o.ph) * 0.03 * (1 - k) + 0.03 * (1 - k);
          o.b.position.set(o.sx * (S / 2 + gap / 2), bob, o.sz * (S / 2 + gap / 2));
          o.b.rotation.y = Math.sin(t * 0.4 + o.ph) * 0.08 * (1 - k);
        }
        const snap = smooth(0.85, 1, k);
        seamM.opacity = snap * (0.5 + Math.sin(t * 3) * 0.15); ringM.color.set(CYAN).multiplyScalar(0.3 + snap * 1.6); halo.material.opacity = snap * 0.16;
        ring.scale.setScalar(lerp(1.25, 1, k));
      },
    };
  },

  // LMS & e-Learning: a tablet on its stand playing a lesson, the course list beside it and a progress bar, with a
  // graduation cap; on hover the progress fills, the last lesson ticks off and the course shows complete
  lms() {
    const g = new THREE.Group();
    const stand = new THREE.Group(); stand.position.set(-0.12, 0, 0); g.add(stand);
    stand.add(mesh(rbox(0.5, 0.022, 0.3, 0.01), M.alu, 0, 0.011, 0));
    const tab = new THREE.Group(); tab.position.set(0, 0.022, 0.08); tab.rotation.x = -0.42; stand.add(tab);
    tab.add(mesh(rbox(0.66, 0.46, 0.018, 0.022), M.dark, 0, 0.23, -0.009));
    const scr = screen(0.62, 0.43, LMS, { uProg: { value: 0.6 } }); scr.position.set(0, 0.23, 0.0006); tab.add(scr);
    const gl = glassOver(0.64, 0.445); gl.position.set(0, 0.23, 0.0012); tab.add(gl);
    const strut = mesh(rbox(0.3, 0.26, 0.014, 0.007), M.alu, 0, 0.13, -0.1); strut.rotation.x = 0.32; stand.add(strut);
    // the cap
    const cap = new THREE.Group(); cap.position.set(0.5, 0, 0.28); cap.rotation.y = 0.5; g.add(cap);
    const capM = M.knit.clone(); capM.color = new THREE.Color(0x15181d);
    cap.add(mesh(new THREE.CylinderGeometry(0.125, 0.135, 0.1, 48), capM, 0, 0.05, 0));
    const board = mesh(rbox(0.4, 0.016, 0.4, 0.006), capM, 0, 0.108, 0); board.rotation.y = Math.PI / 4; cap.add(board);
    cap.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 20), M.alu, 0, 0.12, 0));
    const tas = new THREE.Group(); tas.position.set(0.27, 0.11, 0); cap.add(tas);
    const cord = new THREE.TubeGeometry(new THREE.LineCurve3(new V3(-0.27, 0.012, 0), new V3(0, 0.004, 0)), 4, 0.0035, 6);
    cap.add(mesh(cord, glowMat(AMBER, 0.9), 0, 0.11, 0));
    tas.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 8), glowMat(AMBER, 0.9), 0, -0.045, 0));
    tas.add(mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.06, 16), P({ color: 0xc9a14a, metalness: 0.6, roughness: 0.45 }), 0, -0.12, 0));
    let prog = 0.6;
    return {
      g, frame: { target: [0.05, 0.2, 0.05], dist: 2.2, az: 0.36, el: 0.28 }, top: 0.5, dustN: 12000,
      shadows: [[-0.12, 0.02, 0.75, 0.55, 0.9], [0.5, 0.28, 0.6, 0.6, 0.85]],
      anim(t, h) {
        prog = lerp(prog, h > 0.5 ? 1 : 0.6, h > 0.5 ? 0.02 : 0.08); scr.u.uProg.value = Math.min(1, prog + 0.004);
        tas.rotation.z = Math.sin(t * 1.3) * 0.06 + h * Math.sin(t * 5) * 0.12;
      },
    };
  },

  // CRM: a modern rolodex of glass contact cards on an aluminium spindle; on hover it flips through the contacts
  crm() {
    const g = new THREE.Group(), R0 = 0.07, CH = 0.3, CW = 0.5, AY = 0.25, N = 26;
    g.add(mesh(rbox(0.82, 0.04, 0.34, 0.016), M.paint, 0, 0.02, 0));
    for (const s of [-1, 1]) {
      g.add(mesh(rbox(0.04, 0.2, 0.08, 0.014), M.alu, s * 0.36, 0.14, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.026, 64).rotateZ(Math.PI / 2), M.alu, s * 0.33, AY, 0));
      g.add(mesh(new THREE.TorusGeometry(0.08, 0.003, 8, 64).rotateY(Math.PI / 2), glowMat(CYAN, 1.2), s * 0.345, AY, 0, { tone: 1 }));
    }
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.66, 24).rotateZ(Math.PI / 2), M.alu, 0, AY, 0));
    const glassC = frost(0xd8f1ff, 0.22), cards = [], tx = tex().card;
    for (let i = 0; i < N; i++) {
      const pivot = new THREE.Group(); pivot.position.y = AY; g.add(pivot);
      pivot.add(mesh(rbox(CW, CH, 0.005, 0.012), glassC, 0, R0 + CH / 2, 0, { w: 0.25 }));
      const t2 = tx.clone(); t2.needsUpdate = true; t2.repeat.set(1, 0.25); t2.offset.set(0, (i % 4) * 0.25);
      const lm = new THREE.MeshBasicMaterial({ map: t2, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 });
      pivot.add(mesh(new THREE.PlaneGeometry(CW * 0.86, CH * 0.62), lm, 0, R0 + CH * 0.55, 0.004, { tone: 1, w: 0.2 }));
      cards.push({ pivot, lm, i });
    }
    let c = N / 2;
    return {
      g, frame: { target: [0, 0.33, 0], dist: 2.3, az: 0.55, el: 0.28 }, top: 0.65, dustN: 12000,
      shadows: [[0, 0, 1.1, 0.6, 0.9]],
      anim(t, h, dt) {
        c += (dt || 0) * h * 3.2; if (c > N + 2) c -= N + 4;
        const cc = h > 0.02 ? c : lerp(c, N / 2 + Math.sin(t * 0.35) * 2.5, 0.04); c = cc;
        for (const o of cards) {
          const d = o.i - cc;
          o.pivot.rotation.x = 0.62 * Math.tanh(d * 1.15) + 0.04 * d;
          const front = Math.exp(-d * d * 2);
          o.lm.opacity = 0.18 + front * (0.75 + h * 0.2);
        }
      },
    };
  },

  // Mobile App Development: a phone standing in a small aluminium dock with an app running, two glass app tiles
  // floating beside it; on hover it lifts, turns towards you and slides to the next screen
  mobile() {
    const g = new THREE.Group(), PW = 0.36, PH = 0.75;
    g.add(mesh(puck(0.2, 0.035, 0.014, 0.0), M.alu));
    g.add(mesh(rbox(0.3, 0.04, 0.06, 0.012), M.dark, 0, 0.05, -0.01));
    const phone = new THREE.Group(); g.add(phone);
    const body = new THREE.Group(); body.position.y = PH / 2 + 0.04; phone.add(body); body.rotation.x = -0.08;
    body.add(mesh(rbox(PW, PH, 0.034, 0.05), M.alu));
    body.add(mesh(rbox(PW - 0.012, PH - 0.012, 0.004, 0.046), M.gloss, 0, 0, 0.016));
    const scr = screen(PW - 0.03, PH - 0.03, MOBILE, { uSlide: { value: 0 }, uScroll: { value: 0 } }); scr.position.z = 0.0185; body.add(scr);
    const gl = glassOver(PW - 0.02, PH - 0.02); gl.position.z = 0.019; body.add(gl);
    const tiles = [[0.36, 0.62, 0.1, CYAN], [-0.34, 0.36, 0.18, PINK], [0.4, 0.26, -0.12, AMBER]].map(([x, y, z, col], i) => {
      const tg = new THREE.Group(); tg.position.set(x, y, z); g.add(tg);
      tg.add(mesh(rbox(0.13, 0.13, 0.025, 0.035), frost(0xe6f6ff, 0.34), 0, 0, 0, { w: 0.5 }));
      tg.add(mesh(new THREE.CircleGeometry(0.026, 32), glowMat(col, 1.8), 0, 0, 0.014, { tone: i === 1 ? 2 : 1 }));
      return { tg, x, y, z, ph: i * 2.1 };
    });
    let slide = 0, scroll = 0, turn = 0;
    return {
      g, frame: { target: [0, 0.45, 0], dist: 2.05, az: 0.3, el: 0.12 }, top: 0.9, dustN: 12000,
      shadows: [[0, 0, 0.6, 0.45, 0.9]],
      anim(t, h, dt, st) {
        const sx = st ? st.x : 0;
        scroll += (dt || 0) * 0.045; scr.u.uScroll.value = scroll;
        slide = lerp(slide, h > 0.5 ? 1 : 0, 0.06); scr.u.uSlide.value = ease(slide);
        phone.position.y = ease(h) * 0.06; turn = lerp(turn, h * (0.3 + sx * 0.25), 0.08); phone.rotation.y = turn;
        tiles.forEach((o) => { o.tg.position.set(lerp(o.x, o.x * 0.82, h), o.y + Math.sin(t * 0.8 + o.ph) * 0.025, o.z); o.tg.rotation.set(Math.sin(t * 0.5 + o.ph) * 0.15, -0.3 + Math.sin(t * 0.4 + o.ph) * 0.2, 0); });
      },
    };
  },
});

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

Object.assign(DESCRIBE, {
  genai: 'A compact AI computer in brushed aluminium, light moving behind its perforated front as it works. Hover: the light builds up, as if it is thinking hard.',
  bot: 'A frosted glass chat bubble with three typing dots. Hover: the reply pops up beside it.',
  analytics: 'Aluminium bars on a dark base with a glowing trend line running on into glass forecast bars. Hover: the bars grow and the forecast fills with light.',
  bpa: 'Task cubes run along a glass lane through three checkpoints and turn cyan once approved. Hover: the flow speeds up and tasks are approved sooner.',
  rpa: 'A small precision robot arm taps through a task list on a tablet, ticking each item off. Hover: it works faster.',
  twin: 'A motor-driven pump and its glowing wireframe twin on a light pad, a scan line running through it. Hover: the twin falls exactly into step and data flows between them.',
  code: 'An open laptop with code being written line by line. Hover: the typing speeds up and a web page builds itself beside the code.',
  erp: 'Four modules (finance, inventory, people, sales), each with its own colour and symbol. Hover: they slide together and lock into one system, light running through the seams.',
  lms: 'A tablet on its stand playing a lesson, with the course list, a progress bar and a graduation cap. Hover: the progress fills and the course shows complete.',
  crm: 'A modern rolodex of glass contact cards on an aluminium spindle. Hover: it flips through the contacts.',
  mobile: 'A phone in an aluminium dock running an app, with glass app tiles floating beside it. Hover: it lifts, turns towards you and slides to the next screen.',
});
