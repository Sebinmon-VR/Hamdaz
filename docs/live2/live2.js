// Options page script (docs/live-picture-options.html): three new styles for the live service pictures.
// Each element with data-live="<style>:<kind>" gets one.
//   styles: dark  (studio render on the home page's navy)
//           light (the same render on a pale studio backdrop)
//           dust  (the same object drawn in points of light that gather as it scrolls in and lift apart on hover)
//   kinds:  server (Data Center), partner (Partner Services), meeting (Meeting Rooms & Video Conferencing)
// One fixed WebGL canvas draws every card, cut to each card's box, as in assets/js/cards.js.
import { THREE, BUILD, CYAN, LED_GEO, M, PANEL, T, U, U1, V2, V3, VS_UV, blink, canvasTex, clamp, fine, glowMat, hash, ledMats, lensGroup, lerp, materials, mesh, panelTex, puck, rack, rbox, reduce, rng, smooth, smoothed, textures, unit } from '../../assets/js/live/kit.js';
import '../../assets/js/live/kinds-base.js';
/* ------------------------------------------------------------------ studio lighting (an environment of soft boxes) */
function makeEnv(renderer, light) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(14, 9, 14), new THREE.MeshBasicMaterial({ color: light ? new THREE.Color(0.5, 0.53, 0.57) : new THREE.Color(0.012, 0.022, 0.035), side: THREE.BackSide }));
  room.position.y = 2.5; s.add(room);
  const panel = (w, h, col, k, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0.6, 0); s.add(m); };
  panel(6, 3.5, '#ffffff', light ? 4 : 3, 0, 6.5, 0.8);
  panel(1.6, 4.5, '#ffffff', light ? 3 : 2.6, -6.5, 2.2, 2.5);
  panel(1.6, 4.5, '#ffffff', light ? 1.6 : 0.9, 6.5, 2.2, -1.5);
  panel(5, 1, CYAN, light ? 0.5 : 2.4, 0, 1.3, -6.5);
  if (!light) panel(3, 0.7, '#eb4b96', 0.7, 5, 0.9, -5);
  const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.035).texture; pm.dispose(); return tex;
}

/* ------------------------------------------------------------------ point sampling, for the dust style */
// points on the object's surfaces plus a larger share along its edges, so the outline reads clearly.
// Per mesh: userData.w weights its surface, userData.e its edges, userData.tone picks the colour.
function sample(root, N, seed, edgeShare = 0.55) {
  root.updateMatrixWorld(true);
  const tri = [], cum = [], ttone = [], seg = [], scum = [], stone = []; let total = 0, stotal = 0;
  const a = new V3(), b = new V3(), c = new V3(), m = new THREE.Matrix4(), im = new THREE.Matrix4(), ab = new V3(), ac = new V3();
  root.traverse((o) => {
    if (!o.isMesh || o.userData.noDust) return;
    const geo = o.geometry, pos = geo.attributes.position, idx = geo.index, w = o.userData.w ?? 1, e = o.userData.e ?? 1, tn = o.userData.tone ?? 0;
    const count = o.isInstancedMesh ? o.count : 1, nt = (idx ? idx.count : pos.count) / 3;
    const ep = e > 0 ? new THREE.EdgesGeometry(geo, 15).attributes.position : null;
    for (let k = 0; k < count; k++) {
      m.copy(o.matrixWorld); if (o.isInstancedMesh) { o.getMatrixAt(k, im); m.multiply(im); }
      if (w > 0) for (let i = 0; i < nt; i++) {
        const i0 = idx ? idx.getX(i * 3) : i * 3, i1 = idx ? idx.getX(i * 3 + 1) : i * 3 + 1, i2 = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
        a.fromBufferAttribute(pos, i0).applyMatrix4(m); b.fromBufferAttribute(pos, i1).applyMatrix4(m); c.fromBufferAttribute(pos, i2).applyMatrix4(m);
        const area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5 * w;
        if (!(area > 1e-9)) continue;
        total += area; tri.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); cum.push(total); ttone.push(tn);
      }
      if (ep) for (let i = 0; i < ep.count; i += 2) {
        a.fromBufferAttribute(ep, i).applyMatrix4(m); b.fromBufferAttribute(ep, i + 1).applyMatrix4(m);
        const len = a.distanceTo(b) * e; if (!(len > 1e-6)) continue;
        stotal += len; seg.push(a.x, a.y, a.z, b.x, b.y, b.z); scum.push(stotal); stone.push(tn);
      }
    }
  });
  const rand = rng(seed), out = new Float32Array(N * 3), tones = new Float32Array(N), edge = new Float32Array(N);
  const pick = (arr, r) => { let lo = 0, hi = arr.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < r) lo = mid + 1; else hi = mid; } return lo; };
  const NE = stotal > 0 ? Math.floor(N * edgeShare) : 0;
  for (let n = 0; n < N; n++) {
    if (n < NE) {
      const lo = pick(scum, rand() * stotal), j = lo * 6, u = rand();
      for (let d = 0; d < 3; d++) out[n * 3 + d] = seg[j + d] + (seg[j + 3 + d] - seg[j + d]) * u;
      tones[n] = stone[lo]; edge[n] = 1;
    } else {
      const lo = pick(cum, rand() * total), j = lo * 9; let u = rand(), v = rand(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      for (let d = 0; d < 3; d++) out[n * 3 + d] = tri[j + d] + (tri[j + 3 + d] - tri[j + d]) * u + (tri[j + 6 + d] - tri[j + d]) * v;
      tones[n] = ttone[lo];
    }
  }
  return { pos: out, tones, edge };
}

const DUST_V = `attribute vec4 aRnd; attribute float aTone, aEdge, aTint;
  uniform float uTime, uPixel, uAsm, uScat, uMouseOn, uTop; uniform vec3 uMouse;
  varying vec3 vCol; varying float vA;
  void main() {
    vec3 tgt = position, dir = normalize(aRnd.xyz - 0.5 + 1e-4);
    vec3 start = tgt * 0.25 + dir * (1.4 + aRnd.w * 1.6) + vec3(0.0, 0.7, 0.0);
    float k = smoothstep(aRnd.w * 0.5, aRnd.w * 0.5 + 0.5, uAsm); k = 1.0 - pow(1.0 - k, 3.0);
    vec3 p = mix(start, tgt, k);
    p += vec3(sin(uTime * 0.9 + aRnd.x * 40.0), sin(uTime * 0.7 + aRnd.y * 40.0), cos(uTime * 0.8 + aRnd.z * 40.0)) * 0.003;
    vec3 away = normalize(tgt - vec3(0.0, uTop * 0.45, 0.0) + dir * 0.4);
    p += (away * (0.01 + aRnd.w * 0.05) + vec3(0.0, aRnd.x * 0.035, 0.0) + dir * 0.015 * sin(uTime * 1.6 + aRnd.y * 20.0)) * uScat;
    vec3 d = p - uMouse; float f = exp(-dot(d, d) * 24.0) * uMouseOn; p += normalize(d + 1e-4) * f * 0.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
    float hot = step(0.5, aTone);
    gl_PointSize = (1.1 + hot * 1.4 + aEdge * 0.5 + aRnd.x * 0.8) * uPixel * (4.0 / -mv.z);
    float band = exp(-pow((tgt.y - (fract(uTime * 0.16) * 1.5 - 0.15) * uTop) * 6.0, 2.0));
    vec3 base = aTone < 0.5 ? vec3(0.52, 0.76, 0.95) : aTone < 1.5 ? vec3(0.35, 0.85, 1.0) * 1.6 : aTone < 2.5 ? vec3(0.95, 0.35, 0.62) * 1.5 : vec3(0.3, 0.68, 1.0);
    vCol = base * aTint * (0.6 + band * 1.1 + f * 1.6) * (1.0 + uScat * 0.5);
    vA = (0.2 + 0.8 * k) * (aTone < 0.5 ? (aEdge > 0.5 ? 0.85 : 0.32) : 0.95);
  }`;
const DUST_F = 'varying vec3 vCol; varying float vA; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vCol, a * a * vA); }';

/* ------------------------------------------------------------------ one scene per card */
function groundGlow() {
  return new THREE.Mesh(new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: { uTime: U.time }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime; varying vec2 vP;
      void main() { float r = length(vP); float k1 = fract(uTime * 0.12) * 3.4, k2 = fract(uTime * 0.12 + 0.5) * 3.4;
        float ring = (exp(-pow((r - k1) * 9.0, 2.0)) * (1.0 - k1 / 3.4) + exp(-pow((r - k2) * 9.0, 2.0)) * (1.0 - k2 / 3.4));
        float pool = exp(-r * r * 0.9);
        gl_FragColor = vec4(vec3(0.19, 0.76, 0.97) * (pool * 0.12 + ring * 0.07), 1.0); }`,
  }));
}
function makeScene(style, kind, env, seed) {
  materials();
  const scene = new THREE.Scene(), obj = BUILD[kind](), f = obj.frame;
  const sc = { style, scene, obj, cam: new THREE.PerspectiveCamera(30, 1.5, 0.05, 60), target: new V3(...f.target), asm: style === 'dust' ? 0 : 1 };
  if (style === 'dust') {
    obj.anim(0, 0, 0);
    const smp = sample(obj.g, obj.dustN, seed), grid = obj.dustGrid ? obj.dustGrid() : { pos: [], tint: [] }, ns = smp.tones.length, ng = grid.tint.length, n = ns + ng;
    const pos = new Float32Array(n * 3), tones = new Float32Array(n), edge = new Float32Array(n), tint = new Float32Array(n).fill(1), rnd = new Float32Array(n * 4), rand = rng(seed + 5);
    pos.set(smp.pos); pos.set(grid.pos, ns * 3); tones.set(smp.tones); tones.fill(3, ns); edge.set(smp.edge); tint.set(grid.tint, ns);
    for (let i = 0; i < rnd.length; i++) rnd[i] = rand();
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aTone', new THREE.BufferAttribute(tones, 1)); geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 1));
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1)); geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    sc.u = { uTime: U.time, uPixel: { value: 1 }, uAsm: { value: 0 }, uScat: { value: 0 }, uMouse: { value: new V3(9, 9, 9) }, uMouseOn: { value: 0 }, uTop: { value: obj.top } };
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: sc.u, vertexShader: DUST_V, fragmentShader: DUST_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; scene.add(pts);
    // a floor of faint dots with a ring of light running out through it
    const fp = []; for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) { const x = (i + (j & 1) * 0.5) * 0.075, z = j * 0.065; if (x * x + z * z < 7.3) fp.push(x, 0, z); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    const floor = new THREE.Points(fg, new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uPixel: sc.u.uPixel }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uTime, uPixel; varying float vA;
        void main() { float r = length(position.xz), k = fract(uTime * 0.14) * 3.0; vA = (1.0 - smoothstep(0.6, 2.7, r)) * (0.16 + exp(-pow((r - k) * 7.0, 2.0)) * 0.7 * (1.0 - k / 3.0));
          vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 1.6 * uPixel * (4.0 / -mv.z); }`,
      fragmentShader: 'varying float vA; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.19, 0.76, 0.97, smoothstep(0.5, 0.1, d) * vA); }' }));
    floor.frustumCulled = false; scene.add(floor);
  } else {
    scene.environment = env;
    obj.theme?.(style === 'light');
    scene.add(obj.g);
    if (style === 'dark') { const rim = new THREE.DirectionalLight(CYAN, 2.2); rim.position.set(4, 3, -4); const fill = new THREE.DirectionalLight(0xcfe2ff, 0.9); fill.position.set(2.5, 2, 5); scene.add(rim, fill); }
    const key = new THREE.DirectionalLight(0xffffff, style === 'light' ? 1.4 : 1.8); key.position.set(-3, 5, 4); scene.add(key);
    for (const [x, z, sx, sz, op] of obj.shadows) {
      const s = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: textures().radial, transparent: true, opacity: op * (style === 'light' ? 0.75 : 1), depthWrite: false }), x, 0.002, z, { noDust: true });
      s.scale.set(sx, 1, sz); s.renderOrder = -1; scene.add(s);
    }
    if (style === 'dark') { const gg = groundGlow(); gg.position.y = 0.001; gg.renderOrder = -1; scene.add(gg); }
  }
  return sc;
}

/* ------------------------------------------------------------------ the page's cards */
function start() {
  const els = [...document.querySelectorAll('[data-live]')];
  if (!els.length) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'live-gl'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return; }
  document.body.appendChild(canvas);
  const DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR); renderer.autoClear = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  let W = 0, H = 0;
  const fit = () => { const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight; if (w !== W || h !== H) { W = w; H = h; renderer.setSize(W, H); } };
  const env = { dark: makeEnv(renderer, false), light: makeEnv(renderer, true) };

  // the backdrop: a soft radial gradient (drawn first in each card)
  const bgU = { uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uAsp: { value: 1.5 } };
  const bgScene = new THREE.Scene(), bgCam = new THREE.Camera();
  { const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: bgU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; uniform float uAsp; varying vec2 vUv; void main() { vec2 p = vUv - vec2(0.5, 0.46); p.x *= uAsp; float r = length(p); gl_FragColor = linearToOutputTexel(vec4(mix(uA, uB, smoothstep(0.0, 0.85, r)), 1.0)); }' }));
    q.frustumCulled = false; bgScene.add(q); }
  const BG = { dark: ['#123352', '#050f1a'], dust: ['#0d2840', '#040c16'], light: ['#fbfcfd', '#d5dce5'] };

  // the last pass in each card rounds its corners to match the page
  const maskMat = new THREE.ShaderMaterial({
    uniforms: { uRect: { value: new THREE.Vector4() }, uRad: { value: 16 } },
    vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform vec4 uRect; uniform float uRad;
      void main() { vec2 p = gl_FragCoord.xy - uRect.xy, hs = uRect.zw * 0.5, q = p - hs; vec2 d = abs(q) - hs + uRad;
        float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRad; gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - smoothstep(-0.5, 0.5, sd)); }`,
    transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.SrcAlphaFactor,
  });
  const maskScene = new THREE.Scene();
  { const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), maskMat); q.frustumCulled = false; maskScene.add(q); }

  const cards = els.map((el, idx) => {
    const [style, kind] = el.dataset.live.split(':');
    const card = { el, idx, style, kind, sc: null, rad: 16, st: { x: 0, y: 0, tx: 0, ty: 0, hover: 0, th: 0, mx: 0, my: 0, t0: idx * 1.7 } };
    el.classList.add('is-live');
    const radii = () => { card.rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; };
    radii(); addEventListener('resize', radii);
    const st = card.st, hit = el.closest('label, a') || el;
    hit.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; const r = el.getBoundingClientRect(); st.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); st.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1); });
    hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') st.th = 1; });
    hit.addEventListener('pointerleave', () => { st.tx = 0; st.ty = 0; st.th = 0; });
    return card;
  });

  const ray = new THREE.Raycaster(), ndc = new V2(), plane = new THREE.Plane(), hitP = new V3(), nrm = new V3();
  const clock = new THREE.Clock();
  let t = 0, shown = true;
  function frame() {
    fit();
    const dt = Math.min(clock.getDelta(), 0.05);
    t = reduce ? 6 : t + dt; U.time.value = t;
    let built = false, cleared = false;
    for (const c of cards) {
      const r = c.el.getBoundingClientRect();
      if (r.width < 2) continue;
      if (!c.sc) { if (!built && BUILD[c.kind] && r.top < H * 1.6 && r.bottom > -H * 0.6) { c.sc = makeScene(c.style, c.kind, env[c.style === 'light' ? 'light' : 'dark'], 7 + c.idx); built = true; } continue; }
      const sc = c.sc, s = c.st;
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) { if (r.top > H * 1.4 || r.bottom < -H * 0.4) sc.asm = sc.style === 'dust' ? 0 : 1; continue; }
      if (!cleared) { cleared = true; if (!shown) { shown = true; canvas.style.visibility = ''; } renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); renderer.setScissorTest(true); }
      // 1 entering at the bottom, 0 in the middle of the screen, -1 leaving at the top
      const p = clamp(((r.top + r.height / 2) - H / 2) / (H / 2 + r.height / 2), -1.2, 1.2);
      if (!fine) { s.tx = Math.sin(t * 0.35 + s.t0) * 0.6; s.ty = Math.cos(t * 0.28 + s.t0) * 0.35; s.th = Math.max(0, 1 - Math.abs(p) * 2.6); }
      s.x = lerp(s.x, s.tx, 0.07); s.y = lerp(s.y, s.ty, 0.07); s.hover = lerp(s.hover, s.th, 0.06);
      const h = s.hover, f = sc.obj.frame, aspect = r.width / r.height;
      if (sc.style !== 'dust') sc.obj.anim(t, h, dt, s);
      else { sc.asm = reduce ? 1 : Math.min(1, sc.asm + dt / 2.6); sc.u.uAsm.value = sc.asm; sc.u.uScat.value = h; sc.u.uPixel.value = DPR * (r.height / 300); }
      // the camera swings round after the pointer and drifts with the page
      const dist = f.dist * (aspect < 1.3 ? 1.15 : 1) * (1 - h * 0.05);
      const az = f.az + s.x * 0.22 + Math.sin(t * 0.1 + s.t0) * 0.04 + p * 0.06, el = f.el - s.y * 0.06 + p * 0.05;
      sc.cam.position.set(sc.target.x + Math.sin(az) * Math.cos(el) * dist, sc.target.y + Math.sin(el) * dist, sc.target.z + Math.cos(az) * Math.cos(el) * dist);
      sc.cam.lookAt(sc.target); sc.cam.aspect = aspect; sc.cam.updateProjectionMatrix();
      if (sc.style === 'dust') {
        s.mx = lerp(s.mx, s.tx, 0.25); s.my = lerp(s.my, s.ty, 0.25);
        sc.cam.getWorldDirection(nrm); plane.setFromNormalAndCoplanarPoint(nrm, sc.target);
        ray.setFromCamera(ndc.set(s.mx, -s.my), sc.cam);
        if (ray.ray.intersectPlane(plane, hitP)) sc.u.uMouse.value.copy(hitP);
        sc.u.uMouseOn.value = lerp(sc.u.uMouseOn.value, s.th && fine ? 1 : 0, 0.08);
      }
      const x = r.left, y = H - r.bottom, w = r.width, hh = r.height;
      renderer.setViewport(x, y, w, hh); renderer.setScissor(x, y, w, hh);
      const [a, b] = BG[sc.style]; bgU.uA.value.set(a); bgU.uB.value.set(b); bgU.uAsp.value = aspect;
      renderer.toneMappingExposure = sc.style === 'light' ? 1.05 : 1;
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(sc.scene, sc.cam);
      maskMat.uniforms.uRect.value.set(x * DPR, y * DPR, w * DPR, hh * DPR); maskMat.uniforms.uRad.value = c.rad * DPR;
      renderer.render(maskScene, bgCam);
    }
    if (!cleared && shown) { shown = false; renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); canvas.style.visibility = 'hidden'; }
  }
  const loop = () => { frame(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

start();
