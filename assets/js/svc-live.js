// What We Do cards and service pages: each service's live picture (an object made in assets/js/live/, lit like a
// product photo on navy) in place of its photo. It is drawn into a small canvas inside the picture's own box (a card's
// .svc-media, or the .tone beside a service page's overview), so that box's fade, rounded corners and reveal apply
// exactly as they did to the photo. One WebGL renderer, kept
// off screen, draws each card that is on screen in turn and the result is copied into that card's canvas.
// Pointer: the view swings round after it; hover: each object does its own thing (doors open, screens wake...).
// On touch screens the hover follows how near the card is to the middle of the screen. Without WebGL the photo stays.
import { THREE, BUILD, materials, textures, mesh, clamp, lerp, reduce, fine, U, CYAN } from './live/kit.js';
import './live/kinds-base.js';
import './live/kinds-a.js';
import './live/kinds-b.js';
import './live/kinds-c.js';
import './live/kinds-d.js';
import './live/kinds-e.js';

// a card's .svc-media, the .tone beside a service page's overview, or any other .tone with data-live (How We Do)
const els = [...document.querySelectorAll('.svc-media[data-live], .tone[data-live]')].filter((el) => BUILD[el.dataset.live]);

// studio lighting: soft boxes round the object, a cyan strip behind and a faint pink one
function makeEnv(renderer) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(14, 9, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.012, 0.022, 0.035), side: THREE.BackSide }));
  room.position.y = 2.5; s.add(room);
  const panel = (w, h, col, k, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0.6, 0); s.add(m); };
  panel(6, 3.5, '#ffffff', 3, 0, 6.5, 0.8);
  panel(1.6, 4.5, '#ffffff', 2.6, -6.5, 2.2, 2.5);
  panel(1.6, 4.5, '#ffffff', 0.9, 6.5, 2.2, -1.5);
  panel(5, 1, CYAN, 2.4, 0, 1.3, -6.5);
  panel(3, 0.7, '#eb4b96', 0.7, 5, 0.9, -5);
  const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.035).texture; pm.dispose(); return tex;
}
// a faint pool of cyan under the object with rings of light running out through it
function groundGlow() {
  return new THREE.Mesh(new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: { uTime: U.time }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime; varying vec2 vP;
      void main() { float r = length(vP); float k1 = fract(uTime * 0.12) * 3.4, k2 = fract(uTime * 0.12 + 0.5) * 3.4;
        float ring = exp(-pow((r - k1) * 9.0, 2.0)) * (1.0 - k1 / 3.4) + exp(-pow((r - k2) * 9.0, 2.0)) * (1.0 - k2 / 3.4);
        gl_FragColor = vec4(vec3(0.19, 0.76, 0.97) * (exp(-r * r * 0.9) * 0.12 + ring * 0.07), 1.0); }`,
  }));
}
function makeScene(kind, env) {
  materials();
  const scene = new THREE.Scene(), obj = BUILD[kind]();
  scene.environment = env; scene.add(obj.g);
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(-3, 5, 4);
  const rim = new THREE.DirectionalLight(CYAN, 2.2); rim.position.set(4, 3, -4);
  const fill = new THREE.DirectionalLight(0xcfe2ff, 0.9); fill.position.set(2.5, 2, 5);
  scene.add(key, rim, fill);
  for (const [x, z, sx, sz, op] of obj.shadows) {
    const s = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: textures().radial, transparent: true, opacity: op, depthWrite: false }), x, 0.002, z);
    s.scale.set(sx, 1, sz); s.renderOrder = -1; scene.add(s);
  }
  const gg = groundGlow(); gg.position.y = 0.001; gg.renderOrder = -1; scene.add(gg);
  const f = obj.frame;
  return { scene, obj, cam: new THREE.PerspectiveCamera(30, 1.5, 0.05, 60), target: new THREE.Vector3(...f.target) };
}

function start() {
  if (!els.length) return;
  const gl = document.createElement('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { return; }
  // sharpness: up to 1.75 pixels per CSS pixel, dropped to 1 if the device struggles (see frame)
  let DPR = Math.min(devicePixelRatio || 1, 1.75), slow = 1 / 60, since = 0;
  renderer.setPixelRatio(DPR); renderer.autoClear = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const env = makeEnv(renderer);
  let GW = 0, GH = 0; // the off-screen canvas grows to fit the largest card

  // the navy backdrop, a soft radial gradient (drawn first in each card)
  const bgU = { uAsp: { value: 1.5 } };
  const bgScene = new THREE.Scene(), bgCam = new THREE.Camera();
  { const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { ...bgU, uA: { value: new THREE.Color('#123352') }, uB: { value: new THREE.Color('#050f1a') } }, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; uniform float uAsp; varying vec2 vUv; void main() { vec2 p = vUv - vec2(0.5, 0.46); p.x *= uAsp; gl_FragColor = linearToOutputTexel(vec4(mix(uA, uB, smoothstep(0.0, 0.85, length(p))), 1.0)); }' }));
    q.frustumCulled = false; bgScene.add(q); }

  // where each picture fades: a card fades to the right (to the bottom on a phone), the service page picture fades in
  // from its left edge (towards the bottom up to tablet width), so the object moves into the solid part
  const phone = matchMedia('(max-width: 640px)'), tablet = matchMedia('(max-width: 1024px)');
  const cards = els.map((el, idx) => {
    const canvas = document.createElement('canvas'); canvas.className = 'svc-live'; canvas.setAttribute('aria-hidden', 'true');
    const mode = el.classList.contains('svc-media') ? 'card' : el.closest('.sp-media') ? 'page' : 'plain';
    const card = { el, canvas, ctx: null, kind: el.dataset.live, mode, sc: null, on: false, drawn: false, st: { x: 0, y: 0, tx: 0, ty: 0, hover: 0, th: 0, t0: idx * 1.7 } };
    const st = card.st, hit = el.closest('a') || el;
    hit.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; const r = el.getBoundingClientRect(); st.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); st.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1); });
    hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') st.th = 1; });
    hit.addEventListener('pointerleave', () => { st.tx = 0; st.ty = 0; st.th = 0; });
    return card;
  });
  // only the cards on (or near) the screen are drawn
  const io = new IntersectionObserver((list) => { for (const e of list) { const c = cards.find((k) => k.el === e.target); if (c) c.on = e.isIntersecting; } }, { rootMargin: '150px 0px' });
  cards.forEach((c) => io.observe(c.el));

  const clock = new THREE.Clock();
  let t = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t = reduce ? 6 : t + dt; U.time.value = t;
    const H = innerHeight;
    let built = false;
    // a slow device (under about 35 frames a second for a few seconds): draw at 1 pixel per CSS pixel
    slow = lerp(slow, dt, 0.05); since += dt;
    if (DPR > 1 && since > 4 && slow > 1 / 35) { DPR = 1; renderer.setPixelRatio(1); GW = GH = 0; }
    for (const c of cards) {
      if (!c.on) continue;
      if (!c.sc) { if (built) continue; c.sc = makeScene(c.kind, env); built = true; }
      const r = c.el.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
      if (w < 2 || h < 2) continue;
      if (w > GW || h > GH) { GW = Math.max(GW, w); GH = Math.max(GH, h); renderer.setSize(GW, GH, false); }
      const cw = Math.round(w * DPR), ch = Math.round(h * DPR);
      if (c.canvas.width !== cw || c.canvas.height !== ch) { c.canvas.width = cw; c.canvas.height = ch; c.ctx = null; }
      if (!c.ctx) c.ctx = c.canvas.getContext('2d');
      const sc = c.sc, s = c.st, f = sc.obj.frame, aspect = w / h;
      // 1 entering at the bottom, 0 in the middle of the screen, -1 leaving at the top
      const p = clamp(((r.top + r.height / 2) - H / 2) / (H / 2 + r.height / 2), -1.2, 1.2);
      if (!fine) { s.tx = Math.sin(t * 0.35 + s.t0) * 0.6; s.ty = Math.cos(t * 0.28 + s.t0) * 0.35; s.th = Math.max(0, 1 - Math.abs(p) * 2.6); }
      s.x = lerp(s.x, s.tx, 0.07); s.y = lerp(s.y, s.ty, 0.07); s.hover = lerp(s.hover, s.th, 0.06);
      const hv = s.hover;
      sc.obj.anim(t, hv, dt, s);
      // the camera swings round after the pointer and drifts with the page; narrower pictures pull back a little
      const dist = f.dist * (aspect < 1.3 ? 1.12 + (1.3 - aspect) * 0.35 : 1) * (1 - hv * 0.05);
      const az = f.az + s.x * 0.22 + Math.sin(t * 0.1 + s.t0) * 0.04 + p * 0.06, el = f.el - s.y * 0.06 + p * 0.05;
      sc.cam.position.set(sc.target.x + Math.sin(az) * Math.cos(el) * dist, sc.target.y + Math.sin(el) * dist, sc.target.z + Math.cos(az) * Math.cos(el) * dist);
      sc.cam.lookAt(sc.target); sc.cam.aspect = aspect;
      // keep the object in the solid part of the fade: left of centre on wide cards, higher up on phones
      if (c.mode === 'plain') sc.cam.clearViewOffset();
      else if (c.mode === 'page') { if (tablet.matches) sc.cam.setViewOffset(w, h, 0, h * 0.07, w, h); else sc.cam.setViewOffset(w, h, -w * 0.1, 0, w, h); }
      else if (phone.matches) sc.cam.setViewOffset(w, h, 0, h * 0.14, w, h); else sc.cam.setViewOffset(w, h, w * 0.13, 0, w, h);
      sc.cam.updateProjectionMatrix();
      // draw in the top-left of the off-screen canvas, then copy that into the card
      renderer.setScissorTest(true); renderer.setViewport(0, GH - h, w, h); renderer.setScissor(0, GH - h, w, h);
      bgU.uAsp.value = aspect;
      renderer.render(bgScene, bgCam); renderer.clearDepth(); renderer.render(sc.scene, sc.cam);
      c.ctx.drawImage(gl, 0, 0, cw, ch, 0, 0, cw, ch);
      if (!c.drawn) { c.drawn = true; c.el.appendChild(c.canvas); c.el.classList.add('is-live'); }
    }
  }
  const ticker = window.gsap && window.gsap.ticker;
  if (ticker) ticker.add(frame);
  else { const loop = () => { frame(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
}

start();
