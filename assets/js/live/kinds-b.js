// Cybersecurity, Cloud & Infrastructure and Networking: live pictures (style A) for docs/all-pictures.html
import { THREE, BUILD, DESCRIBE, M, CYAN, U, VS_UV, mesh, rbox, puck, glowMat, canvasTex, textures, lerp, smooth, hash, rng, V2, V3, smoothed } from './kit.js';

const PINK = '#eb4b96', RED = '#ff4d5e';
const phys = (o) => new THREE.MeshPhysicalMaterial(o);
const screenMat = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: VS_UV, fragmentShader: frag });
// a thin clear-coat plane over a screen, so it catches the studio's reflections
const glassOver = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), phys({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false }));
const tube = (pts, r, mat, seg = 48, rad = 10) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, rad), mat);
const pts = (a) => a.map(([x, y, z]) => new V3(x, y, z));
// point an object's +y axis along a direction
const alignY = (o, dir) => o.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.clone().normalize());
// a slab with generously rounded corners in plan and a soft bevel on its edges (for the access point)
function slab(w, d, h, rc, bev) {
  const s = new THREE.Shape(), x = w / 2 - bev, z = d / 2 - bev, c = Math.min(rc, x, z);
  s.moveTo(-x + c, -z); s.lineTo(x - c, -z); s.absarc(x - c, -z + c, c, -Math.PI / 2, 0); s.lineTo(x, z - c); s.absarc(x - c, z - c, c, 0, Math.PI / 2);
  s.lineTo(-x + c, z); s.absarc(-x + c, z - c, c, Math.PI / 2, Math.PI); s.lineTo(-x, -z + c); s.absarc(-x + c, -z + c, c, Math.PI, Math.PI * 1.5);
  const depth = Math.max(1e-4, h - 2 * bev);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 16 });
  g.rotateX(-Math.PI / 2); g.translate(0, -depth / 2, 0);
  return smoothed(g);
}
// LED materials whose brightness the scenes set every frame
const ledMat = (hex) => { const m = new THREE.MeshBasicMaterial({ color: hex }); m.userData.base = new THREE.Color(hex); return m; };
const setLed = (m, k) => m.color.copy(m.userData.base).multiplyScalar(k);

const SHADER_HEAD = `
  const vec3 CY = vec3(0.19, 0.76, 0.97), RD = vec3(0.95, 0.27, 0.36);
  float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
  float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float fill(float d) { return 1.0 - smoothstep(-0.0015, 0.0015, d); }`;

// the SOC's three screens: 0 the threat map, 1 the alert list, 2 events over time
const SOC_SCREEN = `uniform float uTime, uWake, uAlert, uFix, uMode; varying vec2 vUv;${SHADER_HEAD}
  void main() {
    vec2 uv = vUv, p = uv * vec2(1.767, 1.0);
    vec3 col = vec3(0.016, 0.028, 0.048) + vec3(0.008, 0.02, 0.034) * (1.0 - uv.y);
    vec3 ac = mix(RD, CY, uFix);
    if (uMode < 0.5) {
      vec2 g = uv * vec2(88.0, 50.0), cell = floor(g), f = fract(g) - 0.5, cu = (cell + 0.5) / vec2(88.0, 50.0);
      float land = vnoise(cu * vec2(5.0, 3.2) + 2.7) * 0.62 + vnoise(cu * vec2(11.0, 7.0) + 9.1) * 0.38;
      land *= smoothstep(0.06, 0.2, cu.y) * smoothstep(0.96, 0.8, cu.y);
      float on = step(0.5, land), dotm = 1.0 - smoothstep(0.16, 0.3, length(f));
      col += CY * dotm * (0.03 + on * 0.28);
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 a = vec2(0.16 + fi * 0.15, 0.34 + 0.14 * sin(fi * 2.1)), b = vec2(0.52 + 0.12 * cos(fi * 1.3), 0.64 + 0.1 * sin(fi * 3.7)), m = (a + b) * 0.5 + vec2(0.0, 0.14);
        float k = fract(uTime * 0.16 + fi * 0.27), glow = 0.0;
        for (int j = 0; j <= 20; j++) { float s = float(j) / 20.0; vec2 q = mix(mix(a, m, s), mix(m, b, s), s); vec2 dq = (uv - q) * vec2(1.767, 1.0); glow += exp(-dot(dq, dq) * 40000.0); }
        vec2 pk = mix(mix(a, m, k), mix(m, b, k), k), dk = (uv - pk) * vec2(1.767, 1.0), da = (uv - a) * vec2(1.767, 1.0), db = (uv - b) * vec2(1.767, 1.0);
        col += CY * (min(glow, 1.0) * 0.22 + exp(-dot(dk, dk) * 9000.0) * 0.9 + exp(-dot(da, da) * 14000.0) * 0.6 + exp(-dot(db, db) * 14000.0) * 0.4);
      }
      vec2 ap = (uv - vec2(0.74, 0.42)) * vec2(1.767, 1.0); float r = length(ap), k2 = fract(uTime * 0.9);
      col += ac * uAlert * (exp(-pow((r - k2 * 0.1) * 90.0, 2.0)) * (1.0 - k2) * 0.9 + exp(-r * r * 4000.0) * 1.3);
      col += CY * uFix * uAlert * exp(-pow((r - 0.05) * 150.0, 2.0)) * 0.9;
    } else if (uMode < 1.5) {
      col = mix(col, vec3(0.05, 0.09, 0.14), fill(box(p - vec2(0.8835, 0.93), vec2(0.86, 0.035), 0.01)));
      col = mix(col, vec3(0.5, 0.6, 0.7), fill(box(p - vec2(0.2, 0.93), vec2(0.12, 0.008), 0.004)) * 0.6);
      for (int i = 0; i < 7; i++) {
        float fi = float(i), y = 0.8 - fi * 0.115, isA = 1.0 - step(0.5, fi);
        col = mix(col, mix(vec3(0.035, 0.06, 0.09), ac * 0.32, isA * uAlert), fill(box(p - vec2(0.8835, y), vec2(0.85, 0.045), 0.012)));
        vec3 dc = mix(i == 3 ? vec3(0.95, 0.7, 0.3) : CY * 0.8, ac * 1.2, isA * uAlert);
        col = mix(col, dc, 1.0 - smoothstep(0.012, 0.016, length(p - vec2(0.09, y))));
        col = mix(col, vec3(0.62, 0.7, 0.78), fill(box(p - vec2(0.36, y + 0.012), vec2(0.22 - mod(fi, 3.0) * 0.04, 0.007), 0.004)) * 0.75);
        col = mix(col, vec3(0.35, 0.42, 0.5), fill(box(p - vec2(0.3, y - 0.018), vec2(0.16, 0.005), 0.003)) * 0.7);
        col = mix(col, mix(vec3(0.1, 0.22, 0.3), ac * 0.85, isA * uAlert), fill(box(p - vec2(1.52, y), vec2(0.13, 0.022), 0.022)));
      }
    } else {
      float x = uv.x;
      float v = 0.6 + 0.06 * sin(x * 9.0 + uTime * 0.6) + 0.04 * sin(x * 23.0 - uTime * 0.9) + 0.02 * sin(x * 47.0 + uTime * 1.7);
      v += uAlert * (1.0 - uFix) * 0.2 * exp(-pow((x - 0.8) * 14.0, 2.0));
      float inside = step(0.42, uv.y) * step(uv.y, 0.94);
      for (int i = 0; i < 5; i++) col += vec3(0.03, 0.05, 0.07) * (1.0 - smoothstep(0.0, 0.003, abs(uv.y - 0.46 - float(i) * 0.11))) * inside;
      vec3 lc = mix(CY, ac, uAlert * smoothstep(0.65, 0.8, x));
      float line = exp(-pow((uv.y - v) * 160.0, 2.0)), area = step(uv.y, v) * clamp((uv.y - 0.42) / max(v - 0.42, 0.001), 0.0, 1.0);
      col += lc * (line * 0.95 + area * 0.12) * inside;
      for (int i = 0; i < 12; i++) { float fi = float(i); float hg = 0.05 + 0.2 * vnoise(vec2(fi * 1.7, floor(uTime * 0.5) * 0.3 + fi));
        col = mix(col, CY * (0.3 + 0.35 * step(10.5, fi)), fill(box(p - vec2(0.13 + fi * 0.13, 0.07 + hg * 0.5), vec2(0.042, hg * 0.5), 0.006))); }
    }
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

// the audit's circuit board: traces and pads, brighter under the lens; the issue, red until fixed
const BOARD = `uniform float uTime, uFound, uFix; uniform vec2 uLens; varying vec2 vUv;${SHADER_HEAD}
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.44, 0.94);
    vec3 col = vec3(0.02, 0.034, 0.05);
    vec2 g = p / 0.055, c = floor(g), f = fract(g);
    float r = h21(c);
    float tr = r < 0.42 ? 1.0 - smoothstep(0.04, 0.08, abs(f.y - 0.5)) : r < 0.8 ? 1.0 - smoothstep(0.04, 0.08, abs(f.x - 0.5)) : 0.0;
    float pad = (1.0 - smoothstep(0.12, 0.18, length(f - 0.5))) * step(0.9, h21(c + 7.0));
    float dl = length(p - uLens), lens = 1.0 - smoothstep(0.16, 0.2, dl);
    col += CY * (tr * 0.045 + pad * 0.1) * (1.0 + lens * 3.5) + CY * lens * 0.02;
    vec2 ip = vec2(0.33, 0.13); float di = length(p - ip);
    vec3 ic = mix(RD, CY, uFix);
    col += ic * exp(-di * di * 2600.0) * (0.8 + 0.5 * sin(uTime * 4.0) * (1.0 - uFix));
    col += ic * uFound * exp(-pow((di - 0.045 - 0.008 * sin(uTime * 3.0)) * 220.0, 2.0)) * 0.9;
    gl_FragColor = vec4(col, 1.0);
  }`;

// the fingerprint on the sensor: ridges, a scan line, a ring that lights when verified
const PRINT = `uniform float uTime, uScan, uVer; varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0, q = p * vec2(1.0, 0.82) + vec2(0.0, 0.08);
    float a = atan(q.y, q.x), lq = length(q);
    float v = lq + 0.05 * sin(a * 2.0 + lq * 6.0) + 0.03 * sin(q.x * 9.0 + q.y * 5.0);
    float ridge = 1.0 - smoothstep(0.1, 0.22, abs(fract(v * 9.0) - 0.5));
    float mask = 1.0 - smoothstep(0.6, 0.68, length(p * vec2(1.15, 0.92)));
    vec3 cy = vec3(0.19, 0.76, 0.97), ok = vec3(0.35, 0.95, 0.85);
    float sy = mix(-0.75, 0.75, uScan), band = exp(-pow((p.y - sy) * 10.0, 2.0)) * step(0.001, uScan) * step(uScan, 0.999);
    vec3 rc = mix(cy * 0.22, ok * 0.9, uVer) * (0.85 + 0.15 * sin(uTime * 1.5));
    vec3 col = vec3(0.008, 0.012, 0.018) + ridge * mask * (rc + cy * band * 1.4);
    col += cy * band * mask * 0.15;
    float rr = length(p);
    col += mix(cy, ok, uVer) * exp(-pow((rr - 0.9) * 40.0, 2.0)) * (0.18 + uVer * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }`;

let CARD = null, PATCH = null;
function cardTex() {
  return CARD || (CARD = canvasTex(620, 390, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = 'rgba(12, 30, 48, 0.55)'; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 26); x.fill();
    const g = x.createLinearGradient(40, 150, 140, 230); g.addColorStop(0, '#e9edf2'); g.addColorStop(1, '#9aa4b0');
    x.fillStyle = g; x.beginPath(); x.roundRect(44, 150, 96, 74, 12); x.fill();
    x.strokeStyle = 'rgba(40,50,60,0.6)'; x.lineWidth = 2; for (const yy of [174, 199]) { x.beginPath(); x.moveTo(44, yy); x.lineTo(140, yy); x.stroke(); } x.beginPath(); x.moveTo(92, 150); x.lineTo(92, 224); x.stroke();
    x.fillStyle = '#30c1f8'; x.fillRect(4, 40, 10, 90);
    x.fillStyle = 'rgba(255,255,255,0.75)'; x.beginPath(); x.roundRect(44, 52, 230, 18, 9); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.roundRect(44, 84, 160, 12, 6); x.fill();
    for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.roundRect(44, 270 + i * 26, 300 - i * 50, 10, 5); x.fill(); }
    x.strokeStyle = 'rgba(48,193,248,0.85)'; x.lineWidth = 5; x.beginPath(); x.arc(500, 118, 58, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(48,193,248,0.35)'; x.lineWidth = 3; x.beginPath(); x.arc(500, 118, 40, 0, 7); x.stroke();
    x.fillStyle = 'rgba(48,193,248,0.9)'; x.beginPath(); x.arc(500, 118, 10, 0, 7); x.fill();
  }));
}
// the patch panel's front: 24 jacks in four groups, with small number tabs
function patchTex() {
  return PATCH || (PATCH = canvasTex(576, 64, (x, w, h) => {
    x.fillStyle = '#1c2026'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#14171b'; x.fillRect(0, 0, 22, h); x.fillRect(w - 22, 0, 22, h);
    x.fillStyle = '#353a42'; x.fillRect(7, 14, 6, 36); x.fillRect(w - 13, 14, 6, 36);
    for (let c = 0; c < 24; c++) {
      const px = 56 + c * 19 + Math.floor(c / 6) * 6;
      x.fillStyle = '#2c3138'; x.fillRect(px - 2, 18, 19, 28); x.fillStyle = '#050607'; x.fillRect(px, 22, 15, 18);
      x.fillStyle = 'rgba(255,255,255,0.28)'; x.fillRect(px + 3, 8, 9, 5);
    }
    x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, w, 2);
  }));
}

Object.assign(BUILD, {
  // Managed AI SecOps (24/7 SOC): a console of three monitors on one stand. The middle screen is a calm threat map
  // with links between sites, the left one the alert list, the right one events over time. On hover a new alert comes
  // in red on all three screens and is contained a moment later, turning cyan
  soc() {
    const g = new THREE.Group();
    const uWake = { value: 0.9 }, uAlert = { value: 0 }, uFix = { value: 0 };
    g.add(mesh(rbox(0.74, 0.032, 0.38, 0.014), M.dark, 0, 0.016, 0.02));
    g.add(mesh(rbox(0.085, 0.92, 0.06, 0.022), M.alu, 0, 0.48, -0.1));
    g.add(mesh(rbox(1.62, 0.05, 0.04, 0.016), M.alu, 0, 0.98, -0.085));
    const mon = (x, z, ry, mode) => {
      const m = new THREE.Group(); m.position.set(x, 0.98, z); m.rotation.y = ry; g.add(m);
      m.add(mesh(rbox(0.8, 0.47, 0.034, 0.012), M.dark));
      m.add(mesh(rbox(0.16, 0.12, 0.03, 0.01), M.dark, 0, 0, -0.03));
      m.add(mesh(new THREE.PlaneGeometry(0.772, 0.44), screenMat(SOC_SCREEN, { uTime: U.time, uWake, uAlert, uFix, uMode: { value: mode } }), 0, 0, 0.0175, { tone: 3 }));
      const gl = glassOver(0.776, 0.444); gl.position.z = 0.018; gl.userData.noDust = true; m.add(gl);
    };
    mon(0, 0, 0, 0); mon(-0.785, 0.165, 0.42, 1); mon(0.785, 0.165, -0.42, 2);
    const led = ledMat('#7dffb0'); g.add(mesh(new THREE.SphereGeometry(0.006, 12, 8), led, 0.33, 0.762, 0.019, { tone: 1 }));
    let at = 0;
    return {
      g, frame: { target: [0, 0.82, 0], dist: 3.55, az: 0.22, el: 0.1 }, top: 1.25, dustN: 16000,
      shadows: [[0, 0.02, 0.95, 0.6, 0.9], [0, 0.1, 2.4, 0.8, 0.3]],
      anim(t, h, dt) {
        at = h > 0.5 ? at + (dt || 0) : Math.max(0, at - (dt || 0) * 2);
        uAlert.value = smooth(0, 0.3, at); uFix.value = smooth(1.5, 2.2, at); uWake.value = 0.9 + h * 0.15;
        setLed(led, 0.6 + 0.4 * Math.sin(t * 2));
      },
    };
  },

  // Cybersecurity Assessment & Audit: a magnifying glass over a circuit board. It drifts over the board on its own;
  // on hover it follows the pointer, and when it reaches the red issue the issue is found (a ring) and then fixed (cyan)
  audit() {
    const g = new THREE.Group();
    const uLens = { value: new V2() }, uFound = { value: 0 }, uFix = { value: 0 };
    g.add(mesh(rbox(1.5, 0.06, 1.0, 0.02), M.dark, 0, 0.03, 0));
    g.add(mesh(new THREE.PlaneGeometry(1.44, 0.94).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uLens, uFound, uFix }, vertexShader: VS_UV, fragmentShader: BOARD }), 0, 0.0605, 0, { tone: 3 }));
    g.add(mesh(rbox(0.24, 0.022, 0.24, 0.008), M.gloss, -0.38, 0.071, -0.12));
    g.add(mesh(rbox(0.2, 0.034, 0.2, 0.01), M.alu, -0.38, 0.09, -0.12));
    g.add(mesh(rbox(0.16, 0.02, 0.1, 0.006), M.gloss, 0.05, 0.07, 0.24));
    g.add(mesh(rbox(0.16, 0.02, 0.1, 0.006), M.gloss, 0.25, 0.07, 0.24));
    g.add(mesh(rbox(0.9, 0.03, 0.05, 0.01), M.paint, 0, 0.075, -0.42));
    for (let i = 0; i < 6; i++) g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 20), M.alu, -0.6 + i * 0.045, 0.075, 0.3));
    const mag = new THREE.Group(); g.add(mag);
    const tilt = new THREE.Group(); tilt.rotation.set(0.18, 0, -0.1); mag.add(tilt);
    tilt.add(mesh(new THREE.TorusGeometry(0.2, 0.02, 24, 120).rotateX(Math.PI / 2), M.alu));
    tilt.add(mesh(new THREE.CylinderGeometry(0.198, 0.198, 0.012, 96), M.glass));
    const dir = new V3(0.72, 0.22, 0.66).normalize(), hand = new THREE.Group(); hand.position.copy(new V3(0.72, 0, 0.66).normalize().multiplyScalar(0.215)); alignY(hand, dir); tilt.add(hand);
    hand.add(mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.06, 32), M.alu, 0, 0.03, 0));
    hand.add(mesh(new THREE.CapsuleGeometry(0.026, 0.26, 8, 24), M.dark, 0, 0.2, 0));
    const found = ledMat(CYAN); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(0.32); halo.position.set(0.33, 0.08, -0.13); g.add(halo); void found;
    const pos = new V2(-0.2, 0.1); let ft = 0;
    return {
      g, frame: { target: [0, 0.12, 0.02], dist: 2.75, az: 0.3, el: 0.62 }, top: 0.5, dustN: 14000,
      shadows: [[0, 0, 1.7, 1.15, 0.85]],
      anim(t, h, dt, st) {
        const ix = Math.cos(t * 0.32) * 0.36 - 0.05, iz = Math.sin(t * 0.32) * 0.22;
        const px = (st ? st.x : 0) * 0.62, pz = (st ? st.y : 0) * 0.42;
        pos.x = lerp(pos.x, lerp(ix, px, h), 0.07); pos.y = lerp(pos.y, lerp(iz, pz, h), 0.07);
        mag.position.set(pos.x, 0.3 + Math.sin(t * 0.9) * 0.012, pos.y);
        uLens.value.set(pos.x, -pos.y);
        const near = Math.hypot(pos.x - 0.33, pos.y + 0.13) < 0.13;
        ft = near && h > 0.5 ? ft + (dt || 0) : Math.max(0, ft - (dt || 0) * (h > 0.5 ? 0.15 : 0.6));
        uFound.value = Math.max(smooth(0, 0.25, ft), near ? 0.6 : 0); uFix.value = smooth(0.7, 1.3, ft);
        halo.material.opacity = uFix.value * 0.35;
      },
    };
  },

  // Zero Trust, Identity & Data Security: a fingerprint sensor with a glass ID card standing behind it. On hover a scan
  // sweeps across the print, then it turns verified: the ridges and the ring go bright and the card's edge lights
  zerotrust() {
    const g = new THREE.Group();
    const uScan = { value: 0 }, uVer = { value: 0 };
    g.add(mesh(puck(0.34, 0.075, 0.03, 0.27), M.alu));
    g.add(mesh(new THREE.CircleGeometry(0.27, 96).rotateX(-Math.PI / 2), M.gloss, 0, 0.0695, 0));
    g.add(mesh(new THREE.CircleGeometry(0.235, 96).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uScan, uVer }, vertexShader: VS_UV, fragmentShader: PRINT }), 0, 0.0702, 0, { tone: 3 }));
    const ring = ledMat(CYAN); g.add(mesh(new THREE.TorusGeometry(0.302, 0.003, 8, 128).rotateX(Math.PI / 2), ring, 0, 0.074, 0, { tone: 1 }));
    const card = new THREE.Group(); card.position.set(0.04, 0.3, -0.5); card.rotation.set(-0.1, -0.18, 0); g.add(card);
    card.add(mesh(rbox(0.62, 0.39, 0.012, 0.03), M.glass, 0, 0, 0, { w: 0.6 }));
    card.add(mesh(new THREE.PlaneGeometry(0.6, 0.377), new THREE.MeshBasicMaterial({ map: cardTex(), transparent: true, depthWrite: false }), 0, 0, 0.0065, { noDust: true }));
    const edgeM = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false });
    const edge = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(), w = 0.316, hh = 0.201, r = 0.032; s.moveTo(-w + r, -hh); s.lineTo(w - r, -hh); s.absarc(w - r, -hh + r, r, -Math.PI / 2, 0); s.lineTo(w, hh - r); s.absarc(w - r, hh - r, r, 0, Math.PI / 2); s.lineTo(-w + r, hh); s.absarc(-w + r, hh - r, r, Math.PI / 2, Math.PI); s.lineTo(-w, -hh + r); s.absarc(-w + r, -hh + r, r, Math.PI, Math.PI * 1.5);
      const hole = new THREE.Path(), w2 = 0.308, h2 = 0.193, r2 = 0.026; hole.moveTo(-w2 + r2, -h2); hole.lineTo(w2 - r2, -h2); hole.absarc(w2 - r2, -h2 + r2, r2, -Math.PI / 2, 0); hole.lineTo(w2, h2 - r2); hole.absarc(w2 - r2, h2 - r2, r2, 0, Math.PI / 2); hole.lineTo(-w2 + r2, h2); hole.absarc(-w2 + r2, h2 - r2, r2, Math.PI / 2, Math.PI); hole.lineTo(-w2, -h2 + r2); hole.absarc(-w2 + r2, -h2 + r2, r2, Math.PI, Math.PI * 1.5); s.holes.push(hole); return s; })(), 12), edgeM);
    edge.position.z = 0.0068; edge.userData.noDust = true; card.add(edge);
    let st0 = 0;
    return {
      g, frame: { target: [0, 0.2, -0.15], dist: 2.35, az: 0.32, el: 0.42 }, top: 0.55, dustN: 13000,
      shadows: [[0, 0, 1.0, 1.0, 0.9], [0.04, -0.5, 0.75, 0.3, 0.4]],
      anim(t, h, dt) {
        st0 = h > 0.5 ? st0 + (dt || 0) : Math.max(0, st0 - (dt || 0) * 1.5);
        uScan.value = h > 0.5 ? smooth(0.1, 1.3, st0) : 0; uVer.value = smooth(1.3, 1.7, st0);
        setLed(ring, 0.6 + uVer.value * 1.8 + Math.sin(t * 1.6) * 0.15);
        edgeM.opacity = 0.12 + uVer.value * 0.75;
        card.position.y = 0.3 + Math.sin(t * 0.7) * 0.01 + uVer.value * 0.03;
      },
    };
  },

  // Ransomware Resilience & Recovery: a round vault door in brushed metal set in a heavy frame. On hover the wheel
  // turns, the bolts draw back and the door swings open, showing the backed-up drives glowing safely inside
  vault() {
    const g = new THREE.Group(), C = 0.78, R = 0.56;
    const gun = phys({ color: 0x3a4048, metalness: 0.85, roughness: 0.34, clearcoat: 0.3 });
    const chrome = phys({ color: 0xe9ecf0, metalness: 1, roughness: 0.14 });
    const fs = new THREE.Shape(); fs.moveTo(-0.74, -0.74); fs.lineTo(0.74, -0.74); fs.lineTo(0.74, 0.74); fs.lineTo(-0.74, 0.74); fs.lineTo(-0.74, -0.74);
    const hole = new THREE.Path(); hole.absarc(0, 0, R + 0.02, 0, Math.PI * 2, true); fs.holes.push(hole);
    const fg = new THREE.ExtrudeGeometry(fs, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 96 });
    g.add(mesh(fg, gun, 0, C, 0));
    g.add(mesh(new THREE.CircleGeometry(R + 0.03, 96), M.dark, 0, C, 0.02));
    // inside: the protected drives
    const driveLeds = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = (c - 1) * 0.22, y = C + (r - 1) * 0.15;
      g.add(mesh(rbox(0.2, 0.12, 0.14, 0.012), M.paint, x, y, 0.1));
      const l = ledMat(CYAN); driveLeds.push(l); g.add(mesh(new THREE.BoxGeometry(0.14, 0.008, 0.004), l, x, y - 0.035, 0.172, { tone: 1 }));
    }
    const inner = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    inner.scale.setScalar(1.3); inner.position.set(0, C, 0.25); g.add(inner);
    const ringM = ledMat(CYAN); g.add(mesh(new THREE.TorusGeometry(R + 0.055, 0.004, 8, 160), ringM, 0, C, 0.325, { tone: 1 }));
    // hinge blocks on the frame
    for (const y of [0.32, -0.32]) g.add(mesh(rbox(0.1, 0.16, 0.12, 0.02), chrome, R + 0.1, C + y, 0.36));
    // the door, hinged at its right edge
    const pivot = new THREE.Group(); pivot.position.set(R + 0.08, C, 0.37); g.add(pivot);
    const door = new THREE.Group(); door.position.set(-(R + 0.08), 0, 0); pivot.add(door);
    door.add(mesh(new THREE.CylinderGeometry(R, R, 0.17, 128).rotateX(Math.PI / 2), M.alu));
    for (const [rr, tt] of [[0.5, 0.012], [0.4, 0.006], [0.23, 0.01]]) door.add(mesh(new THREE.TorusGeometry(rr, tt, 12, 128), M.dark, 0, 0, 0.086));
    door.add(mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.04, 64).rotateX(Math.PI / 2), chrome, 0, 0, 0.1));
    const bolts = [];
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 24), chrome); b.rotation.z = a - Math.PI / 2; b.userData.a = a; bolts.push(b); door.add(b); }
    const wheel = new THREE.Group(); wheel.position.z = 0.14; door.add(wheel);
    wheel.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 48).rotateX(Math.PI / 2), chrome));
    for (let i = 0; i < 3; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.5, 24), chrome); sp.rotation.z = (i / 3) * Math.PI; wheel.add(sp); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; wheel.add(mesh(new THREE.SphereGeometry(0.034, 24, 16), chrome, Math.sin(a) * 0.25, Math.cos(a) * 0.25, 0)); }
    return {
      g, frame: { target: [0.05, C - 0.02, 0.3], dist: 3.65, az: 0.38, el: 0.1 }, top: 1.55, dustN: 16000,
      shadows: [[0, 0.2, 1.9, 0.9, 0.85]],
      anim(t, h) {
        const lock = smooth(0.15, 0.45, h), open = smooth(0.45, 1, h);
        wheel.rotation.z = -lock * Math.PI * 1.5 + Math.sin(t * 0.5) * 0.03 * (1 - h);
        for (const b of bolts) { const r = R + 0.02 - lock * 0.07; b.position.set(Math.cos(b.userData.a) * r, Math.sin(b.userData.a) * r, 0); }
        pivot.rotation.y = open * 0.95;
        inner.material.opacity = open * 0.55;
        driveLeds.forEach((l, i) => setLed(l, 0.25 + open * (1.4 + Math.sin(t * 3 + i) * 0.5)));
        setLed(ringM, 0.35 + Math.sin(t * 1.2) * 0.12 + open * 1.3);
      },
    };
  },

  // Information Security Services: a padlock in aluminium with a glass front and a chrome shackle. It rests open;
  // on hover the shackle swings in and clicks shut, and the ring of light behind the glass comes on
  padlock() {
    const g = new THREE.Group(), BT = 0.46, R = 0.165, L = 0.21;
    const chrome = phys({ color: 0xe9ecf0, metalness: 1, roughness: 0.12 });
    g.add(mesh(rbox(0.56, BT, 0.2, 0.07), M.alu, 0, BT / 2, 0));
    g.add(mesh(rbox(0.44, 0.3, 0.014, 0.05), M.gloss, 0, BT * 0.46, 0.098));
    const ringM = ledMat(CYAN); g.add(mesh(new THREE.TorusGeometry(0.08, 0.006, 12, 96), ringM, 0, BT * 0.46, 0.107, { tone: 1 }));
    const dotM = ledMat(CYAN); g.add(mesh(new THREE.CircleGeometry(0.018, 32), dotM, 0, BT * 0.46, 0.106, { tone: 1 }));
    const glass = glassOver(0.44, 0.3); glass.position.set(0, BT * 0.46, 0.108); glass.userData.noDust = true; g.add(glass);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(0.5); glow.position.set(0, BT * 0.46, 0.13); g.add(glow);
    const pivot = new THREE.Group(); pivot.position.set(-R, BT - 0.07 + L, 0); g.add(pivot);
    pivot.add(mesh(new THREE.TorusGeometry(R, 0.036, 24, 72, Math.PI), chrome, R, 0, 0));
    pivot.add(mesh(new THREE.CylinderGeometry(0.036, 0.036, L, 32), chrome, 0, -L / 2, 0));
    pivot.add(mesh(new THREE.CylinderGeometry(0.036, 0.036, L, 32), chrome, 2 * R, -L / 2, 0));
    return {
      g, frame: { target: [0, 0.4, 0], dist: 2.15, az: 0.4, el: 0.12 }, top: 0.85, dustN: 12000,
      shadows: [[0, 0, 0.8, 0.45, 0.9]],
      anim(t, h) {
        const swing = 1 - smooth(0.05, 0.5, h), drop = 1 - smooth(0.5, 0.75, h), lit = smooth(0.72, 0.9, h);
        pivot.position.y = BT - 0.07 + L + drop * 0.1; pivot.rotation.y = swing * 1.15;
        setLed(ringM, 0.35 + lit * 2.2 + Math.sin(t * 1.4) * 0.1); setLed(dotM, 0.3 + lit * 1.6);
        glow.material.opacity = lit * 0.5;
      },
    };
  },

  // Cloud Services & Migration: a server below and a soft, glossy cloud above it, with data cubes rising from the
  // server into the cloud. On hover more cubes rise, faster
  cloud() {
    const g = new THREE.Group(), cl = new THREE.Group(); cl.position.y = 1.0; g.add(cl);
    // a dark glass cloud lit from inside and below (a white cloud looked like a cartoon)
    const cm = phys({ color: 0x1c3a58, metalness: 0.2, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 1, sheenColor: new THREE.Color(0x5fd3ff), sheenRoughness: 0.5, emissive: new THREE.Color(0x0b2a44), emissiveIntensity: 0.55 });
    cl.scale.set(0.82, 0.68, 0.72);
    for (const [x, y, z, r] of [[-0.34, -0.02, 0, 0.25], [-0.05, 0.13, -0.02, 0.33], [0.3, 0.03, 0, 0.27], [-0.16, -0.07, 0.13, 0.22], [0.15, -0.06, 0.14, 0.24], [0.02, -0.02, -0.16, 0.25], [0.46, -0.08, 0.02, 0.17], [-0.5, -0.1, 0.02, 0.15]])
      cl.add(mesh(new THREE.SphereGeometry(r, 48, 32), cm, x, y, z));
    cl.add(mesh(rbox(1.1, 0.16, 0.42, 0.08), cm, 0, -0.16, 0.0));
    const under = new THREE.PointLight(CYAN, 1.6, 1.6, 2); under.position.set(0, 0.62, 0.1); g.add(under);
    g.add(mesh(rbox(0.66, 0.2, 0.46, 0.03), M.dark, 0, 0.1, 0));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.16), M.bezel.u2); face.position.set(0, 0.1, 0.2305); g.add(face);
    const leds = [0, 1, 2, 3, 4, 5].map((i) => { const l = ledMat(i % 3 ? CYAN : '#5ef2c4'); g.add(mesh(new THREE.BoxGeometry(0.012, 0.006, 0.003), l, -0.22 + i * 0.088, 0.05, 0.232, { tone: 1 })); return l; });
    const port = ledMat(CYAN); g.add(mesh(new THREE.TorusGeometry(0.07, 0.004, 8, 64).rotateX(Math.PI / 2), port, 0, 0.202, 0.02, { tone: 1 }));
    const cubeM = glowMat(CYAN, 1.3), cubes = [];
    for (let i = 0; i < 16; i++) { const c = mesh(rbox(0.05, 0.05, 0.05, 0.01), cubeM, 0, 0, 0, { tone: 1 }); c.userData.p = hash(i + 3); c.userData.a = hash(i + 11) * Math.PI * 2; cubes.push(c); g.add(c); }
    let flow = 0, speed = 0.22;
    return {
      g, frame: { target: [0, 0.62, 0], dist: 3.2, az: 0.32, el: 0.12 }, top: 1.3, dustN: 14000,
      shadows: [[0, 0, 0.9, 0.65, 0.9], [0, 0, 1.4, 0.7, 0.25]],
      anim(t, h, dt) {
        speed = lerp(speed, lerp(0.22, 0.6, h), 0.05); flow += (dt || 0) * speed;
        cl.position.y = 1.0 + Math.sin(t * 0.6) * 0.02; cl.rotation.y = Math.sin(t * 0.2) * 0.08;
        const n = Math.round(lerp(7, 16, h));
        cubes.forEach((c, i) => {
          const k = (flow + c.userData.p) % 1, on = i < n ? 1 : 0, sw = 0.05 + 0.05 * Math.sin(k * Math.PI);
          c.position.set(Math.cos(c.userData.a + k * 2) * sw, 0.24 + k * 0.58, Math.sin(c.userData.a + k * 2) * sw + 0.02);
          c.scale.setScalar(on * Math.min(1, k * 6, (1 - k) * 5)); c.rotation.set(k * 3, k * 4, 0);
        });
        leds.forEach((l, i) => setLed(l, hash(Math.floor(t * (2 + h * 5) + i * 3.1)) > 0.4 ? 2.2 : 0.15));
        setLed(port, 0.8 + h * 1.2 + Math.sin(t * 2) * 0.2); under.intensity = 1.2 + h * 1.2;
      },
    };
  },

  // Managed Services: a support headset on its stand, the microphone ready. On hover the light rings on the ear cups
  // and the mic light come on, and the headset turns towards the pointer
  managed() {
    const g = new THREE.Group(), yc = 0.56;
    g.add(mesh(puck(0.17, 0.03, 0.012, 0.13), M.dark));
    g.add(mesh(new THREE.CylinderGeometry(0.016, 0.02, yc + 0.235, 32), M.alu, 0, (yc + 0.235) / 2 + 0.02, 0));
    g.add(mesh(new THREE.CapsuleGeometry(0.014, 0.15, 8, 24).rotateZ(Math.PI / 2), M.dark, 0, yc + 0.256, 0));
    const hs = new THREE.Group(); g.add(hs);
    hs.add(mesh(new THREE.TorusGeometry(0.272, 0.02, 16, 120, Math.PI), M.alu, 0, yc + 0.02, 0));
    const pad = mesh(new THREE.TorusGeometry(0.25, 0.024, 16, 96, Math.PI * 0.62), M.knit, 0, yc + 0.02, 0); pad.rotation.z = Math.PI * 0.19; hs.add(pad);
    const rings = [];
    for (const s of [-1, 1]) {
      hs.add(mesh(rbox(0.026, 0.1, 0.045, 0.01), M.alu, s * 0.272, yc - 0.02, 0));
      const cup = mesh(puck(0.125, 0.075, 0.03, 0.09), M.dark, s * 0.22, yc - 0.1, 0); cup.rotation.z = -s * Math.PI / 2; hs.add(cup);
      hs.add(mesh(new THREE.CircleGeometry(0.09, 64).rotateY(s * Math.PI / 2), M.alu, s * 0.2955, yc - 0.1, 0));
      const rm = ledMat(CYAN); rings.push(rm); hs.add(mesh(new THREE.TorusGeometry(0.105, 0.0035, 8, 96).rotateY(Math.PI / 2), rm, s * 0.2965, yc - 0.1, 0, { tone: 1 }));
      hs.add(mesh(new THREE.TorusGeometry(0.098, 0.032, 16, 64).rotateY(Math.PI / 2), M.knit, s * 0.205, yc - 0.1, 0));
    }
    const boom = pts([[-0.3, yc - 0.15, 0.05], [-0.29, yc - 0.24, 0.15], [-0.21, yc - 0.31, 0.24], [-0.09, yc - 0.34, 0.27]]);
    hs.add(tube(boom, 0.008, M.dark, 40, 10));
    const mic = mesh(new THREE.CapsuleGeometry(0.017, 0.04, 8, 16), M.knit, -0.07, yc - 0.343, 0.272); mic.rotation.z = Math.PI / 2 + 0.25; hs.add(mic);
    const micLed = ledMat(RED); hs.add(mesh(new THREE.SphereGeometry(0.006, 12, 8), micLed, -0.105, yc - 0.33, 0.285, { tone: 2 }));
    let ry = 0;
    return {
      g, frame: { target: [0, 0.44, 0], dist: 2.25, az: 0.55, el: 0.12 }, top: 0.85, dustN: 12000,
      shadows: [[0, 0, 0.55, 0.55, 0.9]],
      anim(t, h, dt, st) {
        ry = lerp(ry, Math.sin(t * 0.25) * 0.25 * (1 - h) + (st ? st.x : 0) * 0.5 * h, 0.06); hs.rotation.y = ry;
        rings.forEach((r) => setLed(r, 0.3 + h * 2.2 + Math.sin(t * 2) * 0.1));
        micLed.color.copy(new THREE.Color(RED).lerp(new THREE.Color('#5ef2c4'), h)).multiplyScalar(0.4 + h * 2.2);
      },
    };
  },

  // IT/OT Services: an industrial controller (PLC) on a DIN rail: power supply, the CPU with its network ports and a
  // row of I/O modules with terminals and status lights, a network cable running out. On hover the lights run in sequence
  itot() {
    const g = new THREE.Group(), H = 0.46, D = 0.2, leds = [];
    const shell = phys({ color: 0x2b3038, metalness: 0.2, roughness: 0.5, clearcoat: 0.25 });
    const face = phys({ color: 0x1b1f25, metalness: 0.3, roughness: 0.45 });
    const cable = phys({ color: 0x1a7fb5, roughness: 0.42, clearcoat: 0.4 });
    const screw = new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 16).rotateX(Math.PI / 2);
    const mods = [['psu', 0.12], ['cpu', 0.24], ['io', 0.09], ['io', 0.09], ['io', 0.09], ['io', 0.09], ['io', 0.09]];
    const total = mods.reduce((s, [, w]) => s + w + 0.006, 0);
    g.add(mesh(rbox(total + 0.12, 0.035, 0.012, 0.004), M.alu, 0, H * 0.6, -D / 2 - 0.006));
    let x = -total / 2, cpuX = 0;
    for (const [kind, w] of mods) {
      const cx = x + w / 2; x += w + 0.006;
      g.add(mesh(rbox(w, H, D, 0.012), shell, cx, H / 2, 0));
      const fz = D / 2;
      // terminal strips top and bottom
      for (const ty of [H - 0.06, 0.06]) {
        g.add(mesh(rbox(w - 0.016, 0.075, 0.012, 0.004), face, cx, ty, fz));
        const n = Math.max(2, Math.floor((w - 0.02) / 0.022));
        for (let i = 0; i < n; i++) for (let r = 0; r < 2; r++) g.add(mesh(screw, M.alu, cx - (n - 1) * 0.011 + i * 0.022, ty - 0.017 + r * 0.034, fz + 0.008));
      }
      g.add(mesh(rbox(w - 0.016, 0.22, 0.008, 0.004), face, cx, H / 2, fz));
      if (kind === 'io') {
        for (let i = 0; i < 8; i++) { const l = ledMat(i % 4 === 3 ? '#ffb547' : '#5ef2c4'); leds.push(l); g.add(mesh(new THREE.BoxGeometry(0.014, 0.008, 0.004), l, cx - 0.02, H / 2 + 0.08 - i * 0.022, fz + 0.006, { tone: 1 })); }
        g.add(mesh(new THREE.BoxGeometry(0.03, 0.17, 0.002), M.alu, cx + 0.017, H / 2, fz + 0.005));
      } else if (kind === 'psu') {
        const l = ledMat('#5ef2c4'); leds.push(l); g.add(mesh(new THREE.BoxGeometry(0.02, 0.01, 0.004), l, cx, H / 2 + 0.07, fz + 0.006, { tone: 1 }));
        for (let i = 0; i < 6; i++) g.add(mesh(new THREE.BoxGeometry(0.07, 0.006, 0.003), M.dark, cx, H / 2 - 0.02 - i * 0.015, fz + 0.006));
      } else {
        cpuX = cx;
        const sm = screenMat(`uniform float uTime; varying vec2 vUv;
          void main() { vec3 c = vec3(0.02, 0.05, 0.07); float b = step(fract(vUv.x * 5.0), 0.8) * step(vUv.y, 0.25 + 0.5 * fract(sin(floor(vUv.x * 5.0) * 7.1 + floor(uTime)) * 43.7));
            c += vec3(0.19, 0.76, 0.97) * b * step(0.15, vUv.y) * 0.6 + vec3(0.19, 0.76, 0.97) * 0.8 * (1.0 - smoothstep(0.0, 0.06, abs(vUv.y - 0.86))) * step(vUv.x, 0.6);
            gl_FragColor = vec4(c, 1.0); }`, { uTime: U.time });
        g.add(mesh(new THREE.PlaneGeometry(0.13, 0.07), sm, cx - 0.025, H / 2 + 0.06, fz + 0.0045, { tone: 3 }));
        for (const [c, i] of [['#5ef2c4', 0], ['#ffb547', 1], [RED, 2]]) { const l = ledMat(c); if (i === 0) leds.push(l); else setLed(l, 0.15); g.add(mesh(new THREE.BoxGeometry(0.016, 0.009, 0.004), l, cx + 0.075, H / 2 + 0.085 - i * 0.022, fz + 0.006, { tone: 1 })); }
        for (let i = 0; i < 2; i++) { g.add(mesh(rbox(0.038, 0.032, 0.01, 0.003), M.alu, cx - 0.06 + i * 0.05, H / 2 - 0.06, fz + 0.006)); g.add(mesh(new THREE.BoxGeometry(0.03, 0.022, 0.004), M.gloss, cx - 0.06 + i * 0.05, H / 2 - 0.062, fz + 0.011)); }
      }
    }
    // the network cable out of the CPU's first port, down and away to the front right
    const px = cpuX - 0.06, cab = pts([[px, H / 2 - 0.06, D / 2 + 0.04], [px, H / 2 - 0.08, D / 2 + 0.12], [px + 0.06, 0.12, D / 2 + 0.24], [px + 0.3, 0.018, D / 2 + 0.36], [px + 0.75, 0.018, D / 2 + 0.3], [px + 1.1, 0.018, D / 2 + 0.05]]);
    g.add(tube(cab, 0.011, cable, 80, 12));
    g.add(mesh(rbox(0.034, 0.03, 0.05, 0.006), M.glass, px, H / 2 - 0.06, D / 2 + 0.03));
    g.add(mesh(rbox(0.03, 0.028, 0.04, 0.008), cable, px, H / 2 - 0.062, D / 2 + 0.07));
    return {
      g, frame: { target: [0.05, 0.22, 0.05], dist: 2.35, az: 0.32, el: 0.2 }, top: 0.5, dustN: 14000,
      shadows: [[0, 0, total + 0.2, 0.5, 0.9], [0.3, 0.45, 1.2, 0.5, 0.3]],
      anim(t, h) {
        const N = leds.length;
        leds.forEach((l, i) => {
          const idle = hash(Math.floor(t * 1.5 + i * 7.3)) > 0.55 ? 1.6 : 0.2;
          const wave = (((t * 0.9 - i / N) % 1) + 1) % 1 < 0.14 ? 2.8 : 0.25;
          setLed(l, lerp(idle, wave, h));
        });
      },
    };
  },

  // Enterprise Networking & Wi-Fi: a ceiling access point, white with a soft light ring, and rings of Wi-Fi coverage
  // spreading out from it. On hover the rings grow stronger and faster
  wifi() {
    const g = new THREE.Group(), ap = new THREE.Group(); ap.position.set(0, 0.62, 0); ap.rotation.set(0.62, 0.15, 0); g.add(ap);
    const white = phys({ color: 0xeef1f5, roughness: 0.36, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    ap.add(mesh(slab(0.64, 0.64, 0.085, 0.13, 0.03), white));
    ap.add(mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 64), M.dark, 0, -0.055, 0));
    ap.add(mesh(new THREE.CircleGeometry(0.06, 48).rotateX(-Math.PI / 2), phys({ color: 0xdfe4ea, roughness: 0.25, clearcoat: 1 }), 0, 0.0431, 0));
    const ledM = ledMat(CYAN); ap.add(mesh(new THREE.TorusGeometry(0.045, 0.004, 8, 64).rotateX(Math.PI / 2), ledM, 0, 0.044, 0, { tone: 1 }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: CYAN, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(0.35); halo.position.y = 0.06; ap.add(halo);
    const waves = [0, 1, 2, 3].map(() => { const m = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); const w = mesh(new THREE.TorusGeometry(1, 0.004, 6, 160).rotateX(Math.PI / 2), m, 0, 0.0, 0, { noDust: true }); ap.add(w); return w; });
    let ph = 0, sp = 0.18;
    return {
      g, frame: { target: [0, 0.56, 0], dist: 2.65, az: 0.28, el: 0.14 }, top: 1.0, dustN: 10000,
      shadows: [[0, 0.1, 0.9, 0.9, 0.55]],
      anim(t, h, dt) {
        sp = lerp(sp, lerp(0.18, 0.42, h), 0.05); ph += (dt || 0) * sp;
        ap.position.y = 0.62 + Math.sin(t * 0.7) * 0.015;
        waves.forEach((w, i) => { const k = (ph + i / waves.length) % 1; w.scale.setScalar(0.4 + k * 1.5); w.material.opacity = Math.sin(k * Math.PI) * (1 - k) * lerp(0.55, 1.1, h); w.position.y = 0.01; });
        setLed(ledM, 1 + h * 1.6 + Math.sin(t * 1.5) * 0.2); halo.material.opacity = 0.15 + h * 0.25;
      },
    };
  },

  // Network Services Cabling / Structured Cabling: a patch panel over a switch in a small open frame, with neatly
  // dressed patch cords looping between them through a cable manager. On hover the switch's link lights run along
  cabling() {
    const g = new THREE.Group(), IW = 0.84, UH = 0.088, zf = 0.035, FW = IW + 0.06;
    g.add(mesh(rbox(IW + 0.22, 0.03, 0.42, 0.01), M.dark, 0, 0.015, 0));
    for (const s of [-1, 1]) g.add(mesh(rbox(0.04, 0.66, 0.06, 0.008), M.paint, s * (IW / 2 + 0.05), 0.35, 0));
    g.add(mesh(rbox(IW + 0.18, 0.03, 0.08, 0.008), M.paint, 0, 0.68, 0));
    const yP = 0.53, yM = 0.42, yS = 0.31;
    // patch panel
    g.add(mesh(new THREE.BoxGeometry(IW, UH - 0.004, 0.12), M.dark, 0, yP, zf - 0.06));
    g.add(mesh(new THREE.PlaneGeometry(FW, UH - 0.004), new THREE.MeshStandardMaterial({ map: patchTex(), metalness: 0.5, roughness: 0.45 }), 0, yP, zf + 0.001));
    // cable manager with fingers
    g.add(mesh(rbox(FW, UH - 0.008, 0.012, 0.004), M.dark, 0, yM, zf));
    for (let i = 0; i < 5; i++) g.add(mesh(rbox(0.024, UH - 0.02, 0.07, 0.008), M.paint, -0.36 + i * 0.18, yM, zf + 0.04));
    // switch
    g.add(mesh(new THREE.BoxGeometry(IW, UH - 0.004, 0.3), M.dark, 0, yS, zf - 0.15));
    g.add(mesh(new THREE.PlaneGeometry(FW, UH - 0.004), M.bezel.sw, 0, yS, zf + 0.001));
    const blue = phys({ color: 0x1f8fd0, roughness: 0.42, clearcoat: 0.35 }), white = phys({ color: 0xe1e6ec, roughness: 0.45, clearcoat: 0.3 });
    const toX = (px) => (px / 576 - 0.5) * FW, toY = (py, y0) => y0 + (0.5 - py / 64) * (UH - 0.004);
    const links = [];
    for (let c = 0; c < 24; c++) {
      const xa = toX(56 + c * 19 + Math.floor(c / 6) * 6 + 7.5), ya = toY(31, yP);
      const xb = toX(40 + c * 19 + Math.floor(c / 6) * 6 + 7.5), yb = toY(18.5, yS);
      const mat = c % 6 === 5 ? white : blue, sag = 0.07 + (c % 6) * 0.004;
      g.add(tube(pts([[xa, ya, zf + 0.03], [xa, ya - 0.012, zf + 0.06], [lerp(xa, xb, 0.5), yM, zf + 0.09 + sag * 0.2], [xb, yb + 0.014, zf + 0.06], [xb, yb, zf + 0.03]]), 0.0042, mat, 32, 6));
      g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.03), mat, xa, ya, zf + 0.016));
      g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.03), mat, xb, yb, zf + 0.016));
      const l = ledMat(c % 7 === 3 ? '#ffb547' : '#5ef2c4'); links.push(l);
      g.add(mesh(new THREE.BoxGeometry(0.006, 0.004, 0.003), l, xb + 0.008, toY(6, yS), zf + 0.003, { tone: 1 }));
    }
    return {
      g, frame: { target: [0, 0.38, 0.05], dist: 2.2, az: 0.36, el: 0.12 }, top: 0.7, dustN: 15000,
      shadows: [[0, 0, IW + 0.4, 0.55, 0.9]],
      anim(t, h) {
        links.forEach((l, i) => {
          const idle = hash(Math.floor(t * (3 + (i % 5))) + i * 5.1) > 0.35 ? 1.8 : 0.2;
          const wave = (((t * 0.8 - i / 24) % 1) + 1) % 1 < 0.12 ? 3 : 0.35;
          setLed(l, lerp(idle, wave, h));
        });
      },
    };
  },
});

Object.assign(DESCRIBE, {
  soc: 'A security console of three monitors: a calm threat map, the alert list and events over time. Hover: a new alert comes in red and is contained a moment later, turning cyan.',
  audit: 'A magnifying glass drifting over a circuit board, a red issue waiting on it. Hover: the glass follows your pointer; bring it to the issue and it is found, then fixed (cyan).',
  zerotrust: 'A fingerprint sensor with a glass ID card behind it. Hover: a scan sweeps the print, then it turns verified and the card lights up.',
  vault: 'A round vault door in brushed metal. Hover: the wheel turns, the bolts draw back and the door opens on the backed-up drives glowing safely inside.',
  padlock: 'A padlock in aluminium and glass, resting open. Hover: the shackle swings in and clicks shut, and its ring of light comes on.',
  cloud: 'A server with a soft cloud above it, data cubes rising between them. Hover: more cubes rise, faster.',
  managed: 'A support headset on its stand. Hover: the ear-cup light rings and the mic light come on, and it turns to your pointer.',
  itot: 'An industrial controller (PLC) on a DIN rail: power, CPU and I/O modules with a network cable. Hover: the status lights run in sequence.',
  wifi: 'A ceiling Wi-Fi access point with rings of coverage spreading out. Hover: the rings grow stronger and faster.',
  cabling: 'A patch panel over a switch, with neatly dressed patch cords between them. Hover: the link lights run along the switch.',
});
